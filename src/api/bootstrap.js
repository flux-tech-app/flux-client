// src/api/bootstrap.js
import { http } from "./http";

export const bootstrapApi = {
  get: () => http.get("bootstrap").json(), // GET /api/bootstrap
};