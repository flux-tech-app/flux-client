// src/providers/HabitProvider.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import HabitContext from "@/context/HabitContext";
import { useAuth } from "@/context/AuthContext";
import { bootstrapApi, habitsApi, logsApi, transfersApi, usersApi } from "@/api/fluxApi";

// -------------------------
// UI helpers (safe to keep)
// -------------------------
function microsToDollars(micros) {
  return Number(micros || 0) / 1_000_000;
}

function dollarsToMicros(dollars) {
  const n = Number(dollars);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 1_000_000);
}

function msToISO(ms) {
  if (!ms) return null;
  return new Date(Number(ms)).toISOString();
}

// “Local day” key for “is logged today” checks (keeps behavior consistent with toDateString usage)
function dayKeyFromMs(ms) {
  if (!ms) return "";
  return new Date(Number(ms)).toDateString();
}
function dayKeyFromDate(d) {
  return new Date(d).toDateString();
}

// -------------------------
// Optional cache (perf only)
// -------------------------
const BOOT_CACHE_VERSION = "v4";
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
    localStorage.setItem(cacheKeyForUser(userId), JSON.stringify({ boot, cachedAtMs: Date.now() }));
  } catch {}
}
function clearBootCache(userId) {
  try {
    localStorage.removeItem(cacheKeyForUser(userId));
  } catch {}
}

// -------------------------
// Provider
// -------------------------
export function HabitProvider({ children }) {
  const { session, user: authUser, isAuthLoading } = useAuth();

  const [boot, setBoot] = useState(null);

  // Split “first load” from “background refresh”
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState(null);

  // helps prevent out-of-order state updates
  const requestSeq = useRef(0);

  // IMPORTANT: token refreshes change the session object even though the user is still signed in.
  // We do NOT want that to trigger full re-bootstrap, so we gate bootstrap off stable identity.
  const isSignedIn = !!authUser?.id;

  /**
   * Refresh the server-derived app state.
   * - silent=true: do NOT flip the whole app into a blocking "Loading..." state
   * - silent=false: used when we have no cached data and must block initial render
   */
  const refresh = useCallback(
    async ({ silent = true } = {}) => {
      // Only require a stable user identity; do NOT depend on session/access_token
      // to avoid calling bootstrap on TOKEN_REFRESHED.
      if (!authUser?.id) return null;

      const seq = ++requestSeq.current;

      // Only show full-page loading when we truly don't have anything yet.
      if (silent) setIsRefreshing(true);
      else setIsInitialLoading(true);

      setError(null);

      try {
        // GET /api/bootstrap (authoritative, computed on server)
        const raw = await bootstrapApi.get();
        if (seq !== requestSeq.current) return null;

        setBoot(raw);
        writeBootCache(authUser.id, raw);

        // Once we have a successful bootstrap, initial loading is complete.
        setIsInitialLoading(false);

        return raw;
      } catch (e) {
        if (seq !== requestSeq.current) return null;
        setError(e);
        return null;
      } finally {
        if (seq === requestSeq.current) {
          setIsRefreshing(false);
          // If this was a non-silent initial fetch attempt, we still stop "initial loading"
          // so the UI can show an error state instead of being stuck on a loader.
          if (!silent) setIsInitialLoading(false);
        }
      }
    },
    [authUser?.id]
  );

  useEffect(() => {
    if (isAuthLoading) return;

    // signed out
    if (!isSignedIn) {
      setBoot(null);
      setError(null);
      setIsInitialLoading(false);
      setIsRefreshing(false);
      return;
    }

    // show cached boot immediately if available
    const cached = readBootCache(authUser.id);
    if (cached) {
      setBoot(cached);
      setIsInitialLoading(false);
      // refresh in the background (no full-screen loading)
      refresh({ silent: true });
    } else {
      // no cache: show initial loading until first bootstrap completes
      setIsInitialLoading(true);
      refresh({ silent: false });
    }
  }, [isAuthLoading, isSignedIn, authUser?.id, refresh]);

  // -------------------------
  // Normalize backend shapes
  // -------------------------
  const user = boot?.user ?? null;

  // Some backends return catalog as { habits: [...] } vs just [...]
  const catalog = useMemo(() => {
    const c = boot?.catalog;
    if (!c) return [];
    if (Array.isArray(c)) return c;
    if (Array.isArray(c?.habits)) return c.habits;
    return [];
  }, [boot]);

  const catalogById = useMemo(() => {
    const m = new Map();
    for (const item of catalog) {
      if (item?.id) m.set(item.id, item);
    }
    return m;
  }, [catalog]);

  // flux normalization: { byHabit: [] } vs { ByHabit: [] }
  const fluxByHabit = useMemo(() => {
    const f = boot?.flux;
    const arr = f?.byHabit ?? f?.ByHabit ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [boot]);

  const fluxPortfolio = boot?.flux?.portfolio ?? boot?.flux?.Portfolio ?? null;

  // totals/stats normalization
  const totalsMicros =
    boot?.totals ??
    boot?.Totals ??
    { earnedMicros: 0, transferredMicros: 0, pendingMicros: 0 };

  const statsMicros =
    boot?.stats ??
    boot?.Stats ??
    { todayEarnedMicros: 0, weekEarnedMicros: 0 };

  // -------------------------
  // Canonical server-backed arrays
  // -------------------------
  const habits = useMemo(() => {
    const hs = boot?.habits || boot?.Habits || [];
    return (hs || []).map((h) => {
      const c = catalogById.get(h.libraryId);

      const rateOptionsMicros = c?.rateOptionsMicros ?? c?.RateOptionsMicros ?? [];
      const rateOptions = Array.isArray(rateOptionsMicros)
        ? rateOptionsMicros.map(microsToDollars)
        : [];

      return {
        ...h,

        // Enrichment from BACKEND catalog (no HABIT_LIBRARY)
        name: c?.name ?? h.libraryId,
        ticker: c?.ticker ?? "",
        description: c?.description ?? "",
        icon: c?.icon ?? "✅",
        unit: c?.unit ?? "",
        unitPlural: c?.unitPlural ?? "",
        actionType: c?.actionType ?? "log",
        rateType: c?.rateType ?? h.rateType,

        // convenience for UI
        rate: microsToDollars(h.rateMicros),
        rateOptions,
        createdAt: msToISO(h.createdAtMs),
      };
    });
  }, [boot, catalogById]);

  const logs = useMemo(() => {
    const ls = boot?.logs || boot?.Logs || [];
    return (ls || []).map((l) => ({
      ...l,
      timestamp: msToISO(l.timestampMs),
      dayKey: dayKeyFromMs(l.timestampMs),
      totalEarnings: microsToDollars(l.earningsMicros),
    }));
  }, [boot]);

  const transfers = useMemo(() => {
    const ts = boot?.transfers || boot?.Transfers || [];
    return (ts || []).map((t) => ({
      ...t,
      date: msToISO(t.timestampMs),
      amount: microsToDollars(t.amountMicros),
    }));
  }, [boot]);

  // -------------------------
  // Selectors / legacy compatibility
  // -------------------------
  const getWeekEarnings = useCallback(() => microsToDollars(statsMicros.weekEarnedMicros), [
    statsMicros.weekEarnedMicros,
  ]);

  const getTodayEarnings = useCallback(() => microsToDollars(statsMicros.todayEarnedMicros), [
    statsMicros.todayEarnedMicros,
  ]);

  const getTransferredBalance = useCallback(
    () => microsToDollars(totalsMicros.transferredMicros),
    [totalsMicros.transferredMicros]
  );

  const getPendingBalance = useCallback(
    () => microsToDollars(totalsMicros.pendingMicros),
    [totalsMicros.pendingMicros]
  );

  const isHabitLoggedOnDate = useCallback(
    (habitId, date) => {
      const key = dayKeyFromDate(date);
      return (logs || []).some((l) => l?.habitId === habitId && l?.dayKey === key);
    },
    [logs]
  );

  const calculateFluxScore = useCallback(
    (habitId) =>
      (fluxByHabit || []).find((x) => x?.habitId === habitId || x?.HabitID === habitId) ?? null,
    [fluxByHabit]
  );

  const isHabitAdded = useCallback(
    (libraryId) => (boot?.habits || boot?.Habits || []).some((h) => h.libraryId === libraryId),
    [boot]
  );

  // -------------------------
  // Mutations (server source of truth)
  // -------------------------
  const addHabit = useCallback(
    async (habitConfig) => {
      const libraryId = habitConfig?.libraryId;
      const goal = habitConfig?.goal;

      if (!libraryId) throw new Error("libraryId is required");
      if (!goal?.amount || !goal?.period) throw new Error("Goal is required");

      const c = catalogById.get(libraryId);
      if (!c) throw new Error(`Catalog item not found for libraryId: ${libraryId}`);

      const rateMicros =
        habitConfig?.rateMicros ??
        (habitConfig?.rate != null ? dollarsToMicros(habitConfig.rate) : null) ??
        c.defaultRateMicros ??
        0;

      const payload = {
        libraryId,
        // backend should override/ignore this, but safe during migration
        rateType: c.rateType,
        rateMicros: Number(rateMicros),
        goal: { amount: goal.amount, period: goal.period },
      };

      const nextBoot = await habitsApi.create(payload); // returns Bootstrap
      setBoot(nextBoot);
      if (authUser?.id) writeBootCache(authUser.id, nextBoot);
      return nextBoot;
    },
    [catalogById, authUser?.id]
  );

  const addHabits = useCallback(
    async (habitConfigs) => {
      for (const cfg of habitConfigs || []) {
        // eslint-disable-next-line no-await-in-loop
        await addHabit(cfg);
      }
      return true;
    },
    [addHabit]
  );

  const addLog = useCallback(
    async (logData) => {
      const payload = {
        habitId: logData.habitId,
        units: logData.units ?? 1,
        notes: logData.notes || "",
      };

      // NOTE: Ideally remove custom earnings entirely (server computes).
      if (logData.customEarningsMicros != null) {
        payload.customEarningsMicros = Number(logData.customEarningsMicros);
      } else if (logData.customEarnings != null) {
        payload.customEarningsMicros = dollarsToMicros(logData.customEarnings);
      }

      const nextBoot = await logsApi.create(payload); // returns Bootstrap
      setBoot(nextBoot);
      if (authUser?.id) writeBootCache(authUser.id, nextBoot);
      return nextBoot;
    },
    [authUser?.id]
  );

  const processTransfer = useCallback(async () => {
    const nextBoot = await transfersApi.create(); // returns Bootstrap
    setBoot(nextBoot);
    if (authUser?.id) writeBootCache(authUser.id, nextBoot);
    return nextBoot;
  }, [authUser?.id]);

  const updateUser = useCallback(
    async (patch) => {
      const nextUser = await usersApi.patchMe(patch);
      setBoot((prev) => (prev ? { ...prev, user: nextUser } : prev));

      if (authUser?.id) {
        const cached = readBootCache(authUser.id);
        if (cached) writeBootCache(authUser.id, { ...cached, user: nextUser });
      }
      return nextUser;
    },
    [authUser?.id]
  );

  const completeOnboarding = useCallback(async () => {
    const nextUser = await usersApi.completeOnboarding();
    setBoot((prev) => (prev ? { ...prev, user: nextUser } : prev));

    if (authUser?.id) {
      const cached = readBootCache(authUser.id);
      if (cached) writeBootCache(authUser.id, { ...cached, user: nextUser });
    }
    return nextUser;
  }, [authUser?.id]);

  const clearCache = useCallback(() => {
    if (authUser?.id) clearBootCache(authUser.id);
  }, [authUser?.id]);

  // Provide a legacy flag while shifting consumers gradually:
  // - isLoading: only the initial blocking loader
  const isLoading = isInitialLoading;

  const value = {
    // raw
    boot,

    // canonical (server-backed)
    user,
    catalog,
    catalogById,
    habits,
    logs,
    transfers,
    totalsMicros,
    statsMicros,
    flux: { byHabit: fluxByHabit, portfolio: fluxPortfolio },

    // state
    isLoading, // initial-only (prevents full-screen “Loading…” flashes)
    isRefreshing, // background refresh indicator if you want it
    error,

    // actions
    refresh,
    addHabit,
    addHabits,
    addLog,
    processTransfer,
    updateUser,
    completeOnboarding,

    // selectors / legacy compatibility
    isHabitAdded,
    getWeekEarnings,
    getTodayEarnings,
    getTransferredBalance,
    getPendingBalance,
    isHabitLoggedOnDate,
    calculateFluxScore,

    // dev
    clearCache,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}
