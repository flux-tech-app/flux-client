// src/components/AddHabitFlow/AddHabitFlow.jsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import useHabits from "@/hooks/useHabits";
import HabitIcon from "@/utils/HabitIcons";

import GoalSetup from "../GoalSetup/GoalSetup";
import Button from "../Button";

import { microsToDollars, formatRateFromMicros } from "@/utils/micros";
import "./AddHabitFlow.css";

/**
 * STRICT Add Habit Flow (catalog-backed, micros):
 * - Step 1 lists boot.catalog.habits via HabitProvider.catalogHabits
 * - Step 2 configures rateMicros + goal then calls addHabit({ libraryId, rateMicros, goal })
 *
 * IMPORTANT:
 *   AddHabitFlow is the ONLY place that should call addHabit().
 *   The parent should use onComplete just to close UI or refresh.
 */
export default function AddHabitFlow({ onComplete, onClose }) {
  const { catalogHabits, isHabitAdded, addHabit } = useHabits();

  const [step, setStep] = useState(1);
  const [selectedHabit, setSelectedHabit] = useState(null); // CatalogHabit
  const [selectedRateMicros, setSelectedRateMicros] = useState(null); // int micros
  const [showRateOptions, setShowRateOptions] = useState(false);
  const [direction, setDirection] = useState(1);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Only habits not already in portfolio (libraryId = catalogHabit.id)
  const availableHabits = useMemo(() => {
    const list = Array.isArray(catalogHabits) ? catalogHabits : [];
    return list.filter((h) => h?.id && !isHabitAdded(h.id));
  }, [catalogHabits, isHabitAdded]);

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  const formatRate = (habit) => {
    if (!habit) return "";
    // show "$X/unit" or "$X" for BINARY
    return formatRateFromMicros(Number(habit.defaultRateMicros || 0), habit.unit || "");
  };

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);

    // Prefer defaultRateMicros; else first option; else 0
    const opts = Array.isArray(habit?.rateOptionsMicros) ? habit.rateOptionsMicros : [];
    const defaultMicros =
      habit?.defaultRateMicros != null
        ? Number(habit.defaultRateMicros)
        : opts.length
        ? Number(opts[0])
        : 0;

    setSelectedRateMicros(Number.isFinite(defaultMicros) ? Math.trunc(defaultMicros) : 0);
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
      return;
    }
    onClose?.();
  };

  const handleGoalSet = async (goal) => {
    if (!selectedHabit || !goal) return;

    setIsSaving(true);
    setSaveError("");

    try {
      const rateMicros =
        selectedRateMicros != null
          ? Number(selectedRateMicros)
          : Number(selectedHabit.defaultRateMicros || 0);

      // AddHabitFlow owns addHabit() (prevents double-call bugs)
      await addHabit({
        libraryId: selectedHabit.id,
        rateMicros,
        goal, // { amount, period } matches backend GoalIn
      });

      // Parent should NOT treat this as "habitData"
      onComplete?.();
      onClose?.();
    } catch (e) {
      setSaveError(e?.message || "Failed to add habit");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-flow">
      <div className="flow-dots">
        <div className={`flow-dot ${step >= 1 ? "active" : ""}`} />
        <div className={`flow-dot ${step >= 2 ? "active" : ""}`} />
      </div>

      {!!saveError && (
        <div className="flow-error" role="alert">
          {saveError}
        </div>
      )}

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
              <StepSelectHabit
                habits={availableHabits}
                onSelect={handleHabitSelect}
                formatRate={formatRate}
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
              transition={{ type: "tween", duration: 0.25 }}
              className="flow-step"
            >
              <StepConfigure
                habit={selectedHabit}
                selectedRateMicros={selectedRateMicros}
                showRateOptions={showRateOptions}
                onRateSelectMicros={setSelectedRateMicros}
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
 * Step 1: Select Habit from Catalog
 */
function StepSelectHabit({ habits, onSelect, formatRate }) {
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
      </div>
    </div>
  );
}

/**
 * Step 2: Configure Rate + Goal (Catalog-backed)
 */
function StepConfigure({
  habit,
  selectedRateMicros,
  showRateOptions,
  onRateSelectMicros,
  onToggleRateOptions,
  onBack,
  onGoalSet,
  isSaving,
}) {
  const rateOptionsMicros = Array.isArray(habit?.rateOptionsMicros) ? habit.rateOptionsMicros : [];
  const unit = habit?.unit || "";

  const defaultRateMicros =
    habit?.defaultRateMicros != null
      ? Number(habit.defaultRateMicros)
      : rateOptionsMicros[0] ?? 0;

  const rateMicros =
    selectedRateMicros != null ? Number(selectedRateMicros) : Number(defaultRateMicros || 0);

  // Only convert for display
  const rateDollars = microsToDollars(rateMicros);
  const rateText = rateDollars < 0.01 ? rateDollars.toFixed(4) : rateDollars.toFixed(2);

  return (
    <div className="step-content">
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
        rightIcon={null}
        className="config-back-btn"
        disabled={isSaving}
      >
        Back
      </Button>

      <div className="config-header">
        <div className="config-header-icon">
          <HabitIcon habitId={habit.id} size={32} />
        </div>
        <div className="config-header-info">
          <h2 className="config-header-name">{habit.name}</h2>
          <span className="config-header-rate">
            ${rateText}
            {unit ? `/${unit}` : ""}
          </span>
        </div>
      </div>

      {habit.description && <p className="config-description">{habit.description}</p>}

      {rateOptionsMicros.length > 0 && (
        <div className="config-rate-section">
          <button
            className={`rate-toggle ${showRateOptions ? "expanded" : ""}`}
            onClick={onToggleRateOptions}
            type="button"
            disabled={isSaving}
          >
            <span className="rate-toggle-label">
              {rateMicros === Math.trunc(defaultRateMicros)
                ? "Using default rate"
                : "Using custom rate"}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="rate-toggle-icon"
            >
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
                  {rateOptionsMicros.map((m, index) => {
                    const micros = Math.trunc(Number(m || 0));
                    const dollars = microsToDollars(micros);
                    const txt = dollars < 0.01 ? dollars.toFixed(4) : dollars.toFixed(2);

                    return (
                      <button
                        key={`${habit.id}:${micros}:${index}`}
                        className={`rate-option-btn ${rateMicros === micros ? "active" : ""}`}
                        onClick={() => onRateSelectMicros(micros)}
                        type="button"
                        disabled={isSaving}
                      >
                        <span className="rate-option-label">Rate</span>
                        <span className="rate-option-value">${txt}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="config-goal-section">
        {/* GoalSetup expects micros; it will format only for display */}
        <GoalSetup
          habitLibraryData={habit}
          selectedRateMicros={rateMicros}
          onGoalSet={onGoalSet}
          initialGoal={undefined}
        />
        {isSaving && <div className="flow-saving">Saving…</div>}
      </div>
    </div>
  );
}