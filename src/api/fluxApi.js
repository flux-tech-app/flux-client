// src/api/fluxApi.js
import { http } from "./http";

// Users (public.users row via backend)
export const usersApi = {
  me: async () => http.get("me").json(),                       // GET /api/me -> models.User
  patchMe: async (patch) => http.patch("me", { json: patch }).json(), // PATCH /api/me -> models.User
  completeOnboarding: async () =>
    http.post("onboarding/complete", { json: {} }).json(),     // POST /api/onboarding/complete -> models.User
};

// Core bootstrap + mutations (return models.Bootstrap)
export const bootstrapApi = {
  get: async () => http.get("bootstrap").json(),               // GET /api/bootstrap
};

export const habitsApi = {
  create: async (payload) => http.post("habits", { json: payload }).json(), // POST /api/habits
};

export const logsApi = {
  create: async (payload) => http.post("logs", { json: payload }).json(),   // POST /api/logs
};

export const transfersApi = {
  create: async () => http.post("transfers", { json: {} }).json(),         // POST /api/transfers
};
