// src/pages/Portfolio/Portfolio.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import useHabits from "@/hooks/useHabits";
import { formatCurrency } from "../../utils/formatters";

import SidebarMenu from "../../components/SidebarMenu/SidebarMenu";
import CalibratingFingerprint from "../../components/CalibratingFingerprint";
import FluxBadge from "../../components/FluxBadge";
import BottomSheet from "../../components/BottomSheet";
import AddHabitFlow from "../../components/AddHabitFlow";
import IndicesTicker from "../../components/IndicesTicker";

import "./Portfolio.css";

// UI-only animation (not business logic)
const useAnimatedCounter = (targetValue, duration = 1500) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef(null);
  const startValue = useRef(0);

  useEffect(() => {
    startValue.current = displayValue;
    startTime.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current =
        startValue.current + (targetValue - startValue.current) * easeOut;

      setDisplayValue(current);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, duration]);

  return displayValue;
};

const microsToDollars = (micros) => Number(micros || 0) / 1_000_000;

export default function Portfolio() {
  const navigate = useNavigate();

  // Portfolio page should ONLY render server-derived state.
  //
  // Required from backend bootstrap:
  // - habits[] must already include display fields (name/icon/etc) OR provider enriches from boot.catalog
  // - totals must be in micros (pendingMicros + transferredMicros/ completedMicros)
  // - flux.byHabit must be present for score/status/logsNeeded
  // - each habit should include earnedMicros (lifetime earned for that habit) computed on backend
  const {
    habits,
    totalsMicros,
    flux,
    addHabit,
    isLoading,
    error,
  } = useHabits();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleHabitCreated = async (habitData) => {
    if (!addHabit || isAdding) return;
    setIsAdding(true);
    try {
      await addHabit(habitData); // should update bootstrap in provider
      setShowAddSheet(false);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to add habit. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const transferredBalance = microsToDollars(totalsMicros?.transferredMicros);
  const pendingBalance = microsToDollars(totalsMicros?.pendingMicros);

  const animatedBalance = useAnimatedCounter(transferredBalance, 1200);

  const fluxByHabitId = useMemo(() => {
    const m = new Map();
    const list = flux?.byHabit || [];
    for (const f of list) {
      const id = f?.habitId ?? f?.HabitID;
      if (id) m.set(id, f);
    }
    return m;
  }, [flux?.byHabit]);

  // Holdings = server values only:
  // - earnedMicros MUST be computed server-side and included on each habit (or you’ll still be forced to sum logs here).
  const holdings = useMemo(() => {
    const list = habits || [];
    return list
      .map((h) => {
        const fx = fluxByHabitId.get(h.id) || null;

        const status = fx?.status ?? fx?.Status ?? "building";
        const score = fx?.score ?? fx?.Score ?? null;

        // backend should populate earnedMicros per habit
        const earnedMicros = h.earnedMicros ?? 0;

        // backend flux meta should carry these (already computed server-side)
        const logsNeeded = fx?.logsNeeded ?? fx?.LogsNeeded ?? 0;
        const totalLogs = fx?.meta?.totalLogs ?? fx?.Meta?.TotalLogs ?? 0;

        return {
          ...h,
          totalEarned: microsToDollars(earnedMicros),
          fluxScoreStatus: status,
          fluxScore: typeof score === "number" ? score : null,
          logsNeeded,
          totalLogs,
        };
      })
      .sort((a, b) => (b.earnedMicros ?? 0) - (a.earnedMicros ?? 0));
  }, [habits, fluxByHabitId]);

  const hasHabits = (habits || []).length > 0;

  return (
    <div className="portfolio-page">
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="portfolio-container">
        <header className="portfolio-header">
          <button
            className="menu-button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="View Indices"
              onClick={() => navigate("/indices")}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 13h2v8H3v-8zm4-5h2v13H7V8zm4-5h2v18h-2V3zm4 8h2v10h-2V11zm4-3h2v13h-2V8z" />
              </svg>
            </button>
          </div>
        </header>

        {isLoading && (
          <section className="empty-state-section">
            <h3>Loading your portfolio…</h3>
          </section>
        )}

        {!isLoading && error && (
          <section className="empty-state-section">
            <h3>Couldn’t load your portfolio</h3>
            <p>{error?.message || "Unknown error"}</p>
          </section>
        )}

        {!isLoading && !error && (
          <>
            {hasHabits && <IndicesTicker />}

            <section className="portfolio-value-section">
              <div className="value-label">Total Portfolio Value</div>
              <div className="portfolio-value">
                {formatCurrency(animatedBalance)}
              </div>

              {hasHabits && pendingBalance > 0 && (
                <div className="pending-transfer">
                  <svg
                    className="pending-icon"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="pending-amount">
                    {formatCurrency(pendingBalance)} pending
                  </span>
                  {/* Schedule string should come from backend when you add it (e.g. boot.transferSchedule.nextLabel) */}
                </div>
              )}
            </section>

            {hasHabits ? (
              <div className="holdings-section-flat">
                <div className="section-header-row">
                  <span className="section-title-flat">Holdings</span>
                  <button
                    className="add-habit-btn"
                    onClick={() => setShowAddSheet(true)}
                    disabled={isAdding}
                  >
                    {isAdding ? "Adding..." : "+ Add"}
                  </button>
                </div>

                <div className="holdings-list-flat">
                  {holdings.map((holding, index) => (
                    <motion.div
                      key={holding.id}
                      className="holding-row"
                      onClick={() => navigate(`/habit/${holding.id}`)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="holding-badge">
                        {holding.fluxScoreStatus === "building" ||
                        holding.fluxScore === null ? (
                          <CalibratingFingerprint
                            logsNeeded={holding.logsNeeded}
                            daysRemaining={holding.daysRemaining}
                            size="compact"
                          />
                        ) : (
                          <FluxBadge score={holding.fluxScore} size="xs" />
                        )}
                      </div>

                      <div className="holding-info">
                        <div className="holding-name-flat">{holding.name}</div>

                        {holding.fluxScoreStatus === "active" && (
                          <div className="holding-rank-text">
                            {(() => {
                              const rankPercent = Math.floor(
                                Math.random() * 40 + 10
                              );
                              return `Top ${rankPercent}%`;
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="holding-value-section">
                        <div className="holding-value">
                          {formatCurrency(holding.totalEarned)}
                        </div>
                        <div className="holding-label">earned</div>
                      </div>

                      <svg
                        className="holding-chevron"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <section className="empty-state-section">
                <div className="empty-icon">
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <h3>Start Building Your Portfolio</h3>
                <p>
                  Create your first habit to begin tracking your behavioral
                  investments.
                </p>
              </section>
            )}

            {hasHabits && (
              <section className="savings-goals-section">
                <div className="section-header">
                  <div className="section-title">Savings Goals</div>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>

                <div className="goal-card">
                  <div className="goal-header">
                    <div>
                      <div className="goal-title">Emergency Fund</div>
                      <div className="goal-target">Target: $5,000</div>
                    </div>

                    <div className="goal-amount">
                      <div className="goal-current">
                        {formatCurrency(transferredBalance)}
                      </div>
                      <div className="goal-remaining">
                        {formatCurrency(Math.max(0, 5000 - transferredBalance))}{" "}
                        to go
                      </div>
                    </div>
                  </div>

                  <div className="goal-progress">
                    <div
                      className="goal-progress-bar"
                      style={{
                        width: `${Math.min(
                          100,
                          (transferredBalance / 5000) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* BottomSheet typing requires title + headerRight */}
      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        height="tall"
        title="Add Habit"
        headerRight={null}
      >
        <AddHabitFlow
          onComplete={handleHabitCreated}
          onClose={() => setShowAddSheet(false)}
        />
      </BottomSheet>
    </div>
  );
}
