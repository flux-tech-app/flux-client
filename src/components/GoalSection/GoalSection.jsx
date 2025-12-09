import { useMemo, useState } from 'react';
import { calculateGoalData } from '../../utils/goalCalculations';
import { getHabitById } from '../../utils/HABIT_LIBRARY';
import { formatCurrency } from '../../utils/formatters';
import GoalSetup from '../GoalSetup/GoalSetup';
import { useHabits } from '../../context/HabitContext';
import './GoalSection.css';

/**
 * GoalSection Component
 *
 * Displays goal progress visualization on the Habit Detail page.
 * Shows current week progress with a modern, minimal design.
 */
export default function GoalSection({ habit, logs }) {
  const { updateHabitGoal } = useHabits();
  const [showEditGoal, setShowEditGoal] = useState(false);

  // Calculate goal data based on rate type
  const goalData = useMemo(() => {
    return calculateGoalData(habit, logs);
  }, [habit, logs]);

  // Get library data for goal editing
  const libraryHabit = getHabitById(habit.libraryId);

  if (!habit.goal || !goalData) {
    return null;
  }

  const handleGoalUpdate = (newGoal) => {
    updateHabitGoal(habit.id, newGoal);
    setShowEditGoal(false);
  };

  // Calculate ring progress
  const ringProgress = Math.min(100, Math.max(0, goalData.progress));
  const circumference = 2 * Math.PI * 34; // radius = 34 (smaller ring)
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  return (
    <section className="goal-section">
      <div className="goal-section-header">
        <h3 className="goal-section-title">Goal Progress</h3>
        <button
          className="edit-goal-btn"
          onClick={() => setShowEditGoal(true)}
        >
          Edit
        </button>
      </div>

      {/* Top Row: Ring + Stats side by side */}
      <div className="goal-top-row">
        {/* Progress Ring */}
        <div className="goal-progress-ring-container">
          <div className="goal-ring-wrapper">
            <svg className="goal-ring" viewBox="0 0 80 80">
              <defs>
                <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <circle
                className="goal-ring-bg"
                cx="40"
                cy="40"
                r="34"
              />
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

        {/* Quick Stats */}
        <div className="goal-quick-stats">
          <div className="quick-stat">
            <span className="stat-label">Baseline</span>
            <span className="stat-value">
              {formatStatValue(goalData, 'baseline', habit)}
            </span>
          </div>
          <div className="quick-stat current">
            <span className="stat-label">Current</span>
            <span className="stat-value">
              {formatStatValue(goalData, 'current', habit)}
            </span>
          </div>
          <div className="quick-stat goal">
            <span className="stat-label">Goal</span>
            <span className="stat-value">
              {formatStatValue(goalData, 'goal', habit)}
            </span>
          </div>
        </div>
      </div>

      {/* Current Week View */}
      <CurrentWeekView goalData={goalData} habit={habit} />

      {/* Today's Progress (for daily goals) */}
      {goalData.todayTotal !== undefined && goalData.goalDaily > 0 && (
        <TodayProgress goalData={goalData} habit={habit} />
      )}

      {/* Earnings Impact */}
      {goalData.earnings && (
        <div className="earnings-impact">
          <h4 className="earnings-impact-title">Earnings Impact</h4>
          <div className="earnings-comparison">
            <div className="earnings-row">
              <span className="earnings-label">At Goal</span>
              <span className="earnings-value">
                {formatCurrency(goalData.earnings.atGoal.weekly)}/wk
                <span className="annual">({formatCurrency(goalData.earnings.atGoal.annual)}/yr)</span>
              </span>
            </div>
            <div className="earnings-row">
              <span className="earnings-label">Current</span>
              <span className="earnings-value">
                {formatCurrency(goalData.earnings.current.weekly)}/wk
                <span className="annual">({formatCurrency(goalData.earnings.current.annual)}/yr)</span>
              </span>
            </div>
            {goalData.earnings.gap.weekly > 0 && (
              <div className="earnings-row gap">
                <span className="earnings-label">Gap</span>
                <span className="earnings-value">
                  {formatCurrency(goalData.earnings.gap.weekly)}/wk
                  <span className="annual">({formatCurrency(goalData.earnings.gap.annual)}/yr)</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && libraryHabit && (
        <div className="modal-overlay" onClick={() => setShowEditGoal(false)}>
          <div className="edit-goal-modal" onClick={e => e.stopPropagation()}>
            <div className="edit-goal-modal-header">
              <h3>Edit Goal</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowEditGoal(false)}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <GoalSetup
              habitLibraryData={libraryHabit}
              selectedRate={habit.rate}
              initialGoal={habit.goal}
              onGoalSet={handleGoalUpdate}
            />
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Format stat value based on rate type
 */
function formatStatValue(goalData, type, habit) {
  let value = 0;
  let period = 'wk';

  switch (goalData.type) {
    case 'BINARY':
      if (type === 'baseline') value = goalData.baselineFrequency;
      else if (type === 'current') value = goalData.currentFrequency;
      else value = goalData.goalFrequency;
      period = '/wk';
      break;
    case 'DURATION':
      if (type === 'baseline') value = goalData.baselineDaily;
      else if (type === 'current') value = goalData.currentDaily;
      else value = goalData.goalDaily;
      period = '/day';
      break;
    case 'DISTANCE':
      if (type === 'baseline') value = goalData.baselineWeekly;
      else if (type === 'current') value = goalData.currentWeekly;
      else value = goalData.goalWeekly;
      period = '/wk';
      break;
    case 'COUNT':
      if (type === 'baseline') value = goalData.baselineDaily;
      else if (type === 'current') value = goalData.currentDaily;
      else value = goalData.goalDaily;
      period = '/day';
      break;
  }

  const formatted = value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString();
  return `${formatted}${period}`;
}

/**
 * Current Week View - Shows this week's progress (Sun-Sat)
 */
function CurrentWeekView({ goalData, habit }) {
  const { currentWeekDays, daysAtGoalThisWeek, totalDaysThisWeek } = goalData;

  if (!currentWeekDays || currentWeekDays.length === 0) {
    return null;
  }

  const today = new Date();
  const todayIndex = today.getDay(); // 0 = Sunday

  // Determine goal threshold based on type
  const getGoalThreshold = () => {
    switch (goalData.type) {
      case 'BINARY':
        return 1; // At least 1 session
      case 'DURATION':
        return goalData.goalDaily || 0;
      case 'DISTANCE':
        return goalData.goalWeekly ? goalData.goalWeekly / 7 : 0;
      case 'COUNT':
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
        <span className={`week-view-summary ${atGoalCount < totalDays ? 'below' : ''}`}>
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
              <span className={`day-dot-label ${isToday ? 'today' : ''}`}>
                {day.label}
              </span>
              <div
                className={`day-dot ${
                  isFuture ? 'future' :
                  isAtGoal ? 'completed' :
                  hasActivity ? 'partial' : ''
                }`}
              >
                {isAtGoal && !isFuture && (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Today's Progress Section
 */
function TodayProgress({ goalData, habit }) {
  const { todayTotal, goalDaily, todayRemaining } = goalData;
  const unit = habit.unit || 'units';
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
        <div
          className="today-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      {todayRemaining > 0 && (
        <p className="today-remaining">
          {todayRemaining.toLocaleString()} {unit} to go
        </p>
      )}
    </div>
  );
}
