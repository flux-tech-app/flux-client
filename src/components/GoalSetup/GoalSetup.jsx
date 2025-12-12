import { useState, useEffect } from 'react';
import Button from '../Button';
import './GoalSetup.css';

/**
 * GoalSetup Component
 *
 * Allows users to set/edit goals for a habit.
 * Shows suggested goals and earnings projections.
 *
 * @param {Object} habitLibraryData - The habit data from HABIT_LIBRARY
 * @param {number} selectedRate - The rate the user selected for this habit
 * @param {Function} onGoalSet - Callback when goal is confirmed: (goal) => void
 * @param {Object} initialGoal - Optional initial goal for editing
 */
export default function GoalSetup({
  habitLibraryData,
  selectedRate,
  onGoalSet,
  initialGoal
}) {
  const [amount, setAmount] = useState(initialGoal?.amount?.toString() || '');
  const [period, setPeriod] = useState(
    initialGoal?.period || habitLibraryData.defaultGoalPeriod || 'week'
  );

  // Calculate earnings projections
  const calculateProjections = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !selectedRate) return null;

    const daysMap = { day: 1, week: 7, month: 30 };
    const periodDays = daysMap[period];
    const dailyAmount = numAmount / periodDays;
    const weeklyAmount = dailyAmount * 7;
    const weeklyEarnings = weeklyAmount * selectedRate;
    const annualEarnings = weeklyEarnings * 52;

    return {
      weekly: weeklyEarnings,
      annual: annualEarnings
    };
  };

  const projections = calculateProjections();

  const handleContinue = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return;
    }

    onGoalSet({
      amount: numAmount,
      period: period
    });
  };

  const selectSuggestedGoal = (suggested) => {
    setAmount(suggested.amount.toString());
    setPeriod(suggested.period);
  };

  const isValidGoal = parseFloat(amount) > 0;

  // Format large numbers with commas
  const formatNumber = (num) => {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
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
      {habitLibraryData.suggestedGoals && habitLibraryData.suggestedGoals.length > 0 && (
        <div className="suggested-goals">
          <p className="suggested-goals-label">Quick Select:</p>
          <div className="suggested-goals-buttons">
            {habitLibraryData.suggestedGoals.map((suggested, idx) => {
              const isSelected =
                parseFloat(amount) === suggested.amount &&
                period === suggested.period;
              return (
                <button
                  key={idx}
                  className={`suggested-goal-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectSuggestedGoal(suggested)}
                >
                  {suggested.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
              <span className="goal-unit-label">{habitLibraryData.goalUnit}</span>
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
      {projections && (
        <div className="earnings-projection">
          <p className="projection-title">At this goal, you'd earn:</p>
          <div className="projection-values">
            <div className="projection-row">
              <span className="projection-amount">${projections.weekly.toFixed(2)}</span>
              <span className="projection-period">/ week</span>
            </div>
            <div className="projection-row annual">
              <span className="projection-amount">${formatNumber(Math.round(projections.annual))}</span>
              <span className="projection-period">/ year</span>
            </div>
          </div>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleContinue}
        disabled={!isValidGoal}
      >
        Set Goal
      </Button>
    </div>
  );
}
