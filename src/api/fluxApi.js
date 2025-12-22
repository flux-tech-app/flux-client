// src/api/fluxApi.js
import { http } from "./http";

export const usersApi = {
  me: async () => http.get("me").json(),
  patchMe: async (patch) => http.patch("me", { json: patch }).json(),
  completeOnboarding: async () => http.post("onboarding/complete", { json: {} }).json(),
};

export const bootstrapApi = {
  get: async () => http.get("bootstrap").json(),
};

export const habitsApi = {
  create: async (payload) => http.post("habits", { json: payload }).json(),
};

export const logsApi = {
  create: async (payload) => http.post("logs", { json: payload }).json(),
};

export const transfersApi = {
  create: async () => http.post("transfers", { json: {} }).json(),
};
