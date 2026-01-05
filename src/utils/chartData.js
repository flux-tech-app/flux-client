// src/utils/chartData.js
import {
  getPeriodRange,
  getPreviousPeriodRange,
  generateCalendarGrid,
  isDateInRange,
} from "./dateHelpers.js";

import { microsToUnits, microsToDollars, isBinaryRateType } from "@/utils/micros";

/**
 * Local YYYY-MM-DD from ms (avoids UTC day-shift bugs from toISOString()).
 */
function ymdLocal(ms) {
  if (ms == null) throw new Error("timestampMs is required");
  const d = new Date(Number(ms));
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid timestampMs: ${ms}`);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Decide how to render progress values.
 * - BINARY => completion
 * - else if goalUnit/unit looks time-ish => duration
 * - else => count
 */
function getHabitValueType(habit) {
  const rt = String(habit?.rateType ?? "");
  if (isBinaryRateType(rt)) return "completion";

  const u = String(habit?.goalUnit ?? habit?.unit ?? "").toLowerCase();
  const timeish = u.includes("min") || u.includes("minute") || u.includes("hour");
  return timeish ? "duration" : "count";
}

/**
 * Aggregate logs per day (supports multiple logs in same day).
 */
function aggregateLogsByDate(logs) {
  const map = new Map();

  for (const log of logs) {
    const date = ymdLocal(log.timestampMs);
    const unitsMicros = Number(log.unitsMicros);
    if (!Number.isFinite(unitsMicros)) throw new Error("log.unitsMicros must be a number");

    // earningsMicros is expected from backend (recommended)
    const earningsMicros = Number(log.earningsMicros ?? 0);
    if (!Number.isFinite(earningsMicros)) throw new Error("log.earningsMicros must be a number");

    const prev = map.get(date);
    if (!prev) {
      map.set(date, {
        date,
        unitsMicrosSum: unitsMicros,
        earningsMicrosSum: earningsMicros,
        logs: [log],
      });
    } else {
      prev.unitsMicrosSum += unitsMicros;
      prev.earningsMicrosSum += earningsMicros;
      prev.logs.push(log);
    }
  }

  return map;
}

/**
 * Aggregate chart bars for longer periods.
 * 90D => weekly, 1Y => monthly-ish (30-day chunks)
 */
function aggregateChartData(points, period, valueType) {
  if (period !== "90D" && period !== "1Y") return points;

  const size = period === "90D" ? 7 : 30;
  const out = [];

  for (let i = 0; i < points.length; i += size) {
    const chunk = points.slice(i, i + size);
    const hasData = chunk.some((p) => p.hasData);

    let value = null;
    if (hasData) {
      if (valueType === "completion") {
        const completedDays = chunk.filter((p) => (p.value ?? 0) > 0).length;
        value = Math.round((completedDays / chunk.length) * 100);
      } else {
        value = chunk.reduce((sum, p) => sum + (p.value ?? 0), 0);
      }
    }

    out.push({
      date: chunk[0].date,
      dateRange: { start: chunk[0].date, end: chunk[chunk.length - 1].date },
      value,
      hasData,
      isAggregated: true,
      dayCount: chunk.length,
    });
  }

  return out;
}

export function getProgressChartData(habit, logs, period) {
  const valueType = getHabitValueType(habit);

  const oldest =
    logs.length > 0
      ? ymdLocal(
          logs.reduce((min, l) => (l.timestampMs < min ? l.timestampMs : min), logs[0].timestampMs)
        )
      : null;

  const { startDate, endDate, dates } = getPeriodRange(period, oldest);

  const filtered = logs
    .map((l) => ({ ...l, date: ymdLocal(l.timestampMs) }))
    .filter((l) => isDateInRange(l.date, startDate, endDate));

  const byDate = aggregateLogsByDate(filtered);

  const points = dates.map((date) => {
    const day = byDate.get(date);
    if (!day) {
      return { date, value: null, hasData: false, logs: [] };
    }

    const units = microsToUnits(day.unitsMicrosSum);

    let value;
    if (valueType === "completion") value = units > 0 ? 100 : 0;
    else value = units;

    return {
      date,
      value,
      hasData: true,
      logs: day.logs,
    };
  });

  const data = aggregateChartData(points, period, valueType);
  const actualMax = Math.max(...data.map((d) => d.value || 0), valueType === "completion" ? 100 : 1);

  return {
    data,
    valueType,
    maxValue: valueType === "completion" ? 100 : actualMax,
    period,
    startDate,
    endDate,
  };
}

export function getEarningsChartData(logs, period) {
  const oldest =
    logs.length > 0
      ? ymdLocal(
          logs.reduce((min, l) => (l.timestampMs < min ? l.timestampMs : min), logs[0].timestampMs)
        )
      : null;

  const { startDate, endDate, dates } = getPeriodRange(period, oldest);

  const filtered = logs
    .map((l) => ({ ...l, date: ymdLocal(l.timestampMs) }))
    .filter((l) => isDateInRange(l.date, startDate, endDate));

  const byDate = aggregateLogsByDate(filtered);

  let cumulative = 0;
  const data = dates.map((date) => {
    const day = byDate.get(date);
    const daily = day ? microsToDollars(day.earningsMicrosSum) : 0;

    cumulative += daily;

    return {
      date,
      earnings: daily,
      cumulativeEarnings: cumulative,
      hasData: !!day,
    };
  });

  const displayMax = Math.max(...data.map((d) => d.cumulativeEarnings), 1);

  return {
    data,
    totalEarnings: cumulative,
    displayMax,
    period,
    startDate,
    endDate,
  };
}

function calculateIntensity(value, maxValue) {
  if (value <= 0) return 0;
  const r = value / maxValue;
  if (r >= 0.75) return 4;
  if (r >= 0.5) return 3;
  if (r >= 0.25) return 2;
  return 1;
}

function determineStatus(dayAgg, dayCell, valueType, maxValue) {
  if (dayCell.isFuture) {
    return { type: "future", color: "gray", intensity: 0 };
  }

  if (!dayAgg) {
    return { type: "missed", color: "red", intensity: 0 };
  }

  const units = microsToUnits(dayAgg.unitsMicrosSum);

  if (valueType === "completion") {
    const done = units > 0;
    return { type: done ? "completed" : "missed", color: done ? "green" : "red", intensity: done ? 1 : 0 };
  }

  const intensity = calculateIntensity(units, maxValue);
  return { type: "completed", color: "green", intensity, value: units };
}

export function getCalendarHeatmapData(habit, logs, year = null, month = null) {
  const y = year ?? new Date().getFullYear();
  const m = month ?? new Date().getMonth() + 1;

  const grid = generateCalendarGrid(y, m);

  const logsWithDates = logs.map((l) => ({ ...l, date: ymdLocal(l.timestampMs) }));
  const byDate = aggregateLogsByDate(logsWithDates);

  const valueType = getHabitValueType(habit);

  const allValues = Array.from(byDate.values()).map((d) => microsToUnits(d.unitsMicrosSum)).filter((v) => v > 0);
  const maxValue = Math.max(...allValues, 1);

  const enhanced = grid.map((cell) => {
    if (cell.isEmpty) return cell;

    const dayAgg = byDate.get(cell.date) || null;

    return {
      ...cell,
      logs: dayAgg?.logs ?? [],
      status: determineStatus(dayAgg, cell, valueType, maxValue),
    };
  });

  return { grid: enhanced, year: y, month: m, valueType };
}

export function calculatePeriodSummary(habit, logs, period, view) {
  const logsWithDates = logs.map((l) => ({ ...l, date: ymdLocal(l.timestampMs) }));
  const { startDate, endDate, dates } = getPeriodRange(
    period,
    logsWithDates.length ? logsWithDates.reduce((min, l) => (l.date < min ? l.date : min), logsWithDates[0].date) : null
  );

  const periodLogs = logsWithDates.filter((l) => isDateInRange(l.date, startDate, endDate));
  const days = dates.length;

  if (view === "earnings") {
    const total = periodLogs.reduce((sum, l) => sum + microsToDollars(Number(l.earningsMicros ?? 0)), 0);

    const prev = getPreviousPeriodRange(period, endDate);
    let change = null;
    if (prev) {
      const prevLogs = logsWithDates.filter((l) => isDateInRange(l.date, prev.startDate, prev.endDate));
      const prevTotal = prevLogs.reduce((sum, l) => sum + microsToDollars(Number(l.earningsMicros ?? 0)), 0);

      if (prevTotal > 0) {
        const delta = total - prevTotal;
        change = {
          amount: delta,
          percent: ((delta / prevTotal) * 100).toFixed(1),
          direction: delta >= 0 ? "up" : "down",
        };
      }
    }

    return { label: `Total Earnings (${period})`, value: `$${total.toFixed(2)}`, change, period, rawValue: total };
  }

  // progress view
  const valueType = getHabitValueType(habit);
  if (!periodLogs.length) return { label: "No activity yet", value: "—", period };

  const byDate = aggregateLogsByDate(periodLogs);
  const activeDays = Array.from(byDate.values()).filter((d) => microsToUnits(d.unitsMicrosSum) > 0).length;

  if (valueType === "completion") {
    const pct = Math.round((activeDays / days) * 100);
    return { label: `Completion Rate (${period})`, value: `${pct}%`, subtext: `${activeDays}/${days} days`, period, rawValue: pct };
  }

  const totalUnits = Array.from(byDate.values()).reduce((sum, d) => sum + microsToUnits(d.unitsMicrosSum), 0);
  const avg = totalUnits / days;

  const unit = habit?.unit || "units";
  return {
    label: `Average ${unit} (${period})`,
    value: `${Math.round(avg)} ${unit}`,
    period,
    rawValue: avg,
  };
}