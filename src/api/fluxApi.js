// src/api/fluxApi.js
import { http } from "./http";

/**
 * Hard asserts to force churn / catch old payloads early.
 * This is intentionally loud during the transition.
 */
function assertNoLegacyKeys(obj, legacyKeys, ctx = "payload") {
  if (!obj || typeof obj !== "object") return;
  for (const k of legacyKeys) {
    if (k in obj) {
      throw new Error(`[api] ${ctx} contains legacy key "${k}". Use "catalogId" UUID now.`);
    }
  }
}

function assertUuidString(v, fieldName) {
  if (typeof v !== "string" || v.length < 32) {
    throw new Error(`[api] ${fieldName} must be a UUID string. Got: ${JSON.stringify(v)}`);
  }
}

// Users (public.users row via backend)
export const usersApi = {
  me: async () => http.get("me").json(), // GET /api/me -> models.User
  patchMe: async (patch) => http.patch("me", { json: patch }).json(), // PATCH /api/me -> models.User
  completeOnboarding: async () => http.post("onboarding/complete", { json: {} }).json(), // POST /api/onboarding/complete -> models.User
};

// Core bootstrap + mutations (return models.Bootstrap)
export const bootstrapApi = {
  get: async () => http.get("bootstrap").json(), // GET /api/bootstrap
};

// Habits
export const habitsApi = {
  /**
   * Create a habit instance (user selects an existing catalog habit).
   * Backend expects: { catalogId: "<uuid>", rateMicros, rateEnabled?, goal: {amount, period} }
   * Returns: Bootstrap
   */
  create: async (payload) => {
    assertNoLegacyKeys(payload, ["libraryId"], "habitsApi.create payload");
    if (!payload?.catalogId) throw new Error('[api] habitsApi.create requires "catalogId"');
    assertUuidString(payload.catalogId, "catalogId");

    return http.post("habits", { json: payload }).json(); // POST /api/habits
  },

  /**
   * Create a custom habit:
   * - creates a user-scoped catalog entry
   * - creates the habit instance referencing that catalog entry
   *
   * Backend expects: CustomHabitCreate
   * Returns: Bootstrap
   *
   * IMPORTANT: update the route string below to match your backend router.
   * Common choices:
   * - POST /api/habits/custom
   * - POST /api/catalog/habits
   */
  createCustom: async (payload) => {
    assertNoLegacyKeys(payload, ["libraryId", "catalogId"], "habitsApi.createCustom payload");

    // Lightweight client-side yelling (optional but useful)
    const name = (payload?.name ?? "").trim();
    if (!name) throw new Error('[api] habitsApi.createCustom requires "name"');

    const rateType = (payload?.rateType ?? "").toUpperCase().trim();
    if (!rateType) throw new Error('[api] habitsApi.createCustom requires "rateType"');

    if (payload?.goal?.amount == null || payload.goal.amount <= 0) {
      throw new Error('[api] habitsApi.createCustom requires goal.amount > 0');
    }
    if (!payload?.goal?.period) {
      throw new Error('[api] habitsApi.createCustom requires goal.period');
    }

    // 🔥 ROUTE: change this string if your backend uses a different path
    return http.post("habits/custom", { json: payload }).json(); // POST /api/habits/custom
  },
};

// Logs
export const logsApi = {
  create: async (payload) => http.post("logs", { json: payload }).json(), // POST /api/logs -> Bootstrap
};

// Transfers
export const transfersApi = {
  create: async () => http.post("transfers", { json: {} }).json(), // POST /api/transfers -> Bootstrap
};
