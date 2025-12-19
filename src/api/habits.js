// src/api/habits.js
import { http } from "./http";

export const habitsApi = {
  create: (payload) => http.post("habits", { json: payload }).json(),
};