// src/api/http.js
import ky from "ky";

const USER_ID_KEY = "flux_user_id";

function ensureUserId() {
  let uid = localStorage.getItem(USER_ID_KEY) || "";
  if (!uid) {
    uid = crypto.randomUUID(); // browser-native UUID v4
    localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

export class HttpError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

export const http = ky.create({
  prefixUrl: "/api", // ✅ absolute
  timeout: 15000,
  hooks: {
    beforeRequest: [
      (req) => {
        const uid = ensureUserId();
        req.headers.set("X-User-Id", uid);
      },
    ],
    beforeError: [
      async (error) => {
        const res = error.response;
        if (!res) return error;

        let data = null;
        let message = error.message || "Request failed";

        try {
          data = await res.clone().json();
          if (data?.error) message = data.error;
        } catch {
          // ignore parse errors
        }

        return new HttpError(message, { status: res.status, data });
      },
    ],
  },
});