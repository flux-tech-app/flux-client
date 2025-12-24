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
  const status = e?.response?.status ?? e?.status ?? 0;
  const url = e?.response?.url ?? e?.url ?? "";
  const data = e?.cause?.data ?? null;
  const message = e?.message || "Request failed";
  return new ApiError(message, { status, data, url });
}

/**
 * API base:
 * - If you have a Vite proxy for "/api" -> keep VITE_API_BASE empty and we’ll use "/api"
 * - If NOT using a proxy, set VITE_API_BASE="http://localhost:8080" (or your deployed origin)
 *
 * This avoids accidentally hitting http://localhost:5173/api which will 404/401 weirdly.
 */
const API_BASE = (import.meta.env.VITE_API_BASE ?? "").trim().replace(/\/$/, "");
const PREFIX_URL = API_BASE ? `${API_BASE}/api` : "/api";

// Tiny in-module cache so we can log consistently and avoid extra async calls when possible.
let cachedToken = null;
let cachedUserId = null;

// Keep cache warm (optional but helps debugging)
supabase.auth.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token ?? null;
  cachedUserId = session?.user?.id ?? null;
});

async function getAccessToken() {
  // Prefer cache, but fall back to getSession
  if (cachedToken) return cachedToken;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("[api] supabase.getSession error:", error);
  }
  cachedToken = data?.session?.access_token ?? null;
  cachedUserId = data?.session?.user?.id ?? null;
  return cachedToken;
}

async function refreshToken() {
  // supabase-js will refresh automatically in many cases,
  // but explicitly refreshing once on 401 is a nice safety net.
  const { data, error } = await supabase.auth.refreshSession();
  if (error) return { token: null, error };

  cachedToken = data?.session?.access_token ?? null;
  cachedUserId = data?.session?.user?.id ?? null;
  return { token: cachedToken, error: null };
}

export const http = ky.create({
  prefixUrl: PREFIX_URL, // ky supports prefixUrl for base-path composition :contentReference[oaicite:1]{index=1}
  timeout: 15000,

  hooks: {
    beforeRequest: [
      async (req) => {
        const token = await getAccessToken();

        // Logging: what request + did we attach a token?
        // (Don’t log the token itself.)
        console.debug("[api] request", {
          method: req.method,
          url: req.url,
          hasToken: !!token,
          userId: cachedUserId ?? null,
        });

        if (token) {
          req.headers.set("Authorization", `Bearer ${token}`);
        }

        // JSON defaults (harmless even for GET)
        req.headers.set("Accept", "application/json");
      },
    ],

    // If you want a single “refresh once on 401” behavior:
    afterResponse: [
      async (_req, _options, res) => {
        if (res.status !== 401) return;

        console.warn("[api] 401 received — attempting refreshSession() once...");
        const { token, error } = await refreshToken();
        if (error || !token) {
          console.warn("[api] refreshSession failed:", error);
          return;
        }

        // NOTE: We *don’t* automatically retry here because ky afterResponse
        // doesn’t re-dispatch by itself. The simple pattern is:
        // - let the call fail with 401
        // - your UI triggers a retry (or you can build a wrapper that retries once)
        //
        // If you want auto-retry, tell me and I’ll show the cleanest wrapper version.
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

        console.warn("[api] error", {
          status: res.status,
          url: res.url,
          message,
          data,
        });

        error.message = message;
        error.cause = { data };

        return error;
      },
    ],
  },
});