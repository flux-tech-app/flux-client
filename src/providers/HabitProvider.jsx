// src/providers/HabitProvider.jsx
import { useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import HabitContext from "@/context/HabitContext";
import { useAuth } from "@/context/AuthContext";
import {
  bootstrapApi,
  habitsApi,
  logsApi,
  transfersApi,
  usersApi,
} from "@/api/fluxApi";

import {
  microsToDollars,
  dollarsToMicros,
  microsToUnits,
  unitsToMicros,
  formatUSDFromMicros,
  formatRateFromMicros,
  isBinaryRateType,
} from "@/utils/micros";

function isBootShape(x) {
  return !!x && typeof x === "object" && "habits" in x && "logs" in x && "catalog" in x;
}

/**
 * Toggle debug noise in one place.
 * - default: on in dev, off in prod
 * - you can force on by setting VITE_DEBUG_BOOTSTRAP=true
 */
const DEBUG_BOOTSTRAP =
  (import.meta.env.VITE_DEBUG_BOOTSTRAP ?? "").toLowerCase() === "true" ||
  import.meta.env.DEV === true;

export function HabitProvider({ children }) {
  const { user: authUser, isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const userId = authUser?.id ?? null;
  const bootKey = useMemo(() => ["flux", "bootstrap", userId], [userId]);

  // -------------------------
  // Query: bootstrap
  // -------------------------
  const {
    data: boot,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: bootKey,
    enabled: !!userId && !isAuthLoading,
    queryFn: async () => bootstrapApi.get(),
    // tune these as you like:
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const refresh = useCallback(async () => {
    const res = await refetch();
    return res.data ?? null;
  }, [refetch]);

  const setBoot = useCallback(
    (nextBoot) => {
      queryClient.setQueryData(bootKey, nextBoot);
    },
    [queryClient, bootKey]
  );

  // -------------------------
  // Server truth (NO reshaping)
  // -------------------------
  const user = boot?.user ?? null;

  const catalog = boot?.catalog ?? null;
  const catalogHabits = boot?.catalog?.habits ?? [];

  const habits = boot?.habits ?? [];
  const logs = boot?.logs ?? [];
  const transfers = boot?.transfers ?? [];

  const totals = boot?.totals ?? null;
  const stats = boot?.stats ?? null;

  // NOTE: your server returns Flux.ByHabit, but older UI code used "byHabit" lower-case.
  // Keep the raw object but ensure selector uses either shape.
  const flux = boot?.flux ?? { byHabit: [], portfolio: null };

  const habitTotals = boot?.habitTotals ?? [];

  // -------------------------
  // Debuggers (bootstrap visibility + join sanity checks)
  // -------------------------
  useEffect(() => {
    if (!DEBUG_BOOTSTRAP) return;
    if (!boot) return;

    // Basic payload visibility
    console.groupCollapsed("[flux] bootstrap received");
    try {
      console.debug("userId(auth)", userId);
      console.debug("boot.user.id", boot?.user?.id ?? null);
      console.debug("counts", {
        catalogHabits: catalogHabits.length,
        habits: habits.length,
        logs: logs.length,
        transfers: transfers.length,
        habitTotals: habitTotals.length,
      });
      console.debug("boot.stats", boot?.stats ?? null);
      console.debug("boot.totals", boot?.totals ?? null);
      console.debug("boot.flux keys", boot?.flux ? Object.keys(boot.flux) : null);

      // One sample of each
      console.debug("sample.habit", habits[0] ?? null);
      console.debug("sample.log", logs[0] ?? null);
      console.debug("sample.transfer", transfers[0] ?? null);
      console.debug("sample.catalogHabit", catalogHabits[0] ?? null);

      // Critical sanity check: do transfer.habitId values match habit.id values?
      const habitIds = new Set(habits.map((h) => String(h?.id)));
      const transferHabitIds = transfers
        .map((t) => t?.habitId)
        .filter(Boolean)
        .map((hid) => String(hid));

      const unmatched = transferHabitIds.filter((hid) => !habitIds.has(hid));
      const matchedCount = transferHabitIds.length - unmatched.length;

      console.debug("transfer habitId join check", {
        transferHabitIds: transferHabitIds.length,
        matchedCount,
        unmatchedCount: unmatched.length,
        unmatchedSample: unmatched.slice(0, 5),
      });

      // Also check habit.catalogId -> catalog.habits.id join
      const catalogIds = new Set(catalogHabits.map((c) => String(c?.id)));
      const habitCatalogIds = habits.map((h) => String(h?.catalogId)).filter(Boolean);
      const missingCatalog = habitCatalogIds.filter((cid) => !catalogIds.has(cid));
      console.debug("habit catalogId join check", {
        habitCatalogIds: habitCatalogIds.length,
        missingCatalogCount: missingCatalog.length,
        missingCatalogSample: missingCatalog.slice(0, 5),
      });

      // Debug: if "today earnings" is expected, show today's transfers by habitId
      // (This does NOT change behavior—just prints what exists.)
      const startOfTodayLocal = new Date();
      startOfTodayLocal.setHours(0, 0, 0, 0);
      const startMs = startOfTodayLocal.getTime();
      const endMs = startMs + 24 * 60 * 60 * 1000;

      const todaysTransfers = transfers.filter((t) => {
        const ms = Number(t?.timestampMs ?? 0);
        return ms >= startMs && ms < endMs;
      });

      const byHabit = new Map();
      for (const t of todaysTransfers) {
        const hid = t?.habitId ? String(t.habitId) : "(nil)";
        const amt = Number(t?.amountMicros ?? 0);
        byHabit.set(hid, (byHabit.get(hid) ?? 0) + amt);
      }

      console.debug("local-today transfers", {
        startOfTodayLocal: startOfTodayLocal.toString(),
        todaysTransfersCount: todaysTransfers.length,
        totalsByHabitId: Array.from(byHabit.entries()),
      });
    } finally {
      console.groupEnd();
    }
  }, [
    DEBUG_BOOTSTRAP,
    boot,
    userId,
    catalogHabits,
    habits,
    logs,
    transfers,
    habitTotals,
  ]);

  // -------------------------
  // UI-only derived
  // -------------------------
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

  // -------------------------
  // Helpers / selectors (lightweight)
  // -------------------------
  const getCatalogHabit = useCallback(
    (catalogId) => {
      if (!catalogId) return null;
      return catalogHabits.find((c) => String(c?.id) === String(catalogId)) ?? null;
    },
    [catalogHabits]
  );

  const isHabitAdded = useCallback(
    (catalogId) => {
      if (!catalogId) return false;
      return habits.some((h) => String(h?.catalogId) === String(catalogId));
    },
    [habits]
  );

  const calculateFluxScore = useCallback(
    (habitId) => {
      if (!habitId) return null;

      // Support either "ByHabit" (server struct tag) or legacy "byHabit"
      const list = boot?.flux?.byHabit ?? boot?.flux?.ByHabit ?? flux?.byHabit ?? flux?.ByHabit ?? [];
      return list.find((x) => String(x?.habitId) === String(habitId)) ?? null;
    },
    [boot, flux]
  );

  const isHabitLoggedOnDate = useCallback(
    (habitId, date) => {
      if (!habitId || !date) return false;
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);

      return logs.some((l) => {
        if (String(l?.habitId) !== String(habitId)) return false;
        const ms = l?.timestampMs ?? null;
        if (ms == null) return false;
        const d = new Date(Number(ms));
        d.setHours(0, 0, 0, 0);
        return d.getTime() === target.getTime();
      });
    },
    [logs]
  );

  const getWeekEarnings = useCallback(() => Number(statsUI?.week ?? 0), [statsUI]);
  const getTodayEarnings = useCallback(() => Number(statsUI?.today ?? 0), [statsUI]);
  const getTransferredBalance = useCallback(() => Number(totalsUI?.completed ?? 0), [totalsUI]);
  const getPendingBalance = useCallback(() => Number(totalsUI?.pending ?? 0), [totalsUI]);

  // -------------------------
  // Mutations
  // NOTE: if an endpoint returns Bootstrap -> setBoot(nextBoot)
  //       if it returns only user -> patch boot.user
  // -------------------------
  const addHabitMutation = useMutation({
    mutationFn: async (payload) => habitsApi.create(payload),
    onSuccess: (data) => {
      if (isBootShape(data)) setBoot(data);
      else queryClient.invalidateQueries({ queryKey: bootKey });
    },
  });

  const createCustomHabitMutation = useMutation({
    mutationFn: async (payload) => habitsApi.createCustom(payload),
    onSuccess: (data) => {
      if (isBootShape(data)) setBoot(data);
      else queryClient.invalidateQueries({ queryKey: bootKey });
    },
  });

  const addLogMutation = useMutation({
    mutationFn: async (payload) => logsApi.create(payload),
    onSuccess: (data) => {
      if (isBootShape(data)) setBoot(data);
      else queryClient.invalidateQueries({ queryKey: bootKey });
    },
  });

  const processTransferMutation = useMutation({
    mutationFn: async () => transfersApi.create(),
    onSuccess: (data) => {
      if (isBootShape(data)) setBoot(data);
      else queryClient.invalidateQueries({ queryKey: bootKey });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (patch) => usersApi.patchMe(patch),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(bootKey, (prev) => {
        const p = /** @type {any} */ (prev);
        if (!p || typeof p !== "object") return prev;
        return { ...p, user: nextUser };
      });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => usersApi.completeOnboarding(),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(bootKey, (prev) => {
        const p = /** @type {any} */ (prev);
        if (!p || typeof p !== "object") return prev;
        return { ...p, user: nextUser };
      });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId) => habitsApi.delete?.(habitId),
    onSuccess: (data) => {
      if (isBootShape(data)) setBoot(data);
      else queryClient.invalidateQueries({ queryKey: bootKey });
    },
  });

  // Public API (matches your existing call sites)
  const addHabit = useCallback((cfg) => addHabitMutation.mutateAsync(cfg), [addHabitMutation]);

  const addHabits = useCallback(
    async (cfgs) => {
      for (const cfg of cfgs || []) {
        // eslint-disable-next-line no-await-in-loop
        await addHabit(cfg);
      }
      return true;
    },
    [addHabit]
  );

  const createCustomHabit = useCallback(
    (payload) => createCustomHabitMutation.mutateAsync(payload),
    [createCustomHabitMutation]
  );

  const addLog = useCallback((payload) => addLogMutation.mutateAsync(payload), [addLogMutation]);

  const processTransfer = useCallback(
    () => processTransferMutation.mutateAsync(),
    [processTransferMutation]
  );

  const updateUser = useCallback(
    (patch) => updateUserMutation.mutateAsync(patch),
    [updateUserMutation]
  );

  const completeOnboarding = useCallback(
    () => completeOnboardingMutation.mutateAsync(),
    [completeOnboardingMutation]
  );

  const deleteHabit = useCallback(
    (habitId) => deleteHabitMutation.mutateAsync(habitId),
    [deleteHabitMutation]
  );

  const value = {
    // raw boot (server truth)
    boot,
    user,
    catalog,
    catalogHabits,
    habits,
    logs,
    transfers,
    totals,
    stats,
    flux,
    habitTotals,

    // optional UI derived
    totalsUI,
    statsUI,

    // state
    isLoading: !!userId && (isLoading || isAuthLoading),
    isRefreshing: !!userId && isFetching && !isLoading,
    error,

    // actions
    refresh,
    addHabit,
    addHabits,
    createCustomHabit,
    addLog,
    processTransfer,
    updateUser,
    completeOnboarding,
    deleteHabit,

    // selectors/helpers
    getCatalogHabit,
    isHabitAdded,
    isHabitLoggedOnDate,
    calculateFluxScore,
    getWeekEarnings,
    getTodayEarnings,
    getTransferredBalance,
    getPendingBalance,

    // micros utils (kept available)
    microsToDollars,
    dollarsToMicros,
    microsToUnits,
    unitsToMicros,
    formatUSDFromMicros,
    formatRateFromMicros,
    isBinaryRateType,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}