// src/pages/HabitDetail/HabitDetail.jsx
import { useState, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import useHabits from "@/hooks/useHabits";
import { formatCurrency } from "@/utils/formatters";
import { generateHabitInsights } from "@/utils/habitInsights";
import { getCalibrationStatus } from "@/utils/calibrationStatus";

import BackButton from "@/components/BackButton";
import GoalSection from "@/components/GoalSection/GoalSection";
import CalibratingFingerprint from "@/components/CalibratingFingerprint";
import FluxBadge from "@/components/FluxBadge";

import "./HabitDetail.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// -------------------------
// small helpers
// -------------------------
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toDayStartMs(msOrDate) {
  const d = msOrDate instanceof Date ? new Date(msOrDate) : new Date(Number(msOrDate));
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function safeNumber(n, fallback = 0) {
  const x = typeof n === "number" ? n : Number(n);
  return Number.isFinite(x) ? x : fallback;
}

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { habits, logs, deleteHabit, calculateFluxScore, isBinaryRateType } = useHabits();

  // Tabs
  const [activeTab, setActiveTab] = useState("overview");

  // Chart state
  const [chartType, setChartType] = useState("fluxScore"); // "fluxScore" | "earnings"
  const [chartPeriod, setChartPeriod] = useState("1M"); // 1W/1M/3M/YTD/1Y/ALL

  // Modals / menus
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showCalibrationInfo, setShowCalibrationInfo] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Insights accordion
  const [expandedInsight, setExpandedInsight] = useState(null);

  // Calendar day modal
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Calendar month navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Calendar swipe
  const calendarRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50;

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current == null || touchEndX.current == null) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // next month (but don't go past current)
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      if (!(calendarMonth.year === currentYear && calendarMonth.month === currentMonth)) {
        setCalendarMonth((prev) => {
          const newMonth = prev.month + 1;
          if (newMonth > 11) return { year: prev.year + 1, month: 0 };
          return { ...prev, month: newMonth };
        });
      }
    } else if (isRightSwipe) {
      // prev month
      setCalendarMonth((prev) => {
        const newMonth = prev.month - 1;
        if (newMonth < 0) return { year: prev.year - 1, month: 11 };
        return { ...prev, month: newMonth };
      });
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [calendarMonth]);

  // -------------------------
  // Habit lookup (NO normalization; provider already enriches)
  // -------------------------
  const habit = useMemo(() => (habits || []).find((h) => String(h?.id) === String(id)), [habits, id]);

  if (!habit) {
    return (
      <div className="habit-detail-page">
        <div className="error-container">
          <p>Habit not found</p>
          <button onClick={() => navigate("/portfolio", { state: { direction: "back" } })}>
            Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  // logs for this habit (provider already supplies: timestamp, timestampMs, units, amount, dayKey, etc.)
  const habitLogs = useMemo(() => {
    return (logs || [])
      .filter((l) => String(l?.habitId) === String(habit.id))
      .sort((a, b) => safeNumber(b?.timestampMs) - safeNumber(a?.timestampMs));
  }, [logs, habit.id]);

  const isBinaryHabit = useMemo(() => {
    const rt = String(habit?.rateType || "").toUpperCase();
    return isBinaryRateType ? !!isBinaryRateType(rt) : rt === "BINARY";
  }, [habit?.rateType, isBinaryRateType]);

  const unitLabel = habit?.unit || "";
  const goalUnitLabel = habit?.goalUnit || unitLabel || "units";

  // -------------------------
  // Insights + calibration (kept)
  // -------------------------
  const insights = useMemo(() => {
    // keep utility, but now it gets canonical shapes
    return generateHabitInsights(habit, habitLogs);
  }, [habit, habitLogs]);

  const calibrationStatus = useMemo(() => {
    return getCalibrationStatus(habitLogs);
  }, [habitLogs]);

  // Provide required prop for CalibratingFingerprint:
  // If your util doesn't supply daysRemaining yet, use logsNeeded as the fallback.
  const calibrationDaysRemaining = useMemo(() => {
    const n = calibrationStatus?.daysRemaining;
    if (n != null) return safeNumber(n, 0);
    return safeNumber(calibrationStatus?.logsNeeded, 0);
  }, [calibrationStatus]);

  const habitDataStatus = useMemo(() => {
    const logCount = calibrationStatus?.logCount ?? habitLogs.length;

    if (logCount === 0) {
      return {
        status: "no_data",
        message: "Complete this habit to start tracking your progress",
        logCount,
      };
    }
    if (calibrationStatus?.isCalibrating) {
      return {
        status: "building",
        message: calibrationStatus?.message || "Calibrating…",
        logCount,
      };
    }
    if (calibrationStatus?.isEmerging) {
      return {
        status: "emerging",
        message: "Baseline emerging",
        logCount,
      };
    }
    return { status: "sufficient", logCount };
  }, [calibrationStatus, habitLogs.length]);

  // Flux score (from backend boot.flux.byHabit)
  const fluxScoreData = useMemo(() => {
    return calculateFluxScore?.(habit.id) ?? null;
  }, [habit.id, calculateFluxScore]);

  // -------------------------
  // Header stats
  // -------------------------
  const stats = useMemo(() => {
    const now = Date.now();
    const createdAtMs =
      habit?.createdAtMs != null ? Number(habit.createdAtMs) : habit?.createdAt ? new Date(habit.createdAt).getTime() : now;

    const daysSinceCreation = Math.max(1, Math.floor((now - createdAtMs) / MS_PER_DAY));

    // total earned dollars: provider already gives log.amount (transfer dollars)
    const totalEarnings = habitLogs.reduce((sum, l) => sum + safeNumber(l?.amount, 0), 0);

    // completion rate: last 30 days, unique days with at least one log
    const thirtyDaysAgoMs = now - 30 * MS_PER_DAY;
    const recent = habitLogs.filter((l) => safeNumber(l?.timestampMs) >= thirtyDaysAgoMs);

    const uniqueDaysRecent = new Set(recent.map((l) => l?.dayKey).filter(Boolean)).size;

    const periodDays = Math.min(30, daysSinceCreation);
    const expected = periodDays; // keep same assumption until schedule exists
    const completionRate = expected > 0 ? Math.min(100, Math.round((uniqueDaysRecent / expected) * 100)) : 0;

    // current streak (unique-day streak)
    const uniqueDaysAll = Array.from(new Set(habitLogs.map((l) => l?.dayKey).filter(Boolean)));
    // Need chronological day ordering — easiest: map to dayStartMs from timestampMs
    const uniqueDayStartMs = Array.from(
      new Set(
        habitLogs
          .map((l) => safeNumber(l?.timestampMs))
          .filter((ms) => ms > 0)
          .map((ms) => toDayStartMs(ms))
      )
    ).sort((a, b) => b - a);

    const todayStart = toDayStartMs(Date.now());
    const yesterdayStart = todayStart - MS_PER_DAY;

    let currentStreak = 0;
    if (uniqueDayStartMs.length > 0) {
      const last = uniqueDayStartMs[0];
      if (last === todayStart || last === yesterdayStart) {
        currentStreak = 1;
        let cursor = last;
        for (let i = 1; i < uniqueDayStartMs.length; i++) {
          cursor = cursor - MS_PER_DAY;
          if (uniqueDayStartMs[i] === cursor) currentStreak++;
          else break;
        }
      }
    }

    const consistencyScore = Math.min(100, completionRate);
    const streakBonus = Math.min(20, currentStreak * 2);
    const hss = Math.min(100, Math.round(consistencyScore * 0.8 + streakBonus));

    return {
      totalEarnings,
      completionRate,
      currentStreak,
      hss,
      daysSinceCreation,
      uniqueDaysAll,
    };
  }, [habit, habitLogs]);

  // logged today?
  const isLoggedToday = useMemo(() => {
    const todayKey = new Date().toDateString();
    return habitLogs.some((l) => l?.dayKey === todayKey);
  }, [habitLogs]);

  // Recent activity (top 10)
  const recentActivity = useMemo(() => habitLogs.slice(0, 10), [habitLogs]);

  // Weekly summary
  const weeklySummary = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now);
    const dayOfWeek = todayStart.getDay(); // 0 Sun
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekStartMs = weekStart.getTime();
    const lastWeekStartMs = weekStartMs - 7 * MS_PER_DAY;

    const thisWeek = habitLogs.filter((l) => safeNumber(l?.timestampMs) >= weekStartMs);
    const lastWeek = habitLogs.filter((l) => {
      const t = safeNumber(l?.timestampMs);
      return t >= lastWeekStartMs && t < weekStartMs;
    });

    const uniqueDays = (arr) =>
      new Set(arr.map((l) => l?.dayKey).filter(Boolean)).size;

    const thisWeekDays = uniqueDays(thisWeek);
    const lastWeekDays = uniqueDays(lastWeek);

    const thisWeekEarnings = thisWeek.reduce((sum, l) => sum + safeNumber(l?.amount, 0), 0);
    const lastWeekEarnings = lastWeek.reduce((sum, l) => sum + safeNumber(l?.amount, 0), 0);

    const daysElapsed = dayOfWeek + 1;
    const daysDiff = thisWeekDays - lastWeekDays;
    const earningsDiff = thisWeekEarnings - lastWeekEarnings;

    return {
      thisWeekDays,
      lastWeekDays,
      daysElapsed,
      thisWeekEarnings,
      lastWeekEarnings,
      daysDiff,
      earningsDiff,
      isAhead:
        thisWeekDays >= Math.floor((daysElapsed / 7) * (lastWeekDays || 0)) || thisWeekDays > lastWeekDays,
    };
  }, [habitLogs]);

  // -------------------------
  // Calendar heatmap data
  // -------------------------
  const canGoNext = useMemo(() => {
    const now = new Date();
    return !(calendarMonth.year === now.getFullYear() && calendarMonth.month === now.getMonth());
  }, [calendarMonth]);

  const goToPreviousMonth = () => {
    setCalendarMonth((prev) => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: newMonth };
    });
  };

  const goToNextMonth = () => {
    if (!canGoNext) return;
    setCalendarMonth((prev) => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: newMonth };
    });
  };

  const calendarData = useMemo(() => {
    const todayStart = toDayStartMs(Date.now());
    const { year, month } = calendarMonth;

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastOfMonth.getDate();
    const startDayOfWeek = firstOfMonth.getDay();
    const endDayOfWeek = lastOfMonth.getDay();

    const logCountByDayStart = new Map();
    for (const l of habitLogs) {
      const ms = safeNumber(l?.timestampMs);
      if (ms <= 0) continue;
      const dayStart = toDayStartMs(ms);
      logCountByDayStart.set(dayStart, (logCountByDayStart.get(dayStart) || 0) + 1);
    }

    const days = [];

    // padding before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, count: 0, isPadding: true, isFuture: false, level: 0 });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      const dayStart = date.getTime();
      const count = logCountByDayStart.get(dayStart) || 0;

      const isFuture = dayStart > todayStart;
      const isToday = dayStart === todayStart;

      days.push({
        date,
        day,
        count,
        isPadding: false,
        isFuture,
        isToday,
        level: isFuture ? 0 : count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3,
      });
    }

    // padding after month ends
    const remaining = 6 - endDayOfWeek;
    for (let i = 0; i < remaining; i++) {
      days.push({ date: null, count: 0, isPadding: true, isFuture: false, level: 0 });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

    return {
      weeks,
      monthName: firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  }, [habitLogs, calendarMonth]);

  const logsForDay = useCallback(
    (dateObj) => {
      if (!dateObj) return [];
      const startMs = toDayStartMs(dateObj);
      const endMs = startMs + MS_PER_DAY - 1;

      return habitLogs.filter((l) => {
        const t = safeNumber(l?.timestampMs);
        return t >= startMs && t <= endMs;
      });
    },
    [habitLogs]
  );

  const formatActivityTime = (timestampMs) => {
    const d = new Date(Number(timestampMs));
    const now = new Date();
    const diffDays = Math.floor((toDayStartMs(now) - toDayStartMs(d)) / MS_PER_DAY);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // -------------------------
  // Chart data (kept; derived from logs)
  // -------------------------
  const chartData = useMemo(() => {
    const now = new Date();
    const nowMs = now.getTime();

    const createdAtMs =
      habit?.createdAtMs != null
        ? Number(habit.createdAtMs)
        : habit?.createdAt
        ? new Date(habit.createdAt).getTime()
        : nowMs;

    const ranges = {
      "1W": 7,
      "1M": 30,
      "3M": 90,
      YTD: Math.max(1, Math.floor((nowMs - new Date(now.getFullYear(), 0, 1).getTime()) / MS_PER_DAY)),
      "1Y": 365,
      ALL: Math.max(7, Math.floor((nowMs - createdAtMs) / MS_PER_DAY) + 1),
    };

    const days = Math.max(7, Math.min(ranges[chartPeriod] ?? 30, 365));
    let dataPoints;

    switch (chartPeriod) {
      case "1W":
        dataPoints = 7;
        break;
      case "1M":
      case "3M":
      case "YTD":
        dataPoints = 15;
        break;
      case "1Y":
        dataPoints = 16;
        break;
      case "ALL":
      default:
        dataPoints = 15;
    }

    const interval = Math.max(1, Math.floor(days / dataPoints));
    const points = [];

    for (let i = dataPoints; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * interval);
      d.setHours(0, 0, 0, 0);
      const dMs = d.getTime();

      const logsUpTo = habitLogs.filter((l) => safeNumber(l?.timestampMs) <= dMs);
      const cumulativeEarnings = logsUpTo.reduce((sum, l) => sum + safeNumber(l?.amount, 0), 0);

      // rolling 7-day score: unique days logged in previous 7 days
      const sevenDaysAgoMs = dMs - 7 * MS_PER_DAY;
      const inWindow = habitLogs.filter((l) => {
        const t = safeNumber(l?.timestampMs);
        return t > sevenDaysAgoMs && t <= dMs;
      });
      const uniqueDays = new Set(inWindow.map((l) => l?.dayKey).filter(Boolean)).size;
      const fluxScore = Math.round((uniqueDays / 7) * 100);

      points.push({
        dateMs: dMs,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cumulativeEarnings,
        fluxScore,
      });
    }

    return points;
  }, [habit, habitLogs, chartPeriod]);

  const chartConfig = useMemo(() => {
    const labels = chartData.map((d) => d.label);
    const values = chartData.map((d) => (chartType === "fluxScore" ? d.fluxScore : d.cumulativeEarnings));

    const isFlux = chartType === "fluxScore";
    const lineColor = isFlux ? "#3b82f6" : "#22c55e";
    const gradientColorStart = isFlux ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 197, 94, 0.2)";
    const gradientColorEnd = isFlux ? "rgba(59, 130, 246, 0)" : "rgba(34, 197, 94, 0)";

    return {
      labels,
      datasets: [
        {
          label: isFlux ? "Flux Score" : "Earnings",
          data: values,
          borderColor: lineColor,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, gradientColorStart);
            gradient.addColorStop(1, gradientColorEnd);
            return gradient;
          },
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [chartData, chartType]);

  /** @type {import("chart.js").ChartOptions<"line">} */
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 10 } },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#6b7280",
          bodyColor: "#111827",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (ctx) => {
              const value = safeNumber(ctx?.parsed?.y, 0);
              if (chartType === "fluxScore") return `Score: ${Math.round(value)}`;
              return `Earned: ${formatCurrency(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: "#9ca3af", maxTicksLimit: 5 },
        },
        y: {
          display: false,
          grace: "10%",
          grid: { color: "#f3f4f6" },
        },
      },
    }),
    [chartType]
  );

  // -------------------------
  // Actions
  // -------------------------
  const handleEdit = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  const handlePause = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  const handleDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    try {
      await deleteHabit?.(habit.id);
      navigate("/portfolio", { state: { direction: "back" } });
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to delete habit.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="habit-detail-page">
      <div className="habit-detail-container">
        {/* Header */}
        <header className="detail-header">
          <BackButton to="/portfolio" />
          <span className="header-title">{habit.name}</span>

          <div className="header-actions">
            <button
              className="more-menu-btn"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              aria-label="More options"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {showMoreMenu && (
              <>
                <div className="menu-backdrop" onClick={() => setShowMoreMenu(false)} />
                <div className="more-menu-dropdown">
                  <button
                    className="menu-item"
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleEdit();
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Habit
                  </button>

                  <button
                    className="menu-item"
                    onClick={() => {
                      setShowMoreMenu(false);
                      handlePause();
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Pause Habit
                  </button>

                  <button
                    className="menu-item delete"
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleDelete();
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Habit
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className={`hero-section ${habitDataStatus.status !== "sufficient" ? "calibrating" : ""}`}>
          <div className="hero-calibrating-layout">
            <div className="hero-section-left">
              <div className="calibrating-earnings">{formatCurrency(stats.totalEarnings)}</div>
              <span className="calibrating-earnings-label">lifetime earnings</span>

              {(isLoggedToday || habit.isActive === false) && (
                <div className="hero-status-inline">
                  {isLoggedToday && (
                    <div className="today-status">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Completed today</span>
                    </div>
                  )}
                  {habit.isActive === false && (
                    <div className="paused-status">
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                      <span>Paused</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hero-section-right">
              {habitDataStatus.status !== "sufficient" ? (
                <CalibratingFingerprint
                  logsNeeded={safeNumber(calibrationStatus?.logsNeeded, 0)}
                  daysRemaining={calibrationDaysRemaining}
                  size="hero"
                />
              ) : (
                <FluxBadge score={safeNumber(fluxScoreData?.score, 0)} size="md" />
              )}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="detail-tabs">
          <button className={`detail-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            Overview
          </button>
          <button className={`detail-tab ${activeTab === "activity" ? "active" : ""}`} onClick={() => setActiveTab("activity")}>
            Activity
          </button>
          <button className={`detail-tab ${activeTab === "insights" ? "active" : ""}`} onClick={() => setActiveTab("insights")}>
            Insights
          </button>
        </div>

        {/* ================= OVERVIEW ================= */}
        {activeTab === "overview" && (
          <>
            {/* Performance Chart */}
            <section className="detail-chart-section">
              <div className="detail-chart-header">
                <h3 className="detail-section-title">Performance</h3>
                <div className="chart-toggle-group">
                  <button
                    className={`chart-toggle-btn ${chartType === "fluxScore" ? "active" : ""}`}
                    onClick={() => setChartType("fluxScore")}
                  >
                    Score
                  </button>
                  <button
                    className={`chart-toggle-btn ${chartType === "earnings" ? "active" : ""}`}
                    onClick={() => setChartType("earnings")}
                  >
                    Earnings
                  </button>
                </div>
              </div>

              {habitDataStatus.status === "no_data" ? (
                <div className="chart-empty-state">
                  <div className="chart-empty-icon">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="chart-empty-message">{habitDataStatus.message}</p>
                </div>
              ) : chartType === "fluxScore" && calibrationStatus?.isCalibrating ? (
                <div className="chart-calibrating-state">
                  <div className="chart-calibrating-icon">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeWidth="1.5" d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <p className="chart-calibrating-message">Flux Score calibrating</p>
                  <p className="chart-calibrating-submessage">{calibrationStatus?.message}</p>
                </div>
              ) : (
                <>
                  {habitDataStatus.status !== "sufficient" && chartType === "earnings" && (
                    <div className="chart-building-notice">
                      <span className="building-dot"></span>
                      {habitDataStatus.message}
                    </div>
                  )}
                  <div className="chart-container">
                    <Line data={chartConfig} options={chartOptions} />
                  </div>
                </>
              )}

              <div className="time-toggles">
                {["1W", "1M", "3M", "YTD", "1Y", "ALL"].map((p) => (
                  <button
                    key={p}
                    className={`time-toggle ${chartPeriod === p ? "active" : ""}`}
                    onClick={() => setChartPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>

            {/* Goal Progress */}
            {habit.goal && <GoalSection habit={habit} logs={habitLogs} />}

            {/* Weekly Summary */}
            <section className="weekly-summary-section">
              <div className="weekly-summary-card">
                <div className="weekly-summary-header">
                  <h3 className="weekly-summary-title">This Week</h3>
                  <span className={`weekly-trend ${weeklySummary.isAhead ? "positive" : "neutral"}`}>
                    {weeklySummary.daysDiff > 0 ? "+" : ""}
                    {weeklySummary.daysDiff} vs last week
                  </span>
                </div>
                <div className="weekly-summary-stats">
                  <div className="weekly-stat">
                    <span className="weekly-stat-value">{weeklySummary.thisWeekDays}</span>
                    <span className="weekly-stat-label">days completed</span>
                  </div>
                  <div className="weekly-stat-divider" />
                  <div className="weekly-stat">
                    <span className="weekly-stat-value">{formatCurrency(weeklySummary.thisWeekEarnings)}</span>
                    <span className="weekly-stat-label">earned</span>
                  </div>
                </div>
                {weeklySummary.lastWeekDays > 0 && (
                  <div className="weekly-comparison">
                    <span className="comparison-label">Last week:</span>
                    <span className="comparison-value">
                      {weeklySummary.lastWeekDays} days · {formatCurrency(weeklySummary.lastWeekEarnings)}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ================= ACTIVITY ================= */}
        {activeTab === "activity" && (
          <>
            {/* Calendar Heatmap */}
            <section className="calendar-section">
              <div className="calendar-header">
                <h3 className="detail-section-title">Calendar</h3>
                <div className="calendar-nav">
                  <span className="calendar-month-label">{calendarData.monthName}</span>
                  <div className="calendar-arrows">
                    <button className="calendar-arrow" onClick={goToPreviousMonth} aria-label="Previous month">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className={`calendar-arrow ${!canGoNext ? "disabled" : ""}`}
                      onClick={goToNextMonth}
                      disabled={!canGoNext}
                      aria-label="Next month"
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="calendar-heatmap"
                ref={calendarRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="calendar-weekday-labels">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>

                <div className="calendar-month-grid">
                  {calendarData.weeks.map((week, wi) => (
                    <div key={wi} className="calendar-week-row">
                      {week.map((day, di) => (
                        <div
                          key={di}
                          className={`calendar-day ${
                            day.isPadding ? "padding" : day.isFuture ? "future" : `level-${day.level}`
                          } ${day.isToday ? "today" : ""} ${
                            !day.isPadding && !day.isFuture && day.count > 0 ? "tappable" : ""
                          }`}
                          onClick={() => {
                            if (!day.isPadding && !day.isFuture && day.count > 0) setSelectedCalendarDay(day);
                          }}
                        >
                          {!day.isPadding && <span className="day-number">{day.day}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="calendar-legend">
                  <span className="legend-label">Less</span>
                  <div className="legend-squares">
                    <div className="legend-square level-0"></div>
                    <div className="legend-square level-1"></div>
                    <div className="legend-square level-2"></div>
                    <div className="legend-square level-3"></div>
                  </div>
                  <span className="legend-label">More</span>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="detail-activity-section">
              <h3 className="detail-section-title">Recent Activity</h3>

              {recentActivity.length > 0 ? (
                <div className="detail-activity-list">
                  {recentActivity.slice(0, 5).map((log) => (
                    <div key={log.id} className="detail-activity-item">
                      <div className="activity-date">
                        <span className="date-day">{new Date(log.timestampMs).getDate()}</span>
                        <span className="date-month">
                          {new Date(log.timestampMs).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </div>

                      <div className="activity-info">
                        <div className="activity-title">
                          {isBinaryHabit ? "Completed" : `${safeNumber(log.units, 0)} ${goalUnitLabel}`}
                        </div>
                        <div className="activity-time">{formatActivityTime(log.timestampMs)}</div>
                      </div>

                      <div className="activity-amount">+{formatCurrency(safeNumber(log.amount, 0))}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="activity-empty">
                  <div className="empty-icon">
                    <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <p className="empty-title">No activity yet</p>
                  <p className="empty-subtitle">Complete this habit to start tracking</p>
                </div>
              )}

              {habitLogs.length > 5 && (
                <button className="view-history-btn" onClick={() => navigate("/activity", { state: { habitId: habit.id } })}>
                  View Full History
                </button>
              )}
            </section>
          </>
        )}

        {/* ================= INSIGHTS ================= */}
        {activeTab === "insights" && (
          <section className="insights-accordion-section">
            <h3 className="detail-section-title">Insights</h3>

            {/* Milestone */}
            <div className={`accordion-item ${expandedInsight === "milestone" ? "expanded" : ""}`}>
              <button
                className="accordion-header"
                onClick={() => setExpandedInsight(expandedInsight === "milestone" ? null : "milestone")}
              >
                <div className="accordion-header-left">
                  <span className="accordion-icon milestone">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="accordion-title">Next Milestone</span>
                </div>
                <div className="accordion-header-right">
                  <span className="accordion-preview">{formatCurrency(safeNumber(insights?.milestone?.target, 0))}</span>
                  <svg className="accordion-chevron" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div className="accordion-content">
                {insights?.milestone?.reached ? (
                  <p className="insight-message">{insights?.milestone?.message}</p>
                ) : (
                  <>
                    <div className="milestone-progress-container">
                      <div className="milestone-progress-bar">
                        <div
                          className="milestone-progress-fill"
                          style={{ width: `${safeNumber(insights?.milestone?.progress, 0)}%` }}
                        />
                      </div>
                      <div className="milestone-progress-text">
                        <span>{formatCurrency(safeNumber(insights?.milestone?.current, 0))}</span>
                        <span>{formatCurrency(safeNumber(insights?.milestone?.target, 0))}</span>
                      </div>
                    </div>
                    <p className="insight-message">{insights?.milestone?.message}</p>
                  </>
                )}
              </div>
            </div>

            {/* Maturity */}
            <div className={`accordion-item ${expandedInsight === "maturity" ? "expanded" : ""}`}>
              <button
                className="accordion-header"
                onClick={() => setExpandedInsight(expandedInsight === "maturity" ? null : "maturity")}
              >
                <div className="accordion-header-left">
                  <span className={`accordion-icon maturity ${insights?.maturity?.stage || ""}`}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                  <span className="accordion-title">Habit Stage</span>
                </div>
                <div className="accordion-header-right">
                  <span className="accordion-preview">{insights?.maturity?.title || "—"}</span>
                  <svg className="accordion-chevron" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div className="accordion-content">
                <p className="maturity-description">{insights?.maturity?.description}</p>

                {insights?.maturity?.nextStage && (
                  <div className="maturity-progress-container">
                    <div className="maturity-progress-bar">
                      <div className="maturity-progress-fill" style={{ width: `${safeNumber(insights?.maturity?.progress, 0)}%` }} />
                    </div>
                    <p className="maturity-next">
                      {safeNumber(insights?.maturity?.daysUntilNext, 0)} days until {insights?.maturity?.nextStage}
                    </p>
                  </div>
                )}

                <p className="insight-advice">{insights?.maturity?.insight}</p>
              </div>
            </div>

            {/* Calibration */}
            <div className={`accordion-item ${expandedInsight === "calibration" ? "expanded" : ""}`}>
              <button
                className="accordion-header"
                onClick={() => setExpandedInsight(expandedInsight === "calibration" ? null : "calibration")}
              >
                <div className="accordion-header-left">
                  <span className={`accordion-icon calibration ${insights?.calibration?.status || ""}`}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  <span className="accordion-title">Difficulty</span>
                </div>
                <div className="accordion-header-right">
                  <span className="accordion-preview">{insights?.calibration?.title || "—"}</span>
                  <svg className="accordion-chevron" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div className="accordion-content">
                <p className="insight-message">{insights?.calibration?.message}</p>
                {insights?.calibration?.suggestion && <p className="insight-suggestion">{insights.calibration.suggestion}</p>}
                <button className="calibration-info-link" onClick={() => setShowCalibrationInfo(true)}>
                  Learn more about calibration
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Calendar Day Detail Modal */}
      {selectedCalendarDay && (
        <div className="modal-overlay" onClick={() => setSelectedCalendarDay(null)}>
          <div className="calendar-day-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-day-modal-header">
              <h3>
                {selectedCalendarDay.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <button className="modal-close-btn" onClick={() => setSelectedCalendarDay(null)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="calendar-day-modal-content">
              {logsForDay(selectedCalendarDay.date).map((log, idx) => (
                <div key={log.id ?? idx} className="calendar-day-log">
                  <div className="calendar-log-time">
                    {new Date(log.timestampMs).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </div>
                  <div className="calendar-log-details">
                    <span className="calendar-log-amount">
                      {isBinaryHabit ? "Completed" : `${safeNumber(log.units, 0)} ${goalUnitLabel}`}
                    </span>
                    <span className="calendar-log-earnings">+{formatCurrency(safeNumber(log.amount, 0))}</span>
                  </div>
                </div>
              ))}

              <div className="calendar-day-summary">
                <span>Total:</span>
                <span className="calendar-day-total">
                  +
                  {formatCurrency(
                    logsForDay(selectedCalendarDay.date).reduce((sum, l) => sum + safeNumber(l?.amount, 0), 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Habit?</h3>
            <p className="modal-text">
              This will permanently delete this habit and all its activity history. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="modal-btn delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Toast */}
      {showComingSoon && (
        <div className="coming-soon-toast">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Coming Soon</span>
        </div>
      )}

      {/* Calibration Info Modal */}
      {showCalibrationInfo && (
        <div className="modal-overlay" onClick={() => setShowCalibrationInfo(false)}>
          <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <h3 className="info-modal-title">Difficulty Calibration</h3>
              <button className="info-modal-close" onClick={() => setShowCalibrationInfo(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="info-modal-text">
              Difficulty calibration analyzes your completion rate to determine if this habit is set at the right level for you.
            </p>

            <ul className="info-modal-list">
              <li><strong>Building:</strong> Still gathering data (first logs)</li>
              <li><strong>Struggling:</strong> Below 70% - consider making it easier</li>
              <li><strong>Challenging:</strong> 70-80% - a healthy growth zone</li>
              <li><strong>Well Calibrated:</strong> 80-95% - sustainable and challenging</li>
              <li><strong>Ready for More:</strong> Above 95% - consider increasing difficulty</li>
            </ul>

            <button className="info-modal-button" onClick={() => setShowCalibrationInfo(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
