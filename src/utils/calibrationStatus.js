/**
 * Calibration Status Utility
 *
 * Single source of truth for determining habit calibration state.
 * Based on log count thresholds from the Flux blueprints.
 */

import {
  MIN_LOGS_FOR_FLUX,
  LOGS_FOR_ESTABLISHED,
  MATURITY_LABELS,
} from './constants';

/**
 * Get the calibration status for a habit based on its logs.
 *
 * @param {Array} logs - Array of habit log entries
 * @returns {Object} Calibration status object
 */
export function getCalibrationStatus(logs) {
  const logCount = logs?.length || 0;
  const logsNeeded = Math.max(0, MIN_LOGS_FOR_FLUX - logCount);
  const logsForEstablished = Math.max(0, LOGS_FOR_ESTABLISHED - logCount);

  let status, label;
  if (logCount < MIN_LOGS_FOR_FLUX) {
    status = 'building';
    label = MATURITY_LABELS.BUILDING;
  } else if (logCount < LOGS_FOR_ESTABLISHED) {
    status = 'emerging';
    label = MATURITY_LABELS.EMERGING;
  } else {
    status = 'established';
    label = MATURITY_LABELS.ESTABLISHED;
  }

  return {
    // Raw count
    logCount,

    // Status string: 'building' | 'emerging' | 'established'
    status,

    // Human-readable label
    label,

    // Boolean helpers for conditional rendering
    isCalibrating: logCount < MIN_LOGS_FOR_FLUX,
    isEmerging: logCount >= MIN_LOGS_FOR_FLUX && logCount < LOGS_FOR_ESTABLISHED,
    isEstablished: logCount >= LOGS_FOR_ESTABLISHED,

    // Logs needed to reach next threshold
    logsNeeded,           // Logs until Flux score available (0-10)
    logsForEstablished,   // Logs until fully established (0-30)

    // Progress percentage toward MIN_LOGS_FOR_FLUX
    progress: Math.min(100, Math.round((logCount / MIN_LOGS_FOR_FLUX) * 100)),

    // Message to display (null if calibrated)
    message: logsNeeded > 0
      ? `${logsNeeded} more log${logsNeeded === 1 ? '' : 's'} needed`
      : null,
  };
}

/**
 * Get a short status message for charts/UI elements.
 *
 * @param {Array} logs - Array of habit log entries
 * @returns {string|null} Status message or null if fully calibrated
 */
export function getCalibrationMessage(logs) {
  const { logsNeeded, isEmerging } = getCalibrationStatus(logs);

  if (logsNeeded > 0) {
    return `${logsNeeded} more log${logsNeeded === 1 ? '' : 's'} to see Flux Score`;
  }

  if (isEmerging) {
    return 'Baseline emerging';
  }

  return null; // Fully established
}
