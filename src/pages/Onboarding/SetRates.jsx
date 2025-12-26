// src/pages/Onboarding/SetRates.jsx
import { useMemo, useState } from "react";
import HabitIcon from "@/utils/HabitIcons";
import GoalSetup from "@/components/GoalSetup/GoalSetup";
import Button from "@/components/Button";
import {
  formatUSDFromMicros,
  formatRateFromMicros,
  isBinaryRateType,
  unitsToMicros,
  computeEarningsMicrosUI,
} from "@/utils/micros";
import "./Onboarding.css";

/**
 * STRICT:
 * - uses server catalog
 * - rates stored as MICROS (int)
 * - goal amounts stored as human units (number)
 */
export default function SetRates({
  catalog,
  selectedHabits,
  habitRates,
  habitGoals,
  onRateChange,
  onGoalChange,
  onContinue,
  onBack,
}) {
  const [activeGoalSetup, setActiveGoalSetup] = useState(null);

  const catalogById = useMemo(() => {
    const m = new Map();
    for (const h of catalog?.habits ?? []) {
      if (h?.id) m.set(h.id, h);
    }
    return m;
  }, [catalog]);

  const allGoalsSet = (selectedHabits ?? []).every((libraryId) => !!habitGoals?.[libraryId]);

  function getRateLabel(index, total) {
    // keep it simple + deterministic
    if (total <= 1) return "Default";
    if (total === 2) return index === 0 ? "Standard" : "High";
    // 3+
    if (index === 0) return "Low";
    if (index === total - 1) return "High";
    return "Med";
  }

  function getHabit(libraryId) {
    return catalogById.get(libraryId) ?? null;
  }

  function rateDisplayForHabit(habit, rateMicros) {
    if (!habit) return formatUSDFromMicros(rateMicros);
    if (isBinaryRateType(habit.rateType)) {
      return formatUSDFromMicros(rateMicros);
    }
    return formatRateFromMicros(rateMicros, habit.unit);
  }

  // Estimated weekly earnings (display only)
  const weeklyProjectionMicros = useMemo(() => {
    const ids = selectedHabits ?? [];
    let totalMicros = 0;

    // goal.period meaning in your UI seems to be: "per day/week/month"
    const daysMap = { day: 1, week: 7, month: 30 };

    for (const libraryId of ids) {
      const habit = getHabit(libraryId);
      if (!habit) continue;

      const rateMicros = Number(habitRates?.[libraryId] ?? habit.defaultRateMicros ?? 0);
      const goal = habitGoals?.[libraryId];

      if (goal?.amount && goal?.period) {
        const periodDays = daysMap[String(goal.period)] ?? 7;
        const dailyUnits = Number(goal.amount) / periodDays;
        const weeklyUnits = dailyUnits * 7;

        const weeklyUnitsMicros = unitsToMicros(weeklyUnits);

        totalMicros += computeEarningsMicrosUI({
          rateType: habit.rateType,
          rateMicros,
          unitsMicros: weeklyUnitsMicros,
        });
      } else {
        // fallback estimates (same spirit as your legacy, but in micros)
        let fallbackWeeklyUnits = 0;

        if (isBinaryRateType(habit.rateType)) {
          fallbackWeeklyUnits = 5; // 5 occurrences/week
        } else if (habit.rateType === "DURATION") {
          // minutes
          fallbackWeeklyUnits = 30 * 5;
        } else if (habit.rateType === "DISTANCE") {
          // miles
          fallbackWeeklyUnits = 3 * 4;
        } else if (habit.rateType === "COUNT") {
          if (habit.unit === "step") fallbackWeeklyUnits = 8000 * 5;
          else if (habit.unit === "rep") fallbackWeeklyUnits = 20 * 5;
          else fallbackWeeklyUnits = 3 * 5;
        } else {
          fallbackWeeklyUnits = 5;
        }

        totalMicros += computeEarningsMicrosUI({
          rateType: habit.rateType,
          rateMicros,
          unitsMicros: unitsToMicros(fallbackWeeklyUnits),
        });
      }
    }

    return totalMicros;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHabits, habitRates, habitGoals, catalogById]);

  const handleGoalSet = (libraryId, goal) => {
    onGoalChange(libraryId, goal);
    setActiveGoalSetup(null);
  };

  const handleContinue = () => {
    if (!allGoalsSet) {
      const firstMissing = (selectedHabits ?? []).find((id) => !habitGoals?.[id]);
      if (firstMissing) setActiveGoalSetup(firstMissing);
      return;
    }
    onContinue?.();
  };

  // =========================
  // Goal setup modal view
  // =========================
  if (activeGoalSetup) {
    const habit = getHabit(activeGoalSetup);
    if (!habit) {
      // safety fallback
      setActiveGoalSetup(null);
      return null;
    }

    const rateMicros = Number(habitRates?.[activeGoalSetup] ?? habit.defaultRateMicros ?? 0);

    // Adapter object: keep GoalSetup working while you migrate it off legacy expectations.
    // If GoalSetup expects floats, you’ll update GoalSetup next — but this keeps the data available.
    const habitLibraryData = {
      ...habit,
      // provide some legacy-ish aliases (harmless if unused)
      defaultRate: habit.defaultRateMicros ? habit.defaultRateMicros / 1_000_000 : 0,
      rateOptions: (habit.rateOptionsMicros ?? []).map((m) => m / 1_000_000),
    };

    return (
      <div className="onboarding-screen">
        <div className="onboarding-content scrollable">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveGoalSetup(null)}
            leftIcon={
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            }
            rightIcon={null}
            className="goal-back-btn"
          >
            Back to rates
          </Button>

          <div className="goal-habit-header">
            <div className="goal-habit-icon">
              <HabitIcon habitId={habit.id} size={36} />
            </div>
            <div className="goal-habit-info">
              <span className="goal-habit-name">{habit.name}</span>
              <span style={{ opacity: 0.8, fontSize: 12 }}>
                {rateDisplayForHabit(habit, rateMicros)}
              </span>
            </div>
          </div>

          <GoalSetup
            habitLibraryData={habitLibraryData}
            // keep existing prop name, but this is MICROS now
            selectedRate={rateMicros}
            initialGoal={habitGoals?.[activeGoalSetup]}
            onGoalSet={(goal) => handleGoalSet(activeGoalSetup, goal)}
          />
        </div>
      </div>
    );
  }

  // =========================
  // Main rates view
  // =========================
  const completedGoalsCount = (selectedHabits ?? []).filter((id) => !!habitGoals?.[id]).length;

  return (
    <div className="onboarding-screen">
      <div className="onboarding-content scrollable">
        <div className="section-header">
          <h1 className="section-title">Set Your Rates & Goals</h1>
          <p className="section-subtitle">Choose how much to earn per habit, then set your goal.</p>
        </div>

        <div className="rate-cards-list">
          {(selectedHabits ?? []).map((libraryId) => {
            const habit = getHabit(libraryId);
            if (!habit) return null;

            const options = habit.rateOptionsMicros?.length
              ? habit.rateOptionsMicros
              : [habit.defaultRateMicros ?? 0];

            const currentRateMicros = Number(habitRates?.[libraryId] ?? habit.defaultRateMicros ?? 0);
            const currentGoal = habitGoals?.[libraryId];

            return (
              <div key={libraryId} className="rate-card">
                <div className="rate-card-header">
                  <div className="rate-card-icon">
                    <HabitIcon habitId={habit.id} size={24} />
                  </div>
                  <div className="rate-card-info">
                    <span className="rate-card-name">{habit.name}</span>
                  </div>
                </div>

                <div className="rate-options-row">
                  {options.map((rateMicros, index) => {
                    const isSelected = Number(currentRateMicros) === Number(rateMicros);
                    const label = getRateLabel(index, options.length);

                    // display only
                    const valueText = isBinaryRateType(habit.rateType)
                      ? formatUSDFromMicros(rateMicros)
                      : formatUSDFromMicros(rateMicros);

                    return (
                      <button
                        key={`${rateMicros}-${index}`}
                        type="button"
                        className={`rate-option-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => onRateChange(libraryId, Number(rateMicros))}
                      >
                        <span className="rate-option-label">{label}</span>
                        <span className="rate-option-value">
                          {valueText}
                          {!isBinaryRateType(habit.rateType) && habit.unit ? (
                            <span className="rate-unit">/{habit.unit}</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="rate-card-goal">
                  {currentGoal ? (
                    <button
                      type="button"
                      className="goal-set-indicator"
                      onClick={() => setActiveGoalSetup(libraryId)}
                    >
                      <svg className="goal-check-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="goal-text">
                        Goal: {Number(currentGoal.amount).toLocaleString()} {habit.goalUnit} / {currentGoal.period}
                      </span>
                      <span className="goal-edit">Edit</span>
                    </button>
                  ) : (
                    <button type="button" className="set-goal-btn" onClick={() => setActiveGoalSetup(libraryId)}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Set Goal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="earnings-projection">
          <div className="projection-label">Estimated Weekly Earnings</div>
          <div className="projection-amount">{formatUSDFromMicros(weeklyProjectionMicros)}</div>
          <div className="projection-note">{allGoalsSet ? "Based on your goals" : "Based on typical activity levels"}</div>
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="button-group">
          <Button
            variant="secondary"
            size="lg"
            onClick={onBack}
            className="onboarding-back"
            leftIcon={null}
            rightIcon={null}
          >
            Back
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            className={`onboarding-continue ${!allGoalsSet ? "incomplete-state" : ""}`}
            leftIcon={null}
            rightIcon={null}
          >
            {allGoalsSet
              ? "Review & Finish"
              : `Set Goals (${completedGoalsCount}/${(selectedHabits ?? []).length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
