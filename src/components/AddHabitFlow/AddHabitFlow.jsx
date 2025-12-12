import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { HABIT_LIBRARY, getHabitById, formatRate, getRateLabel, RATE_TYPES } from '../../utils/HABIT_LIBRARY';
import HabitIcon from '../../utils/HabitIcons';
import GoalSetup from '../GoalSetup/GoalSetup';
import Button from '../Button';
import './AddHabitFlow.css';

/**
 * Add Habit Flow - Modernized 2-Step Design
 *
 * Step 1: Select from library (excluding already-added habits)
 * Step 2: Configure rate + goal (combined)
 */
export default function AddHabitFlow({ onComplete, onClose }) {
  const { isHabitAdded } = useHabits();
  const [step, setStep] = useState(1);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [showRateOptions, setShowRateOptions] = useState(false);
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
    setShowRateOptions(false);
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setDirection(-1);
      setStep(1);
    } else {
      onClose?.();
    }
  };

  const handleGoalSet = (goal) => {
    if (!selectedHabit || !goal) return;

    onComplete?.({
      libraryId: selectedHabit.id,
      rate: selectedRate,
      goal: goal
    });
  };

  return (
    <div className="add-flow">
      {/* Progress indicator - 2 dots */}
      <div className="flow-dots">
        <div className={`flow-dot ${step >= 1 ? 'active' : ''}`} />
        <div className={`flow-dot ${step >= 2 ? 'active' : ''}`} />
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
              <StepConfigure
                habit={selectedHabit}
                selectedRate={selectedRate}
                showRateOptions={showRateOptions}
                onRateSelect={setSelectedRate}
                onToggleRateOptions={() => setShowRateOptions(!showRateOptions)}
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
      <div className="step-content">
        <h2 className="step-title">All Habits Added!</h2>
        <p className="step-subtitle">
          You've added all available habits to your portfolio.
        </p>
        <div className="empty-icon">🎉</div>
      </div>
    );
  }

  return (
    <div className="step-content">
      <h2 className="step-title">Add Position</h2>
      <p className="step-subtitle">Select a habit to add to your portfolio</p>

      <div className="habit-select-list">
        {habits.map((habit, index) => (
          <motion.button
            key={habit.id}
            className="habit-select-row"
            onClick={() => onSelect(habit)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="habit-select-icon">
              <HabitIcon habitId={habit.id} size={24} />
            </div>
            <span className="habit-select-name">{habit.name}</span>
            <div className="habit-select-right">
              <span className="habit-select-rate">{formatRate(habit)}</span>
              <svg className="habit-select-chevron" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.button>
        ))}

        {/* Request Habit */}
        <div className="request-card">
          <div className="request-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="request-text">
            <span className="request-title">Request a Habit</span>
            <span className="request-desc">Custom habits coming soon</span>
          </div>
          <span className="coming-badge">Soon</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 2: Configure Rate + Goal (Combined)
 */
function StepConfigure({
  habit,
  selectedRate,
  showRateOptions,
  onRateSelect,
  onToggleRateOptions,
  onBack,
  onGoalSet
}) {
  const rateLabels = ['Low', 'Default', 'High'];

  return (
    <div className="step-content">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        leftIcon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        }
        className="config-back-btn"
      >
        Back
      </Button>

      {/* Habit Header */}
      <div className="config-header">
        <div className="config-header-icon">
          <HabitIcon habitId={habit.id} size={32} />
        </div>
        <div className="config-header-info">
          <h2 className="config-header-name">{habit.name}</h2>
          <span className="config-header-rate">
            ${selectedRate < 0.01 ? selectedRate.toFixed(4) : selectedRate.toFixed(2)}/{habit.unit}
          </span>
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <p className="config-description">{habit.description}</p>
      )}

      {/* Rate Customization - Collapsed by default */}
      <div className="config-rate-section">
        <button
          className={`rate-toggle ${showRateOptions ? 'expanded' : ''}`}
          onClick={onToggleRateOptions}
        >
          <span className="rate-toggle-label">
            {selectedRate === habit.defaultRate ? 'Using default rate' : 'Using custom rate'}
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
                {habit.rateOptions.map((rate, index) => (
                  <button
                    key={rate}
                    className={`rate-option-btn ${selectedRate === rate ? 'active' : ''}`}
                    onClick={() => onRateSelect(rate)}
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

      {/* Goal Setup - Integrated */}
      <div className="config-goal-section">
        <GoalSetup
          habitLibraryData={habit}
          selectedRate={selectedRate}
          onGoalSet={onGoalSet}
        />
      </div>
    </div>
  );
}
