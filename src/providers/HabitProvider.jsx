// src/providers/HabitProvider.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import HabitContext from "@/context/HabitContext";
import { useAuth } from "@/context/AuthContext";
import { bootstrapApi, habitsApi, logsApi, transfersApi, usersApi } from "@/api/fluxApi";

import {
  microsToDollars,
  dollarsToMicros,
  microsToUnits,
  unitsToMicros,
  formatUSDFromMicros,
  formatRateFromMicros,
  isBinaryRateType,
} from "@/utils/micros";

/**
 * ============================================================
 * STRICT MICROS CONTRACT (LET LEGACY BURN)
 * ============================================================
 * Assumptions:
 * - Backend is the source of truth.
 * - Backend ALWAYS sends micros fields (money + units + rates).
 * - Frontend converts micros -> display ONLY.
 * - If a required micros field is missing or malformed, we THROW.
 * 
 * Backend models (JSON tags) expected:
 *
 * Bootstrap:
 * - user
 * - habits[]: { id, libraryId, rateMicros, goal: {amount, period, setAtMs}, createdAtMs }
 * - logs[]: { id, habitId, timestampMs, unitsMicros, notes?, earningsMicros? }
 * - transfers[]: { id, userId, habitId, timestampMs, amountMicros, status, weekKey, logId? }
 * - totals: { pendingMicros, completedMicros, earnedMicros }
 * - stats:  { todayMicros, weekMicros }
 * - flux:   { byHabit: [...], portfolio: {...} }
 * - habitTotals[]: { userId, habitId, pendingMicros, completedMicros, earnedMicros, updatedAtMs }
 * - catalog: { habits: [...] }
 *
 * If required micros fields are missing/malformed => THROW
 */

// -------------------------
// tiny helpers
// -------------------------
function msToISO(ms) {
  if (ms == null) return null;
  const d = new Date(Number(ms));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function dayKeyFromMs(ms) {
  if (ms == null) return "";
  return new Date(Number(ms)).toDateString();
}
function dayKeyFromDate(d) {
  return new Date(d).toDateString();
}

// Strict asserts
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function assertString(v, label) {
  const s = String(v ?? "").trim();
  assert(s.length > 0, `${label} is required`);
  return s;
}
function assertArray(v, label) {
  assert(Array.isArray(v), `${label} must be an array`);
  return v;
}
function assertInt(v, label) {
  assert(v !== undefined && v !== null, `${label} is required`);
  const n = typeof v === "number" ? v : Number(v);
  assert(Number.isFinite(n), `${label} must be a finite number`);
  return Math.trunc(n);
}
function assertMicrosInt(v, label) {
  // same as assertInt but clearer error messages for contract
  return assertInt(v, `${label} (micros)`);
}
function toKey(v) {
  // uuid objects sometimes arrive as strings already; normalize to string
  if (v == null) return null;
  const s = String(v);
  return s.trim() ? s : null;
}

// -------------------------
// Optional cache (perf only)
// -------------------------
const BOOT_CACHE_VERSION = "v10-micros-strict-modelsgo";
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

// -------------------------
// Catalog validation (strict, matches Go JSON tags)
// -------------------------
function assertCatalogHabitShape(c, idx = 0) {
  assert(c && typeof c === "object", `catalog.habits[${idx}] missing (expected object)`);

  const id = assertString(c.id, `catalog.habits[${idx}].id`);
  assertString(c.name, `catalog.habits[${id}].name`);

  // These can be empty strings, but should exist
  assert(c.ticker !== undefined, `catalog.habits[${id}].ticker is required (can be empty)`);
  assert(c.description !== undefined, `catalog.habits[${id}].description is required (can be empty)`);

  assertString(c.actionType, `catalog.habits[${id}].actionType`);
  assertString(c.rateType, `catalog.habits[${id}].rateType`);

  // micros options
  assertMicrosInt(c.defaultRateMicros, `catalog.habits[${id}].defaultRateMicros`);
  const opts = assertArray(c.rateOptionsMicros, `catalog.habits[${id}].rateOptionsMicros`);
  for (let i = 0; i < opts.length; i++) {
    assertMicrosInt(opts[i], `catalog.habits[${id}].rateOptionsMicros[${i}]`);
  }

  // unit fields should exist (can be empty for BINARY)
  assert(c.unit !== undefined, `catalog.habits[${id}].unit is required (can be empty)`);
  assert(c.unitPlural !== undefined, `catalog.habits[${id}].unitPlural is required (can be empty)`);

  assertString(c.goalUnit, `catalog.habits[${id}].goalUnit`);
  assertString(c.defaultGoalPeriod, `catalog.habits[${id}].defaultGoalPeriod`);

  if (c.suggestedGoals != null) {
    assertArray(c.suggestedGoals, `catalog.habits[${id}].suggestedGoals`);
  }

  return c;
}

export function HabitProvider({ children }) {
  const { user: authUser, isAuthLoading } = useAuth();

  const [boot, setBoot] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const requestSeq = useRef(0);
  const isSignedIn = !!authUser?.id;

  // -------------------------
  // Bootstrap fetch
  // -------------------------
  const refresh = useCallback(
    async ({ silent = true } = {}) => {
      assert(authUser?.id, "refresh called without authUser.id");

      const seq = ++requestSeq.current;

      if (silent) setIsRefreshing(true);
      else setIsInitialLoading(true);

      setError(null);

      try {
        const raw = await bootstrapApi.get(); // MUST match models.go
        if (seq !== requestSeq.current) return null;

        setBoot(raw);
        writeBootCache(authUser.id, raw);

        setIsInitialLoading(false);
        return raw;
      } catch (e) {
        if (seq !== requestSeq.current) return null;
        setError(e);
        return null;
      } finally {
        if (seq === requestSeq.current) {
          setIsRefreshing(false);
          if (!silent) setIsInitialLoading(false);
        }
      }
    },
    [authUser?.id]
  );

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isSignedIn) {
      setBoot(null);
      setError(null);
      setIsInitialLoading(false);
      setIsRefreshing(false);
      return;
    }

    const cached = readBootCache(authUser.id);
    if (cached) {
      setBoot(cached);
      setIsInitialLoading(false);
      refresh({ silent: true });
    } else {
      setIsInitialLoading(true);
      refresh({ silent: false });
    }
  }, [isAuthLoading, isSignedIn, authUser?.id, refresh]);

  // -------------------------
  // STRICT contract surface
  // -------------------------

  const user = useMemo(() => {
    if (!boot) return null;
    assert(boot.user, "boot.user is required");
    return boot.user;
  }, [boot]);

  // Catalog (strict)
  const catalogHabits = useMemo(() => {
    if (!boot) return [];
    assert(boot.catalog, "boot.catalog is required");
    const list = boot.catalog.habits;
    assertArray(list, "boot.catalog.habits");

    for (let i = 0; i < list.length; i++) assertCatalogHabitShape(list[i], i);
    return list;
  }, [boot]);

  const catalogById = useMemo(() => {
    const m = new Map();
    for (const c of catalogHabits) m.set(c.id, c);
    return m;
  }, [catalogHabits]);

  const getCatalogHabit = useCallback(
    (libraryId) => {
      const id = String(libraryId ?? "").trim();
      if (!id) return null;
      return catalogById.get(id) ?? null;
    },
    [catalogById]
  );

  // Totals (strict)
  const totals = useMemo(() => {
    if (!boot) return null;
    assert(boot.totals, "boot.totals is required");
    return {
      pendingMicros: assertMicrosInt(boot.totals.pendingMicros, "totals.pendingMicros"),
      completedMicros: assertMicrosInt(boot.totals.completedMicros, "totals.completedMicros"),
      earnedMicros: assertMicrosInt(boot.totals.earnedMicros, "totals.earnedMicros"),
    };
  }, [boot]);

  // Stats (strict)
  const stats = useMemo(() => {
    if (!boot) return null;
    assert(boot.stats, "boot.stats is required");
    return {
      todayMicros: assertMicrosInt(boot.stats.todayMicros, "stats.todayMicros"),
      weekMicros: assertMicrosInt(boot.stats.weekMicros, "stats.weekMicros"),
    };
  }, [boot]);

  // UI-friendly derived totals/stats (dollars)
  const totalsUI = useMemo(() => {
    if (!totals) return null;
    return {
      ...totals,
      pending: microsToDollars(totals.pendingMicros),
      completed: microsToDollars(totals.completedMicros),
      earned: microsToDollars(totals.earnedMicros),
    };
  }, [totals]);

  const statsUI = useMemo(() => {
    if (!stats) return null;
    return {
      ...stats,
      today: microsToDollars(stats.todayMicros),
      week: microsToDollars(stats.weekMicros),
    };
  }, [stats]);

  // HabitTotals (strict-ish)
  const habitTotals = useMemo(() => {
    if (!boot) return [];
    const list = boot.habitTotals;
    assertArray(list, "boot.habitTotals");
    return list.map((ht, i) => ({
      ...ht,
      pendingMicros: assertMicrosInt(ht.pendingMicros, `habitTotals[${i}].pendingMicros`),
      completedMicros: assertMicrosInt(ht.completedMicros, `habitTotals[${i}].completedMicros`),
      earnedMicros: assertMicrosInt(ht.earnedMicros, `habitTotals[${i}].earnedMicros`),
      updatedAtMs: assertInt(ht.updatedAtMs, `habitTotals[${i}].updatedAtMs`),
    }));
  }, [boot]);

  // Transfers (strict)
  const transfers = useMemo(() => {
    if (!boot) return [];
    const list = boot.transfers;
    assertArray(list, "boot.transfers");

    return list.map((t, i) => {
      const amountMicros = assertMicrosInt(t.amountMicros, `transfers[${i}].amountMicros`);
      assertInt(t.timestampMs, `transfers[${i}].timestampMs`);
      assertString(t.status, `transfers[${i}].status`);
      assertString(t.weekKey, `transfers[${i}].weekKey`);

      return {
        ...t,
        amountMicros,
        amount: microsToDollars(amountMicros), // display only
        date: msToISO(t.timestampMs),
      };
    });
  }, [boot]);

  const transferByLogId = useMemo(() => {
    const m = new Map();
    for (const t of transfers) {
      const key = toKey(t?.logId);
      if (key) m.set(key, t);
    }
    return m;
  }, [transfers]);

  // Logs (strict)
  const logs = useMemo(() => {
    if (!boot) return [];
    const list = boot.logs;
    assertArray(list, "boot.logs");

    return list.map((l, i) => {
      assert(l.id, `logs[${i}].id is required`);
      assert(l.habitId, `logs[${i}].habitId is required`);
      const unitsMicros = assertMicrosInt(l.unitsMicros, `logs[${i}].unitsMicros`);
      assertInt(l.timestampMs, `logs[${i}].timestampMs`);

      const t = transferByLogId.get(toKey(l.id));

      return {
        ...l,
        unitsMicros,
        units: microsToUnits(unitsMicros), // display only
        timestamp: msToISO(l.timestampMs),
        dayKey: dayKeyFromMs(l.timestampMs),

        // transfer enrichment (money is canonical on transfers)
        amountMicros: t ? t.amountMicros : 0,
        amount: t ? microsToDollars(t.amountMicros) : 0,
        transferStatus: t ? t.status : null,

        // optional server convenience
        earningsMicros:
          l.earningsMicros !== undefined && l.earningsMicros !== null
            ? assertMicrosInt(l.earningsMicros, `logs[${i}].earningsMicros`)
            : undefined,
      };
    });
  }, [boot, transferByLogId]);

  // Habits (strict + catalog enrichment)
  const habits = useMemo(() => {
    if (!boot) return [];
    const list = boot.habits;
    assertArray(list, "boot.habits");

    return list.map((h, i) => {
      assert(h.id, `habits[${i}].id is required`);
      const libraryId = assertString(h.libraryId, `habits[${i}].libraryId`);
      const c = catalogById.get(libraryId);
      assert(c, `habits[${i}] refers to unknown catalog libraryId=${libraryId}`);

      const rateMicros = assertMicrosInt(h.rateMicros, `habits[${h.id}].rateMicros`);
      assertInt(h.createdAtMs, `habits[${h.id}].createdAtMs`);

      // goal strict
      assert(h.goal && typeof h.goal === "object", `habits[${h.id}].goal is required`);
      const goalAmount = Number(h.goal.amount);
      assert(Number.isFinite(goalAmount) && goalAmount > 0, `habits[${h.id}].goal.amount must be > 0`);
      const goalPeriod = assertString(h.goal.period, `habits[${h.id}].goal.period`);
      // setAtMs exists in Go model; allow missing if older rows exist, but validate if present
      const goalSetAtMs =
        h.goal.setAtMs != null ? assertInt(h.goal.setAtMs, `habits[${h.id}].goal.setAtMs`) : null;

      const unitLabel = c.unit || null;
      const rateText = formatRateFromMicros(rateMicros, unitLabel, { precision: "auto" });

      return {
        ...h,
        libraryId,
        rateMicros,
        createdAt: msToISO(h.createdAtMs),

        goal: {
          amount: goalAmount,
          period: goalPeriod,
          setAtMs: goalSetAtMs,
        },

        // UI-only derived
        rate: microsToDollars(rateMicros),
        rateText,

        // catalog enrichment
        name: c.name,
        ticker: c.ticker,
        description: c.description,
        actionType: c.actionType,
        rateType: c.rateType,
        unit: c.unit,
        unitPlural: c.unitPlural,
        goalUnit: c.goalUnit,
        defaultGoalPeriod: c.defaultGoalPeriod,
        suggestedGoals: c.suggestedGoals,

        // catalog micros options
        defaultRateMicros: assertMicrosInt(c.defaultRateMicros, `catalog.habits[${c.id}].defaultRateMicros`),
        rateOptionsMicros: c.rateOptionsMicros.map((x, j) =>
          assertMicrosInt(x, `catalog.habits[${c.id}].rateOptionsMicros[${j}]`)
        ),

        // optional derived display
        defaultRate: microsToDollars(assertMicrosInt(c.defaultRateMicros, `catalog.habits[${c.id}].defaultRateMicros`)),
        rateOptions: c.rateOptionsMicros.map((m) =>
          microsToDollars(assertMicrosInt(m, `catalog.habits[${c.id}].rateOptionsMicros[*]`))
        ),
      };
    });
  }, [boot, catalogById]);

  // Flux (strict presence)
  const flux = useMemo(() => {
    if (!boot) return { byHabit: [], portfolio: null };
    assert(boot.flux, "boot.flux is required");
    assertArray(boot.flux.byHabit, "boot.flux.byHabit");
    assert(boot.flux.portfolio !== undefined, "boot.flux.portfolio is required");
    return boot.flux;
  }, [boot]);

  // -------------------------
  // Selectors
  // -------------------------
  const getWeekEarnings = useCallback(() => Number(statsUI?.week ?? 0), [statsUI?.week]);
  const getTodayEarnings = useCallback(() => Number(statsUI?.today ?? 0), [statsUI?.today]);

  const getTransferredBalance = useCallback(() => Number(totalsUI?.completed ?? 0), [totalsUI?.completed]);
  const getPendingBalance = useCallback(() => Number(totalsUI?.pending ?? 0), [totalsUI?.pending]);

  const isHabitLoggedOnDate = useCallback(
    (habitId, date) => {
      const key = dayKeyFromDate(date);
      return logs.some((l) => String(l?.habitId) === String(habitId) && l?.dayKey === key);
    },
    [logs]
  );

  const calculateFluxScore = useCallback(
    (habitId) => (flux.byHabit ?? []).find((x) => String(x?.habitId) === String(habitId)) ?? null,
    [flux.byHabit]
  );

  const isHabitAdded = useCallback(
    (libraryId) => {
      const id = assertString(libraryId, "libraryId");
      assert(boot, "boot is required");
      return boot.habits.some((h) => h.libraryId === id);
    },
    [boot]
  );

  // -------------------------
  // Mutations (STRICT micros)
  // -------------------------
  const addHabit = useCallback(
    async (habitConfig) => {
      assert(boot, "addHabit called before boot loaded");

      const libraryId = assertString(habitConfig?.libraryId, "libraryId");

      // goal required
      assert(habitConfig?.goal, "goal is required");
      const goalAmt = Number(habitConfig.goal.amount);
      assert(Number.isFinite(goalAmt) && goalAmt > 0, "goal.amount must be a positive number");
      const goalPeriod = assertString(habitConfig.goal.period, "goal.period");

      // rateMicros required
      const rateMicros = assertMicrosInt(habitConfig?.rateMicros, "rateMicros");

      // sanity check against catalog
      const c = getCatalogHabit(libraryId);
      assert(c, `Unknown libraryId=${libraryId} (not found in catalog)`);

      // matches models.HabitCreate
      const payload = {
        libraryId,
        rateMicros,
        goal: { amount: goalAmt, period: goalPeriod },
      };

      const nextBoot = await habitsApi.create(payload); // returns Bootstrap
      setBoot(nextBoot);
      if (authUser?.id) writeBootCache(authUser.id, nextBoot);
      return nextBoot;
    },
    [authUser?.id, boot, getCatalogHabit]
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
      assert(boot, "addLog called before boot loaded");

      const habitId = assertString(logData?.habitId, "habitId");
      const unitsMicros = assertMicrosInt(logData?.unitsMicros, "unitsMicros");

      // matches models.LogCreate
      const payload = {
        habitId,
        unitsMicros,
        notes: logData?.notes || "",
        timestampMs: logData?.timestampMs ?? undefined,
      };

      const nextBoot = await logsApi.create(payload); // returns Bootstrap
      setBoot(nextBoot);
      if (authUser?.id) writeBootCache(authUser.id, nextBoot);
      return nextBoot;
    },
    [authUser?.id, boot]
  );

  const processTransfer = useCallback(async () => {
    assert(boot, "processTransfer called before boot loaded");
    const nextBoot = await transfersApi.create(); // returns Bootstrap
    setBoot(nextBoot);
    if (authUser?.id) writeBootCache(authUser.id, nextBoot);
    return nextBoot;
  }, [authUser?.id, boot]);

  const updateUser = useCallback(
    async (patch) => {
      assert(boot, "updateUser called before boot loaded");
      const nextUser = await usersApi.patchMe(patch);

      setBoot((prev) => {
        assert(prev, "boot missing while patching user");
        return { ...prev, user: nextUser };
      });

      if (authUser?.id) {
        const cached = readBootCache(authUser.id);
        if (cached) writeBootCache(authUser.id, { ...cached, user: nextUser });
      }
      return nextUser;
    },
    [authUser?.id, boot]
  );

  const completeOnboarding = useCallback(async () => {
    assert(boot, "completeOnboarding called before boot loaded");
    const nextUser = await usersApi.completeOnboarding();

    setBoot((prev) => {
      assert(prev, "boot missing while completing onboarding");
      return { ...prev, user: nextUser };
    });

    if (authUser?.id) {
      const cached = readBootCache(authUser.id);
      if (cached) writeBootCache(authUser.id, { ...cached, user: nextUser });
    }
    return nextUser;
  }, [authUser?.id, boot]);

  const clearCache = useCallback(() => {
    if (authUser?.id) clearBootCache(authUser.id);
  }, [authUser?.id]);

  // -------------------------
  // Context value
  // -------------------------
  const value = {
    boot,

    user,

    // server truth
    catalog: boot?.catalog ?? null,
    catalogHabits,
    habits,
    logs,
    transfers,
    totals,
    stats,
    flux,
    habitTotals,

    // UI derived (dollars)
    totalsUI,
    statsUI,

    // helpers
    getCatalogHabit,

    // state
    isLoading: isInitialLoading,
    isRefreshing,
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
    getWeekEarnings,
    getTodayEarnings,
    getTransferredBalance,
    getPendingBalance,
    isHabitLoggedOnDate,
    calculateFluxScore,

    // micros utils (optional export)
    microsToDollars,
    dollarsToMicros,
    microsToUnits,
    unitsToMicros,
    formatUSDFromMicros,
    formatRateFromMicros,
    isBinaryRateType,

    // dev
    clearCache,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}
