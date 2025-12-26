// src/utils/micros.js

// Canonical multipliers (must match backend rules)
export const MICRO_DOLLARS = 1_000_000; // $1.00
export const MICRO_UNITS = 1_000_000;   // 1.0 unit (e.g. 1 mile, 1 minute, 1 rep)

// ---------------------------
// Guards / normalization
// ---------------------------

export function toIntMicros(v, fallback = 0) {
  // Accepts number/string/bigint-ish and returns a safe integer number (JS Number).
  // We assume micros values fit within JS safe integer range in Flux v1.
  if (v == null) return fallback;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

export function clampInt(n, min = 0, max = Number.MAX_SAFE_INTEGER) {
  n = toIntMicros(n, 0);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

// ---------------------------
// Money conversions
// ---------------------------

export function microsToDollars(micros) {
  return toIntMicros(micros, 0) / MICRO_DOLLARS;
}

export function dollarsToMicros(dollars) {
  // For user-entered values. Avoid floating drift by rounding to nearest micro-dollar.
  // Accept strings like "12.34" or "$12.34".
  if (dollars == null) return 0;

  if (typeof dollars === "string") {
    const cleaned = dollars.trim().replace(/[$,]/g, "");
    if (cleaned === "") return 0;
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * MICRO_DOLLARS);
  }

  const n = Number(dollars);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * MICRO_DOLLARS);
}

// ---------------------------
// Units conversions (micro-units)
// ---------------------------

export function microsToUnits(unitsMicros) {
  return toIntMicros(unitsMicros, 0) / MICRO_UNITS;
}

export function unitsToMicros(units) {
  // For user-entered units like "30" minutes or "2.5" miles.
  if (units == null) return 0;

  if (typeof units === "string") {
    const cleaned = units.trim().replace(/,/g, "");
    if (cleaned === "") return 0;
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * MICRO_UNITS);
  }

  const n = Number(units);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * MICRO_UNITS);
}

// ---------------------------
// Formatting (display only)
// ---------------------------

const USD_2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_4 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function formatUSDFromMicros(micros, { precision = "auto" } = {}) {
  const m = toIntMicros(micros, 0);
  const dollars = m / MICRO_DOLLARS;

  const p = precision === "auto" ? "auto" : Number(precision);

  if (p === 2) return USD_2.format(dollars);
  if (p === 4) return USD_4.format(dollars);

  // auto: show more precision for tiny amounts (< 1 cent)
  if (Math.abs(dollars) > 0 && Math.abs(dollars) < 0.01) {
    return USD_4.format(dollars);
  }
  return USD_2.format(dollars);
}

export function formatRateFromMicros(rateMicros, unitLabel, opts = {}) {
  // "$0.05/rep", "$1.00/mile"
  const unit = unitLabel ? `/${unitLabel}` : "";
  return `${formatUSDFromMicros(rateMicros, opts)}${unit}`;
}

export function formatUnitsFromMicros(unitsMicros, { maxFractionDigits = 2 } = {}) {
  const units = microsToUnits(unitsMicros);
  // For clean UI. For many habits you may want 0 dp (steps/reps), but keep generic here.
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(units);
}

// ---------------------------
// Habit-specific convenience
// ---------------------------

export function isBinaryRateType(rateType) {
  return String(rateType || "").toUpperCase() === "BINARY";
}

/**
 * Compute display earnings from a log, purely for UI.
 * Prefer backend as source-of-truth; this is for display when needed.
 *
 * @param {Object} args
 * @param {string} args.rateType - "BINARY" | "COUNT" | "DURATION" | "DISTANCE"
 * @param {number} args.rateMicros - micro-dollars per unit (or flat for BINARY)
 * @param {number} args.unitsMicros - micro-units (ignored for BINARY)
 */
export function computeEarningsMicrosUI({ rateType, rateMicros, unitsMicros }) {
  const r = toIntMicros(rateMicros, 0);
  if (r <= 0) return 0;

  if (isBinaryRateType(rateType)) return r;

  const u = toIntMicros(unitsMicros, MICRO_UNITS);
  // integer math: (rateMicros * unitsMicros) / 1e6
  // safe for your v1 ranges; if you ever scale huge, do it on backend.
  return Math.trunc((r * u) / MICRO_UNITS);
}