/**
 * HABIT_LIBRARY.js
 * 
 * Curated library of 23 behaviors for MVT (Minimum Viable Test)
 * Users select from this list rather than creating custom habits
 * 
 * Action Types:
 * - LOG: Track completion of positive behaviors (13 behaviors)
 * - PASS: Track successful avoidance of impulse behaviors (10 behaviors)
 * 
 * Rate Types:
 * - BINARY: Complete/not complete (flat rate per completion)
 * - DURATION: Minutes tracked ($X per minute)
 * - DISTANCE: Miles/km tracked ($X per mile)
 * - COUNT: Units tracked ($X per unit)
 */

export const RATE_TYPES = {
  BINARY: 'BINARY',
  DURATION: 'DURATION',
  DISTANCE: 'DISTANCE',
  COUNT: 'COUNT'
};

export const ACTION_TYPES = {
  LOG: 'log',
  PASS: 'pass'
};

/**
 * The 23 MVT Behaviors
 * Each behavior includes:
 * - id: Unique identifier (also used as icon key)
 * - name: Display name
 * - ticker: Stock-style ticker symbol
 * - description: Brief explanation
 * - actionType: 'log' | 'pass'
 * - rateType: BINARY | DURATION | DISTANCE | COUNT
 * - defaultRate: Default dollar amount
 * - rateOptions: [low, default, high] for customization
 * - unit: Label for the rate (session, minute, mile, etc.)
 * - unitPlural: Plural form of unit
 */
export const HABIT_LIBRARY = [
  // ===== LOG BEHAVIORS (13) =====
  {
    id: 'running',
    name: 'Running',
    ticker: 'RUN',
    description: 'Track your runs by distance',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.DISTANCE,
    defaultRate: 1.00,
    rateOptions: [0.50, 1.00, 2.00],
    unit: 'mile',
    unitPlural: 'miles'
  },
  {
    id: 'gym',
    name: 'Gym Workout',
    ticker: 'GYM',
    description: 'Log each gym session',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 5.00,
    rateOptions: [3.00, 5.00, 10.00],
    unit: 'session',
    unitPlural: 'sessions'
  },
  {
    id: 'pushups',
    name: 'Push Ups',
    ticker: 'PUSH',
    description: 'Count your push ups',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.COUNT,
    defaultRate: 0.05,
    rateOptions: [0.02, 0.05, 0.10],
    unit: 'rep',
    unitPlural: 'reps'
  },
  {
    id: 'walking',
    name: 'Walking',
    ticker: 'WALK',
    description: 'Track your daily steps',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.COUNT,
    defaultRate: 0.001,
    rateOptions: [0.0005, 0.001, 0.002],
    unit: 'step',
    unitPlural: 'steps'
  },
  {
    id: 'crunches',
    name: 'Crunches',
    ticker: 'CRUNCH',
    description: 'Count your crunches',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.COUNT,
    defaultRate: 0.03,
    rateOptions: [0.01, 0.03, 0.05],
    unit: 'rep',
    unitPlural: 'reps'
  },
  {
    id: 'budget',
    name: 'Review Budget',
    ticker: 'BUDGET',
    description: 'Review your spending and budget',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 3.00,
    rateOptions: [2.00, 3.00, 5.00],
    unit: 'session',
    unitPlural: 'sessions'
  },
  {
    id: 'cook',
    name: 'Cook at Home',
    ticker: 'COOK',
    description: 'Prepare a meal at home',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 4.00,
    rateOptions: [2.00, 4.00, 6.00],
    unit: 'meal',
    unitPlural: 'meals'
  },
  {
    id: 'reading',
    name: 'Reading',
    ticker: 'READ',
    description: 'Read books or articles',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.COUNT,
    defaultRate: 0.50,
    rateOptions: [0.25, 0.50, 1.00],
    unit: 'chapter',
    unitPlural: 'chapters'
  },
  {
    id: 'study',
    name: 'Learning / Study',
    ticker: 'STUDY',
    description: 'Dedicated learning time',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.DURATION,
    defaultRate: 0.10,
    rateOptions: [0.05, 0.10, 0.15],
    unit: 'minute',
    unitPlural: 'minutes'
  },
  {
    id: 'meditation',
    name: 'Meditation',
    ticker: 'ZEN',
    description: 'Mindfulness and meditation',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.DURATION,
    defaultRate: 0.20,
    rateOptions: [0.10, 0.20, 0.30],
    unit: 'minute',
    unitPlural: 'minutes'
  },
  {
    id: 'journal',
    name: 'Journaling',
    ticker: 'JOURNAL',
    description: 'Write in your journal',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 2.00,
    rateOptions: [1.00, 2.00, 3.00],
    unit: 'session',
    unitPlural: 'sessions'
  },
  {
    id: 'compliment',
    name: 'Give Compliment',
    ticker: 'KIND',
    description: 'Spread kindness to others',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.COUNT,
    defaultRate: 1.00,
    rateOptions: [0.50, 1.00, 2.00],
    unit: 'compliment',
    unitPlural: 'compliments'
  },
  {
    id: 'makebed',
    name: 'Make Bed',
    ticker: 'BED',
    description: 'Start your day with a win',
    actionType: ACTION_TYPES.LOG,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 2.00,
    rateOptions: [1.00, 2.00, 3.00],
    unit: 'day',
    unitPlural: 'days'
  },

  // ===== PASS BEHAVIORS (10) =====
  {
    id: 'takeout',
    name: 'Takeout',
    ticker: 'TAKEOUT',
    description: 'Skip ordering food delivery',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 7.00,
    rateOptions: [5.00, 7.00, 10.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    ticker: 'BOOZE',
    description: 'Pass on drinking alcohol',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 5.00,
    rateOptions: [3.00, 5.00, 10.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'doomscrolling',
    name: 'Doomscrolling',
    ticker: 'SCROLL',
    description: 'Avoid mindless social media',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 3.00,
    rateOptions: [2.00, 3.00, 5.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'smoking',
    name: 'Smoking',
    ticker: 'SMOKE',
    description: 'Successfully avoid smoking',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 5.00,
    rateOptions: [3.00, 5.00, 10.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'vaping',
    name: 'Vaping',
    ticker: 'VAPE',
    description: 'Successfully avoid vaping',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 5.00,
    rateOptions: [3.00, 5.00, 10.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'impulse',
    name: 'Impulse Purchases',
    ticker: 'IMPULSE',
    description: 'Resist unnecessary spending',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 5.00,
    rateOptions: [3.00, 5.00, 10.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'junkfood',
    name: 'Junk Food',
    ticker: 'JUNK',
    description: 'Pass on unhealthy snacks',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 3.00,
    rateOptions: [2.00, 3.00, 5.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'midnight',
    name: 'Midnight Snacks',
    ticker: 'MIDNIGHT',
    description: 'Avoid late-night eating',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 3.00,
    rateOptions: [2.00, 3.00, 5.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'gambling',
    name: 'Gambling',
    ticker: 'BET',
    description: 'Resist gambling urges',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 10.00,
    rateOptions: [5.00, 10.00, 20.00],
    unit: 'pass',
    unitPlural: 'passes'
  },
  {
    id: 'snooze',
    name: 'Hitting Snooze',
    ticker: 'SNOOZE',
    description: 'Get up on first alarm',
    actionType: ACTION_TYPES.PASS,
    rateType: RATE_TYPES.BINARY,
    defaultRate: 2.00,
    rateOptions: [1.00, 2.00, 3.00],
    unit: 'pass',
    unitPlural: 'passes'
  }
];

/**
 * Helper: Get habit by ID
 */
export function getHabitById(id) {
  return HABIT_LIBRARY.find(h => h.id === id);
}

/**
 * Helper: Get habit by ticker
 */
export function getHabitByTicker(ticker) {
  // Handle both with and without $
  const cleanTicker = ticker.replace('$', '').toUpperCase();
  return HABIT_LIBRARY.find(h => h.ticker.toUpperCase() === cleanTicker);
}

/**
 * Helper: Get behaviors by action type
 */
export function getHabitsByActionType(actionType) {
  return HABIT_LIBRARY.filter(h => h.actionType === actionType);
}

/**
 * Helper: Format rate display
 * Returns string like "$1.00/mile" or "$5.00/session"
 */
export function formatRate(habit, rate = null) {
  const displayRate = rate ?? habit.defaultRate;
  
  // Handle very small rates (like walking $0.001/step)
  if (displayRate < 0.01) {
    return `$${displayRate.toFixed(4)}/${habit.unit}`;
  }
  
  return `$${displayRate.toFixed(2)}/${habit.unit}`;
}

/**
 * Helper: Calculate earnings for a log
 */
export function calculateEarnings(habit, units) {
  if (habit.rateType === RATE_TYPES.BINARY) {
    return habit.rate || habit.defaultRate;
  }
  return (habit.rate || habit.defaultRate) * units;
}

/**
 * Helper: Get rate label for display
 * Returns "Low", "Default", or "High" based on index
 */
export function getRateLabel(index) {
  const labels = ['Low', 'Default', 'High'];
  return labels[index] || 'Custom';
}

/**
 * Helper: Check if habit uses units (vs binary)
 */
export function habitUsesUnits(habit) {
  return habit.rateType !== RATE_TYPES.BINARY;
}

export default HABIT_LIBRARY;
