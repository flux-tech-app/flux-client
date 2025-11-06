/**
 * Data Models Reference
 * 
 * This file documents the exact structure of data objects used in Flux 2.0
 * Use these as reference when building components
 */

// ============================================================================
// HABIT OBJECT
// ============================================================================

const habitExample = {
  // Core identification
  id: '1699123456789', // timestamp string
  createdAt: '2025-11-05T10:30:00.000Z', // ISO string

  // Basic info
  name: 'Cardio', // display name
  type: 'build', // 'build' | 'break'
  
  // Rate configuration
  rateType: 'duration', // 'duration' | 'completion'
  rate: 0.05, // dollar amount (e.g., $0.05/min or $0.50/completion)
  
  // Break habit specific
  allowTopUp: false, // only relevant for type: 'break'
  
  // Optional metadata
  icon: 'dumbbell', // icon identifier (to be defined)
  color: '#2563eb', // hex color for visual distinction
  notes: '', // optional user notes
}

// Build habit example
const buildHabitExample = {
  id: '1',
  name: 'Cardio',
  type: 'build',
  rateType: 'duration', // pays per minute
  rate: 0.05, // $0.05/min
  allowTopUp: false, // not applicable for build habits
  icon: 'dumbbell',
  color: '#2563eb',
  createdAt: '2025-11-05T10:30:00.000Z',
}

// Break habit example (with top-up)
const breakHabitExample = {
  id: '2',
  name: 'Doordash',
  type: 'break',
  rateType: 'completion', // pays per resistance
  rate: 1.00, // $1.00 base rate
  allowTopUp: true, // user can add actual savings
  icon: 'shield',
  color: '#f59e0b',
  createdAt: '2025-11-05T10:30:00.000Z',
}

// ============================================================================
// LOG OBJECT
// ============================================================================

const logExample = {
  // Core identification
  id: '1699123456790', // timestamp string
  timestamp: '2025-11-05T14:45:00.000Z', // ISO string
  habitId: '1', // references habit.id
  
  // Earnings breakdown
  baseEarnings: 1.50, // calculated from rate × duration/completion
  topUpAmount: 0, // optional, break habits only
  totalEarnings: 1.50, // baseEarnings + topUpAmount
  
  // Activity details
  duration: 30, // minutes (for duration-based habits only)
  notes: '', // optional user notes
}

// Build habit log example (duration-based)
const buildLogExample = {
  id: '100',
  habitId: '1', // Cardio
  timestamp: '2025-11-05T14:45:00.000Z',
  duration: 30, // 30 minutes
  baseEarnings: 1.50, // $0.05/min × 30 min
  topUpAmount: 0,
  totalEarnings: 1.50,
  notes: 'Morning run',
}

// Build habit log example (completion-based)
const buildLogCompletionExample = {
  id: '101',
  habitId: '3', // Journaling
  timestamp: '2025-11-05T09:00:00.000Z',
  duration: null, // not applicable
  baseEarnings: 0.50, // $0.50 per completion
  topUpAmount: 0,
  totalEarnings: 0.50,
  notes: '',
}

// Break habit log example (without top-up)
const breakLogExample = {
  id: '102',
  habitId: '2', // Doordash
  timestamp: '2025-11-05T12:30:00.000Z',
  duration: null, // not applicable
  baseEarnings: 1.00, // $1.00 base rate
  topUpAmount: 0, // user chose not to add savings
  totalEarnings: 1.00,
  notes: 'Made lunch at home instead',
}

// Break habit log example (with top-up)
const breakLogWithTopUpExample = {
  id: '103',
  habitId: '2', // Doordash
  timestamp: '2025-11-05T18:30:00.000Z',
  duration: null,
  baseEarnings: 1.00, // $1.00 base rate
  topUpAmount: 28.50, // actual savings from not ordering
  totalEarnings: 29.50, // $1.00 + $28.50
  notes: 'Avoided $28.50 order',
}

// ============================================================================
// USER OBJECT
// ============================================================================

const userExample = {
  name: 'Ryan',
  email: 'ryan@example.com',
  hasCompletedOnboarding: true,
  
  // Future fields (not yet implemented)
  bankConnected: false,
  transferSchedule: 'weekly', // 'weekly' | 'monthly'
  notificationsEnabled: true,
}

// ============================================================================
// DERIVED DATA / CALCULATIONS
// ============================================================================

/**
 * Habit Stats (calculated from logs)
 * Returned by getHabitStats(habitId)
 */
const habitStatsExample = {
  totalLogs: 15, // number of times logged
  totalEarnings: 45.50, // sum of all totalEarnings for this habit
  currentStreak: 7, // consecutive days with logs
  lastLogDate: '2025-11-05T14:45:00.000Z', // most recent log timestamp
}

/**
 * Chart Data Point (for habit detail charts)
 * Returned by getChartData(logs)
 */
const chartDataPointExample = {
  date: 'Mon Nov 4 2025', // date string
  earnings: 3.50, // total earnings on this date
  count: 2, // number of logs on this date
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

const validationRules = {
  habit: {
    name: {
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    type: {
      required: true,
      options: ['build', 'break'],
    },
    rateType: {
      required: true,
      options: ['duration', 'completion'],
    },
    rate: {
      required: true,
      min: 0.01, // minimum $0.01
      max: 10.00, // maximum $10.00 per unit
    },
  },
  log: {
    habitId: {
      required: true,
    },
    duration: {
      required: false, // only for duration-based habits
      min: 1,
      max: 1440, // 24 hours in minutes
    },
    topUpAmount: {
      required: false, // only for break habits with allowTopUp: true
      min: 0,
      max: 1000, // reasonable max for savings
    },
    notes: {
      required: false,
      maxLength: 200,
    },
  },
}

export {
  habitExample,
  buildHabitExample,
  breakHabitExample,
  logExample,
  buildLogExample,
  buildLogCompletionExample,
  breakLogExample,
  breakLogWithTopUpExample,
  userExample,
  habitStatsExample,
  chartDataPointExample,
  validationRules,
}
