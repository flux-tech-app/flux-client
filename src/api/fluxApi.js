// src/api/fluxApi.js
import { http } from "./http";

export const sessionApi = {
  login: async (email) => http.post("auth/login", { json: { email } }).json(),
  verify: async (email, code) =>
    http.post("auth/verify", { json: { email, code } }).json(),
};

export const bootstrapApi = { get: async () => http.get("bootstrap").json() };
export const habitsApi = { create: async (payload) => http.post("habits", { json: payload }).json() };
export const logsApi = { create: async (payload) => http.post("logs", { json: payload }).json() };
export const transfersApi = { create: async () => http.post("transfers", { json: {} }).json() };