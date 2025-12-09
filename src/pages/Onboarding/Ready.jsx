import { getHabitById } from '../../utils/HABIT_LIBRARY';
import HabitIcon from '../../utils/HabitIcons';
import './Onboarding.css';

/**
 * Ready Screen - Step 5
 * Professional summary of selections and launch
 */
export default function Ready({
  selectedHabits,
  habitRates,
  habitGoals,
  onComplete,
  onBack
}) {
  
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <div className="ready-hero">
          <div className="ready-icon-container">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="ready-title">You're All Set</h1>
          <p className="ready-subtitle">
            Your portfolio is ready. Start logging to build your savings.
          </p>
        </div>

        {/* Summary of selected habits */}
        <div className="summary-card">
          <div className="summary-header">
            <span className="summary-title">Your Positions</span>
            <span className="summary-count">{selectedHabits.length} habits</span>
          </div>
          
          <div className="summary-list">
            {selectedHabits.map(libraryId => {
              const habit = getHabitById(libraryId);
              const rate = habitRates[libraryId] ?? habit.defaultRate;
              const goal = habitGoals[libraryId];

              // Format rate
              let rateDisplay;
              if (rate < 0.01) {
                rateDisplay = `$${rate.toFixed(4)}/${habit.unit}`;
              } else {
                rateDisplay = `$${rate.toFixed(2)}/${habit.unit}`;
              }

              return (
                <div key={libraryId} className="summary-item">
                  <div className="summary-item-left">
                    <div className="summary-item-icon">
                      <HabitIcon habitId={habit.id} size={18} />
                    </div>
                    <div className="summary-item-info">
                      <span className="summary-item-name">{habit.name}</span>
                      {goal && (
                        <span className="summary-item-goal">
                          Goal: {goal.amount.toLocaleString()} {habit.goalUnit}/{goal.period}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="summary-item-rate">{rateDisplay}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Tips - SVG icons */}
        <div className="tips-card">
          <div className="tip-item">
            <div className="tip-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <span className="tip-text">Tap the + button to log activities</span>
          </div>
          <div className="tip-item">
            <div className="tip-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <span className="tip-text">Check Portfolio to see your progress</span>
          </div>
          <div className="tip-item">
            <div className="tip-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="tip-text">Transfers happen every Friday</span>
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="button-group">
          <button className="secondary-button" onClick={onBack}>
            Back
          </button>
          <button className="primary-button launch" onClick={onComplete}>
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
}
