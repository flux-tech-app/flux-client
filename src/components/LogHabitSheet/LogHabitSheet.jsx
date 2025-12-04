import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { RATE_TYPES } from '../../utils/HABIT_LIBRARY';
import './LogHabitSheet.css';

/**
 * Log Habit Sheet
 * Shows list of user's habits for quick logging
 */
export default function LogHabitSheet({ onClose, onLogComplete }) {
  const { habits, isHabitLoggedOnDate, addLog } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [logValue, setLogValue] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const today = new Date();

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    // Set default value based on rate type
    if (habit.rateType !== RATE_TYPES.BINARY) {
      setLogValue('1');
    } else {
      setLogValue('');
    }
  };

  const handleLog = async () => {
    if (!selectedHabit) return;
    
    setIsLogging(true);
    
    const logData = {
      habitId: selectedHabit.id,
      units: selectedHabit.rateType !== RATE_TYPES.BINARY 
        ? parseFloat(logValue) || 1 
        : 1,
    };

    const log = addLog(logData);
    
    // Brief delay for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsLogging(false);
    onLogComplete?.(log);
    onClose?.();
  };

  const handleValueChange = (delta) => {
    const current = parseFloat(logValue) || 0;
    // Use appropriate step based on habit type
    let step = 1;
    if (selectedHabit.unit === 'step') {
      step = 1000;
    } else if (selectedHabit.unit === 'minute') {
      step = 5;
    }
    const newValue = Math.max(0, current + (delta * step));
    setLogValue(newValue.toString());
  };

  // Calculate earnings preview
  const getEarningsPreview = () => {
    if (!selectedHabit) return 0;
    if (selectedHabit.rateType === RATE_TYPES.BINARY) {
      return selectedHabit.rate;
    }
    return selectedHabit.rate * (parseFloat(logValue) || 0);
  };

  // If a habit is selected, show logging modal
  if (selectedHabit) {
    const isBinary = selectedHabit.rateType === RATE_TYPES.BINARY;
    
    return (
      <div className="log-habit-sheet">
        <div className="log-modal">
          <button className="back-button" onClick={() => setSelectedHabit(null)}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back
          </button>

          <div className="log-modal-header">
            <span className="log-habit-icon">{selectedHabit.icon}</span>
            <div className="log-habit-info">
              <span className="log-habit-ticker">${selectedHabit.ticker}</span>
              <span className="log-habit-name">{selectedHabit.name}</span>
            </div>
          </div>

          {/* Unit-based habits get a number input */}
          {!isBinary ? (
            <div className="log-input-section">
              <label className="log-input-label">
                How many {selectedHabit.unitPlural}?
              </label>
              <div className="log-stepper">
                <button 
                  className="stepper-button"
                  onClick={() => handleValueChange(-1)}
                  disabled={parseFloat(logValue) <= 0}
                >
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <input
                  type="number"
                  className="stepper-input"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  min="0"
                  step={selectedHabit.unit === 'step' ? 1000 : 1}
                />
                <button 
                  className="stepper-button"
                  onClick={() => handleValueChange(1)}
                >
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="log-confirmation-section">
              <p className="log-confirmation-text">
                Did you complete <strong>{selectedHabit.name}</strong> today?
              </p>
            </div>
          )}

          {/* Earnings preview */}
          <div className="earnings-preview-box">
            <span className="earnings-preview-label">You'll earn</span>
            <span className="earnings-preview-value">
              +${getEarningsPreview().toFixed(2)}
            </span>
          </div>

          {/* Confirm button */}
          <button 
            className="log-confirm-button"
            onClick={handleLog}
            disabled={isLogging || (!isBinary && !parseFloat(logValue))}
          >
            {isLogging ? (
              <span className="logging-spinner" />
            ) : (
              isBinary ? 'Yes, I did it!' : 'Log Activity'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default: show list of habits
  return (
    <div className="log-habit-sheet">
      <h2 className="log-sheet-title">Log Activity</h2>
      <p className="log-sheet-subtitle">
        {habits.length > 0 
          ? 'Select a habit to log'
          : 'Add habits to start logging'
        }
      </p>

      <div className="habits-log-list">
        {habits.map((habit, index) => {
          const isLogged = isHabitLoggedOnDate(habit.id, today);
          
          // Format rate display
          let rateDisplay;
          if (habit.rate < 0.01) {
            rateDisplay = `$${habit.rate.toFixed(4)}/${habit.unit}`;
          } else {
            rateDisplay = `$${habit.rate.toFixed(2)}`;
            if (habit.rateType !== RATE_TYPES.BINARY) {
              rateDisplay += `/${habit.unit}`;
            }
          }
          
          return (
            <motion.button
              key={habit.id}
              className={`habit-log-item ${isLogged ? 'logged' : ''}`}
              onClick={() => !isLogged && handleHabitSelect(habit)}
              disabled={isLogged}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={!isLogged ? { scale: 0.98 } : {}}
            >
              <div className="habit-log-left">
                <span className="habit-log-icon">{habit.icon}</span>
                <div className="habit-log-info">
                  <span className="habit-log-ticker">${habit.ticker}</span>
                  <span className="habit-log-name">{habit.name}</span>
                </div>
              </div>
              
              <div className="habit-log-right">
                {isLogged ? (
                  <span className="habit-logged-badge">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Done
                  </span>
                ) : (
                  <>
                    <span className="habit-log-rate">{rateDisplay}</span>
                    <svg className="chevron" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="empty-habits">
          <p>Add habits to start earning!</p>
        </div>
      )}
    </div>
  );
}
