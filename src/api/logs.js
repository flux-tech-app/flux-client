import { http } from "./http";

export const logsApi = {
  create: (payload) => http.post("logs", { json: payload }).json(),
};