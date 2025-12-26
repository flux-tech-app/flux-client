// src/components/GoalSetup/GoalSetup.jsx
import { useMemo, useState } from "react";
import Button from "../Button";
import {
  computeEarningsMicrosUI,
  formatUSDFromMicros,
  isBinaryRateType,
  unitsToMicros,
  MICRO_UNITS,
} from "@/utils/micros";
import "./GoalSetup.css";

/**
 * GoalSetup (micros-native)
 */
export default function GoalSetup({ habitLibraryData, selectedRate, onGoalSet, initialGoal }) {
  const [amount, setAmount] = useState(initialGoal?.amount?.toString() || "");
  const [period, setPeriod] = useState(
    initialGoal?.period || habitLibraryData?.defaultGoalPeriod || "week"
  );

  const rateType = habitLibraryData?.rateType;
  const goalUnit = habitLibraryData?.goalUnit || "units";

  const projections = useMemo(() => {
    const numAmount = Number.parseFloat(amount);
    const rateMicros = Number(selectedRate);

    if (!Number.isFinite(numAmount) || numAmount <= 0) return null;
    if (!Number.isFinite(rateMicros) || rateMicros <= 0) return null;

    const daysMap = { day: 1, week: 7, month: 30 };
    const periodDays = daysMap[String(period)] ?? 7;

    // Convert "goal amount per period" -> "weekly units"
    // ex: 10 miles/week => weeklyUnits = 10
    // ex: 30 minutes/day => weeklyUnits = 30*7
    const weeklyUnits = (numAmount / periodDays) * 7;

    // For BINARY, units don't matter; UI helper ignores units for BINARY anyway.
    const weeklyUnitsMicros = isBinaryRateType(rateType) ? MICRO_UNITS : unitsToMicros(weeklyUnits);

    const weeklyEarnMicros = computeEarningsMicrosUI({
      rateType,
      rateMicros,
      unitsMicros: weeklyUnitsMicros,
    });

    const annualEarnMicros = weeklyEarnMicros * 52;

    return {
      weeklyMicros: weeklyEarnMicros,
      annualMicros: annualEarnMicros,
    };
  }, [amount, period, rateType, selectedRate]);

  const isValidGoal = Number.parseFloat(amount) > 0;

  const handleContinue = () => {
    const numAmount = Number.parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) return;

    onGoalSet?.({
      amount: numAmount,
      period,
    });
  };

  const selectSuggestedGoal = (suggested) => {
    setAmount(String(suggested.amount));
    setPeriod(String(suggested.period));
  };

  // “Annual” display: show whole dollars-ish (matches your prior UI intent)
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
                min="0"
                step="any"
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
