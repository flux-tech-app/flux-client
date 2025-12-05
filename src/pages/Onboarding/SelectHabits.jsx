import { HABIT_LIBRARY, formatRate, ACTION_TYPES, getHabitsByActionType } from '../../utils/HABIT_LIBRARY';
import HabitIcon from '../../utils/HabitIcons';
import './Onboarding.css';

/**
 * Select Habits Screen - Step 3
 * Browse and select habits from the curated library (23 behaviors)
 */
export default function SelectHabits({ 
  selectedHabits, 
  onToggle, 
  onContinue, 
  onBack 
}) {
  const canContinue = selectedHabits.length > 0;
  
  // Organize habits by action type
  const logHabits = getHabitsByActionType(ACTION_TYPES.LOG);
  const passHabits = getHabitsByActionType(ACTION_TYPES.PASS);

  return (
    <div className="onboarding-screen">
      <div className="onboarding-content scrollable">
        <div className="section-header sticky">
          <h1 className="section-title">Build Your Portfolio</h1>
          <p className="section-subtitle">
            Select the behaviors you want to track. You can add more later.
          </p>
          {selectedHabits.length > 0 && (
            <div className="selection-badge">
              {selectedHabits.length} selected
            </div>
          )}
        </div>

        {/* Log Behaviors Section */}
        <div className="habit-section">
          <div className="habit-section-header">
            <div className="section-badge log-badge">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Log Behaviors
            </div>
            <span className="section-count">{logHabits.length} available</span>
          </div>
          <div className="habit-selection-list">
            {logHabits.map((habit) => {
              const isSelected = selectedHabits.includes(habit.id);
              
              return (
                <button
                  key={habit.id}
                  className={`habit-select-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onToggle(habit.id)}
                >
                  <div className="habit-select-left">
                    <div className="habit-select-icon">
                      <HabitIcon habitId={habit.id} size={22} />
                    </div>
                    <div className="habit-select-info">
                      <span className="habit-select-name">{habit.name}</span>
                      <span className="habit-select-ticker">${habit.ticker}</span>
                    </div>
                  </div>
                  
                  <div className="habit-select-right">
                    <span className="habit-select-rate">{formatRate(habit)}</span>
                    <div className={`select-checkbox ${isSelected ? 'checked' : ''}`}>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pass Behaviors Section */}
        <div className="habit-section">
          <div className="habit-section-header">
            <div className="section-badge pass-badge">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
              </svg>
              Pass Behaviors
            </div>
            <span className="section-count">{passHabits.length} available</span>
          </div>
          <div className="habit-selection-list">
            {passHabits.map((habit) => {
              const isSelected = selectedHabits.includes(habit.id);
              
              return (
                <button
                  key={habit.id}
                  className={`habit-select-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onToggle(habit.id)}
                >
                  <div className="habit-select-left">
                    <div className="habit-select-icon pass-icon">
                      <HabitIcon habitId={habit.id} size={22} />
                    </div>
                    <div className="habit-select-info">
                      <span className="habit-select-name">{habit.name}</span>
                      <span className="habit-select-ticker">${habit.ticker}</span>
                    </div>
                  </div>
                  
                  <div className="habit-select-right">
                    <span className="habit-select-rate">{formatRate(habit)}</span>
                    <div className={`select-checkbox ${isSelected ? 'checked' : ''}`}>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="button-group">
          <button className="secondary-button" onClick={onBack}>
            Back
          </button>
          <button 
            className="primary-button" 
            onClick={onContinue}
            disabled={!canContinue}
          >
            {canContinue 
              ? `Continue with ${selectedHabits.length}` 
              : 'Select at least 1'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
