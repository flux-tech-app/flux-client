// src/utils/goalCalculations.js
/**
 * Goal Calculations Utility (MICROS-NATIVE)
 *
 * What this file does (frontend-only view model):
 * - buckets logs into day/week windows
 * - aggregates totals (human units) from unitsMicros
 * - computes goal progress metrics used by GoalSection charts (ring, bars, dots)
 * - computes OPTIONAL earnings impact in MICROS for display
 *
 * What this file does NOT do:
 * - it does not determine “truth” for balances/transfers (backend owns that)
 */

import {
  toIntMicros,
  microsToUnits,
  unitsToMicros,
  microsToDollars,
  computeEarningsMicrosUI,
  isBinaryRateType,
  MICRO_UNITS,
} from "@/utils/micros";

// ---------------------------
// Time helpers
// ---------------------------

function logToDate(log) {
  // Prefer numeric millis fields if present
  const ms =
    log?.timestampMs ??
    log?.timestamp_ms ??
    log?.tsMs ??
    log?.ts_ms ??
    log?.createdAtMs ??
    log?.created_at_ms;

  if (typeof ms === "number" && Number.isFinite(ms)) return new Date(ms);

  // Fallback to common timestamp string/number
  const t = log?.timestamp ?? log?.createdAt ?? log?.created_at ?? log?.time;
  if (t == null) return null;

  if (typeof t === "number" && Number.isFinite(t)) {
    // could be seconds or millis; assume millis if large
    return new Date(t > 10_000_000_000 ? t : t * 1000);
  }

  if (typeof t === "string") {
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function _isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// ---------------------------
// Units helpers (human units)
// ---------------------------

function getRateType(habit) {
  return String(habit?.rateType || "BINARY").toUpperCase();
}

function getRateMicros(habit) {
  // Prefer backend-provided micros
  const m = habit?.rateMicros ?? habit?.rate_micros;
  if (m != null) return toIntMicros(m, 0);

  // Legacy: habit.rate might be dollars float; convert to micros
  const r = habit?.rate;
  if (r == null) return 0;

  const n = Number(r);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1_000_000);
}

/**
 * Return the log's units as a HUMAN number (minutes, miles, reps, steps).
 * For BINARY habits, each log counts as 1.
 */
function logUnitsHuman(habit, log) {
  const rt = getRateType(habit);
  if (isBinaryRateType(rt)) return 1;

  // Preferred: micros
  if (log?.unitsMicros != null || log?.units_micros != null) {
    const um = toIntMicros(log?.unitsMicros ?? log?.units_micros, 0);
    return microsToUnits(um);
  }

  // Legacy fallbacks (float-ish)
  if (log?.units != null) {
    const n = Number(log.units);
    return Number.isFinite(n) ? n : 0;
  }
  if (log?.amount != null) {
    const n = Number(log.amount);
    return Number.isFinite(n) ? n : 0;
  }

  // Last resort: treat as 1 unit (rare, legacy)
  return 0;
}

// ---------------------------
// Period normalization
// ---------------------------

/**
 * Normalize a value from one period to another
 * @param {number} value - The value to convert
 * @param {'day'|'week'|'month'} fromPeriod
 * @param {'day'|'week'|'month'} toPeriod
 */
export function normalizeToPeriod(value, fromPeriod, toPeriod) {
  if (!value || !fromPeriod || !toPeriod) return 0;
  const daysMap = { day: 1, week: 7, month: 30 };
  const fromDays = daysMap[fromPeriod] || 1;
  const toDays = daysMap[toPeriod] || 1;
  return value * (toDays / fromDays);
}

// ---------------------------
// Bucketing helpers
// ---------------------------

/**
 * Group logs by week (returns array of arrays, oldest -> newest)
 * Week windows are rolling 7-day blocks ending on "today".
 */
function groupLogsByWeek(logs, weeksCount = 4) {
  const now = new Date();
  const weeks = [];

  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekLogs = (logs || []).filter((log) => {
      const d = logToDate(log);
      if (!d) return false;
      return d >= weekStart && d <= weekEnd;
    });

    weeks.push(weekLogs);
  }

  return weeks;
}

/**
 * Group logs by day (returns array for last N days, oldest -> newest)
 */
function groupLogsByDay(habit, logs, daysCount = 14) {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const days = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const dayEnd = new Date(now);
    dayEnd.setDate(dayEnd.getDate() - i);
    dayEnd.setHours(23, 59, 59, 999);

    const dayStart = new Date(dayEnd);
    dayStart.setHours(0, 0, 0, 0);

    const dayLogs = (logs || []).filter((log) => {
      const d = logToDate(log);
      if (!d) return false;
      return d >= dayStart && d <= dayEnd;
    });

    const total = dayLogs.reduce((sum, log) => sum + logUnitsHuman(habit, log), 0);

    days.push({
      date: new Date(dayStart),
      logs: dayLogs,
      total,
    });
  }

  return days;
}

/**
 * Current week data (Sunday -> Saturday): 7 items with totals and labels
 */
function getCurrentWeekData(habit, logs) {
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const currentWeekDays = [];

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayLogs = (logs || []).filter((log) => {
      const d = logToDate(log);
      if (!d) return false;
      return d >= dayStart && d <= dayEnd;
    });

    const total = dayLogs.reduce((sum, log) => sum + logUnitsHuman(habit, log), 0);

    currentWeekDays.push({
      date: new Date(dayStart),
      label: dayLabels[i],
      logs: dayLogs,
      total,              // human units (or count for BINARY)
      count: dayLogs.length,
    });
  }

  return currentWeekDays;
}

function getTodayLogs(logs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (logs || []).filter((log) => {
    const d = logToDate(log);
    if (!d) return false;
    return d >= today && d < tomorrow;
  });
}

// ---------------------------
// Earnings (MICROS) helpers
// ---------------------------

function computeWeeklyEarningsMicrosFromWeeklyUnits(habit, weeklyUnitsHuman) {
  const rateType = getRateType(habit);
  const rateMicros = getRateMicros(habit);
  if (rateMicros <= 0) return 0;

  if (isBinaryRateType(rateType)) {
    // For binary, "units" represent sessions/occurrences
    const sessions = Number(weeklyUnitsHuman) || 0;
    return Math.trunc(sessions * rateMicros);
  }

  const weeklyUnitsMicros = unitsToMicros(weeklyUnitsHuman);
  return computeEarningsMicrosUI({
    rateType,
    rateMicros,
    unitsMicros: weeklyUnitsMicros > 0 ? weeklyUnitsMicros : MICRO_UNITS,
  });
}

/**
 * Calculate earnings at goal vs current (MICROS).
 *
 * Returns MICROS + (temporary) dollars floats for backwards compatibility.
 * UI should prefer the *Micros fields and format via micros.js.
 */
export function calculateEarningsImpact(habit, currentWeeklyUnitsHuman, goalWeeklyUnitsHuman) {
  if (!habit?.goal) return null;

  const atGoalWeeklyMicros = computeWeeklyEarningsMicrosFromWeeklyUnits(habit, goalWeeklyUnitsHuman);
  const currentWeeklyMicros = computeWeeklyEarningsMicrosFromWeeklyUnits(habit, currentWeeklyUnitsHuman);

  const atGoalAnnualMicros = atGoalWeeklyMicros * 52;
  const currentAnnualMicros = currentWeeklyMicros * 52;

  const gapWeeklyMicros = atGoalWeeklyMicros - currentWeeklyMicros;
  const gapAnnualMicros = atGoalAnnualMicros - currentAnnualMicros;

  return {
    // preferred: MICROS
    atGoal: { weeklyMicros: atGoalWeeklyMicros, annualMicros: atGoalAnnualMicros },
    current: { weeklyMicros: currentWeeklyMicros, annualMicros: currentAnnualMicros },
    gap: { weeklyMicros: gapWeeklyMicros, annualMicros: gapAnnualMicros },

    // legacy bridge: dollars floats (remove once UI is fully micros-formatted)
    atGoalDollars: { weekly: microsToDollars(atGoalWeeklyMicros), annual: microsToDollars(atGoalAnnualMicros) },
    currentDollars: { weekly: microsToDollars(currentWeeklyMicros), annual: microsToDollars(currentAnnualMicros) },
    gapDollars: { weekly: microsToDollars(gapWeeklyMicros), annual: microsToDollars(gapAnnualMicros) },
  };
}

// ============================================
// RATE-TYPE-SPECIFIC CALCULATIONS
// ============================================

/**
 * BINARY Habits (frequency/session-based)
 */
export function calculateBinaryGoalData(habit, logs) {
  const { goal, baseline } = habit || {};
  if (!goal) return null;

  // last 4 weeks
  const weeklyBuckets = groupLogsByWeek(logs, 4);

  // sessions per week
  const weeklyFrequencies = weeklyBuckets.map((weekLogs) => (weekLogs || []).length);

  // normalize goal to weekly sessions
  const goalFrequency = normalizeToPeriod(goal.amount, goal.period, "week");

  // baseline: assume baseline.avgPerPeriod is in the same goal.period units (legacy)
  const baselineFrequency = baseline?.avgPerPeriod
    ? normalizeToPeriod(baseline.avgPerPeriod, goal.period, "week")
    : 0;

  // current average (4-week)
  const totalSessions = weeklyFrequencies.reduce((a, b) => a + b, 0);
  const currentFrequency = totalSessions / 4;

  const weeksAtGoal = weeklyFrequencies.filter((f) => f >= goalFrequency).length;
  const hitRate = (weeksAtGoal / 4) * 100;

  const progress =
    goalFrequency > baselineFrequency
      ? Math.min(
          100,
          Math.max(
            0,
            ((currentFrequency - baselineFrequency) / (goalFrequency - baselineFrequency)) * 100
          )
        )
      : currentFrequency >= goalFrequency
      ? 100
      : 0;

  // current week visualization
  const currentWeekDays = getCurrentWeekData(habit, logs);
  const today = new Date();
  const todayIndex = today.getDay();

  // for binary, “at goal for the day” = at least 1 session
  const daysAtGoalThisWeek = currentWeekDays
    .slice(0, todayIndex + 1)
    .filter((d) => (d.count || 0) >= 1).length;

  const totalDaysThisWeek = todayIndex + 1;

  // earnings impact (weekly sessions)
  const earnings = calculateEarningsImpact(habit, currentFrequency, goalFrequency);

  return {
    type: "BINARY",
    goalFrequency,
    baselineFrequency,
    currentFrequency,
    weeklyFrequencies,
    weeksAtGoal,
    hitRate,
    gap: goalFrequency - currentFrequency,
    progress,
    earnings,
    currentWeekDays,
    daysAtGoalThisWeek,
    totalDaysThisWeek,
  };
}

/**
 * DURATION Habits (minutes/day goal typically)
 */
export function calculateDurationGoalData(habit, logs) {
  const { goal, baseline } = habit || {};
  if (!goal) return null;

  const dailyData = groupLogsByDay(habit, logs, 14);
  const dailyTotals = dailyData.map((d) => d.total);

  // normalize goal to daily units (minutes)
  const goalDaily = normalizeToPeriod(goal.amount, goal.period, "day");

  const baselineDaily = baseline?.avgPerPeriod
    ? normalizeToPeriod(baseline.avgPerPeriod, goal.period, "day")
    : 0;

  const daysAtGoal = dailyTotals.filter((d) => d >= goalDaily).length;
  const achievementRate = (daysAtGoal / 14) * 100;

  const currentDaily = dailyTotals.reduce((a, b) => a + b, 0) / 14;

  const thisWeekTotal = dailyTotals.slice(7).reduce((a, b) => a + b, 0);
  const lastWeekTotal = dailyTotals.slice(0, 7).reduce((a, b) => a + b, 0);
  const goalWeekly = normalizeToPeriod(goal.amount, goal.period, "week");

  const allDurations = (logs || []).map((l) => logUnitsHuman(habit, l));
  const longestSession = allDurations.length > 0 ? Math.max(...allDurations) : 0;

  const progress =
    goalDaily > baselineDaily
      ? Math.min(
          100,
          Math.max(0, ((currentDaily - baselineDaily) / (goalDaily - baselineDaily)) * 100)
        )
      : currentDaily >= goalDaily
      ? 100
      : 0;

  // current week dots
  const currentWeekDays = getCurrentWeekData(habit, logs);
  const today = new Date();
  const todayIndex = today.getDay();

  const daysAtGoalThisWeek = currentWeekDays
    .slice(0, todayIndex + 1)
    .filter((d) => (d.total || 0) >= goalDaily).length;
  const totalDaysThisWeek = todayIndex + 1;

  // today progress
  const todayLogs = getTodayLogs(logs);
  const todayTotal = todayLogs.reduce((sum, l) => sum + logUnitsHuman(habit, l), 0);
  const todayRemaining = Math.max(0, goalDaily - todayTotal);

  // earnings impact (weekly units)
  const currentWeeklyUnits = currentDaily * 7;
  const earnings = calculateEarningsImpact(habit, currentWeeklyUnits, goalWeekly);

  return {
    type: "DURATION",
    goalDaily,
    baselineDaily,
    currentDaily,
    dailyTotals,
    dailyData,
    daysAtGoal,
    achievementRate,
    thisWeekTotal,
    lastWeekTotal,
    goalWeekly,
    longestSession,
    gap: goalDaily - currentDaily,
    progress,
    earnings,
    currentWeekDays,
    daysAtGoalThisWeek,
    totalDaysThisWeek,
    todayTotal,
    todayRemaining,
  };
}

/**
 * DISTANCE Habits (miles/week goal typically)
 */
export function calculateDistanceGoalData(habit, logs) {
  const { goal, baseline } = habit || {};
  if (!goal) return null;

  const weeklyBuckets = groupLogsByWeek(logs, 6);

  const weeklyMileage = weeklyBuckets.map((weekLogs) =>
    (weekLogs || []).reduce((sum, log) => sum + logUnitsHuman(habit, log), 0)
  );

  const goalWeekly = normalizeToPeriod(goal.amount, goal.period, "week");

  const baselineWeekly = baseline?.avgPerPeriod
    ? normalizeToPeriod(baseline.avgPerPeriod, goal.period, "week")
    : 0;

  const currentWeekly = weeklyMileage.reduce((a, b) => a + b, 0) / 6;

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 Sunday
  const daysIntoWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  const currentWeekTotal = weeklyMileage[weeklyMileage.length - 1] || 0;
  const projectedThisWeek = daysIntoWeek > 0 ? (currentWeekTotal / daysIntoWeek) * 7 : 0;

  const recentAvg = weeklyMileage.slice(3).reduce((a, b) => a + b, 0) / 3;
  const olderAvg = weeklyMileage.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

  const trend =
    recentAvg > olderAvg * 1.1 ? "improving" : recentAvg < olderAvg * 0.9 ? "declining" : "stable";

  const allDistances = (logs || []).map((l) => logUnitsHuman(habit, l));
  const longestRun = allDistances.length > 0 ? Math.max(...allDistances) : 0;

  const recentRuns = [...(logs || [])]
    .map((l) => ({ log: l, d: logToDate(l) }))
    .filter((x) => x.d)
    .sort((a, b) => b.d.getTime() - a.d.getTime())
    .slice(0, 5)
    .map(({ log, d }) => {
      const distance = logUnitsHuman(habit, log);
      const earningsMicros = computeWeeklyEarningsMicrosFromWeeklyUnits(habit, distance);
      return {
        date: new Date(d),
        distance,
        earningsMicros,
        earningsDollars: microsToDollars(earningsMicros), // legacy bridge
      };
    });

  const progress =
    goalWeekly > baselineWeekly
      ? Math.min(
          100,
          Math.max(0, ((currentWeekly - baselineWeekly) / (goalWeekly - baselineWeekly)) * 100)
        )
      : currentWeekly >= goalWeekly
      ? 100
      : 0;

  const thisWeekProgress = goalWeekly > 0 ? (currentWeekTotal / goalWeekly) * 100 : 0;

  // current week dots (use daily goal = goalWeekly/7)
  const currentWeekDays = getCurrentWeekData(habit, logs);
  const todayIndex = today.getDay();
  const dailyGoal = goalWeekly / 7;

  const daysAtGoalThisWeek = currentWeekDays
    .slice(0, todayIndex + 1)
    .filter((d) => (d.total || 0) >= dailyGoal).length;

  const totalDaysThisWeek = todayIndex + 1;

  // earnings impact (weekly miles)
  const earnings = calculateEarningsImpact(habit, currentWeekly, goalWeekly);

  return {
    type: "DISTANCE",
    goalWeekly,
    baselineWeekly,
    currentWeekly,
    weeklyMileage,
    currentWeekTotal,
    projectedThisWeek,
    thisWeekProgress,
    trend,
    longestRun,
    recentRuns,
    gap: goalWeekly - currentWeekTotal,
    progress,
    earnings,
    currentWeekDays,
    daysAtGoalThisWeek,
    totalDaysThisWeek,
  };
}

/**
 * COUNT Habits (steps/reps/day goal typically)
 */
export function calculateCountGoalData(habit, logs) {
  const { goal, baseline } = habit || {};
  if (!goal) return null;

  const dailyData = groupLogsByDay(habit, logs, 7);
  const dailyCounts = dailyData.map((d) => d.total);

  const dayLabels = dailyData.map((d) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.date.getDay()];
  });

  const goalDaily = normalizeToPeriod(goal.amount, goal.period, "day");

  const baselineDaily = baseline?.avgPerPeriod
    ? normalizeToPeriod(baseline.avgPerPeriod, goal.period, "day")
    : 0;

  const daysAtGoal = dailyCounts.filter((d) => d >= goalDaily).length;
  const achievementRate = (daysAtGoal / 7) * 100;

  const currentDaily = dailyCounts.reduce((a, b) => a + b, 0) / 7;

  const thisWeekTotal = dailyCounts.reduce((a, b) => a + b, 0);
  const goalWeekly = normalizeToPeriod(goal.amount, goal.period, "week");
  const weekProgress = goalWeekly > 0 ? (thisWeekTotal / goalWeekly) * 100 : 0;

  // today
  const todayLogs = getTodayLogs(logs);
  const todayTotal = todayLogs.reduce((sum, l) => sum + logUnitsHuman(habit, l), 0);
  const todayRemaining = Math.max(0, goalDaily - todayTotal);
  const todayProgress = goalDaily > 0 ? (todayTotal / goalDaily) * 100 : 0;

  const highestDay = dailyCounts.length > 0 ? Math.max(...dailyCounts) : 0;
  const highestDayIndex = dailyCounts.indexOf(highestDay);
  const highestDayLabel = dayLabels[highestDayIndex] || "";

  const progress =
    goalDaily > baselineDaily
      ? Math.min(
          100,
          Math.max(0, ((currentDaily - baselineDaily) / (goalDaily - baselineDaily)) * 100)
        )
      : currentDaily >= goalDaily
      ? 100
      : 0;

  const currentWeekDays = getCurrentWeekData(habit, logs);
  const today = new Date();
  const todayIndex = today.getDay();

  const daysAtGoalThisWeek = currentWeekDays
    .slice(0, todayIndex + 1)
    .filter((d) => (d.total || 0) >= goalDaily).length;
  const totalDaysThisWeek = todayIndex + 1;

  // earnings impact (weekly count units)
  const currentWeeklyUnits = currentDaily * 7;
  const earnings = calculateEarningsImpact(habit, currentWeeklyUnits, goalWeekly);

  return {
    type: "COUNT",
    goalDaily,
    baselineDaily,
    currentDaily,
    dailyCounts,
    dailyData,
    dayLabels,
    daysAtGoal,
    achievementRate,
    thisWeekTotal,
    goalWeekly,
    weekProgress,
    todayTotal,
    todayRemaining,
    todayProgress,
    highestDay,
    highestDayLabel,
    gap: goalDaily - currentDaily,
    progress,
    earnings,
    currentWeekDays,
    daysAtGoalThisWeek,
    totalDaysThisWeek,
  };
}

// ---------------------------
// Router
// ---------------------------

export function calculateGoalData(habit, logs) {
  if (!habit?.goal) return null;

  const rateType = getRateType(habit);

  switch (rateType) {
    case "BINARY":
      return calculateBinaryGoalData(habit, logs);
    case "DURATION":
      return calculateDurationGoalData(habit, logs);
    case "DISTANCE":
      return calculateDistanceGoalData(habit, logs);
    case "COUNT":
      return calculateCountGoalData(habit, logs);
    default:
      return calculateBinaryGoalData(habit, logs);
  }
}

export function formatGoal(goal, unit) {
  if (!goal) return "";
  const amount = goal.amount?.toLocaleString?.() ?? String(goal.amount ?? "");
  return `${amount} ${unit} / ${goal.period}`;
}
