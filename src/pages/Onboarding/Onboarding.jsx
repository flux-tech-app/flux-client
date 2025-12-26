// src/pages/Onboarding/Onboarding.jsx
import { useMemo, useState } from "react";
import useHabits from "@/hooks/useHabits";

import Welcome from "./Welcome";
import HowItWorks from "./HowItWorks";
import SelectHabits from "./SelectHabits";
import SetRates from "./SetRates";
import Ready from "./Ready";

import "./Onboarding.css";

/**
 * Onboarding Flow - 5 Steps
 *
 * 1. Welcome
 * 2. How It Works
 * 3. Select Habits (from server catalog)
 * 4. Set Rates + Goals (rateMicros + goal)
 * 5. Ready (summary + submit)
 */
export default function Onboarding({ onComplete }) {
  const { addHabits, catalog } = useHabits();

  const [currentStep, setCurrentStep] = useState(0);

  // catalog habit IDs (libraryId in backend terms)
  const [selectedHabits, setSelectedHabits] = useState([]);

  // IMPORTANT: store rateMicros (int), not dollars
  const [habitRates, setHabitRates] = useState({}); // { [libraryId]: rateMicros }

  // goal is still human units (float) + period (string)
  const [habitGoals, setHabitGoals] = useState({}); // { [libraryId]: { amount, period } }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;

  const catalogHabits = catalog?.habits ?? [];
  const catalogById = useMemo(() => {
    const m = new Map();
    for (const h of catalogHabits) {
      if (h?.id) m.set(h.id, h);
    }
    return m;
  }, [catalogHabits]);

  const handleNext = () => {
    if (isSubmitting) return;
    if (currentStep < totalSteps - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (isSubmitting) return;
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    if (isSubmitting) return;
    onComplete?.();
  };

  // Step 3: Select habits
  const handleHabitToggle = (libraryId) => {
    if (isSubmitting) return;

    setSelectedHabits((prev) => {
      if (prev.includes(libraryId)) return prev.filter((id) => id !== libraryId);
      return [...prev, libraryId];
    });
  };

  // Step 4: Set rates (MICROS)
  // Expect callers to pass a whole integer micros value.
  const handleRateChange = (libraryId, rateMicros) => {
    if (isSubmitting) return;
    setHabitRates((prev) => ({ ...prev, [libraryId]: Number(rateMicros) }));
  };

  // Step 4: Set goals
  const handleGoalChange = (libraryId, goal) => {
    if (isSubmitting) return;
    setHabitGoals((prev) => ({ ...prev, [libraryId]: goal }));
  };

  // Final step: Create habits and complete onboarding
  const handleComplete = async () => {
    if (isSubmitting) return;

    // Validate selection exists in server catalog
    for (const libraryId of selectedHabits) {
      if (!catalogById.get(libraryId)) {
        alert(`Unknown habit "${libraryId}" (not found in server catalog). Please refresh and try again.`);
        return;
      }
    }

    // Enforce required goals
    for (const libraryId of selectedHabits) {
      const g = habitGoals[libraryId];
      if (!g?.amount || !g?.period) {
        alert("Please set a goal for each selected habit before continuing.");
        return;
      }
    }

    // Build payload for backend (rateMicros required)
    const habitConfigs = selectedHabits.map((libraryId) => {
      const c = catalogById.get(libraryId);

      const rateMicros =
        habitRates[libraryId] != null
          ? Number(habitRates[libraryId])
          : Number(c?.defaultRateMicros);

      if (!Number.isFinite(rateMicros) || rateMicros <= 0) {
        throw new Error(`Invalid rateMicros for "${libraryId}".`);
      }

      const g = habitGoals[libraryId];

      return {
        libraryId,
        rateMicros,
        goal: {
          amount: Number(g.amount),
          period: String(g.period),
        },
      };
    });

    setIsSubmitting(true);
    try {
      await addHabits(habitConfigs);
      onComplete?.();
    } catch (err) {
      // keep user on page, allow retry
      console.error(err);
      alert(err?.message || "Failed to create habits. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        {[...Array(totalSteps)].map((_, index) => (
          <div key={index} className={`progress-dot ${index <= currentStep ? "active" : ""}`} />
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 0 && <Welcome onContinue={handleNext} onSkip={handleSkip} />}

      {currentStep === 1 && <HowItWorks onContinue={handleNext} onBack={handleBack} />}

      {currentStep === 2 && (
        <SelectHabits
          catalog={catalog}
          selectedHabits={selectedHabits}
          onToggle={handleHabitToggle}
          onContinue={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <SetRates
          catalog={catalog}
          selectedHabits={selectedHabits}
          habitRates={habitRates}
          habitGoals={habitGoals}
          onRateChange={handleRateChange}
          onGoalChange={handleGoalChange}
          onContinue={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 4 && (
        <Ready
          catalog={catalog}
          selectedHabits={selectedHabits}
          habitRates={habitRates}
          habitGoals={habitGoals}
          onComplete={handleComplete}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}