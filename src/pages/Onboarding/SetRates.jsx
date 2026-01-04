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
  MICRO_UNITS,
} from "@/utils/micros";
import "./Onboarding.css";

/**
 * STRICT:
 * - uses server catalog
 * - rates stored as MICROS (int) keyed by catalogId
 * - goals keyed by catalogId
 */
export default function SetRates({
  catalog,
  selectedHabits, // string[] catalogIds
  habitRates, // { [catalogId]: rateMicros }
  habitGoals, // { [catalogId]: { amount, period } }
  onRateChange,
  onGoalChange,
  onContinue,
  onBack,
}) {
  const [activeGoalSetup, setActiveGoalSetup] = useState(null); // catalogId string | null

  const catalogById = useMemo(() => {
    const m = new Map();
    for (const h of catalog?.habits ?? []) {
      const id = h?.id != null ? String(h.id) : "";
      if (id) m.set(id, h);
    }
    return m;
  }, [catalog]);

  const ids = selectedHabits ?? [];
  const allGoalsSet = ids.every((catalogId) => !!habitGoals?.[String(catalogId)]);

  function getRateLabel(index, total) {
    if (total <= 1) return "Default";
    if (total === 2) return index === 0 ? "Standard" : "High";
    if (index === 0) return "Low";
    if (index === total - 1) return "High";
    return "Med";
  }

  function getHabit(catalogId) {
    return catalogById.get(String(catalogId)) ?? null;
  }

  function rateDisplayForHabit(habit, rateMicros) {
    if (!habit) return formatUSDFromMicros(rateMicros);
    if (isBinaryRateType(habit.rateType)) return formatUSDFromMicros(rateMicros);
    return formatRateFromMicros(rateMicros, habit.unit);
  }

  // Estimated weekly earnings (display only)
  const weeklyProjectionMicros = useMemo(() => {
    let totalMicros = 0;
    const daysMap = { day: 1, week: 7, month: 30 };

    for (const rawId of ids) {
      const catalogId = String(rawId);
      const habit = getHabit(catalogId);
      if (!habit) continue;

      const rateMicros = Number(habitRates?.[catalogId] ?? habit.defaultRateMicros ?? 0);
      const goal = habitGoals?.[catalogId];

      if (goal?.amount && goal?.period) {
        const periodDays = daysMap[String(goal.period)] ?? 7;
        const dailyUnits = Number(goal.amount) / periodDays;
        const weeklyUnits = dailyUnits * 7;

        const weeklyUnitsMicros = isBinaryRateType(habit.rateType)
          ? MICRO_UNITS
          : unitsToMicros(weeklyUnits);

        totalMicros += computeEarningsMicrosUI({
          rateType: habit.rateType,
          rateMicros,
          unitsMicros: weeklyUnitsMicros,
        });
      } else {
        let fallbackWeeklyUnits = 0;

        if (isBinaryRateType(habit.rateType)) {
          fallbackWeeklyUnits = 5;
        } else if (habit.rateType === "DURATION") {
          fallbackWeeklyUnits = 30 * 5;
        } else if (habit.rateType === "DISTANCE") {
          fallbackWeeklyUnits = 3 * 4;
        } else if (habit.rateType === "COUNT") {
          if (habit.unit === "step") fallbackWeeklyUnits = 8000 * 5;
          else if (habit.unit === "rep") fallbackWeeklyUnits = 20 * 5;
          else fallbackWeeklyUnits = 3 * 5;
        } else {
          fallbackWeeklyUnits = 5;
        }

        const unitsMicros = isBinaryRateType(habit.rateType)
          ? MICRO_UNITS
          : unitsToMicros(fallbackWeeklyUnits);

        totalMicros += computeEarningsMicrosUI({
          rateType: habit.rateType,
          rateMicros,
          unitsMicros,
        });
      }
    }

    return totalMicros;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, habitRates, habitGoals, catalogById]);

  const handleGoalSet = (catalogId, goal) => {
    onGoalChange?.(String(catalogId), goal);
    setActiveGoalSetup(null);
  };

  const handleContinue = () => {
    if (!allGoalsSet) {
      const firstMissing = ids.find((id) => !habitGoals?.[String(id)]);
      if (firstMissing) setActiveGoalSetup(String(firstMissing));
      return;
    }
    onContinue?.();
  };

  // =========================
  // Goal setup modal view
  // =========================
  if (activeGoalSetup) {
    const catalogId = String(activeGoalSetup);
    const habit = getHabit(catalogId);
    if (!habit) {
      setActiveGoalSetup(null);
      return null;
    }

    const rateMicros = Number(habitRates?.[catalogId] ?? habit.defaultRateMicros ?? 0);

    // Adapter object for GoalSetup (optional legacy-like fields)
    const habitLibraryData = {
      ...habit,
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
              <HabitIcon habitId={catalogId} size={36} />
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
            selectedRateMicros={rateMicros}
            initialGoal={habitGoals?.[catalogId]}
            onGoalSet={(goal) => handleGoalSet(catalogId, goal)}
          />
        </div>
      </div>
    );
  }

  // =========================
  // Main rates view
  // =========================
  const completedGoalsCount = ids.filter((id) => !!habitGoals?.[String(id)]).length;

  return (
    <div className="onboarding-screen">
      <div className="onboarding-content scrollable">
        <div className="section-header">
          <h1 className="section-title">Set Your Rates & Goals</h1>
          <p className="section-subtitle">Choose how much to earn per habit, then set your goal.</p>
        </div>

        <div className="rate-cards-list">
          {ids.map((rawId) => {
            const catalogId = String(rawId);
            const habit = getHabit(catalogId);
            if (!habit) return null;

            const options = habit.rateOptionsMicros?.length
              ? habit.rateOptionsMicros
              : [habit.defaultRateMicros ?? 0];

            const currentRateMicros = Number(habitRates?.[catalogId] ?? habit.defaultRateMicros ?? 0);
            const currentGoal = habitGoals?.[catalogId];

            return (
              <div key={catalogId} className="rate-card">
                <div className="rate-card-header">
                  <div className="rate-card-icon">
                    <HabitIcon habitId={catalogId} size={24} />
                  </div>
                  <div className="rate-card-info">
                    <span className="rate-card-name">{habit.name}</span>
                  </div>
                </div>

                <div className="rate-options-row">
                  {options.map((rateMicros, index) => {
                    const isSelected = Number(currentRateMicros) === Number(rateMicros);
                    const label = getRateLabel(index, options.length);

                    const valueText = isBinaryRateType(habit.rateType)
                      ? formatUSDFromMicros(rateMicros)
                      : formatRateFromMicros(rateMicros, habit.unit);

                    return (
                      <button
                        key={`${rateMicros}-${index}`}
                        type="button"
                        className={`rate-option-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => onRateChange?.(catalogId, Number(rateMicros))}
                      >
                        <span className="rate-option-label">{label}</span>
                        <span className="rate-option-value">{valueText}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="rate-card-goal">
                  {currentGoal ? (
                    <button
                      type="button"
                      className="goal-set-indicator"
                      onClick={() => setActiveGoalSetup(catalogId)}
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
                    <button
                      type="button"
                      className="set-goal-btn"
                      onClick={() => setActiveGoalSetup(catalogId)}
                    >
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
          <div className="projection-note">
            {allGoalsSet ? "Based on your goals" : "Based on typical activity levels"}
          </div>
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
              : `Set Goals (${completedGoalsCount}/${ids.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
