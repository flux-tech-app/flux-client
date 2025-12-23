// src/components/AddHabitFlow/AddHabitFlow.jsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import useHabits from "@/hooks/useHabits";
import { HABIT_LIBRARY, formatRate } from "@/utils/HABIT_LIBRARY";
import HabitIcon from "@/utils/HabitIcons";

import GoalSetup from "../GoalSetup/GoalSetup";
import Button from "../Button";
import "./AddHabitFlow.css";

/**
 * Add Habit Flow - Modernized 2-Step Design
 *
 * Step 1: Select from library (excluding already-added habits)
 * Step 2: Configure rate + goal (combined) -> calls backend via addHabit()
 */
export default function AddHabitFlow({ onComplete, onClose }) {
  const { isHabitAdded, addHabit } = useHabits();

  const [step, setStep] = useState(1);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [showRateOptions, setShowRateOptions] = useState(false);
  const [direction, setDirection] = useState(1);

  // UX state for mutation
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Filter out already-added habits (backend is truth; this uses boot-derived habits)
  const availableHabits = useMemo(() => {
    return HABIT_LIBRARY.filter((h) => !isHabitAdded(h.id));
  }, [isHabitAdded]);

  // Animation variants
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);

    // Prefer defaultRate; fall back to first rateOption; else 0
    const defaultRate =
      typeof habit?.defaultRate === "number"
        ? habit.defaultRate
        : Array.isArray(habit?.rateOptions) && habit.rateOptions.length
          ? habit.rateOptions[0]
          : 0;

    setSelectedRate(defaultRate);
    setShowRateOptions(false);
    setSaveError("");
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    setSaveError("");
    if (step === 2) {
      setDirection(-1);
      setStep(1);
    } else {
      onClose?.();
    }
  };

  /**
   * This is the key “new flow” part:
   * We call addHabit() from context, which hits the backend (canonical),
   * then we close/notify.
   */
  const handleGoalSet = async (goal) => {
    if (!selectedHabit || !goal) return;

    setIsSaving(true);
    setSaveError("");

    try {
      // addHabit() should POST /api/habits and update bootstrap in provider
      const nextBoot = await addHabit({
        libraryId: selectedHabit.id,
        rate: selectedRate,
        goal,
      });

      // optional UI callback for parent components
      onComplete?.(nextBoot);

      // close modal/sheet
      onClose?.();
    } catch (e) {
      const msg = e?.message || "Failed to add habit";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-flow">
      {/* Progress indicator - 2 dots */}
      <div className="flow-dots">
        <div className={`flow-dot ${step >= 1 ? "active" : ""}`} />
        <div className={`flow-dot ${step >= 2 ? "active" : ""}`} />
      </div>

      {/* Error banner (only if save failed) */}
      {!!saveError && (
        <div className="flow-error" role="alert">
          {saveError}
        </div>
      )}

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
              transition={{ type: "tween", duration: 0.25 }}
              className="flow-step"
            >
              <StepSelectHabit habits={availableHabits} onSelect={handleHabitSelect} />
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
              transition={{ type: "tween", duration: 0.25 }}
              className="flow-step"
            >
              <StepConfigure
                habit={selectedHabit}
                selectedRate={selectedRate}
                showRateOptions={showRateOptions}
                onRateSelect={setSelectedRate}
                onToggleRateOptions={() => setShowRateOptions((v) => !v)}
                onBack={handleBack}
                onGoalSet={handleGoalSet}
                isSaving={isSaving}
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
  if (!habits || habits.length === 0) {
    return (
      <div className="step-content">
        <h2 className="step-title">All Habits Added!</h2>
        <p className="step-subtitle">You've added all available habits to your portfolio.</p>
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
            type="button"
          >
            <div className="habit-select-icon">
              <HabitIcon habitId={habit.id} size={24} />
            </div>

            <span className="habit-select-name">{habit.name}</span>

            <div className="habit-select-right">
              <span className="habit-select-rate">{formatRate(habit)}</span>
              <svg
                className="habit-select-chevron"
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </motion.button>
        ))}

        {/* Request Habit (static, UI only) */}
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
  onGoalSet,
  isSaving,
}) {
  const rateLabels = ["Low", "Default", "High"];

  // Defensive: ensure we have rateOptions
  const rateOptions = Array.isArray(habit?.rateOptions) ? habit.rateOptions : [];
  const unit = habit?.unit || "";
  const defaultRate = typeof habit?.defaultRate === "number" ? habit.defaultRate : rateOptions[0];

  return (
    <div className="step-content">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        leftIcon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        }
        // If your Button typing still requires rightIcon, keep this.
        rightIcon={null}
        className="config-back-btn"
        disabled={isSaving}
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
            ${selectedRate < 0.01 ? Number(selectedRate).toFixed(4) : Number(selectedRate).toFixed(2)}
            {unit ? `/${unit}` : ""}
          </span>
        </div>
      </div>

      {/* Description */}
      {habit.description && <p className="config-description">{habit.description}</p>}

      {/* Rate Customization */}
      {rateOptions.length > 0 && (
        <div className="config-rate-section">
          <button
            className={`rate-toggle ${showRateOptions ? "expanded" : ""}`}
            onClick={onToggleRateOptions}
            type="button"
            disabled={isSaving}
          >
            <span className="rate-toggle-label">
              {selectedRate === defaultRate ? "Using default rate" : "Using custom rate"}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="rate-toggle-icon">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L8 8.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <AnimatePresence>
            {showRateOptions && (
              <motion.div
                className="rate-options-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rate-options-grid">
                  {rateOptions.map((rate, index) => (
                    <button
                      key={rate}
                      className={`rate-option-btn ${selectedRate === rate ? "active" : ""}`}
                      onClick={() => onRateSelect(rate)}
                      type="button"
                      disabled={isSaving}
                    >
                      <span className="rate-option-label">{rateLabels[index] || "Rate"}</span>
                      <span className="rate-option-value">
                        ${rate < 0.01 ? Number(rate).toFixed(4) : Number(rate).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Goal Setup */}
      <div className="config-goal-section">
        <GoalSetup habitLibraryData={habit} selectedRate={selectedRate} onGoalSet={onGoalSet} />
        {isSaving && <div className="flow-saving">Saving…</div>}
      </div>
    </div>
  );
}