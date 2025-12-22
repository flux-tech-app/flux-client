// src/context/HabitContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getHabitById, RATE_TYPES } from "@/utils/HABIT_LIBRARY";
import { useAuth } from "@/context/AuthContext";
import {
  bootstrapApi,
  habitsApi,
  logsApi,
  transfersApi,
  usersApi,
} from "@/api/fluxApi";

const HabitContext = createContext(null);

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used within HabitProvider");
  return ctx;
}

// ---------- money helpers (UI only) ----------
function microsToDollars(micros) {
  return Number(micros || 0) / 1_000_000;
}
function dollarsToMicros(dollars) {
  return Math.round(Number(dollars || 0) * 1_000_000);
}

// ---------- time helpers (UI only) ----------
function msToISO(ms) {
  if (!ms) return null;
  return new Date(Number(ms)).toISOString();
}
function startOfTodayMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// ---------- optional cache helpers (NOT identity) ----------
const BOOT_CACHE_VERSION = "v1";
function cacheKeyForUser(userId) {
  return `flux_bootstrap_cache_${BOOT_CACHE_VERSION}:${userId}`;
}
function readBootCache(userId) {
  try {
    const raw = localStorage.getItem(cacheKeyForUser(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.boot ?? null;
  } catch {
    return null;
  }
}
function writeBootCache(userId, boot) {
  try {
    localStorage.setItem(
      cacheKeyForUser(userId),
      JSON.stringify({ boot, cachedAtMs: Date.now() })
    );
  } catch {
    // ignore quota errors
  }
}
function clearBootCache(userId) {
  try {
    localStorage.removeItem(cacheKeyForUser(userId));
  } catch {
    // ignore
  }
}

export function HabitProvider({ children }) {
  const { session, user: authUser, isAuthLoading } = useAuth();

  // Server bootstrap state (source of truth)
  const [boot, setBoot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Avoid state updates from stale async requests
  const requestSeq = useRef(0);

  const refresh = useCallback(async () => {
    // If not authed, we shouldn't fetch
    if (!session?.access_token) return null;

    const seq = ++requestSeq.current;
    setIsLoading(true);
    setError(null);

    try {
      const raw = await bootstrapApi.get(); // GET /api/bootstrap
      if (seq !== requestSeq.current) return null;

      setBoot(raw);

      // Optional cache (perf only)
      const uid = authUser?.id;
      if (uid) writeBootCache(uid, raw);

      return raw;
    } catch (e) {
      if (seq !== requestSeq.current) return null;
      setError(e);
      return null;
    } finally {
      if (seq === requestSeq.current) setIsLoading(false);
    }
  }, [session?.access_token, authUser?.id]);

  // Load: Auth gate first, then bootstrap
  useEffect(() => {
    if (isAuthLoading) return;

    // Signed out => clear state
    if (!session || !authUser?.id) {
      setBoot(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Signed in => show cache immediately (optional)
    const cached = readBootCache(authUser.id);
    if (cached) {
      setBoot(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // Always refresh from backend after (authoritative)
    refresh();
  }, [isAuthLoading, session, authUser?.id, refresh]);

  // -------------------------
  // View models (UI-only mapping)
  // -------------------------
  const user = boot?.user ?? null;

  const habits = useMemo(() => {
    const hs = boot?.habits || [];
    return hs.map((h) => {
      const lib = getHabitById(h.libraryId);
      return {
        // raw
        id: h.id,
        libraryId: h.libraryId,
        rateType: h.rateType,
        rateMicros: h.rateMicros,
        goal: h.goal,
        createdAtMs: h.createdAtMs,

        // UI enrichment from local library catalog
        name: lib?.name || h.libraryId,
        icon: lib?.icon || "✅",
        unit: lib?.unit || "",
        unitPlural: lib?.unitPlural || "",
        defaultRate: lib?.defaultRate ?? 0,

        // UI convenience
        rate: microsToDollars(h.rateMicros),
        createdAt: msToISO(h.createdAtMs),
      };
    });
  }, [boot]);

  const logs = useMemo(() => {
    const ls = boot?.logs || [];
    return ls.map((l) => ({
      // raw
      id: l.id,
      habitId: l.habitId,
      timestampMs: l.timestampMs,
      earningsMicros: l.earningsMicros,
      units: l.units,
      notes: l.notes || "",

      // UI convenience
      timestamp: msToISO(l.timestampMs),
      totalEarnings: microsToDollars(l.earningsMicros),
    }));
  }, [boot]);

  const transfers = useMemo(() => {
    const ts = boot?.transfers || [];
    return ts.map((t) => ({
      // raw
      id: t.id,
      timestampMs: t.timestampMs,
      amountMicros: t.amountMicros,
      status: t.status,
      weekKey: t.weekKey,

      // UI convenience
      date: msToISO(t.timestampMs),
      amount: microsToDollars(t.amountMicros),
    }));
  }, [boot]);

  const totalsMicros =
    boot?.totals || { earnedMicros: 0, transferredMicros: 0, pendingMicros: 0 };

  // -------------------------
  // Minimal UI helpers (optional)
  // -------------------------
  const getPendingBalance = useCallback(
    () => microsToDollars(totalsMicros.pendingMicros),
    [totalsMicros.pendingMicros]
  );
  const getTransferredBalance = useCallback(
    () => microsToDollars(totalsMicros.transferredMicros),
    [totalsMicros.transferredMicros]
  );
  const getTotalEarnings = useCallback(
    () => microsToDollars(totalsMicros.earnedMicros),
    [totalsMicros.earnedMicros]
  );

  const getTodayEarnings = useCallback(() => {
    // UI-only aggregation (totals are still server-owned)
    const todayStart = startOfTodayMs();
    let sum = 0;
    for (const l of logs) {
      if ((l.timestampMs || 0) >= todayStart) sum += l.earningsMicros || 0;
    }
    return microsToDollars(sum);
  }, [logs]);

  const getWeekEarnings = useCallback(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    let sum = 0;
    for (const l of logs) {
      if ((l.timestampMs || 0) >= weekAgo) sum += l.earningsMicros || 0;
    }
    return microsToDollars(sum);
  }, [logs]);

  const getHabitLogs = useCallback(
    (habitId) => logs.filter((l) => l.habitId === habitId),
    [logs]
  );

  const isHabitLoggedOnDate = useCallback(
    (habitId, date) => {
      const d = new Date(date);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const start = dayStart.getTime();
      const end = dayEnd.getTime();

      return logs.some(
        (l) =>
          l.habitId === habitId &&
          (l.timestampMs || 0) >= start &&
          (l.timestampMs || 0) <= end
      );
    },
    [logs]
  );

  const getTodayLogs = useCallback(() => {
    const todayStart = startOfTodayMs();
    return logs.filter((l) => (l.timestampMs || 0) >= todayStart);
  }, [logs]);

  const isHabitAdded = useCallback(
    (libraryId) => habits.some((h) => h.libraryId === libraryId),
    [habits]
  );

  // -------------------------
  // Mutations (server is source of truth)
  // -------------------------
  const addHabit = useCallback(async (habitConfig) => {
    const lib = getHabitById(habitConfig.libraryId);
    if (!lib) throw new Error(`Habit not found in library: ${habitConfig.libraryId}`);

    if (!habitConfig.goal?.amount || !habitConfig.goal?.period) {
      throw new Error("Goal is required (amount + period)");
    }

    const payload = {
      libraryId: habitConfig.libraryId,
      rateType: lib.rateType,
      rateMicros: dollarsToMicros(habitConfig.rate ?? lib.defaultRate ?? 0),
      goal: { amount: habitConfig.goal.amount, period: habitConfig.goal.period },
    };

    const nextBoot = await habitsApi.create(payload); // POST /api/habits -> Bootstrap
    setBoot(nextBoot);
    if (authUser?.id) writeBootCache(authUser.id, nextBoot);
    return nextBoot;
  }, [authUser?.id]);

  const addHabits = useCallback(async (habitConfigs) => {
    // safe sequential; backend is idempotent on (user_id, library_id)
    for (const cfg of habitConfigs || []) {
      // eslint-disable-next-line no-await-in-loop
      await addHabit(cfg);
    }
    return true;
  }, [addHabit]);

  const addLog = useCallback(async (logData) => {
    if (!logData?.habitId) throw new Error("habitId is required");

    const payload = {
      habitId: logData.habitId,
      units: logData.units ?? 1,
      notes: logData.notes || "",
    };

    if (logData.customEarnings !== undefined && logData.customEarnings !== null) {
      payload.customEarningsMicros = dollarsToMicros(logData.customEarnings);
    }

    const nextBoot = await logsApi.create(payload); // POST /api/logs -> Bootstrap
    setBoot(nextBoot);
    if (authUser?.id) writeBootCache(authUser.id, nextBoot);
    return nextBoot;
  }, [authUser?.id]);

  const processTransfer = useCallback(async () => {
    const nextBoot = await transfersApi.create(); // POST /api/transfers -> Bootstrap
    setBoot(nextBoot);
    if (authUser?.id) writeBootCache(authUser.id, nextBoot);
    return nextBoot;
  }, [authUser?.id]);

  // User updates go to backend
  const updateUser = useCallback(async (patch) => {
    const nextUser = await usersApi.patchMe(patch);
    setBoot((prev) => (prev ? { ...prev, user: nextUser } : prev));
    if (authUser?.id) {
      const cached = readBootCache(authUser.id);
      if (cached) writeBootCache(authUser.id, { ...cached, user: nextUser });
    }
    return nextUser;
  }, [authUser?.id]);

  const completeOnboarding = useCallback(async () => {
    const nextUser = await usersApi.completeOnboarding();
    setBoot((prev) => (prev ? { ...prev, user: nextUser } : prev));
    if (authUser?.id) {
      const cached = readBootCache(authUser.id);
      if (cached) writeBootCache(authUser.id, { ...cached, user: nextUser });
    }
    return nextUser;
  }, [authUser?.id]);

  // Optional: allow manual cache clear (useful during dev)
  const clearCache = useCallback(() => {
    if (authUser?.id) clearBootCache(authUser.id);
  }, [authUser?.id]);

  // -------------------------
  // Flux Score (still FE for now)
  // -------------------------
  const calculateFluxScore = useCallback(
    (habitId) => {
      const habitLogs = logs.filter((l) => l.habitId === habitId);
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return null;

      const totalLogs = habitLogs.length;
      if (totalLogs < 10) {
        return { score: null, status: "building", logsNeeded: 10 - totalLogs, totalLogs };
      }

      const now = Date.now();
      const sorted = [...habitLogs].sort(
        (a, b) => (b.timestampMs || 0) - (a.timestampMs || 0)
      );

      const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
      const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

      const recentLogs = sorted.filter((l) => (l.timestampMs || 0) >= fourteenDaysAgo);
      const baselineLogs = sorted.filter((l) => (l.timestampMs || 0) >= ninetyDaysAgo);

      // Frequency trend (30)
      const recentFrequency = recentLogs.length / 14;
      const oldestMs = sorted[sorted.length - 1]?.timestampMs || now;
      const baselineDays = Math.min(
        90,
        Math.floor((now - oldestMs) / (24 * 60 * 60 * 1000))
      );
      const baselineFrequency = baselineLogs.length / Math.max(baselineDays, 1);

      const frequencyRatio = baselineFrequency > 0 ? recentFrequency / baselineFrequency : 1;
      const frequencyScore = 30 * Math.min(1, frequencyRatio);

      // Consistency (25)
      const gaps = [];
      for (let i = 1; i < sorted.length; i++) {
        const gapDays =
          ((sorted[i - 1].timestampMs || 0) - (sorted[i].timestampMs || 0)) /
          (24 * 60 * 60 * 1000);
        gaps.push(gapDays);
      }
      const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 1;
      const gapVariance = gaps.length
        ? Math.sqrt(gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length)
        : 0;
      const consistencyScore = 25 * Math.exp(-gapVariance / Math.max(avgGap, 0.5));

      // Recency (20)
      const daysSinceLog = sorted.length
        ? (now - (sorted[0].timestampMs || now)) / (24 * 60 * 60 * 1000)
        : 30;
      const recencyScore = 20 * Math.exp(-daysSinceLog / Math.max(avgGap, 1));

      // Volume (15) - only non-binary
      let volumeScore = 0;
      if (habit.rateType !== RATE_TYPES.BINARY && habit.rateType !== "BINARY") {
        const recentUnits = recentLogs.reduce((sum, l) => sum + (l.units || 1), 0);
        const baselineUnits = baselineLogs.reduce((sum, l) => sum + (l.units || 1), 0);

        const recentAvgUnits = recentLogs.length ? recentUnits / recentLogs.length : 0;
        const baselineAvgUnits = baselineLogs.length ? baselineUnits / baselineLogs.length : 1;

        const volumeRatio = baselineAvgUnits > 0 ? recentAvgUnits / baselineAvgUnits : 1;
        volumeScore = 15 * Math.min(1, volumeRatio);
      }

      // Maturity (10)
      const maturityScore = 10 * Math.min(1, totalLogs / 30);

      let totalScore;
      if (habit.rateType === RATE_TYPES.BINARY || habit.rateType === "BINARY") {
        const raw = frequencyScore + consistencyScore + recencyScore + maturityScore;
        totalScore = (raw / 85) * 100;
      } else {
        totalScore = frequencyScore + consistencyScore + recencyScore + volumeScore + maturityScore;
      }

      return {
        score: Math.round(totalScore),
        status: "active",
        components: {
          frequency: Math.round(frequencyScore * 10) / 10,
          consistency: Math.round(consistencyScore * 10) / 10,
          recency: Math.round(recencyScore * 10) / 10,
          volume: Math.round(volumeScore * 10) / 10,
          maturity: Math.round(maturityScore * 10) / 10,
        },
        meta: {
          totalLogs,
          avgGap: Math.round(avgGap * 10) / 10,
          daysSinceLog: Math.round(daysSinceLog * 10) / 10,
          recentLogs: recentLogs.length,
        },
      };
    },
    [habits, logs]
  );

  const getPortfolioFluxScore = useCallback(() => {
    const scored = habits
      .map((h) => ({ habit: h, fluxScore: calculateFluxScore(h.id) }))
      .filter((x) => x.fluxScore?.status === "active");

    if (!scored.length) {
      return { score: null, status: "building", habitsWithScore: 0, totalHabits: habits.length };
    }

    const avg = scored.reduce((sum, x) => sum + x.fluxScore.score, 0) / scored.length;
    return { score: Math.round(avg), status: "active", habitsWithScore: scored.length, totalHabits: habits.length };
  }, [habits, calculateFluxScore]);

  const value = {
    // raw bootstrap (sometimes useful for debugging)
    boot,

    // server-backed (canonical)
    user,
    habits,
    logs,
    transfers,
    totalsMicros,

    // loading state
    isLoading,
    error,

    // core actions
    refresh,
    addHabit,
    addHabits,
    addLog,
    processTransfer,
    updateUser,
    completeOnboarding,

    // ui helpers (optional)
    isHabitAdded,
    getHabitLogs,
    isHabitLoggedOnDate,
    getTodayLogs,

    // money helpers (UI)
    getPendingBalance,
    getTransferredBalance,
    getTotalEarnings,
    getTodayEarnings,
    getWeekEarnings,

    // flux score (temporary FE)
    calculateFluxScore,
    getPortfolioFluxScore,

    // dev
    clearCache,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}