import { http } from "./http";

export const transfersApi = {
  create: () => http.post("transfers").json(),
};