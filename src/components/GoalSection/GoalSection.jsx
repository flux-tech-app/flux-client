// src/components/GoalSection/GoalSection.jsx
import { useMemo, useState } from "react";
import { calculateGoalData } from "@/utils/goalCalculations";
import { getCalibrationStatus } from "@/utils/calibrationStatus";
import GoalSetup from "../GoalSetup/GoalSetup";
import useHabits from "@/hooks/useHabits";
import Button from "../Button";
import { dollarsToMicros, formatUSDFromMicros } from "@/utils/micros";
import "./GoalSection.css";

/**
 * GoalSection
 *
 * Minimal migration:
 * - use server catalog for GoalSetup data
 * - use micros formatter for earnings display
 */
export default function GoalSection({ habit, logs }) {
  const { updateHabitGoal, catalog } = useHabits();
  const [showEditGoal, setShowEditGoal] = useState(false);

  const goalData = useMemo(() => calculateGoalData(habit, logs), [habit, logs]);

  // Find catalog habit by libraryId
  const catalogHabit = useMemo(() => {
    const id = habit?.libraryId;
    if (!id) return null;
    const list = catalog?.habits ?? [];
    return list.find((h) => h?.id === id) ?? null;
  }, [catalog, habit?.libraryId]);

  if (!habit?.goal || !goalData) return null;

  const handleGoalUpdate = (newGoal) => {
    updateHabitGoal(habit.id, newGoal);
    setShowEditGoal(false);
  };

  // ---- money formatting: micros-first, legacy fallback ----
  const formatMoney = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return formatUSDFromMicros(0);

    // Heuristic:
    // - micros values are typically >= 1_000 for $0.001 and up
    // - legacy dollars floats are typically small like 0.25, 5, 10, etc.
    // If it's clearly a micros integer, format directly; else treat as dollars.
    if (Math.abs(n) >= 1_000) return formatUSDFromMicros(n);
    return formatUSDFromMicros(dollarsToMicros(n));
  };

  // Rate can be either micros (new) or dollars float (legacy).
  // For GoalSetup we want rateMicros.
  const rateMicros = (() => {
    if (habit?.rateMicros != null) return Number(habit.rateMicros);
    const r = Number(habit?.rate);
    if (!Number.isFinite(r)) return 0;
    // if it looks like micros already, keep it
    if (Math.abs(r) >= 1_000) return r;
    return dollarsToMicros(r);
  })();

  // Progress ring math (unchanged)
  const ringProgress = Math.min(100, Math.max(0, goalData.progress ?? 0));
  const circumference = 2 * Math.PI * 34;
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  return (
    <section className="goal-section">
      <div className="goal-section-header">
        <h3 className="goal-section-title">Goal Progress</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEditGoal(true)}
          leftIcon={null}
          rightIcon={null}
        >
          Edit
        </Button>
      </div>

      <div className="goal-top-row">
        <div className="goal-progress-ring-container">
          <div className="goal-ring-wrapper">
            <svg className="goal-ring" viewBox="0 0 80 80">
              <defs>
                <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <circle className="goal-ring-bg" cx="40" cy="40" r="34" />
              <circle
                className="goal-ring-progress"
                cx="40"
                cy="40"
                r="34"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="goal-ring-value">
              <span className="goal-ring-percent">{Math.round(ringProgress)}%</span>
            </div>
          </div>
        </div>

        <MetricsBarChart goalData={goalData} habit={habit} logs={logs} />
      </div>

      <CurrentWeekView goalData={goalData} habit={habit} />

      {goalData.todayTotal !== undefined && goalData.goalDaily > 0 && (
        <TodayProgress goalData={goalData} habit={habit} />
      )}

      {goalData.earnings ? (
        <div className="earnings-inline">
          {goalData.earnings.gap?.weekly > 0 ? (
            <span>
              Potential:{" "}
              <span className="earnings-inline-value">
                +{formatMoney(goalData.earnings.gap.weekly)}/wk
              </span>{" "}
              at goal
              <span className="earnings-inline-annual">
                {" "}
                (+{formatMoney(goalData.earnings.gap.annual)}/yr)
              </span>
            </span>
          ) : (
            <span>
              On track for{" "}
              <span className="earnings-inline-value">
                {formatMoney(goalData.earnings.current?.weekly)}/wk
              </span>
            </span>
          )}
        </div>
      ) : null}

      {/* Edit Goal Modal */}
      {showEditGoal && catalogHabit ? (
        <div className="modal-overlay" onClick={() => setShowEditGoal(false)}>
          <div className="edit-goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-goal-modal-header">
              <h3>Edit Goal</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditGoal(false)}
                className="modal-close-btn"
                leftIcon={null}
                rightIcon={null}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <GoalSetup
              habitLibraryData={catalogHabit}
              selectedRate={rateMicros}
              initialGoal={habit.goal}
              onGoalSet={handleGoalUpdate}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* ====== Rest of your file unchanged below (helpers) ====== */

function formatStatValue(goalData, type, habit) {
  let value = 0;
  let period = "wk";

  switch (goalData.type) {
    case "BINARY":
      if (type === "baseline") value = goalData.baselineFrequency;
      else if (type === "current") value = goalData.currentFrequency;
      else value = goalData.goalFrequency;
      period = "/wk";
      break;
    case "DURATION":
      if (type === "baseline") value = goalData.baselineDaily;
      else if (type === "current") value = goalData.currentDaily;
      else value = goalData.goalDaily;
      period = "/day";
      break;
    case "DISTANCE":
      if (type === "baseline") value = goalData.baselineWeekly;
      else if (type === "current") value = goalData.currentWeekly;
      else value = goalData.goalWeekly;
      period = "/wk";
      break;
    case "COUNT":
      if (type === "baseline") value = goalData.baselineDaily;
      else if (type === "current") value = goalData.currentDaily;
      else value = goalData.goalDaily;
      period = "/day";
      break;
    default:
      break;
  }

  const formatted = value < 10 ? Number(value || 0).toFixed(1) : Math.round(value || 0).toLocaleString();
  return `${formatted}${period}`;
}

function getRawValue(goalData, type) {
  switch (goalData.type) {
    case "BINARY":
      if (type === "baseline") return goalData.baselineFrequency || 0;
      if (type === "current") return goalData.currentFrequency || 0;
      return goalData.goalFrequency || 1;
    case "DURATION":
      if (type === "baseline") return goalData.baselineDaily || 0;
      if (type === "current") return goalData.currentDaily || 0;
      return goalData.goalDaily || 1;
    case "DISTANCE":
      if (type === "baseline") return goalData.baselineWeekly || 0;
      if (type === "current") return goalData.currentWeekly || 0;
      return goalData.goalWeekly || 1;
    case "COUNT":
      if (type === "baseline") return goalData.baselineDaily || 0;
      if (type === "current") return goalData.currentDaily || 0;
      return goalData.goalDaily || 1;
    default:
      return type === "goal" ? 1 : 0;
  }
}

function MetricsBarChart({ goalData, habit, logs }) {
  const baseline = getRawValue(goalData, "baseline");
  const current = getRawValue(goalData, "current");
  const goal = getRawValue(goalData, "goal");

  const calibrationStatus = getCalibrationStatus(logs);
  const isBaselineCalibrating = !habit.baseline?.avgPerPeriod && calibrationStatus.isCalibrating;

  const maxValue = Math.max(goal, current, isBaselineCalibrating ? 0 : baseline) || 1;
  const baselinePercent = isBaselineCalibrating ? 0 : Math.min(100, (baseline / maxValue) * 100);
  const currentPercent = Math.min(100, (current / maxValue) * 100);
  const goalPercent = (goal / maxValue) * 100;

  return (
    <div className="metrics-bar-chart">
      <div className={`metric-bar-row baseline ${isBaselineCalibrating ? "calibrating" : ""}`}>
        <span className="metric-bar-label">Baseline</span>
        <div className="metric-bar-track">
          {isBaselineCalibrating ? (
            <div className="metric-bar-calibrating">
              <span className="calibrating-dot"></span>
              <span className="calibrating-dot"></span>
              <span className="calibrating-dot"></span>
            </div>
          ) : (
            <div className="metric-bar-fill baseline" style={{ width: `${baselinePercent}%` }} />
          )}
        </div>
        <span className="metric-bar-value calibrating-text">
          {isBaselineCalibrating ? "Calibrating" : formatStatValue(goalData, "baseline", habit)}
        </span>
      </div>

      <div className="metric-bar-row current">
        <span className="metric-bar-label">Current</span>
        <div className="metric-bar-track">
          <div className="metric-bar-fill current" style={{ width: `${currentPercent}%` }} />
        </div>
        <span className="metric-bar-value">{formatStatValue(goalData, "current", habit)}</span>
      </div>

      <div className="metric-bar-row goal">
        <span className="metric-bar-label">Goal</span>
        <div className="metric-bar-track">
          <div className="metric-bar-fill goal" style={{ width: `${goalPercent}%` }} />
        </div>
        <span className="metric-bar-value">{formatStatValue(goalData, "goal", habit)}</span>
      </div>
    </div>
  );
}

function CurrentWeekView({ goalData }) {
  const { currentWeekDays, daysAtGoalThisWeek, totalDaysThisWeek } = goalData;
  if (!currentWeekDays || currentWeekDays.length === 0) return null;

  const today = new Date();
  const todayIndex = today.getDay(); // 0 = Sunday

  const getGoalThreshold = () => {
    switch (goalData.type) {
      case "BINARY":
        return 1;
      case "DURATION":
        return goalData.goalDaily || 0;
      case "DISTANCE":
        return goalData.goalWeekly ? goalData.goalWeekly / 7 : 0;
      case "COUNT":
        return goalData.goalDaily || 0;
      default:
        return 1;
    }
  };

  const threshold = getGoalThreshold();
  const atGoalCount = daysAtGoalThisWeek || 0;
  const totalDays = totalDaysThisWeek || todayIndex + 1;

  return (
    <div className="week-view-container">
      <div className="week-view-header">
        <span className="week-view-title">This Week</span>
        <span className={`week-view-summary ${atGoalCount < totalDays ? "below" : ""}`}>
          {atGoalCount}/{totalDays} days at goal
        </span>
      </div>

      <div className="day-dots-grid">
        {currentWeekDays.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isFuture = idx > todayIndex;
          const value = day.total || 0;
          const isAtGoal = value >= threshold;
          const hasActivity = value > 0;

          return (
            <div key={idx} className="day-dot-item">
              <span className={`day-dot-label ${isToday ? "today" : ""}`}>{day.label}</span>
              <div
                className={`day-dot ${
                  isFuture ? "future" : isAtGoal ? "completed" : hasActivity ? "partial" : ""
                }`}
              >
                {isAtGoal && !isFuture ? (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TodayProgress({ goalData, habit }) {
  const { todayTotal, goalDaily, todayRemaining } = goalData;
  const unit = habit.unit || "units";
  const progress = goalDaily > 0 ? Math.min(100, (todayTotal / goalDaily) * 100) : 0;

  return (
    <div className="today-progress-section">
      <div className="today-progress-header">
        <span className="today-progress-title">Today</span>
        <span className="today-progress-value">
          {todayTotal.toLocaleString()} / {goalDaily.toLocaleString()} {unit}
        </span>
      </div>
      <div className="today-progress-bar">
        <div className="today-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {todayRemaining > 0 ? (
        <p className="today-remaining">
          {todayRemaining.toLocaleString()} {unit} to go
        </p>
      ) : null}
    </div>
  );
}
