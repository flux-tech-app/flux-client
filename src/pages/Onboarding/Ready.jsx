// src/pages/Onboarding/Ready.jsx
import HabitIcon from "@/utils/HabitIcons";
import Button from "@/components/Button";
import { formatRateFromMicros, toIntMicros } from "@/utils/micros";
import "./Onboarding.css";
import { useMemo } from "react";

/**
 * Ready Screen - Step 5
 * Summary of selections and launch
 *
 * - selectedHabits: catalogId UUID strings
 * - habitRates/habitGoals keyed by catalogId
 */
export default function Ready({
  selectedHabits,
  habitRates, // { [catalogId]: rateMicros }
  habitGoals, // { [catalogId]: { amount, period } }
  catalog, // { habits: [...] }
  onComplete,
  onBack,
  isSubmitting = false,
}) {
  const ids = selectedHabits ?? [];
  const catalogHabits = catalog?.habits ?? [];

  const catalogById = useMemo(() => {
    const m = new Map();
    for (const h of catalogHabits) {
      const id = h?.id != null ? String(h.id) : "";
      if (id) m.set(id, h);
    }
    return m;
  }, [catalogHabits]);

  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <div className="ready-hero">
          <div className="ready-icon-container">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="ready-title">You're All Set</h1>
          <p className="ready-subtitle">
            Your portfolio is ready. Start logging to build your savings.
          </p>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <span className="summary-title">Your Positions</span>
            <span className="summary-count">{ids.length} habits</span>
          </div>

          <div className="summary-list">
            {ids.map((rawId) => {
              const catalogId = String(rawId);
              const habit = catalogById.get(catalogId);

              if (!habit) {
                return (
                  <div key={catalogId} className="summary-item">
                    <div className="summary-item-left">
                      <div className="summary-item-icon">
                        <HabitIcon habitId={catalogId} size={18} />
                      </div>
                      <div className="summary-item-info">
                        <span className="summary-item-name">{catalogId}</span>
                        <span className="summary-item-goal" style={{ opacity: 0.75 }}>
                          Loading habit details…
                        </span>
                      </div>
                    </div>
                    <span className="summary-item-rate">—</span>
                  </div>
                );
              }

              const goal = habitGoals?.[catalogId];
              const rateMicros =
                toIntMicros(habitRates?.[catalogId], null) ??
                toIntMicros(habit.defaultRateMicros, 0);

              const rateDisplay = formatRateFromMicros(rateMicros, habit.unit);

              return (
                <div key={catalogId} className="summary-item">
                  <div className="summary-item-left">
                    <div className="summary-item-icon">
                      <HabitIcon habitId={catalogId} size={18} />
                    </div>
                    <div className="summary-item-info">
                      <span className="summary-item-name">{habit.name}</span>
                      {goal ? (
                        <span className="summary-item-goal">
                          Goal: {Number(goal.amount).toLocaleString()} {habit.goalUnit}/{goal.period}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <span className="summary-item-rate">{rateDisplay}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="tips-card">
          <div className="tip-item">
            <div className="tip-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="tip-text">Tap the + button to log activities</span>
          </div>

          <div className="tip-item">
            <div className="tip-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="tip-text">Check Portfolio to see your progress</span>
          </div>

          <div className="tip-item">
            <div className="tip-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="tip-text">Transfers happen every Friday</span>
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="button-group">
          <Button
            variant="secondary"
            size="lg"
            onClick={onBack}
            className="onboarding-back"
            disabled={isSubmitting}
            leftIcon={null}
            rightIcon={null}
          >
            Back
          </Button>

          <Button
            variant="success"
            size="lg"
            onClick={onComplete}
            className="onboarding-continue"
            disabled={isSubmitting}
            loading={isSubmitting}
            leftIcon={null}
            rightIcon={null}
          >
            {isSubmitting ? "Starting..." : "Start Building"}
          </Button>
        </div>
      </div>
    </div>
  );
}
