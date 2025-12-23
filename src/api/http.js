// src/api/http.js
import ky from "ky";
import { supabase } from "@/auth/supabaseClient";

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{status?: number, data?: any, url?: string}} meta
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = "ApiError";
    this.status = meta.status ?? 0;
    this.data = meta.data ?? null;
    this.url = meta.url ?? "";
  }
}

/**
 * Convert unknown/ky errors into ApiError (single place).
 * @param {any} e
 * @returns {ApiError}
 */
export function toApiError(e) {
  // ky HTTPError has .response
  const status = e?.response?.status ?? e?.status ?? 0;
  const url = e?.response?.url ?? e?.url ?? "";
  const data = e?.cause?.data ?? null;
  const message = e?.message || "Request failed";
  return new ApiError(message, { status, data, url });
}

export const http = ky.create({
  prefixUrl: "/api",
  timeout: 15000,
  hooks: {
    beforeRequest: [
      async (req) => {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (token) req.headers.set("Authorization", `Bearer ${token}`);
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

        // Hook must return HTTPError — so we only mutate safe fields:
        error.message = message;

        // Optional: stash parsed json somewhere typed as unknown
        // (so we can surface it later via toApiError)
        error.cause = { data };

        return error;
      },
    ],
  },
});