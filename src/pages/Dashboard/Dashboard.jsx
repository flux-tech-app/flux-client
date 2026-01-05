import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useHabits from "@/hooks/useHabits";
import "./Dashboard.css";

// Default star color for MVT (no categories)
const DEFAULT_STAR_COLOR = "#60a5fa";

const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// Deterministic position generator based on habit ID
const getStarPosition = (habitId, index, total) => {
  const str = String(habitId ?? "");
  const hash = str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / cols);
  const col = index % cols;

  const baseX = 15 + (col / Math.max(1, cols - 1)) * 70;
  const baseY = 20 + (row / Math.max(1, Math.ceil(total / cols) - 1)) * 55;

  const xVariation = (hash % 15) - 7;
  const yVariation = ((hash * 7) % 15) - 7;

  return {
    x: Math.max(10, Math.min(90, baseX + xVariation)),
    y: Math.max(15, Math.min(80, baseY + yVariation)),
  };
};

// Get star brightness class based on Flux Score
const getStarBrightness = (score) => {
  if (score >= 85) return "blazing";
  if (score >= 70) return "bright";
  if (score >= 50) return "growing";
  return "dim";
};

// Animated counter hook
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

// Calculate current streak for a habit based on logs (timestampMs)
const calculateHabitStreak = (habitId, logs) => {
  const habitLogs = (logs || []).filter((l) => String(l?.habitId) === String(habitId));
  if (habitLogs.length === 0) return 0;

  const sorted = [...habitLogs].sort(
    (a, b) => safeNumber(b?.timestampMs) - safeNumber(a?.timestampMs)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today.getTime() - 86400000);

  const lastLogMs = safeNumber(sorted[0]?.timestampMs, 0);
  const lastLogDate = new Date(lastLogMs);
  lastLogDate.setHours(0, 0, 0, 0);

  // Only count streak if logged today or yesterday
  if (lastLogDate < yesterday) return 0;

  const logDays = new Set(
    sorted
      .map((log) => safeNumber(log?.timestampMs, null))
      .filter((ms) => ms != null)
      .map((ms) => {
        const d = new Date(ms);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
  );

  let streak = 0;
  const checkDate = new Date(lastLogDate);

  while (logDays.has(checkDate.getTime())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    habits,
    logs,
    user,
    totalsUI,
    statsUI,
    habitTotals,
    getCatalogHabit,
    calculateFluxScore, // returns server flux object {score?, status, ...}
    microsToDollars,
  } = useHabits();

  const [activeTooltip, setActiveTooltip] = useState(null);
  const bgStarsRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // All habits (MVT: all active)
  const activeHabits = useMemo(() => habits || [], [habits]);

  // Fast lookup: habitId -> earned dollars (from habitTotals)
  const earnedByHabitId = useMemo(() => {
    const m = new Map();
    for (const ht of habitTotals || []) {
      const hid = String(ht?.habitId ?? "");
      if (!hid) continue;
      m.set(hid, microsToDollars(safeNumber(ht?.earnedMicros, 0)));
    }
    return m;
  }, [habitTotals, microsToDollars]);

  // Habit “view models” joined with catalog + flux
  const habitStats = useMemo(() => {
    const hs = activeHabits;
    const ls = logs || [];

    return hs.map((habit, index) => {
      const catalogHabit = getCatalogHabit?.(habit?.catalogId);
      const name = catalogHabit?.name ?? "Habit";

      const fluxObj = calculateFluxScore?.(habit?.id);
      const fluxScore = typeof fluxObj?.score === "number" ? fluxObj.score : 20;

      const position = getStarPosition(habit?.id, index, hs.length);
      const streak = calculateHabitStreak(habit?.id, ls);

      const totalEarned = safeNumber(earnedByHabitId.get(String(habit?.id)), 0);

      return {
        ...habit,
        name,
        fluxScore,
        totalEarned,
        position,
        brightness: getStarBrightness(fluxScore),
        streak,
      };
    });
  }, [activeHabits, logs, getCatalogHabit, calculateFluxScore, earnedByHabitId]);

  // Overall streak (days with any activity)
  const calculateOverallStreak = (allLogs) => {
    const ls = allLogs || [];
    if (ls.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logDays = new Set(
      ls
        .map((log) => safeNumber(log?.timestampMs, null))
        .filter((ms) => ms != null)
        .map((ms) => {
          const d = new Date(ms);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
    );

    let streak = 0;
    const checkDate = new Date(today);

    const todayTime = today.getTime();
    const yesterdayTime = todayTime - 86400000;

    if (!logDays.has(todayTime) && !logDays.has(yesterdayTime)) return 0;

    while (logDays.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  };

  // Calculate overall stats using server-derived totals/stats
  const stats = useMemo(() => {
    const totalEarnings = safeNumber(totalsUI?.earned, 0);
    const weekEarnings = safeNumber(statsUI?.week, 0);

    const avgScore =
      habitStats.length > 0
        ? Math.round(habitStats.reduce((sum, h) => sum + safeNumber(h.fluxScore, 0), 0) / habitStats.length)
        : 0;

    // Days since first habit (createdAtMs)
    const firstHabit = (habits || []).reduce((earliest, h) => {
      if (!earliest) return h;
      return safeNumber(h?.createdAtMs) < safeNumber(earliest?.createdAtMs) ? h : earliest;
    }, null);

    const daysSinceStart = firstHabit
      ? Math.floor((Date.now() - safeNumber(firstHabit.createdAtMs)) / (1000 * 60 * 60 * 24))
      : 0;

    const overallStreak = calculateOverallStreak(logs);

    const topHabit =
      habitStats.length > 0
        ? habitStats.reduce((best, h) => (safeNumber(h.fluxScore) > safeNumber(best.fluxScore) ? h : best), habitStats[0])
        : null;

    const longestStreak = habitStats.reduce((max, h) => Math.max(max, safeNumber(h.streak, 0)), 0);
    const peakScore = habitStats.reduce((max, h) => Math.max(max, safeNumber(h.fluxScore, 0)), avgScore);

    // Best week earnings (MVT: current)
    const bestWeekEarnings = weekEarnings;

    // Optional WoW: compute last week earnings from logs using earningsMicros if present
    const lastWeekStart = Date.now() - 14 * 86400000;
    const lastWeekEnd = Date.now() - 7 * 86400000;

    const lastWeekEarningsMicros = (logs || [])
      .filter((l) => {
        const t = safeNumber(l?.timestampMs, 0);
        return t >= lastWeekStart && t < lastWeekEnd;
      })
      .reduce((sum, l) => sum + safeNumber(l?.earningsMicros, 0), 0);

    const lastWeekEarnings = microsToDollars(lastWeekEarningsMicros);

    const weekChange =
      lastWeekEarnings > 0
        ? Math.round(((weekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100)
        : weekEarnings > 0
          ? 100
          : 0;

    return {
      totalEarnings,
      weekEarnings,
      weekChange, // number
      avgScore,
      habitCount: activeHabits.length,
      daysSinceStart,
      overallStreak,
      longestStreak,
      peakScore,
      bestWeekEarnings,
      topHabit,
    };
  }, [habits, logs, habitStats, activeHabits.length, totalsUI, statsUI, microsToDollars]);

  const animatedPortfolioValue = useAnimatedCounter(stats.totalEarnings);

  // Generate background stars on mount
  useEffect(() => {
    if (!bgStarsRef.current) return;

    const container = bgStarsRef.current;
    container.innerHTML = "";

    for (let i = 0; i < 80; i++) {
      const star = document.createElement("div");
      star.className = "bg-star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.opacity = String(Math.random() * 0.4 + 0.1);
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      container.appendChild(star);
    }
  }, []);

  const handleStarClick = (habit) => {
    navigate(`/habit/${habit.id}`);
  };

  // Member since date based on first habit createdAtMs
  const memberSince = useMemo(() => {
    const firstHabit = (habits || []).reduce((earliest, h) => {
      if (!earliest) return h;
      return safeNumber(h?.createdAtMs) < safeNumber(earliest?.createdAtMs) ? h : earliest;
    }, null);

    if (!firstHabit) return "Today";

    const date = new Date(safeNumber(firstHabit.createdAtMs));
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [habits]);

  // Achievement badges
  const achievements = useMemo(() => {
    const earned = [];

    if (stats.totalEarnings >= 100) earned.push({ id: "century", name: "Century Club", icon: "💯", desc: "Earned $100+" });
    if (stats.totalEarnings >= 50) earned.push({ id: "fifty", name: "Halfway There", icon: "🎯", desc: "Earned $50+" });
    if (stats.overallStreak >= 7) earned.push({ id: "week", name: "Week Warrior", icon: "🔥", desc: "7-day streak" });
    if (stats.overallStreak >= 30) earned.push({ id: "month", name: "Monthly Master", icon: "⭐", desc: "30-day streak" });
    if (stats.habitCount >= 3) earned.push({ id: "diversified", name: "Diversified", icon: "📊", desc: "3+ habits" });
    if (stats.avgScore >= 80) earned.push({ id: "performer", name: "High Performer", icon: "🏆", desc: "80+ avg score" });
    if (stats.habitCount >= 1) earned.push({ id: "first", name: "First Star", icon: "✨", desc: "Created first habit" });

    return earned.slice(0, 4);
  }, [stats]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Dark Sky Section */}
        <div className="sky-section">
          {/* Header */}
          <header className="dashboard-header">
            <div className="app-logo">
              {getGreeting()}
              {user?.name ? `, ${user.name}` : ""}
            </div>
            <div className="header-actions">
              <button className="icon-button" aria-label="Activity" onClick={() => navigate("/activity")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
            </div>
          </header>

          {/* Hero */}
          <div className="hero-section">
            <div className="hero-label">You've paid yourself</div>
            <div className="hero-value">${animatedPortfolioValue.toFixed(2)}</div>
            {stats.weekEarnings > 0 && (
              <div className="hero-change">
                <span className="change-positive">+${stats.weekEarnings.toFixed(2)}</span>
                <span className="change-period">this week</span>
                {stats.weekChange > 0 && <span className="change-percent">↑ {stats.weekChange}%</span>}
              </div>
            )}
          </div>

          {/* Constellation */}
          <div className="constellation-container">
            <div className="bg-stars" ref={bgStarsRef}></div>

            {habitStats.map((habit) => {
              const styleObj = {
                left: `${habit.position.x}%`,
                top: `${habit.position.y}%`,
                "--star-color": DEFAULT_STAR_COLOR,
              };

              return (
                <div
                  key={habit.id}
                  className={`star ${habit.brightness}`}
                  style={/** @type {any} */ (styleObj)}
                  onClick={() => handleStarClick(habit)}
                  onMouseEnter={() => setActiveTooltip(habit.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="star-glow"></div>
                  <div className="star-core"></div>

                  <div className={`star-tooltip ${activeTooltip === habit.id ? "visible" : ""}`}>
                    <div className="tooltip-name">{habit.name}</div>
                    <div className="tooltip-stats">
                      <div className="tooltip-stat">
                        <div className="tooltip-stat-value">{habit.fluxScore}</div>
                        <div className="tooltip-stat-label">Score</div>
                      </div>
                      <div className="tooltip-stat">
                        <div className="tooltip-stat-value">${safeNumber(habit.totalEarned).toFixed(0)}</div>
                        <div className="tooltip-stat-label">Earned</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {habitStats.length === 0 && (
              <div className="constellation-empty">
                <div className="empty-star">✦</div>
                <p>Your sky is waiting</p>
                <span>Create your first habit to add a star</span>
              </div>
            )}

            {habitStats.length > 0 && (
              <div className="constellation-label">
                <h2>Your Constellation</h2>
                <p>
                  {stats.daysSinceStart} days of growth • {stats.habitCount} stars
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Light Mode Content */}
        <div className="content-section">
          {/* Personal Records */}
          {stats.habitCount > 0 && (
            <div className="records-card">
              <div className="records-title">Personal Records</div>
              <div className="records-grid">
                <div className="record-item">
                  <div className="record-icon">🔥</div>
                  <div className="record-value">{stats.longestStreak}</div>
                  <div className="record-label">Best Streak</div>
                </div>
                <div className="record-item">
                  <div className="record-icon">📈</div>
                  <div className="record-value">{stats.peakScore}</div>
                  <div className="record-label">Peak Score</div>
                </div>
                <div className="record-item">
                  <div className="record-icon">💰</div>
                  <div className="record-value">${stats.bestWeekEarnings.toFixed(0)}</div>
                  <div className="record-label">Best Week</div>
                </div>
                <div className="record-item">
                  <div className="record-icon">⭐</div>
                  <div className="record-value">{stats.habitCount}</div>
                  <div className="record-label">Total Habits</div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="achievements-card">
              <div className="achievements-title">Achievements</div>
              <div className="achievements-grid">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="achievement-item">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-desc">{achievement.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Performer */}
          {stats.topHabit && (
            <div className="top-performer-card" onClick={() => navigate(`/habit/${stats.topHabit.id}`)}>
              <div className="performer-badge">Top Performer</div>
              <div className="performer-content">
                <div className="performer-name">{stats.topHabit.name}</div>
              </div>
              <div className="performer-stats">
                <div className="performer-hhs">{stats.topHabit.fluxScore} Score</div>
                <div className="performer-earned">${safeNumber(stats.topHabit.totalEarned).toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="summary-card">
            <div className="summary-header">
              <span className="summary-title">Portfolio Overview</span>
            </div>
            <div className="summary-stats">
              <div className="summary-stat">
                <div className="summary-stat-value">{stats.daysSinceStart}</div>
                <div className="summary-stat-label">Days Invested</div>
              </div>
              <div className="summary-stat">
                <div className="summary-stat-value">{stats.avgScore}</div>
                <div className="summary-stat-label">Avg Score</div>
              </div>
              <div className="summary-stat">
                <div className="summary-stat-value">{(logs || []).length}</div>
                <div className="summary-stat-label">Total Logs</div>
              </div>
            </div>
          </div>

          {/* Member Badge */}
          <div className="member-card">
            <div className="member-icon">⭐</div>
            <div className="member-text">
              <strong>Founding Member</strong> • Building your sky since {memberSince}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
