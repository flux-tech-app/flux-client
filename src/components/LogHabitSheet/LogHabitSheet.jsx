import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import './LogHabitSheet.css';

/**
 * Log Habit Sheet - shows list of today's habits for quick logging
 * Used when user taps "Log" from FAB
 */
export default function LogHabitSheet({ onClose, onLogComplete }) {
  const { getTodayHabits, isHabitLoggedOnDate, addLog } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [logValue, setLogValue] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const todayHabits = getTodayHabits();
  const today = new Date();

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    // Set default value based on rate type
    if (habit.rateType === 'per_unit') {
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
      amount: selectedHabit.rateType === 'per_unit' 
        ? parseFloat(logValue) || 1 
        : 1,
      date: today.toISOString()
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
    const newValue = Math.max(0, current + delta);
    setLogValue(newValue.toString());
  };

  // Calculate earnings preview
  const getEarningsPreview = () => {
    if (!selectedHabit) return 0;
    if (selectedHabit.rateType === 'per_unit') {
      return selectedHabit.rate * (parseFloat(logValue) || 0);
    }
    return selectedHabit.rate;
  };

  // If a habit is selected, show logging modal
  if (selectedHabit) {
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
          {selectedHabit.rateType === 'per_unit' ? (
            <div className="log-input-section">
              <label className="log-input-label">
                How many {selectedHabit.unit}s?
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
                  step="0.5"
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
            disabled={isLogging || (selectedHabit.rateType === 'per_unit' && !parseFloat(logValue))}
          >
            {isLogging ? (
              <span className="logging-spinner" />
            ) : (
              selectedHabit.rateType === 'per_unit' ? 'Log Activity' : 'Yes, I did it!'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default: show list of today's habits
  return (
    <div className="log-habit-sheet">
      <h2 className="log-sheet-title">Log Activity</h2>
      <p className="log-sheet-subtitle">
        {todayHabits.length > 0 
          ? 'Select a habit to log'
          : 'No habits scheduled for today'
        }
      </p>

      <div className="habits-log-list">
        {todayHabits.map((habit, index) => {
          const isLogged = isHabitLoggedOnDate(habit.id, today);
          
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
                    <span className="habit-log-rate">
                      ${habit.rate.toFixed(2)}
                      {habit.rateType === 'per_unit' ? `/${habit.unit}` : ''}
                    </span>
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

      {todayHabits.length === 0 && (
        <div className="empty-habits">
          <p>Create a habit to start earning!</p>
        </div>
      )}
    </div>
  );
}
