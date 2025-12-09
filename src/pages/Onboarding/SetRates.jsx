import { useState } from 'react';
import { getHabitById, getRateLabel } from '../../utils/HABIT_LIBRARY';
import HabitIcon from '../../utils/HabitIcons';
import GoalSetup from '../../components/GoalSetup/GoalSetup';
import './Onboarding.css';

/**
 * Set Rates & Goals Screen - Step 4
 * Customize rates and set goals for selected habits
 */
export default function SetRates({
  selectedHabits,
  habitRates,
  habitGoals,
  onRateChange,
  onGoalChange,
  onContinue,
  onBack
}) {
  // Track which habit is currently showing goal setup
  const [activeGoalSetup, setActiveGoalSetup] = useState(null);

  // Check if all habits have goals set
  const allGoalsSet = selectedHabits.every(libraryId => habitGoals[libraryId]);

  // Calculate projected weekly earnings based on goals
  const getWeeklyProjection = () => {
    let total = 0;
    selectedHabits.forEach(libraryId => {
      const habit = getHabitById(libraryId);
      const rate = habitRates[libraryId] ?? habit.defaultRate;
      const goal = habitGoals[libraryId];

      if (goal) {
        // Calculate based on goal
        const daysMap = { day: 1, week: 7, month: 30 };
        const periodDays = daysMap[goal.period];
        const dailyAmount = goal.amount / periodDays;
        const weeklyAmount = dailyAmount * 7;
        total += weeklyAmount * rate;
      } else {
        // Fallback to rough estimates
        if (habit.rateType === 'BINARY') {
          total += rate * 5;
        } else if (habit.rateType === 'DURATION') {
          total += rate * 30 * 5;
        } else if (habit.rateType === 'DISTANCE') {
          total += rate * 3 * 4;
        } else if (habit.rateType === 'COUNT') {
          if (habit.unit === 'step') {
            total += rate * 8000 * 5;
          } else if (habit.unit === 'rep') {
            total += rate * 20 * 5;
          } else {
            total += rate * 3 * 5;
          }
        }
      }
    });
    return total;
  };

  const handleGoalSet = (libraryId, goal) => {
    onGoalChange(libraryId, goal);
    setActiveGoalSetup(null);
  };

  const handleContinue = () => {
    if (!allGoalsSet) {
      // Find first habit without a goal and open its goal setup
      const habitWithoutGoal = selectedHabits.find(id => !habitGoals[id]);
      if (habitWithoutGoal) {
        setActiveGoalSetup(habitWithoutGoal);
      }
      return;
    }
    onContinue();
  };

  // If goal setup modal is active, show it
  if (activeGoalSetup) {
    const habit = getHabitById(activeGoalSetup);
    const rate = habitRates[activeGoalSetup] ?? habit.defaultRate;

    return (
      <div className="onboarding-screen">
        <div className="onboarding-content scrollable">
          {/* Back button */}
          <button
            className="goal-back-link"
            onClick={() => setActiveGoalSetup(null)}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to rates
          </button>

          {/* Habit header */}
          <div className="goal-habit-header">
            <div className="goal-habit-icon">
              <HabitIcon habitId={habit.id} size={36} />
            </div>
            <div className="goal-habit-info">
              <span className="goal-habit-ticker">${habit.ticker}</span>
              <span className="goal-habit-name">{habit.name}</span>
            </div>
          </div>

          <GoalSetup
            habitLibraryData={habit}
            selectedRate={rate}
            initialGoal={habitGoals[activeGoalSetup]}
            onGoalSet={(goal) => handleGoalSet(activeGoalSetup, goal)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-content scrollable">
        <div className="section-header">
          <h1 className="section-title">Set Your Rates & Goals</h1>
          <p className="section-subtitle">
            Choose how much to earn per habit, then set your goal.
          </p>
        </div>

        {/* Rate Cards */}
        <div className="rate-cards-list">
          {selectedHabits.map(libraryId => {
            const habit = getHabitById(libraryId);
            const currentRate = habitRates[libraryId] ?? habit.defaultRate;
            const currentGoal = habitGoals[libraryId];

            return (
              <div key={libraryId} className="rate-card">
                <div className="rate-card-header">
                  <div className="rate-card-icon">
                    <HabitIcon habitId={habit.id} size={24} />
                  </div>
                  <div className="rate-card-info">
                    <span className="rate-card-name">{habit.name}</span>
                    <span className="rate-card-ticker">${habit.ticker}</span>
                  </div>
                </div>

                <div className="rate-options-row">
                  {habit.rateOptions.map((rate, index) => {
                    const isSelected = currentRate === rate;
                    const label = getRateLabel(index);

                    // Format rate display
                    let rateDisplay;
                    if (rate < 0.01) {
                      rateDisplay = `$${rate.toFixed(4)}`;
                    } else {
                      rateDisplay = `$${rate.toFixed(2)}`;
                    }

                    return (
                      <button
                        key={rate}
                        className={`rate-option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => onRateChange(libraryId, rate)}
                      >
                        <span className="rate-option-label">{label}</span>
                        <span className="rate-option-value">
                          {rateDisplay}
                          <span className="rate-unit">/{habit.unit}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Goal Section */}
                <div className="rate-card-goal">
                  {currentGoal ? (
                    <button
                      className="goal-set-indicator"
                      onClick={() => setActiveGoalSetup(libraryId)}
                    >
                      <svg className="goal-check-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="goal-text">
                        Goal: {currentGoal.amount.toLocaleString()} {habit.goalUnit} / {currentGoal.period}
                      </span>
                      <span className="goal-edit">Edit</span>
                    </button>
                  ) : (
                    <button
                      className="set-goal-btn"
                      onClick={() => setActiveGoalSetup(libraryId)}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Set Goal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Earnings Preview */}
        <div className="earnings-projection">
          <div className="projection-label">Estimated Weekly Earnings</div>
          <div className="projection-amount">
            ${getWeeklyProjection().toFixed(2)}
          </div>
          <div className="projection-note">
            {allGoalsSet ? 'Based on your goals' : 'Based on typical activity levels'}
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="button-group">
          <button className="secondary-button" onClick={onBack}>
            Back
          </button>
          <button
            className={`primary-button ${!allGoalsSet ? 'incomplete' : ''}`}
            onClick={handleContinue}
          >
            {allGoalsSet ? 'Review & Finish' : `Set Goals (${selectedHabits.filter(id => habitGoals[id]).length}/${selectedHabits.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
