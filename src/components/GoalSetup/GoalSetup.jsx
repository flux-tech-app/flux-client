// src/components/GoalSetup/GoalSetup.jsx
import { useMemo, useState } from "react";
import Button from "../Button";
import {
  computeEarningsMicrosUI,
  formatUSDFromMicros,
  isBinaryRateType,
  unitsToMicros,
} from "@/utils/micros";
import "./GoalSetup.css";

/**
 * GoalSetup (micros-native)
 *
 * Props:
 * - habitLibraryData: CatalogHabit (rateType, goalUnit, suggestedGoals, defaultGoalPeriod, etc.)
 * - selectedRateMicros: number (micros; money per unit, or flat per completion for BINARY)
 * - onGoalSet(goal): goal = { amount: number, period: 'day'|'week'|'month' }
 * - initialGoal: optional existing goal
 */
export default function GoalSetup({
  habitLibraryData,
  selectedRateMicros,
  onGoalSet,
  initialGoal,
}) {
  const [amount, setAmount] = useState(initialGoal?.amount?.toString() || "");
  const [period, setPeriod] = useState(
    initialGoal?.period || habitLibraryData?.defaultGoalPeriod || "week"
  );

  const rateType = habitLibraryData?.rateType;
  const binary = isBinaryRateType(rateType);

  // What label to show beside the input
  const goalUnit = habitLibraryData?.goalUnit || (binary ? "times" : "units");

  const projections = useMemo(() => {
    const numAmount = Number.parseFloat(amount);
    const rateMicros = Number(selectedRateMicros);

    if (!Number.isFinite(numAmount) || numAmount <= 0) return null;
    if (!Number.isFinite(rateMicros) || rateMicros <= 0) return null;

    const daysMap = { day: 1, week: 7, month: 30 };
    const periodDays = daysMap[String(period)] ?? 7;

    // Convert "goal amount per period" -> "weekly units"
    // ex: 10 miles/week => weeklyUnits = 10
    // ex: 30 minutes/day => weeklyUnits = 30*7
    // ex: 40 miles/month => weeklyUnits ≈ 40/30*7
    const weeklyUnits = (numAmount / periodDays) * 7;

    let weeklyEarnMicros = 0;

    if (binary) {
      // Binary habits are "per completion".
      // Interpret goal amount as "completions per period".
      // Since it’s “times”, treat it as a whole number for projections.
      const weeklyCompletions = Math.max(0, Math.round(weeklyUnits));
      weeklyEarnMicros = weeklyCompletions * rateMicros;
    } else {
      const weeklyUnitsMicros = unitsToMicros(weeklyUnits);
      weeklyEarnMicros = computeEarningsMicrosUI({
        rateType,
        rateMicros,
        unitsMicros: weeklyUnitsMicros,
      });
    }

    const annualEarnMicros = weeklyEarnMicros * 52;

    return {
      weeklyMicros: weeklyEarnMicros,
      annualMicros: annualEarnMicros,
    };
  }, [amount, period, rateType, selectedRateMicros, binary]);

  const parsedAmount = Number.parseFloat(amount);
  const isValidGoal = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleContinue = () => {
    const numAmount = Number.parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) return;

    // For binary habits, store a clean integer goal
    const finalAmount = binary ? Math.max(1, Math.round(numAmount)) : numAmount;

    onGoalSet?.({
      amount: finalAmount,
      period,
    });
  };

  const selectSuggestedGoal = (suggested) => {
    setAmount(String(suggested.amount));
    setPeriod(String(suggested.period));
  };

  // “Annual” display: show whole dollars-ish
  const formatAnnual = (annualMicros) => {
    const dollars = annualMicros / 1_000_000;
    const rounded = Math.round(dollars);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);
  };

  return (
    <div className="goal-setup">
      <div className="goal-setup-header">
        <h2 className="goal-setup-title">Set Your Goal</h2>
        <p className="goal-setup-subtitle">
          Goals help you aim higher and track progress beyond your baseline.
        </p>
      </div>

      {/* Suggested Goals */}
      {habitLibraryData?.suggestedGoals?.length ? (
        <div className="suggested-goals">
          <p className="suggested-goals-label">Quick Select:</p>
          <div className="suggested-goals-buttons">
            {habitLibraryData.suggestedGoals.map((suggested, idx) => {
              const isSelected =
                Number.parseFloat(amount) === Number(suggested.amount) &&
                String(period) === String(suggested.period);

              return (
                <button
                  key={idx}
                  type="button"
                  className={`suggested-goal-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => selectSuggestedGoal(suggested)}
                >
                  {suggested.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Custom Goal Input */}
      <div className="goal-input-section">
        <div className="goal-input-row">
          <div className="goal-input-group">
            <label className="goal-input-label">Amount</label>
            <div className="goal-input-wrapper">
              <input
                type="number"
                className="goal-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min={binary ? "1" : "0"}
                step={binary ? "1" : "any"}
              />
              <span className="goal-unit-label">{goalUnit}</span>
            </div>
          </div>

          <div className="goal-input-group">
            <label className="goal-input-label">Period</label>
            <select
              className="goal-period-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="day">per day</option>
              <option value="week">per week</option>
              <option value="month">per month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Earnings Projection */}
      {projections ? (
        <div className="earnings-projection">
          <p className="projection-title">At this goal, you'd earn:</p>
          <div className="projection-values">
            <div className="projection-row">
              <span className="projection-amount">
                {formatUSDFromMicros(projections.weeklyMicros)}
              </span>
              <span className="projection-period">/ week</span>
            </div>
            <div className="projection-row annual">
              <span className="projection-amount">{formatAnnual(projections.annualMicros)}</span>
              <span className="projection-period">/ year</span>
            </div>
          </div>
        </div>
      ) : null}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleContinue}
        disabled={!isValidGoal}
        leftIcon={null}
        rightIcon={null}
      >
        Set Goal
      </Button>
    </div>
  );
}
