/**
 * Centralized Constants for Flux App
 *
 * All thresholds and configuration values in one place.
 * Based on FLUX-TECHNICAL-BLUEPRINT.md and FLUX-PRODUCT-BLUEPRINT.md
 */

// =============================================================================
// LOG COUNT THRESHOLDS (Blueprint-specified)
// =============================================================================

/** Minimum logs required to calculate Flux Score */
export const MIN_LOGS_FOR_FLUX = 10;

/** Logs required for fully established baseline */
export const LOGS_FOR_ESTABLISHED = 30;

// =============================================================================
// FLUX SCORE WEIGHTS (100 points total)
// =============================================================================

export const FLUX_WEIGHTS = {
  FREQUENCY: 30,    // Frequency Trend: Recent vs baseline
  CONSISTENCY: 25,  // Gap variance between logs
  RECENCY: 20,      // Days since last log
  VOLUME: 15,       // Average units vs baseline
  MATURITY: 10,     // Data maturity (logs.length / 30)
};

// =============================================================================
// TIME WINDOWS
// =============================================================================

/** Days to consider for "recent" calculations (frequency, volume) */
export const RECENT_WINDOW_DAYS = 7;

/** Days to display in charts */
export const CHART_WINDOW_DAYS = 30;

// =============================================================================
// MATURITY STATUS LABELS
// =============================================================================

export const MATURITY_LABELS = {
  BUILDING: 'Building baseline',
  EMERGING: 'Baseline emerging',
  ESTABLISHED: 'Established',
};

// =============================================================================
// BASELINE CALCULATION DEFAULTS
// =============================================================================

/** Default typical gap between logs (days) when no baseline exists */
export const DEFAULT_TYPICAL_GAP = 1;

/** Minimum gap variance to avoid division issues */
export const MIN_GAP_VARIANCE = 0.1;
