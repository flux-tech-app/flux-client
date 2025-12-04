import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { HABIT_LIBRARY, getHabitById, formatRate, getRateLabel } from '../../utils/HABIT_LIBRARY';
import './AddHabitFlow.css';

/**
 * Add Habit Flow (Post-Onboarding)
 * 
 * Step 1: Select from library (excluding already-added habits)
 * Step 2: Customize rate
 */
export default function AddHabitFlow({ onComplete, onClose }) {
  const { isHabitAdded } = useHabits();
  const [step, setStep] = useState(1);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
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
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(1);
    } else {
      onClose?.();
    }
  };

  const handleConfirm = () => {
    if (!selectedHabit) return;
    
    onComplete?.({
      libraryId: selectedHabit.id,
      rate: selectedRate
    });
  };

  return (
    <div className="add-habit-flow">
      {/* Progress indicator */}
      <div className="flow-progress">
        {[1, 2].map((s) => (
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
                onRateSelect={setSelectedRate}
                onBack={handleBack}
                onConfirm={handleConfirm}
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
              <span className="habit-option-icon">{habit.icon}</span>
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
  onRateSelect, 
  onBack, 
  onConfirm 
}) {
  // Rough weekly projection
  const getWeeklyEstimate = () => {
    if (habit.rateType === 'BINARY') {
      return selectedRate * 5; // 5 completions per week
    } else if (habit.rateType === 'DURATION') {
      return selectedRate * 30 * 5; // 30 min, 5 times
    } else if (habit.rateType === 'DISTANCE') {
      return selectedRate * 3 * 4; // 3 miles, 4 times
    } else if (habit.rateType === 'COUNT') {
      if (habit.unit === 'step') {
        return selectedRate * 8000 * 5;
      } else if (habit.unit === 'rep') {
        return selectedRate * 20 * 5;
      }
      return selectedRate * 3 * 5;
    }
    return 0;
  };

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
        <span className="customize-icon">{habit.icon}</span>
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
            const isSelected = selectedRate === rate;
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
                onClick={() => onRateSelect(rate)}
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

      {/* Confirm button */}
      <button 
        className="confirm-button"
        onClick={onConfirm}
      >
        Add to Portfolio
      </button>
    </div>
  );
}
