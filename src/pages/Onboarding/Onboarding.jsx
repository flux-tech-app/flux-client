// src/pages/Onboarding/Onboarding.jsx
import { useMemo, useState, useEffect } from "react";
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

  const normalizeId = (v) => {
    const id = String(v ?? "").trim();
    return id ? id : "";
  };

  // --- helpers that tolerate both camelCase + snake_case ---
  const getDefaultRateMicros = (habit) => {
    const raw =
      habit?.defaultRateMicros ??
      habit?.default_rate_micros ??
      habit?.default_rateMicros; // (just in case)

    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;

    // fallback: first option
    const opts = getRateOptionsMicros(habit);
    const first = Number(opts?.[0]);
    return Number.isFinite(first) && first > 0 ? first : 0;
  };

  const getRateOptionsMicros = (habit) => {
    const v =
      habit?.rateOptionsMicros ??
      habit?.rate_options_micros ??
      habit?.rate_optionsMicros;

    // API might return array already; or CSV-ish might be a JSON string
    if (Array.isArray(v)) return v;
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const getSuggestedGoals = (habit) => {
    const v =
      habit?.suggestedGoals ??
      habit?.suggested_goals ??
      habit?.suggestedGoalsJson;

    if (Array.isArray(v)) return v;
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const getDefaultGoalPeriod = (habit) => {
    const p =
      habit?.defaultGoalPeriod ??
      habit?.default_goal_period ??
      habit?.default_goalPeriod;

    const s = String(p ?? "").trim();
    return s || "day";
  };

  const getDefaultGoal = (habit) => {
    // Prefer first suggested goal if present
    const suggested = getSuggestedGoals(habit);
    const first = suggested?.[0];

    const amt = Number(first?.amount);
    const per = String(first?.period ?? "").trim();

    if (Number.isFinite(amt) && amt > 0 && per) {
      return { amount: amt, period: per };
    }

    // fallback: 1 per default period
    return { amount: 1, period: getDefaultGoalPeriod(habit) };
  };

  // --- navigation ---
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

    const id = normalizeId(catalogId);
    if (!id) return;

    setSelectedHabits((prev) => {
      const isSelected = prev.includes(id);

      // If deselecting, also clean up related state to avoid stale keys
      if (isSelected) {
        setHabitRates((rPrev) => {
          if (!(id in (rPrev ?? {}))) return rPrev;
          const next = { ...(rPrev ?? {}) };
          delete next[id];
          return next;
        });

        setHabitGoals((gPrev) => {
          if (!(id in (gPrev ?? {}))) return gPrev;
          const next = { ...(gPrev ?? {}) };
          delete next[id];
          return next;
        });

        return prev.filter((x) => x !== id);
      }

      return [...prev, id];
    });
  };

  // Step 4: Set rates (MICROS)
  const handleRateChange = (catalogId, rateMicros) => {
    if (isSubmitting) return;

    const id = normalizeId(catalogId);
    if (!id) return;

    const n = Number(rateMicros);
    setHabitRates((prev) => ({ ...(prev ?? {}), [id]: n }));
  };

  // Step 4: Set goals
  const handleGoalChange = (catalogId, goal) => {
    if (isSubmitting) return;

    const id = normalizeId(catalogId);
    if (!id) return;

    setHabitGoals((prev) => ({ ...(prev ?? {}), [id]: goal }));
  };

  /**
   * ✅ Key fix:
   * If catalog provides defaults, commit them into state for selected habits.
   * This prevents UI “looks set” vs submit “missing value” divergence.
   */
  useEffect(() => {
    if (!selectedHabits?.length) return;
    if (!catalogById?.size) return;

    // Seed missing rates
    setHabitRates((prev) => {
      const next = { ...(prev ?? {}) };
      let changed = false;

      for (const rawId of selectedHabits) {
        const id = normalizeId(rawId);
        if (!id) continue;

        const cur = Number(next[id]);
        if (Number.isFinite(cur) && cur > 0) continue;

        const habit = catalogById.get(id);
        if (!habit) continue;

        const def = getDefaultRateMicros(habit);
        if (Number.isFinite(def) && def > 0) {
          next[id] = def;
          changed = true;
        }
      }

      return changed ? next : prev;
    });

    // Seed missing goals
    setHabitGoals((prev) => {
      const next = { ...(prev ?? {}) };
      let changed = false;

      for (const rawId of selectedHabits) {
        const id = normalizeId(rawId);
        if (!id) continue;

        const g = next[id];
        const amt = Number(g?.amount);
        const per = String(g?.period ?? "").trim();
        if (Number.isFinite(amt) && amt > 0 && per) continue;

        const habit = catalogById.get(id);
        if (!habit) continue;

        next[id] = getDefaultGoal(habit);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [selectedHabits, catalogById]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Resolve + validate rates/goals using SAME logic as defaults seeding
    const resolvedConfigs = [];
    for (const catalogId of selectedHabits) {
      const id = String(catalogId);
      const habit = catalogById.get(id);

      const rateFromState = Number(habitRates?.[id]);
      const rateMicros =
        Number.isFinite(rateFromState) && rateFromState > 0
          ? rateFromState
          : getDefaultRateMicros(habit);

      if (!Number.isFinite(rateMicros) || rateMicros <= 0) {
        alert("Please set a valid rate for each selected habit before continuing.");
        return;
      }

      const gFromState = habitGoals?.[id];
      const amtFromState = Number(gFromState?.amount);
      const perFromState = String(gFromState?.period ?? "").trim();

      const goal =
        Number.isFinite(amtFromState) && amtFromState > 0 && perFromState
          ? { amount: amtFromState, period: perFromState }
          : getDefaultGoal(habit);

      const amt = Number(goal?.amount);
      const period = String(goal?.period ?? "").trim();

      if (!Number.isFinite(amt) || amt <= 0 || !period) {
        alert("Please set a valid goal for each selected habit before continuing.");
        return;
      }

      resolvedConfigs.push({
        catalogId: id, // ✅ UUID
        rateMicros: Number(rateMicros), // ✅ int micros
        goal: { amount: amt, period },
      });
    }

    setIsSubmitting(true);
    try {
      await addHabits(resolvedConfigs);
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
