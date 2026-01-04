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
 *
 * IMPORTANT:
 * - catalog habits are identified by catalogId UUID (catalog.habits[i].id)
 * - NO legacy "libraryId" anywhere
 */
export default function Onboarding({ onComplete }) {
  const { addHabits, catalog } = useHabits();

  const [currentStep, setCurrentStep] = useState(0);

  // Selected catalog habit IDs (UUIDs)
  const [selectedHabits, setSelectedHabits] = useState([]); // string[]

  // Store rateMicros (int) keyed by catalogId
  const [habitRates, setHabitRates] = useState({}); // { [catalogId]: number }

  // Store goal keyed by catalogId
  const [habitGoals, setHabitGoals] = useState({}); // { [catalogId]: { amount, period } }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;

  const catalogHabits = catalog?.habits ?? [];
  const catalogById = useMemo(() => {
    const m = new Map();
    for (const h of catalogHabits) {
      if (h?.id) m.set(String(h.id), h);
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
  const handleHabitToggle = (catalogId) => {
    if (isSubmitting) return;

    const id = String(catalogId ?? "");
    if (!id) return;

    setSelectedHabits((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  // Step 4: Set rates (MICROS)
  const handleRateChange = (catalogId, rateMicros) => {
    if (isSubmitting) return;

    const id = String(catalogId ?? "");
    const n = Number(rateMicros);

    setHabitRates((prev) => ({ ...prev, [id]: n }));
  };

  // Step 4: Set goals
  const handleGoalChange = (catalogId, goal) => {
    if (isSubmitting) return;

    const id = String(catalogId ?? "");
    setHabitGoals((prev) => ({ ...prev, [id]: goal }));
  };

  // Final step: Create habits and complete onboarding
  const handleComplete = async () => {
    if (isSubmitting) return;

    // Validate selected ids exist in server catalog
    for (const catalogId of selectedHabits) {
      if (!catalogById.get(String(catalogId))) {
        alert(
          `Unknown catalog habit "${catalogId}" (not found in server catalog). Please refresh and try again.`
        );
        return;
      }
    }

    // Enforce goals + rates exist (strict, no fallbacks)
    for (const catalogId of selectedHabits) {
      const rateMicros = habitRates[catalogId];
      if (!Number.isFinite(rateMicros) || Number(rateMicros) <= 0) {
        alert("Please set a valid rate for each selected habit before continuing.");
        return;
      }

      const g = habitGoals[catalogId];
      const amt = Number(g?.amount);
      const period = String(g?.period ?? "").trim();

      if (!Number.isFinite(amt) || amt <= 0 || !period) {
        alert("Please set a valid goal for each selected habit before continuing.");
        return;
      }
    }

    // Build STRICT payload for backend
    const habitConfigs = selectedHabits.map((catalogId) => {
      const rateMicros = Number(habitRates[catalogId]);
      const g = habitGoals[catalogId];

      return {
        catalogId, // ✅ UUID
        rateMicros, // ✅ int micros
        goal: {
          amount: Number(g.amount), // ✅ numeric
          period: String(g.period), // ✅ string
        },
      };
    });

    setIsSubmitting(true);
    try {
      await addHabits(habitConfigs);
      onComplete?.();
    } catch (err) {
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
          <div
            key={index}
            className={`progress-dot ${index <= currentStep ? "active" : ""}`}
          />
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 0 && <Welcome onContinue={handleNext} onSkip={handleSkip} />}

      {currentStep === 1 && <HowItWorks onContinue={handleNext} onBack={handleBack} />}

      {currentStep === 2 && (
        <SelectHabits
          catalog={catalog}
          selectedHabits={selectedHabits} // catalogIds
          onToggle={handleHabitToggle} // expects catalogId
          onContinue={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <SetRates
          catalog={catalog}
          selectedHabits={selectedHabits} // catalogIds
          habitRates={habitRates} // keyed by catalogId
          habitGoals={habitGoals} // keyed by catalogId
          onRateChange={handleRateChange} // (catalogId, rateMicros)
          onGoalChange={handleGoalChange} // (catalogId, goal)
          onContinue={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 4 && (
        <Ready
          catalog={catalog}
          selectedHabits={selectedHabits} // catalogIds
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
