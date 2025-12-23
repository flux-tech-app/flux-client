// src/pages/Portfolio/Portfolio.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useHabits from "@/hooks/useHabits";
import { formatCurrency } from "../../utils/formatters";
import { getNextTransferDate } from "../../utils/calculations";
import { getHabitById } from "../../utils/HABIT_LIBRARY";
import SidebarMenu from "../../components/SidebarMenu/SidebarMenu";
import CalibratingFingerprint from "../../components/CalibratingFingerprint";
import FluxBadge from "../../components/FluxBadge";
import BottomSheet from "../../components/BottomSheet";
import AddHabitFlow from "../../components/AddHabitFlow";
import IndicesTicker from "../../components/IndicesTicker";
import "./Portfolio.css";

// Animated counter hook - counts up from 0 to target value
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
      const current = startValue.current + (targetValue - startValue.current) * easeOut;

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
  const {
    habits = [],
    logs = [],
    transfers = [],
    totals, // optional (recommended you expose this from bootstrap)
    getTransferredBalance,
    getPendingBalance,
    calculateFluxScore,
    addHabit,
    isLoading,
    error,
  } = useHabits();

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleHabitCreated = async (habitData) => {
    if (!addHabit) return;
    if (isAdding) return;

    setIsAdding(true);
    try {
      await addHabit(habitData); // context should post to backend + refresh bootstrap
      setShowAddSheet(false);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to add habit. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  // Prefer server totals if present (best single source of truth)
  const transferredBalance =
    totals?.transferredMicros != null
      ? microsToDollars(totals.transferredMicros)
      : (getTransferredBalance ? getTransferredBalance() : 0);

  const pendingBalance =
    totals?.pendingMicros != null
      ? microsToDollars(totals.pendingMicros)
      : (getPendingBalance ? getPendingBalance() : 0);

  const nextTransfer = getNextTransferDate();

  // Animated portfolio value - counts up from 0 on load
  const animatedBalance = useAnimatedCounter(transferredBalance, 1200);

  const getLogEarnedDollars = (log) => {
    if (!log) return 0;
    // old client shape:
    if (log.totalEarnings != null) return Number(log.totalEarnings || 0);
    // new server shape:
    if (log.earningsMicros != null) return microsToDollars(log.earningsMicros);
    return 0;
  };

  // Calculate total earned for a habit
  const getHabitTotalEarned = (habitId) => {
    if (!logs?.length) return 0;
    const habitLogs = logs.filter((log) => log && log.habitId === habitId);
    return habitLogs.reduce((sum, log) => sum + getLogEarnedDollars(log), 0);
  };

  // Decorate a habit if backend didn’t include UI fields
  const decorateHabit = (habit) => {
    const lib = getHabitById(habit.libraryId);
    return {
      ...habit,
      name: habit.name || lib?.name || habit.libraryId,
      icon: habit.icon || lib?.icon,
      unit: habit.unit || lib?.unit,
      unitPlural: habit.unitPlural || lib?.unitPlural,
      // keep old field 'rate' if you still use it in UI
      rate:
        habit.rate != null
          ? habit.rate
          : habit.rateMicros != null
          ? microsToDollars(habit.rateMicros)
          : lib?.defaultRate || 0,
    };
  };

  // Get holdings data with Flux Scores
  const holdings = useMemo(() => {
    const decorated = (habits || []).map(decorateHabit);

    return decorated
      .map((habit) => {
        const fluxScoreData = calculateFluxScore ? calculateFluxScore(habit.id) : null;
        return {
          ...habit,
          fluxScore: fluxScoreData?.score ?? null,
          fluxScoreStatus: fluxScoreData?.status ?? "building",
          logsNeeded: fluxScoreData?.logsNeeded ?? 0,
          totalLogs: fluxScoreData?.totalLogs ?? 0,
          totalEarned: getHabitTotalEarned(habit.id),
        };
      })
      .sort((a, b) => b.totalEarned - a.totalEarned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, logs, calculateFluxScore]);

  const hasHabits = habits && habits.length > 0;

  return (
    <div className="portfolio-page">
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="portfolio-container">
        <header className="portfolio-header">
          <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="header-actions">
            <button className="icon-button" aria-label="View Indices" onClick={() => navigate("/indices")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v8H3v-8zm4-5h2v13H7V8zm4-5h2v18h-2V3zm4 8h2v10h-2V11zm4-3h2v13h-2V8z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Loading / error gates help a lot during migration */}
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
              <div className="portfolio-value">{formatCurrency(animatedBalance)}</div>

              {hasHabits && pendingBalance > 0 && (
                <div className="pending-transfer">
                  <svg className="pending-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="pending-amount">{formatCurrency(pendingBalance)} pending</span>
                  <span className="pending-separator">•</span>
                  <span className="pending-schedule">transfers {nextTransfer}</span>
                </div>
              )}
            </section>

            {hasHabits ? (
              <div className="holdings-section-flat">
                <div className="section-header-row">
                  <span className="section-title-flat">Holdings</span>
                  <button className="add-habit-btn" onClick={() => setShowAddSheet(true)} disabled={isAdding}>
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
                        {holding.fluxScoreStatus === "building" || holding.fluxScore === null ? (
                          <CalibratingFingerprint logsNeeded={holding.logsNeeded} size="compact" />
                        ) : (
                          <FluxBadge score={holding.fluxScore} size="xs" />
                        )}
                      </div>

                      <div className="holding-info">
                        <div className="holding-name-flat">{holding.name}</div>
                        {holding.fluxScoreStatus === "active" && (
                          <div className="holding-rank-text">
                            {(() => {
                              const rankPercent = Math.floor(Math.random() * 40 + 10);
                              return `Top ${rankPercent}%`;
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="holding-value-section">
                        <div className="holding-value">{formatCurrency(holding.totalEarned)}</div>
                        <div className="holding-label">earned</div>
                      </div>

                      <svg className="holding-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <section className="empty-state-section">
                <div className="empty-icon">
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3>Start Building Your Portfolio</h3>
                <p>Create your first habit to begin tracking your behavioral investments.</p>
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
                      <div className="goal-current">{formatCurrency(transferredBalance)}</div>
                      <div className="goal-remaining">{formatCurrency(Math.max(0, 5000 - transferredBalance))} to go</div>
                    </div>
                  </div>
                  <div className="goal-progress">
                    <div className="goal-progress-bar" style={{ width: `${Math.min(100, (transferredBalance / 5000) * 100)}%` }} />
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <BottomSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} height="tall">
        <AddHabitFlow onComplete={handleHabitCreated} onClose={() => setShowAddSheet(false)} />
      </BottomSheet>
    </div>
  );
}