import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import HabitContext from "@/context/HabitContext";
import { useAuth } from "@/context/AuthContext";
import {
  bootstrapApi,
  habitsApi,
  logsApi,
  transfersApi,
  usersApi,
} from "@/api/fluxApi";

// UI helpers (still fine)
function microsToDollars(micros) {
  return Number(micros || 0) / 1_000_000;
}
function msToISO(ms) {
  if (!ms) return null;
  return new Date(Number(ms)).toISOString();
}

// Optional cache (perf only)
const BOOT_CACHE_VERSION = "v3";
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
  } catch {}
}
function clearBootCache(userId) {
  try {
    localStorage.removeItem(cacheKeyForUser(userId));
  } catch {}
}

export function HabitProvider({ children }) {
  const { session, user: authUser, isAuthLoading } = useAuth();

  const [boot, setBoot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestSeq = useRef(0);

  const refresh = useCallback(async () => {
    if (!session?.access_token) return null;

    const seq = ++requestSeq.current;
    setIsLoading(true);
    setError(null);

    try {
      const raw = await bootstrapApi.get(); // GET /api/bootstrap (authoritative)
      if (seq !== requestSeq.current) return null;

      setBoot(raw);
      if (authUser?.id) writeBootCache(authUser.id, raw);
      return raw;
    } catch (e) {
      if (seq !== requestSeq.current) return null;
      setError(e);
      return null;
    } finally {
      if (seq === requestSeq.current) setIsLoading(false);
    }
  }, [session?.access_token, authUser?.id]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!session || !authUser?.id) {
      setBoot(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const cached = readBootCache(authUser.id);
    if (cached) {
      setBoot(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    refresh();
  }, [isAuthLoading, session, authUser?.id, refresh]);

  // -------------------------
  // Canonical server-backed data
  // -------------------------
  const user = boot?.user ?? null;

  // NEW: catalog comes from backend bootstrap
  const catalog = boot?.catalog ?? [];

  const catalogById = useMemo(() => {
    const m = new Map();
    for (const c of catalog) m.set(c.id, c);
    return m;
  }, [catalog]);

  const habits = useMemo(() => {
    const hs = boot?.habits || [];
    return hs.map((h) => {
      const c = catalogById.get(h.libraryId);

      return {
        ...h,

        // Enrichment from BACKEND catalog, not FE file
        name: c?.name || h.libraryId,
        ticker: c?.ticker || "",
        description: c?.description || "",
        icon: c?.icon || "✅",
        unit: c?.unit || "",
        unitPlural: c?.unitPlural || "",
        actionType: c?.actionType || "log",

        // convenience
        rate: microsToDollars(h.rateMicros),
        createdAt: msToISO(h.createdAtMs),
      };
    });
  }, [boot, catalogById]);

  const logs = useMemo(() => {
    const ls = boot?.logs || [];
    return ls.map((l) => ({
      ...l,
      timestamp: msToISO(l.timestampMs),
      totalEarnings: microsToDollars(l.earningsMicros),
    }));
  }, [boot]);

  const transfers = useMemo(() => {
    const ts = boot?.transfers || [];
    return ts.map((t) => ({
      ...t,
      date: msToISO(t.timestampMs),
      amount: microsToDollars(t.amountMicros),
    }));
  }, [boot]);

  const totalsMicros =
    boot?.totals ?? { earnedMicros: 0, transferredMicros: 0, pendingMicros: 0 };
  const statsMicros =
    boot?.stats ?? { todayEarnedMicros: 0, weekEarnedMicros: 0 };
  const flux = boot?.flux ?? { byHabit: [], portfolio: null };

  // Useful selector (used by AddHabitFlow)
  const isHabitAdded = useCallback(
    (libraryId) => (boot?.habits || []).some((h) => h.libraryId === libraryId),
    [boot]
  );

  // -------------------------
  // Mutations (server source of truth)
  // -------------------------

  // IMPORTANT CHANGE:
  // We no longer look up lib in FE; we use backend catalog to determine rateType/defaults.
  const addHabit = useCallback(
    async (habitConfig) => {
      const libraryId = habitConfig?.libraryId;
      const goal = habitConfig?.goal;

      if (!libraryId) throw new Error("libraryId is required");
      if (!goal?.amount || !goal?.period) throw new Error("Goal is required");

      const c = catalogById.get(libraryId);
      if (!c) throw new Error(`Catalog item not found for libraryId: ${libraryId}`);

      // Prefer micros from UI; else fall back to catalog default
      const rateMicros =
        habitConfig?.rateMicros ??
        (habitConfig?.rate != null ? Math.round(Number(habitConfig.rate) * 1_000_000) : null) ??
        c.defaultRateMicros ??
        0;

      const payload = {
        libraryId,
        rateType: c.rateType, // <-- backend-controlled
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
        // sequential by design (can be replaced by backend bulk endpoint later)
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

      // Prefer micros; allow dollars fallback for older callers
      if (logData.customEarningsMicros != null) {
        payload.customEarningsMicros = Number(logData.customEarningsMicros);
      } else if (logData.customEarnings != null) {
        payload.customEarningsMicros = Math.round(Number(logData.customEarnings) * 1_000_000);
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

      // keep cache in sync too
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

  const value = {
    boot,

    // canonical
    user,
    catalog,
    habits,
    logs,
    transfers,
    totalsMicros,
    statsMicros,
    flux,

    // state
    isLoading,
    error,

    // actions
    refresh,
    addHabit,
    addHabits,
    addLog,
    processTransfer,
    updateUser,
    completeOnboarding,

    // selectors
    isHabitAdded,

    // dev
    clearCache,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}