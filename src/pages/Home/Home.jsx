// src/pages/Home/Home.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useHabits from "@/hooks/useHabits";
import { formatCurrency } from "../../utils/formatters";
import BottomSheet from "../../components/BottomSheet";
import LogHabitSheet from "../../components/LogHabitSheet";
import SidebarMenu from "../../components/SidebarMenu/SidebarMenu";
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

export default function Home() {
  const navigate = useNavigate();

  // IMPORTANT: useHabits() should now be backed by boot.catalog (server truth),
  // and should enrich each habit with name/actionType/unit/etc.
  const {
    habits = [],
    logs = [],
    getWeekEarnings,
    getTodayEarnings,
    isHabitLoggedOnDate,
    calculateFluxScore,
  } = useHabits();

  const [activeSheet, setActiveSheet] = useState(null); // "log" | "pass" | null
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasHabits = habits.length > 0;
  const weekEarnings = typeof getWeekEarnings === "function" ? getWeekEarnings() : 0;
  const todayEarnings = typeof getTodayEarnings === "function" ? getTodayEarnings() : 0;
  const animatedWeekEarnings = useAnimatedCounter(weekEarnings);

  // Calculate pace projection (assuming 7-day week, project based on days elapsed)
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // Sunday = 7
  const dailyAverage = dayOfWeek > 0 ? weekEarnings / dayOfWeek : 0;
  const projectedWeekTotal = dailyAverage * 7;

  // Helpers for log fields (migration-safe)
  const getLogTimestamp = (log) => log?.timestamp ?? log?.timestampMs ?? null;
  const getLogEarnings = (log) =>
    // new provider should use `earnings` (number in dollars)
    // old provider might use `totalEarnings`
    log?.earnings ?? log?.totalEarnings ?? 0;

  const normalizeToDate = (ts) => {
    if (!ts) return null;
    // if provider passes ms, accept it; if string, accept it
    const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // Get calibrating habits (status === "building")
  const getCalibratingHabits = () => {
    return habits
      .map((habit) => {
        const fluxScore =
          typeof calculateFluxScore === "function"
            ? calculateFluxScore(habit.id)
            : null;

        return {
          ...habit,
          fluxScore,
          isCalibrating: fluxScore?.status === "building",
          logsNeeded: fluxScore?.logsNeeded ?? 0,
          totalLogs: fluxScore?.meta?.totalLogs ?? fluxScore?.totalLogs ?? 0,
        };
      })
      .filter((h) => h.isCalibrating);
  };

  const calibratingHabits = getCalibratingHabits();

  // Get weekly performance data for horizontal cards
  const getWeeklyPerformers = () => {
    if (!habits || !logs) return [];

    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    return habits
      .map((habit) => {
        const habitLogs = (logs || []).filter(
          (log) => log && log.habitId === habit.id
        );

        const thisWeekLogs = habitLogs.filter((log) => {
          const d = normalizeToDate(getLogTimestamp(log));
          return d ? d >= startOfThisWeek : false;
        });

        const thisWeekEarnings = thisWeekLogs.reduce(
          (sum, log) => sum + getLogEarnings(log),
          0
        );

        // Generate sparkline data (last 6 days)
        const sparklineData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);

          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const dayEarnings = habitLogs
            .filter((log) => {
              const d = normalizeToDate(getLogTimestamp(log));
              return d ? d >= date && d < nextDate : false;
            })
            .reduce((sum, log) => sum + getLogEarnings(log), 0);

          sparklineData.push(dayEarnings);
        }

        return {
          ...habit,
          thisWeekEarnings,
          thisWeekLogCount: thisWeekLogs.length,
          sparklineData,
        };
      })
      .sort((a, b) => b.thisWeekEarnings - a.thisWeekEarnings);
  };

  const weeklyPerformers = getWeeklyPerformers();

  // Get today's habits with logged status and progress info
  const getTodayHabits = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return habits.map((habit) => {
      const isLogged =
        typeof isHabitLoggedOnDate === "function"
          ? isHabitLoggedOnDate(habit.id, today)
          : false;

      const todayLog = (logs || []).find((log) => {
        if (!log || log.habitId !== habit.id) return false;
        const d = normalizeToDate(getLogTimestamp(log));
        return d ? d.toDateString() === today.toDateString() : false;
      });

      // actionType comes from server-backed catalog join (provider)
      const actionType = habit.actionType || "log";

      // Count logs this week (count-based; keep until you switch goals to units-based)
      const weekLogs = (logs || []).filter((log) => {
        if (!log || log.habitId !== habit.id) return false;
        const d = normalizeToDate(getLogTimestamp(log));
        return d ? d >= startOfWeek : false;
      });
      const weekLogCount = weekLogs.length;

      // Calculate progress info
      let progressText = `${weekLogCount} this week`;
      if (habit.goal && habit.goal.period === "week") {
        const goalAmount = Number(habit.goal.amount ?? 0);
        const remaining = Math.max(0, goalAmount - weekLogCount);
        if (remaining === 0) progressText = "Goal reached!";
        else progressText = `${remaining} more to goal`;
      }

      return {
        ...habit,
        isLogged,
        todayEarnings: todayLog ? getLogEarnings(todayLog) : 0,
        actionType,
        weekLogCount,
        progressText,
      };
    });
  };

  const todayHabits = getTodayHabits();
  const loggedCount = todayHabits.filter((h) => h.isLogged).length;

  // Get greeting based on time of day
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

  // Handle tapping a habit in the Today section
  const handleHabitTap = (habit) => {
    if (habit.isLogged) return;

    setSelectedHabitId(habit.id);
    setActiveSheet(habit.actionType === "pass" ? "pass" : "log");
  };

  return (
    <div className="home-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="home-container">
        {!hasHabits ? (
          <EmptyState />
        ) : (
          <>
            {/* Header */}
            <header className="home-header">
              <div className="header-row">
                <button
                  className="menu-button"
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

            {/* This Week Summary Card */}
            <section className="week-summary-card">
              <div className="week-summary-top">
                <div className="week-earned">
                  <span className="earned-label">Earned this week</span>
                  <span className="earned-value">
                    {formatCurrency(animatedWeekEarnings)}
                  </span>
                </div>

                {projectedWeekTotal > 0 && (
                  <div className="week-pace">
                    <span className="pace-label">On pace for</span>
                    <span className="pace-value">
                      {formatCurrency(projectedWeekTotal)}
                    </span>
                  </div>
                )}
              </div>

              {todayEarnings > 0 && (
                <div className="today-earned">
                  <span className="today-label">Today</span>
                  <span className="today-value">
                    +{formatCurrency(todayEarnings)}
                  </span>
                </div>
              )}
            </section>

            {/* Today's Behaviors */}
            <section className="today-section">
              <div className="section-header">
                <span className="section-label">Today</span>
                <span className="section-count">
                  {loggedCount}/{habits.length}
                </span>
              </div>

              <div className="today-list">
                {todayHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`today-row ${
                      habit.isLogged ? "logged" : "tappable"
                    }`}
                    onClick={() => handleHabitTap(habit)}
                  >
                    <div className="today-status">
                      {habit.isLogged ? (
                        <div className="status-check">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
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
                          +{formatCurrency(habit.todayEarnings)}
                        </span>
                      ) : (
                        <span className="today-progress">
                          {habit.progressText}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* This Week Performers */}
            {weeklyPerformers.length > 0 && (
              <section className="performers-section">
                <div className="section-label">This Week</div>
                <div className="performers-scroll">
                  {weeklyPerformers.map((performer, index) => {
                    const maxSparkline = Math.max(
                      ...(performer.sparklineData || []),
                      1
                    );

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
                          {formatCurrency(performer.thisWeekEarnings)}
                        </div>

                        <div className="sparkline-container">
                          {(performer.sparklineData || []).map((value, i) => {
                            const height =
                              maxSparkline > 0
                                ? (value / maxSparkline) * 100
                                : 10;
                            const isRecent =
                              i >= performer.sparklineData.length - 2;

                            return (
                              <div
                                key={i}
                                className={`spark-bar ${
                                  isRecent ? "highlight" : ""
                                }`}
                                style={{ height: `${Math.max(height, 10)}%` }}
                              />
                            );
                          })}
                        </div>

                        <div className="performer-logs">
                          {performer.thisWeekLogCount} logs
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Calibrating Section */}
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
                          <circle
                            className="ring-bg"
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            strokeWidth="3"
                          />
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
                        <span className="calibrating-needed">
                          {habit.logsNeeded} more logs
                        </span>
                      </div>

                      <svg
                        className="calibrating-chevron"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Log Activity Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === "log"}
        onClose={closeSheet}
        height="tall"
        title="Log Activity"
      >
        <LogHabitSheet
          actionType="log"
          initialHabitId={selectedHabitId}
          onClose={closeSheet}
          onLogComplete={handleLogComplete}
        />
      </BottomSheet>

      {/* Pass Activity Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === "pass"}
        onClose={closeSheet}
        height="tall"
        title="Log Pass"
      >
        <LogHabitSheet
          actionType="pass"
          initialHabitId={selectedHabitId}
          onClose={closeSheet}
          onLogComplete={handleLogComplete}
        />
      </BottomSheet>
    </div>
  );
}
