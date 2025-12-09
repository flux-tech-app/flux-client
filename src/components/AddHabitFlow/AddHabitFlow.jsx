import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { HABIT_LIBRARY, getHabitById, formatRate, getRateLabel, RATE_TYPES } from '../../utils/HABIT_LIBRARY';
import HabitIcon from '../../utils/HabitIcons';
import GoalSetup from '../GoalSetup/GoalSetup';
import './AddHabitFlow.css';

/**
 * Add Habit Flow (Post-Onboarding)
 *
 * Step 1: Select from library (excluding already-added habits)
 * Step 2: Customize rate
 * Step 3: Set goal (NEW)
 */
export default function AddHabitFlow({ onComplete, onClose }) {
  const { isHabitAdded } = useHabits();
  const [step, setStep] = useState(1);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [customRate, setCustomRate] = useState('');
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [direction, setDirection] = useState(1);

  // Filter out already-added habits
  const availableHabits = HABIT_LIBRARY.filter(h => !isHabitAdded(h.id));

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    setSelectedRate(habit.defaultRate);
    setUseCustomRate(false);
    setCustomRate('');
    setSelectedGoal(null);
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 3) {
      setDirection(-1);
      setStep(2);
    } else if (step === 2) {
      setDirection(-1);
      setStep(1);
    } else {
      onClose?.();
    }
  };

  const handleRateConfirm = () => {
    setDirection(1);
    setStep(3);
  };

  const handleGoalSet = (goal) => {
    setSelectedGoal(goal);
    handleConfirm(goal);
  };

  const handleConfirm = (goal) => {
    if (!selectedHabit || !goal) return;

    const rate = useCustomRate && customRate ? parseFloat(customRate) : selectedRate;

    onComplete?.({
      libraryId: selectedHabit.id,
      rate: rate,
      goal: goal
    });
  };

  const effectiveRate = useCustomRate && customRate ? parseFloat(customRate) : selectedRate;

  return (
    <div className="add-habit-flow">
      {/* Progress indicator */}
      <div className="flow-progress">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`progress-dot ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flow-content">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.25 }}
              className="flow-step"
            >
              <StepSelectHabit
                habits={availableHabits}
                onSelect={handleHabitSelect}
              />
            </motion.div>
          )}

          {step === 2 && selectedHabit && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.25 }}
              className="flow-step"
            >
              <StepCustomize
                habit={selectedHabit}
                selectedRate={selectedRate}
                customRate={customRate}
                useCustomRate={useCustomRate}
                onRateSelect={setSelectedRate}
                onCustomRateChange={setCustomRate}
                onUseCustomRateToggle={setUseCustomRate}
                onBack={handleBack}
                onConfirm={handleRateConfirm}
              />
            </motion.div>
          )}

          {step === 3 && selectedHabit && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.25 }}
              className="flow-step"
            >
              <StepGoal
                habit={selectedHabit}
                selectedRate={effectiveRate}
                onBack={handleBack}
                onGoalSet={handleGoalSet}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Step 1: Select Habit from Library
 */
function StepSelectHabit({ habits, onSelect }) {
  if (habits.length === 0) {
    return (
      <div className="step-select">
        <h2 className="step-title">All Habits Added!</h2>
        <p className="step-subtitle">
          You've already added all available habits to your portfolio.
        </p>
        <div className="empty-state-icon">🎉</div>
      </div>
    );
  }

  return (
    <div className="step-select">
      <h2 className="step-title">Add Position</h2>
      <p className="step-subtitle">
        Select a habit to add to your portfolio
      </p>

      <div className="habit-list">
        {habits.map((habit) => (
          <motion.button
            key={habit.id}
            className="habit-option"
            onClick={() => onSelect(habit)}
            whileTap={{ scale: 0.98 }}
          >
            <div className="habit-option-left">
              <div className="habit-option-icon-container">
                <HabitIcon habitId={habit.id} size={24} />
              </div>
              <div className="habit-option-info">
                <span className="habit-option-ticker">${habit.ticker}</span>
                <span className="habit-option-name">{habit.name}</span>
              </div>
            </div>
            <div className="habit-option-right">
              <span className="habit-option-rate">
                {formatRate(habit)}
              </span>
              <svg className="chevron" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.button>
        ))}

        {/* Request Habit Option */}
        <div className="request-habit-card">
          <div className="request-habit-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="request-habit-content">
            <div className="request-habit-title">Request a Habit</div>
            <div className="request-habit-subtitle">
              Custom habits coming soon! We're starting with a curated library to ensure data quality.
            </div>
          </div>
          <div className="coming-soon-badge">Coming Soon</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 2: Customize Rate
 */
function StepCustomize({
  habit,
  selectedRate,
  customRate,
  useCustomRate,
  onRateSelect,
  onCustomRateChange,
  onUseCustomRateToggle,
  onBack,
  onConfirm
}) {
  // Rough weekly projection
  const getWeeklyEstimate = () => {
    const rate = useCustomRate && customRate ? parseFloat(customRate) : selectedRate;

    if (habit.rateType === RATE_TYPES.BINARY) {
      return rate * 5; // 5 completions per week
    } else if (habit.rateType === RATE_TYPES.DURATION) {
      return rate * 30 * 5; // 30 min, 5 times
    } else if (habit.rateType === RATE_TYPES.DISTANCE) {
      return rate * 3 * 4; // 3 miles, 4 times
    } else if (habit.rateType === RATE_TYPES.COUNT) {
      if (habit.unit === 'step') {
        return rate * 8000 * 5;
      } else if (habit.unit === 'rep') {
        return rate * 20 * 5;
      }
      return rate * 3 * 5;
    }
    return 0;
  };

  const effectiveRate = useCustomRate && customRate ? parseFloat(customRate) : selectedRate;
  const canConfirm = effectiveRate > 0;

  return (
    <div className="step-customize">
      <button className="back-link" onClick={onBack}>
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back
      </button>

      {/* Habit header */}
      <div className="customize-header">
        <div className="customize-icon-container">
          <HabitIcon habitId={habit.id} size={36} />
        </div>
        <div className="customize-title-group">
          <span className="customize-ticker">${habit.ticker}</span>
          <span className="customize-name">{habit.name}</span>
        </div>
      </div>

      {/* Description */}
      <p className="customize-description">{habit.description}</p>

      {/* Rate selection */}
      <div className="customize-section">
        <h3 className="section-label">Set Your Rate</h3>
        <div className="rate-options">
          {habit.rateOptions.map((rate, index) => {
            const isSelected = !useCustomRate && selectedRate === rate;
            const label = getRateLabel(index);

            // Format rate
            let rateDisplay;
            if (rate < 0.01) {
              rateDisplay = `$${rate.toFixed(4)}`;
            } else {
              rateDisplay = `$${rate.toFixed(2)}`;
            }

            return (
              <button
                key={rate}
                className={`rate-option ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onRateSelect(rate);
                  onUseCustomRateToggle(false);
                }}
              >
                <span className="rate-label">{label}</span>
                <span className="rate-value">
                  {rateDisplay}/{habit.unit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Rate Option */}
      <div className="customize-section">
        <h3 className="section-label">Or Use Custom Rate</h3>
        <div className="custom-rate-section">
          <button
            className={`custom-rate-toggle ${useCustomRate ? 'active' : ''}`}
            onClick={() => {
              onUseCustomRateToggle(!useCustomRate);
              if (!useCustomRate) {
                onCustomRateChange('');
              }
            }}
          >
            <span>{useCustomRate ? 'Using Custom Rate' : 'Use Custom Rate'}</span>
            <svg
              className="toggle-icon"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {useCustomRate ? (
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>

          {useCustomRate && (
            <div className="custom-rate-input-wrapper">
              <div className="custom-rate-input-group">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  className="custom-rate-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={customRate}
                  onChange={(e) => onCustomRateChange(e.target.value)}
                />
                <span className="per-unit">/{habit.unit}</span>
              </div>
              <p className="custom-rate-hint">
                Enter your preferred rate amount for this habit
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Earnings Preview */}
      <div className="earnings-preview">
        <div className="earnings-row">
          <span className="earnings-label">Estimated weekly earnings:</span>
        </div>
        <div className="earnings-amount">
          <span className="amount-value">${getWeeklyEstimate().toFixed(2)}</span>
          <span className="amount-label">/week</span>
        </div>
      </div>

      {/* Continue button */}
      <button
        className="confirm-button"
        onClick={onConfirm}
        disabled={!canConfirm}
      >
        Set Goal
      </button>
    </div>
  );
}

/**
 * Step 3: Set Goal
 */
function StepGoal({ habit, selectedRate, onBack, onGoalSet }) {
  return (
    <div className="step-goal">
      <button className="back-link" onClick={onBack}>
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back
      </button>

      {/* Habit header */}
      <div className="customize-header">
        <div className="customize-icon-container">
          <HabitIcon habitId={habit.id} size={36} />
        </div>
        <div className="customize-title-group">
          <span className="customize-ticker">${habit.ticker}</span>
          <span className="customize-name">{habit.name}</span>
        </div>
      </div>

      <GoalSetup
        habitLibraryData={habit}
        selectedRate={selectedRate}
        onGoalSet={onGoalSet}
      />
    </div>
  );
}
