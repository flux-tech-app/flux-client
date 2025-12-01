import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, PREDEFINED_HABITS, SCHEDULE_PRESETS, generateTicker } from '../../utils/HABIT_CATEGORIES';
import './AddHabitFlow.css';

/**
 * Multi-step Add Habit Flow
 * Step 1: Select Category
 * Step 2: Select Habit (from predefined list)
 * Step 3: Customize (rate, schedule)
 * Step 4: Confirmation
 */
export default function AddHabitFlow({ onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [customization, setCustomization] = useState({
    rate: null,
    schedule: SCHEDULE_PRESETS.daily,
    customDays: [0, 1, 2, 3, 4, 5, 6]
  });

  // Animation variants for step transitions
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

  const [direction, setDirection] = useState(1);

  const goToStep = (newStep) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    goToStep(2);
  };

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    setCustomization(prev => ({
      ...prev,
      rate: habit.defaultRate
    }));
    goToStep(3);
  };

  const handleRateSelect = (rate) => {
    setCustomization(prev => ({ ...prev, rate }));
  };

  const handleScheduleSelect = (scheduleKey) => {
    const preset = SCHEDULE_PRESETS[scheduleKey];
    setCustomization(prev => ({ 
      ...prev, 
      schedule: preset,
      customDays: preset.days 
    }));
  };

  const handleDayToggle = (day) => {
    setCustomization(prev => {
      const newDays = prev.customDays.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...prev.customDays, day].sort((a, b) => a - b);
      return {
        ...prev,
        schedule: { ...SCHEDULE_PRESETS.custom, days: newDays },
        customDays: newDays
      };
    });
  };

  const handleConfirm = () => {
    const category = CATEGORIES[selectedCategory];
    const habit = {
      ticker: selectedHabit.ticker,
      name: selectedHabit.name,
      category: selectedCategory,
      categoryName: category.name,
      rateType: selectedHabit.rateType,
      rate: customization.rate,
      unit: selectedHabit.unit,
      schedule: {
        type: customization.schedule.type,
        days: customization.customDays
      },
      icon: selectedHabit.icon,
      predefinedId: selectedHabit.id
    };
    
    onComplete?.(habit);
  };

  const handleBack = () => {
    if (step > 1) {
      goToStep(step - 1);
    } else {
      onClose?.();
    }
  };

  // Calculate projected earnings
  const getProjectedEarnings = () => {
    if (!selectedHabit || !customization.rate) return { weekly: 0, monthly: 0 };
    
    const daysPerWeek = customization.customDays.length;
    const weekly = customization.rate * daysPerWeek;
    const monthly = weekly * 4.33; // Average weeks per month
    
    return { weekly, monthly };
  };

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

      {/* Step content with animations */}
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
              <StepCategory onSelect={handleCategorySelect} />
            </motion.div>
          )}

          {step === 2 && (
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
              <StepHabit 
                category={selectedCategory}
                onSelect={handleHabitSelect}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {step === 3 && (
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
              <StepCustomize
                habit={selectedHabit}
                category={selectedCategory}
                customization={customization}
                onRateSelect={handleRateSelect}
                onScheduleSelect={handleScheduleSelect}
                onDayToggle={handleDayToggle}
                onBack={handleBack}
                onConfirm={handleConfirm}
                projectedEarnings={getProjectedEarnings()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Step 1: Category Selection
function StepCategory({ onSelect }) {
  const categories = Object.values(CATEGORIES);

  return (
    <div className="step-category">
      <h2 className="step-title">What do you want to work on?</h2>
      <p className="step-subtitle">Choose a category for your new habit</p>
      
      <div className="category-grid">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            className="category-card"
            onClick={() => onSelect(category.id)}
            whileTap={{ scale: 0.97 }}
            style={{ '--category-color': category.color }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <span className="category-desc">{category.description}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Habit Selection
function StepHabit({ category, onSelect, onBack }) {
  const categoryData = CATEGORIES[category];
  const habits = PREDEFINED_HABITS[category] || [];

  return (
    <div className="step-habit">
      <button className="back-link" onClick={onBack}>
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back
      </button>

      <h2 className="step-title">
        <span className="category-badge" style={{ background: categoryData.color }}>
          {categoryData.icon} {categoryData.name}
        </span>
      </h2>
      <p className="step-subtitle">Select a habit to track</p>
      
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
                ${habit.defaultRate.toFixed(2)}
                {habit.rateType === 'per_unit' ? `/${habit.unit}` : '/day'}
              </span>
              <svg className="chevron" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Custom habit option - future enhancement */}
      <button className="custom-habit-link" disabled>
        + Create Custom Habit (Coming Soon)
      </button>
    </div>
  );
}

// Step 3: Customization
function StepCustomize({ 
  habit, 
  category,
  customization, 
  onRateSelect, 
  onScheduleSelect,
  onDayToggle,
  onBack,
  onConfirm,
  projectedEarnings
}) {
  const categoryData = CATEGORIES[category];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isCustomSchedule = customization.schedule.type === 'specific_days';

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

      {/* Rate selection */}
      <div className="customize-section">
        <h3 className="section-label">How much do you want to earn?</h3>
        <div className="rate-options">
          {habit.rateOptions.map((rate, index) => (
            <button
              key={rate}
              className={`rate-option ${customization.rate === rate ? 'selected' : ''}`}
              onClick={() => onRateSelect(rate)}
            >
              <span className="rate-label">
                {index === 0 ? 'Low' : index === 1 ? 'Default' : 'High'}
              </span>
              <span className="rate-value">
                ${rate.toFixed(2)}
                {habit.rateType === 'per_unit' ? `/${habit.unit}` : '/day'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule selection */}
      <div className="customize-section">
        <h3 className="section-label">When do you want to do this?</h3>
        <div className="schedule-options">
          {Object.entries(SCHEDULE_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`schedule-option ${customization.schedule.type === preset.type ? 'selected' : ''}`}
              onClick={() => onScheduleSelect(key)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Day picker for custom schedule */}
        {isCustomSchedule && (
          <div className="day-picker">
            {dayLabels.map((label, index) => (
              <button
                key={index}
                className={`day-button ${customization.customDays.includes(index) ? 'selected' : ''}`}
                onClick={() => onDayToggle(index)}
                title={dayNames[index]}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projected earnings */}
      <div className="earnings-preview">
        <div className="earnings-row">
          <span className="earnings-label">If you succeed every scheduled day:</span>
        </div>
        <div className="earnings-amounts">
          <div className="earnings-amount">
            <span className="amount-value">${projectedEarnings.weekly.toFixed(2)}</span>
            <span className="amount-label">/week</span>
          </div>
          <span className="earnings-separator">·</span>
          <div className="earnings-amount">
            <span className="amount-value">${projectedEarnings.monthly.toFixed(2)}</span>
            <span className="amount-label">/month</span>
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <button 
        className="confirm-button"
        onClick={onConfirm}
        disabled={customization.customDays.length === 0}
        style={{ '--category-color': categoryData.color }}
      >
        Create Habit
      </button>
    </div>
  );
}
