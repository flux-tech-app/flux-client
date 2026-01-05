// src/pages/Home/Home.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import useHabits from "@/hooks/useHabits";
import { formatCurrency } from "@/utils/formatters";

import BottomSheet from "@/components/BottomSheet";
import LogHabitSheet from "@/components/LogHabitSheet";
import SidebarMenu from "@/components/SidebarMenu/SidebarMenu";
import AddHabitSheet from "@/components/AddHabit/AddHabitSheet";

import EmptyState from "../Portfolio/EmptyState";

import "./Home.css";

// Animated counter hook - counts up from 0 to target value
const useAnimatedCounter = (targetValue, duration = 1200) => {
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

      // Easing function (ease-out cubic)
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

// helper for BottomSheet typing: provide required prop
const noopHeaderRight = () => null;

export default function Home() {
  const navigate = useNavigate();

  const {
    habits,
    logs,
    transfers, // ✅ pull transfers (source of truth for money)
    getWeekEarnings,
    getTodayEarnings,
    isHabitLoggedOnDate,
    calculateFluxScore,
    getCatalogHabit,
    formatUSDFromMicros,
  } = useHabits();

  const [activeSheet, setActiveSheet] = useState(null); // "log" | "pass" | null
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const hasHabits = (habits || []).length > 0;

  // server-derived values (provider just returns boot.stats)
  const weekEarnings = Number(getWeekEarnings());
  const todayEarnings = Number(getTodayEarnings()); // (not used yet, but handy)
  const animatedWeekEarnings = useAnimatedCounter(weekEarnings);

  const normalizeToDate = (ms) => {
    if (ms == null) return null;
    const d = new Date(Number(ms));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setSelectedHabitId(null);
  };

  const handleLogComplete = () => {
    closeSheet();
  };

  /**
   * Decorate habit instances with catalog fields (name, actionType, icon, etc.)
   */
  const habitsUI = useMemo(() => {
    return (habits || []).map((h) => {
      const cat = getCatalogHabit?.(h.catalogId);
      return {
        ...h,
        name: cat?.name ?? "Habit",
        actionType: (cat?.actionType ?? "log").toLowerCase(),
        trackingType: (cat?.trackingType ?? cat?.unitType ?? "").toLowerCase(),
        icon: cat?.icon ?? null,
      };
    });
  }, [habits, getCatalogHabit]);

  const handleHabitTap = (habit) => {
    if (habit.isLogged) return;
    setSelectedHabitId(habit.id);
    setActiveSheet(habit.actionType === "pass" ? "pass" : "log");
  };

  /**
   * Build a lookup: logId -> habitId (string), so we can derive habitId from transfers when transfer.habitId is null.
   */
  const habitIdByLogId = useMemo(() => {
    const m = new Map();
    for (const l of logs || []) {
      if (!l?.id || !l?.habitId) continue;
      m.set(String(l.id), String(l.habitId));
    }
    return m;
  }, [logs]);

  /**
   * Helper: given a transfer, resolve habitId:
   * - prefer transfer.habitId
   * - else fall back via transfer.logId -> logs.habitId
   */
  const resolveHabitIdForTransfer = (t) => {
    const direct = t?.habitId ? String(t.habitId) : null;
    if (direct) return direct;

    const logId = t?.logId ? String(t.logId) : null;
    if (!logId) return null;

    return habitIdByLogId.get(logId) ?? null;
  };

  /**
   * Compute "today earned micros" per habit from transfers (pending OR completed).
   * Local-day boundaries, because the UI is "Today" in local time.
   */
  const todayEarningsMicrosByHabitId = useMemo(() => {
    const map = new Map();

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const startMs = start.getTime();
    const endMs = end.getTime();

    for (const t of transfers || []) {
      const ms = Number(t?.timestampMs);
      if (!Number.isFinite(ms)) continue;
      if (ms < startMs || ms >= endMs) continue;

      const hid = resolveHabitIdForTransfer(t);
      if (!hid) continue;

      const amt = Number(t?.amountMicros ?? 0);
      if (!Number.isFinite(amt) || amt === 0) continue;

      map.set(hid, (map.get(hid) ?? 0) + amt);
    }

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfers, habitIdByLogId]);

  /**
   * Compute "this week earned micros" per habit from transfers (pending OR completed).
   * Using the same local-week logic your UI already uses (Sunday -> Saturday).
   */
  const weekEarningsMicrosByHabitId = useMemo(() => {
    const map = new Map();

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startMs = startOfWeek.getTime();

    for (const t of transfers || []) {
      const ms = Number(t?.timestampMs);
      if (!Number.isFinite(ms)) continue;
      if (ms < startMs) continue;

      const hid = resolveHabitIdForTransfer(t);
      if (!hid) continue;

      const amt = Number(t?.amountMicros ?? 0);
      if (!Number.isFinite(amt) || amt === 0) continue;

      map.set(hid, (map.get(hid) ?? 0) + amt);
    }

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfers, habitIdByLogId]);

  /**
   * DEBUG: show what Home is actually using for the Today earnings.
   * (Only logs in dev builds.)
   */
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const startOfTodayLocal = new Date();
    startOfTodayLocal.setHours(0, 0, 0, 0);

    console.debug("[Home] money debug", {
      startOfTodayLocal: String(startOfTodayLocal),
      transfersCount: (transfers || []).length,
      logsCount: (logs || []).length,
      habitsCount: (habitsUI || []).length,
      todayEarningsMicrosByHabitId: Array.from(todayEarningsMicrosByHabitId.entries()),
      weekEarningsMicrosByHabitId: Array.from(weekEarningsMicrosByHabitId.entries()),
      stats_today_dollars: todayEarnings,
      stats_week_dollars: weekEarnings,
    });
  }, [
    transfers,
    logs,
    habitsUI,
    todayEarningsMicrosByHabitId,
    weekEarningsMicrosByHabitId,
    todayEarnings,
    weekEarnings,
  ]);

  // Calibrating habits (based on server-computed flux)
  const calibratingHabits = useMemo(() => {
    return habitsUI
      .map((habit) => {
        const fluxScore = calculateFluxScore(habit.id);
        return {
          ...habit,
          fluxScore,
          isCalibrating: fluxScore?.status === "building",
          logsNeeded: fluxScore?.logsNeeded ?? 0,
          totalLogs: fluxScore?.meta?.totalLogs ?? 0,
        };
      })
      .filter((h) => h.isCalibrating);
  }, [habitsUI, calculateFluxScore]);

  // Weekly performers (use transfers for earnings; logs for log counts + sparkline bars count)
  const weeklyPerformers = useMemo(() => {
    const hs = habitsUI;
    const ls = logs || [];
    if (hs.length === 0) return [];

    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    return hs
      .map((habit) => {
        const habitLogs = ls.filter((log) => log?.habitId === habit.id);

        const thisWeekLogs = habitLogs.filter((log) => {
          const d = normalizeToDate(log?.timestampMs);
          return d ? d >= startOfThisWeek : false;
        });

        const thisWeekEarningsMicros =
          weekEarningsMicrosByHabitId.get(String(habit.id)) ?? 0;

        // sparkline: last 6 days (based on transfers)
        const sparklineData = [];
        for (let i = 5; i >= 0; i--) {
          const dayStart = new Date(now);
          dayStart.setDate(dayStart.getDate() - i);
          dayStart.setHours(0, 0, 0, 0);

          const nextDay = new Date(dayStart);
          nextDay.setDate(nextDay.getDate() + 1);

          const dayStartMs = dayStart.getTime();
          const nextDayMs = nextDay.getTime();

          let dayMicros = 0;
          for (const t of transfers || []) {
            const ms = Number(t?.timestampMs);
            if (!Number.isFinite(ms)) continue;
            if (ms < dayStartMs || ms >= nextDayMs) continue;

            const hid = resolveHabitIdForTransfer(t);
            if (hid !== String(habit.id)) continue;

            dayMicros += Number(t?.amountMicros ?? 0);
          }

          // convert micros -> dollars for bar heights (still UI-only)
          sparklineData.push(dayMicros / 1_000_000);
        }

        return {
          ...habit,
          thisWeekEarningsMicros,
          thisWeekLogCount: thisWeekLogs.length,
          sparklineData,
        };
      })
      .sort((a, b) => (b.thisWeekEarningsMicros ?? 0) - (a.thisWeekEarningsMicros ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitsUI, logs, transfers, weekEarningsMicrosByHabitId, habitIdByLogId]);

  // Today habits list: isLogged from logs; todayEarningsMicros from transfers map
  const todayHabits = useMemo(() => {
    const hs = habitsUI;
    const ls = logs || [];

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return hs.map((habit) => {
      const isLogged = isHabitLoggedOnDate(habit.id, today);

      // week log count (UI-only)
      const weekLogs = ls.filter((log) => {
        if (!log || log.habitId !== habit.id) return false;
        const d = normalizeToDate(log?.timestampMs);
        return d ? d >= startOfWeek : false;
      });
      const weekLogCount = weekLogs.length;

      // progress text (UI-only)
      let progressText = `${weekLogCount} this week`;
      if (habit.goal?.period === "week") {
        const goalAmount = Number(habit.goal.amount ?? 0);
        const remaining = Math.max(0, goalAmount - weekLogCount);
        if (remaining === 0) progressText = "Goal reached!";
        else progressText = `${remaining} more to goal`;
      }

      const todayEarningsMicros =
        todayEarningsMicrosByHabitId.get(String(habit.id)) ?? 0;

      return {
        ...habit,
        isLogged,
        todayEarningsMicros,
        weekLogCount,
        progressText,
      };
    });
  }, [habitsUI, logs, isHabitLoggedOnDate, todayEarningsMicrosByHabitId]);

  const loggedCount = todayHabits.filter((h) => h.isLogged).length;

  return (
    <div className="home-page">
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="home-container">
        {!hasHabits ? (
          <EmptyState onAdd={() => setShowAddSheet(true)} />
        ) : (
          <>
            <header className="home-header">
              <div className="header-row">
                <button className="menu-button" onClick={() => setSidebarOpen(true)}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <div className="header-content">
                  <h1 className="home-greeting">{getGreeting()}</h1>
                  <p className="home-date">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </header>

            <section className="week-summary-card">
              <div className="week-summary-top">
                <div className="week-earned">
                  <span className="earned-label">Earned this week</span>
                  <span className="earned-value">{formatCurrency(animatedWeekEarnings)}</span>
                </div>
              </div>
            </section>

            <section className="today-section">
              <div className="section-header">
                <span className="section-label">Today</span>
                <span className="section-count">
                  {loggedCount}/{(habitsUI || []).length}
                </span>
              </div>

              <div className="today-list">
                {todayHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`today-row ${habit.isLogged ? "logged" : "tappable"}`}
                    onClick={() => handleHabitTap(habit)}
                  >
                    <div className="today-status">
                      {habit.isLogged ? (
                        <div className="status-check">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="status-circle" />
                      )}
                    </div>

                    <div className="today-info">
                      <span className="today-name">{habit.name}</span>
                    </div>

                    <div className="today-value">
                      {habit.isLogged ? (
                        <span className="today-earned">
                          +{formatUSDFromMicros(habit.todayEarningsMicros)}
                        </span>
                      ) : (
                        <span className="today-progress">{habit.progressText}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {weeklyPerformers.length > 0 && (
              <section className="performers-section">
                <div className="section-label">This Week</div>
                <div className="performers-scroll">
                  {weeklyPerformers.map((performer, index) => {
                    const maxSparkline = Math.max(...(performer.sparklineData || []), 1);

                    return (
                      <motion.div
                        key={performer.id}
                        className="performer-card"
                        onClick={() => navigate(`/habit/${performer.id}`)}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="performer-name">{performer.name}</div>
                        <div className="performer-earnings">
                          {formatUSDFromMicros(performer.thisWeekEarningsMicros ?? 0)}
                        </div>

                        <div className="sparkline-container">
                          {(performer.sparklineData || []).map((value, i) => {
                            const height = maxSparkline > 0 ? (value / maxSparkline) * 100 : 10;
                            const isRecent = i >= performer.sparklineData.length - 2;

                            return (
                              <div
                                key={i}
                                className={`spark-bar ${isRecent ? "highlight" : ""}`}
                                style={{ height: `${Math.max(height, 10)}%` }}
                              />
                            );
                          })}
                        </div>

                        <div className="performer-logs">{performer.thisWeekLogCount} logs</div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {calibratingHabits.length > 0 && (
              <section className="calibrating-section">
                <div className="section-label">Calibrating</div>
                <div className="calibrating-list">
                  {calibratingHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="calibrating-row"
                      onClick={() => navigate(`/habit/${habit.id}`)}
                    >
                      <div className="calibrating-progress">
                        <svg viewBox="0 0 36 36" className="calibrating-ring">
                          <circle className="ring-bg" cx="18" cy="18" r="14" fill="none" strokeWidth="3" />
                          <circle
                            className="ring-progress"
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${(habit.totalLogs / 10) * 88} 88`}
                          />
                        </svg>
                        <span className="calibrating-count">{habit.totalLogs}</span>
                      </div>

                      <div className="calibrating-info">
                        <span className="calibrating-name">{habit.name}</span>
                        <span className="calibrating-needed">{habit.logsNeeded} more logs</span>
                      </div>

                      <svg
                        className="calibrating-chevron"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <BottomSheet
        isOpen={activeSheet === "log"}
        onClose={closeSheet}
        height="tall"
        title="Log Activity"
        headerRight={noopHeaderRight}
      >
        <LogHabitSheet
          actionType="log"
          initialHabitId={selectedHabitId}
          onClose={closeSheet}
          onLogComplete={handleLogComplete}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === "pass"}
        onClose={closeSheet}
        height="tall"
        title="Log Pass"
        headerRight={noopHeaderRight}
      >
        <LogHabitSheet
          actionType="pass"
          initialHabitId={selectedHabitId}
          onClose={closeSheet}
          onLogComplete={handleLogComplete}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        height="tall"
        title="Add Habit"
        headerRight={noopHeaderRight}
      >
        <AddHabitSheet
          onComplete={() => setShowAddSheet(false)}
          onClose={() => setShowAddSheet(false)}
        />
      </BottomSheet>
    </div>
  );
}
