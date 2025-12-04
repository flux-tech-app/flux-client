import { getHabitById, getRateLabel } from '../../utils/HABIT_LIBRARY';
import HabitIcon from '../../utils/HabitIcons';
import './Onboarding.css';

/**
 * Set Rates Screen - Step 4
 * Customize rates for selected habits
 */
export default function SetRates({ 
  selectedHabits, 
  habitRates, 
  onRateChange, 
  onContinue, 
  onBack 
}) {
  
  // Calculate projected weekly earnings
  const getWeeklyProjection = () => {
    let total = 0;
    selectedHabits.forEach(libraryId => {
      const habit = getHabitById(libraryId);
      const rate = habitRates[libraryId] ?? habit.defaultRate;
      
      // Rough estimate based on typical activity
      if (habit.rateType === 'BINARY') {
        total += rate * 5; // 5 completions per week
      } else if (habit.rateType === 'DURATION') {
        total += rate * 30 * 5; // 30 min × 5 sessions
      } else if (habit.rateType === 'DISTANCE') {
        total += rate * 3 * 4; // 3 miles × 4 sessions
      } else if (habit.rateType === 'COUNT') {
        if (habit.unit === 'step') {
          total += rate * 8000 * 5; // 8k steps × 5 days
        } else if (habit.unit === 'rep') {
          total += rate * 20 * 5; // 20 reps × 5 days
        } else {
          total += rate * 3 * 5;
        }
      }
    });
    return total;
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-content scrollable">
        <div className="section-header">
          <h1 className="section-title">Set Your Rates</h1>
          <p className="section-subtitle">
            Choose how much to earn per habit. Start small—you can adjust later.
          </p>
        </div>

        {/* Rate Cards */}
        <div className="rate-cards-list">
          {selectedHabits.map(libraryId => {
            const habit = getHabitById(libraryId);
            const currentRate = habitRates[libraryId] ?? habit.defaultRate;
            
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
            Based on typical activity levels
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="button-group">
          <button className="secondary-button" onClick={onBack}>
            Back
          </button>
          <button className="primary-button" onClick={onContinue}>
            Review & Finish
          </button>
        </div>
      </div>
    </div>
  );
}
