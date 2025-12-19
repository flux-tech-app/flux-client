// src/api/session.js
import { http } from "./http";

export const sessionApi = {
  me: () => http.get("me").json(), // GET /api/me
};