// src/api/index.js
import { sessionApi } from "./session";
import { bootstrapApi } from "./bootstrap";
import { habitsApi } from "./habits";
import { logsApi } from "./logs";
import { transfersApi } from "./transfers";

export const fluxApi = {
  session: sessionApi,
  bootstrap: bootstrapApi,
  habits: habitsApi,
  logs: logsApi,
  transfers: transfersApi,
};