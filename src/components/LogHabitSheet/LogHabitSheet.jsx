import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { RATE_TYPES, ACTION_TYPES, getHabitById } from '../../utils/HABIT_LIBRARY';
import HabitIcon from '../../utils/HabitIcons';
import './LogHabitSheet.css';

/**
 * Log Habit Sheet
 * Shows list of user's habits for quick logging
 * Now supports filtering by action type (log vs pass) and autocomplete search
 */
export default function LogHabitSheet({ actionType, onClose, onLogComplete }) {
  const { habits, isHabitLoggedOnDate, addLog } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [logValue, setLogValue] = useState('');
  const [customRate, setCustomRate] = useState(null);
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const today = new Date();

  // Filter habits by action type
  const filteredHabits = habits.filter(habit => {
    const libraryHabit = getHabitById(habit.libraryId);
    return libraryHabit && libraryHabit.actionType === actionType;
  });

  // Apply search filter
  const searchedHabits = searchQuery.trim()
    ? filteredHabits.filter(habit =>
        habit.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredHabits;

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    setUseCustomRate(false);
    setCustomRate(null);
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

    try {
      // Determine the rate to use
      const effectiveRate = useCustomRate && customRate
        ? parseFloat(customRate)
        : selectedHabit.rate;

      const logData = {
        habitId: selectedHabit.id,
        units: selectedHabit.rateType !== RATE_TYPES.BINARY
          ? parseFloat(logValue) || 1
          : 1,
      };

      // Calculate custom earnings if using custom rate
      if (useCustomRate && customRate) {
        if (selectedHabit.rateType === RATE_TYPES.BINARY) {
          logData.customEarnings = parseFloat(customRate);
        } else {
          logData.customEarnings = parseFloat(customRate) * (parseFloat(logValue) || 1);
        }
      }

      const log = addLog(logData);

      // Brief delay for animation
      await new Promise(resolve => setTimeout(resolve, 300));

      setIsLogging(false);
      onLogComplete?.(log);
      onClose?.();
    } catch (error) {
      console.error('Error logging activity:', error);
      setIsLogging(false);
      // Optionally show an error message to the user
      alert('Failed to log activity. Please try again.');
    }
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
    
    const rate = useCustomRate && customRate ? parseFloat(customRate) : selectedHabit.rate;
    
    if (selectedHabit.rateType === RATE_TYPES.BINARY) {
      return rate;
    }
    return rate * (parseFloat(logValue) || 0);
  };

  // Get rate options for display
  const getRateOptions = () => {
    if (!selectedHabit) return [];
    const libraryHabit = getHabitById(selectedHabit.libraryId);
    if (!libraryHabit) return [selectedHabit.rate];
    return libraryHabit.rateOptions || [selectedHabit.rate];
  };

  // If a habit is selected, show logging modal
  if (selectedHabit) {
    const isBinary = selectedHabit.rateType === RATE_TYPES.BINARY;
    const rateOptions = getRateOptions();
    
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
            <div className="log-habit-icon-container">
              <HabitIcon habitId={selectedHabit.libraryId} size={48} />
            </div>
            <div className="log-habit-info">
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
                {actionType === ACTION_TYPES.LOG 
                  ? <>Did you complete <strong>{selectedHabit.name}</strong>?</>
                  : <>Did you successfully pass on <strong>{selectedHabit.name}</strong>?</>
                }
              </p>
            </div>
          )}

          {/* Rate Selection */}
          <div className="rate-selection-section">
            <label className="log-input-label">Rate</label>
            <div className="rate-selection-grid">
              {rateOptions.map((rate, index) => {
                const isSelected = !useCustomRate && rate === selectedHabit.rate;
                const labels = ['Low', 'Default', 'High'];
                
                return (
                  <button
                    key={rate}
                    className={`rate-selection-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setUseCustomRate(false);
                      setCustomRate(null);
                      // This would require updating the habit's rate in context
                      // For now, we'll just use it for this log
                    }}
                  >
                    <span className="rate-label">{labels[index] || 'Rate'}</span>
                    <span className="rate-amount">
                      ${rate < 0.01 ? rate.toFixed(4) : rate.toFixed(2)}
                    </span>
                  </button>
                );
              })}
              <button
                className={`rate-selection-btn ${useCustomRate ? 'selected' : ''}`}
                onClick={() => setUseCustomRate(true)}
              >
                <span className="rate-label">Custom</span>
                <span className="rate-amount">
                  {useCustomRate ? `$${(parseFloat(customRate) || 0).toFixed(2)}` : '—'}
                </span>
              </button>
            </div>

            {/* Custom Rate Input */}
            {useCustomRate && (
              <div className="custom-rate-input-group">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  className="custom-rate-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={customRate || ''}
                  onChange={(e) => setCustomRate(e.target.value)}
                />
                <span className="per-label">/{selectedHabit.unit}</span>
              </div>
            )}
          </div>

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
            disabled={isLogging || (!isBinary && !parseFloat(logValue)) || (useCustomRate && !customRate)}
          >
            {isLogging ? (
              <span className="logging-spinner" />
            ) : (
              actionType === ACTION_TYPES.LOG ? 'Log Activity' : 'Log Pass'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default: show list of habits with search
  const title = actionType === ACTION_TYPES.LOG ? 'Log Activity' : 'Log Pass';
  const subtitle = filteredHabits.length > 0
    ? actionType === ACTION_TYPES.LOG
      ? 'Select a habit to log'
      : 'Select what you successfully passed on'
    : actionType === ACTION_TYPES.LOG
      ? 'Add Log behaviors to start tracking'
      : 'Add Pass behaviors to start tracking';

  return (
    <div className="log-habit-sheet">
      <h2 className="log-sheet-title">{title}</h2>
      <p className="log-sheet-subtitle">{subtitle}</p>

      {/* Search Input */}
      {filteredHabits.length > 0 && (
        <div className="search-input-container">
          <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="habits-log-list">
        {searchedHabits.map((habit, index) => {
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
                <div className="habit-log-icon-container">
                  <HabitIcon habitId={habit.libraryId} size={28} />
                </div>
                <div className="habit-log-info">
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

      {filteredHabits.length === 0 && (
        <div className="empty-habits">
          <p>
            {actionType === ACTION_TYPES.LOG 
              ? 'Add Log behaviors to your portfolio to start tracking positive habits!'
              : 'Add Pass behaviors to your portfolio to track impulse resistance!'}
          </p>
        </div>
      )}

      {searchQuery && searchedHabits.length === 0 && filteredHabits.length > 0 && (
        <div className="empty-search">
          <p>No habits found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
