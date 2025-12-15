import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { RATE_TYPES, ACTION_TYPES, getHabitById } from '../../utils/HABIT_LIBRARY';
import HabitIcon from '../../utils/HabitIcons';
import Button from '../Button';
import './LogHabitSheet.css';

/**
 * Log Habit Sheet - Modernized Design
 * Clean, minimal interface for quick habit logging
 *
 * @param {string} actionType - 'log' or 'pass'
 * @param {string} initialHabitId - Optional habit ID to pre-select
 * @param {function} onClose - Called when sheet closes
 * @param {function} onLogComplete - Called after successful log
 */
export default function LogHabitSheet({ actionType, initialHabitId, onClose, onLogComplete }) {
  const { habits, isHabitLoggedOnDate, addLog } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [logValue, setLogValue] = useState('');
  const [customRate, setCustomRate] = useState(null);
  const [showRateOptions, setShowRateOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const today = new Date();

  // Pre-select habit if initialHabitId is provided
  useEffect(() => {
    if (initialHabitId && habits.length > 0) {
      const habit = habits.find(h => h.id === initialHabitId);
      if (habit) {
        handleHabitSelect(habit);
      }
    }
  }, [initialHabitId, habits]);

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
    setCustomRate(null);
    setShowRateOptions(false);
    // Set default value based on rate type
    if (habit.rateType !== RATE_TYPES.BINARY) {
      // Smart defaults based on unit type
      if (habit.unit === 'minute') setLogValue('30');
      else if (habit.unit === 'mile') setLogValue('3');
      else if (habit.unit === 'step') setLogValue('5000');
      else if (habit.unit === 'rep') setLogValue('20');
      else if (habit.unit === 'chapter') setLogValue('1');
      else setLogValue('1');
    } else {
      setLogValue('');
    }
  };

  const handleLog = async () => {
    if (!selectedHabit) return;
    setIsLogging(true);

    try {
      const logData = {
        habitId: selectedHabit.id,
        units: selectedHabit.rateType !== RATE_TYPES.BINARY
          ? parseFloat(logValue) || 1
          : 1,
      };

      // Use custom rate if set
      if (customRate !== null) {
        if (selectedHabit.rateType === RATE_TYPES.BINARY) {
          logData.customEarnings = parseFloat(customRate);
        } else {
          logData.customEarnings = parseFloat(customRate) * (parseFloat(logValue) || 1);
        }
      }

      const log = addLog(logData);
      await new Promise(resolve => setTimeout(resolve, 300));

      setIsLogging(false);
      onLogComplete?.(log);
      onClose?.();
    } catch (error) {
      console.error('Error logging activity:', error);
      setIsLogging(false);
      alert('Failed to log activity. Please try again.');
    }
  };

  // Calculate earnings preview
  const getEarningsPreview = () => {
    if (!selectedHabit) return 0;
    const rate = customRate !== null ? parseFloat(customRate) : selectedHabit.rate;
    if (selectedHabit.rateType === RATE_TYPES.BINARY) {
      return rate;
    }
    return rate * (parseFloat(logValue) || 0);
  };

  // Get rate options
  const getRateOptions = () => {
    if (!selectedHabit) return [];
    const libraryHabit = getHabitById(selectedHabit.libraryId);
    if (!libraryHabit) return [selectedHabit.rate];
    return libraryHabit.rateOptions || [selectedHabit.rate];
  };

  const currentRate = customRate !== null ? customRate : selectedHabit?.rate;

  // ==================== LOGGING MODAL ====================
  if (selectedHabit) {
    const isBinary = selectedHabit.rateType === RATE_TYPES.BINARY;
    const rateOptions = getRateOptions();
    const rateLabels = ['Low', 'Default', 'High'];

    return (
      <div className="log-sheet">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedHabit(null)}
          leftIcon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          }
          className="sheet-back-btn"
        >
          Back
        </Button>

        {/* Habit Header - Clean inline layout */}
        <div className="log-header">
          <div className="log-header-icon">
            <HabitIcon habitId={selectedHabit.libraryId} size={32} />
          </div>
          <div className="log-header-info">
            <h2 className="log-header-name">{selectedHabit.name}</h2>
            <span className="log-header-rate">
              ${currentRate < 0.01 ? currentRate.toFixed(4) : currentRate.toFixed(2)}
              {!isBinary && `/${selectedHabit.unit}`}
            </span>
          </div>
        </div>

        {/* Quantity Input (for non-binary habits) */}
        {!isBinary && (
          <div className="log-quantity-section">
            <label className="log-label">How many {selectedHabit.unitPlural}?</label>
            <div className="quantity-input-wrapper">
              <button
                className="quantity-btn"
                onClick={() => {
                  const step = selectedHabit.unit === 'step' ? 1000 : selectedHabit.unit === 'minute' ? 5 : 1;
                  setLogValue(Math.max(0, (parseFloat(logValue) || 0) - step).toString());
                }}
              >
                −
              </button>
              <input
                type="number"
                className="quantity-input"
                value={logValue}
                onChange={(e) => setLogValue(e.target.value)}
                min="0"
              />
              <button
                className="quantity-btn"
                onClick={() => {
                  const step = selectedHabit.unit === 'step' ? 1000 : selectedHabit.unit === 'minute' ? 5 : 1;
                  setLogValue(((parseFloat(logValue) || 0) + step).toString());
                }}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Binary Confirmation */}
        {isBinary && (
          <div className="log-binary-section">
            <div className="binary-check">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(34, 197, 94, 0.1)"/>
                <path d="M15 24l6 6 12-12" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="binary-text">
              {actionType === ACTION_TYPES.LOG
                ? `Log ${selectedHabit.name}?`
                : `Successfully passed on ${selectedHabit.name}?`
              }
            </p>
          </div>
        )}

        {/* Rate Customization - Collapsed by default */}
        <div className="rate-section">
          <button
            className={`rate-toggle ${showRateOptions ? 'expanded' : ''}`}
            onClick={() => setShowRateOptions(!showRateOptions)}
          >
            <span className="rate-toggle-label">
              {customRate !== null ? 'Using custom rate' : 'Using default rate'}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="rate-toggle-icon">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L8 8.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <AnimatePresence>
            {showRateOptions && (
              <motion.div
                className="rate-options-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rate-options-grid">
                  {rateOptions.map((rate, index) => (
                    <button
                      key={rate}
                      className={`rate-option-btn ${customRate === null && rate === selectedHabit.rate ? 'active' : ''} ${customRate === rate ? 'active' : ''}`}
                      onClick={() => {
                        if (rate === selectedHabit.rate) {
                          setCustomRate(null);
                        } else {
                          setCustomRate(rate);
                        }
                      }}
                    >
                      <span className="rate-option-label">{rateLabels[index] || 'Rate'}</span>
                      <span className="rate-option-value">
                        ${rate < 0.01 ? rate.toFixed(4) : rate.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Earnings Preview - Inline */}
        <div className="earnings-inline">
          <span className="earnings-label">You'll earn</span>
          <span className="earnings-value">+${getEarningsPreview().toFixed(2)}</span>
        </div>

        {/* Confirm Button */}
        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={handleLog}
          disabled={isLogging || (!isBinary && !parseFloat(logValue))}
          loading={isLogging}
        >
          {actionType === ACTION_TYPES.LOG ? 'Log Activity' : 'Log Pass'}
        </Button>
      </div>
    );
  }

  // ==================== HABIT LIST VIEW ====================
  const title = actionType === ACTION_TYPES.LOG ? 'Log Activity' : 'Log Pass';
  const emptyText = actionType === ACTION_TYPES.LOG
    ? 'Add Log habits to your portfolio to start tracking'
    : 'Add Pass habits to track impulse resistance';

  return (
    <div className="log-sheet">
      <h2 className="sheet-title">{title}</h2>

      {filteredHabits.length > 0 && (
        <p className="sheet-subtitle">Select a habit to log</p>
      )}

      {/* Search */}
      {filteredHabits.length > 3 && (
        <div className="search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-field"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Habit List */}
      <div className="habit-list">
        {searchedHabits.map((habit, index) => {
          const isLogged = isHabitLoggedOnDate(habit.id, today);
          const rateDisplay = habit.rate < 0.01
            ? `$${habit.rate.toFixed(4)}`
            : `$${habit.rate.toFixed(2)}`;

          return (
            <motion.button
              key={habit.id}
              className={`habit-row ${isLogged ? 'completed' : ''}`}
              onClick={() => !isLogged && handleHabitSelect(habit)}
              disabled={isLogged}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileTap={!isLogged ? { scale: 0.98 } : {}}
            >
              <div className="habit-row-icon">
                <HabitIcon habitId={habit.libraryId} size={24} />
              </div>
              <span className="habit-row-name">{habit.name}</span>
              <div className="habit-row-right">
                {isLogged ? (
                  <span className="done-badge">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Done
                  </span>
                ) : (
                  <>
                    <span className="habit-row-rate">{rateDisplay}</span>
                    <svg className="habit-row-chevron" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Empty States */}
      {filteredHabits.length === 0 && (
        <div className="empty-state">
          <p>{emptyText}</p>
        </div>
      )}

      {searchQuery && searchedHabits.length === 0 && filteredHabits.length > 0 && (
        <div className="empty-state">
          <p>No habits found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
