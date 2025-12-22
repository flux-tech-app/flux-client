// src/api/http.js
import ky from "ky";
import { supabase } from "@/auth/supabaseClient";

export class HttpError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

export const http = ky.create({
  prefixUrl: "/api",
  timeout: 15000,
  hooks: {
    beforeRequest: [
      async (req) => {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;

        if (token) {
          req.headers.set("Authorization", `Bearer ${token}`);
        }
        // If no token, we let the request go through and your backend returns 401.
        // (Also fine: you can throw new HttpError("Not authenticated") here if you prefer.)
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

        // Keep ky's HTTPError type (so TS doesn’t explode), but enrich it
        error.name = "HttpError";
        error.message = message;
        error.status = res.status;
        error.data = data;

        return error;
      },
    ],
  },
});
