// Flux Habit Categories & Predefined Habits
// Based on FLUX-COMPLETE-PRODUCT-SPECIFICATION v1.0
// 4 Categories: Fitness, Nutrition, Spending, Growth

export const CATEGORIES = {
  fitness: {
    id: 'fitness',
    name: 'Fitness',
    icon: '🏃',
    description: 'Running, gym, workouts',
    color: '#3b82f6', // Blue
    indexTicker: 'FIT'
  },
  nutrition: {
    id: 'nutrition',
    name: 'Nutrition',
    icon: '🥗',
    description: 'Eating, cooking, health',
    color: '#22c55e', // Green
    indexTicker: 'NUT'
  },
  spending: {
    id: 'spending',
    name: 'Spending',
    icon: '💰',
    description: 'Saving, avoiding waste',
    color: '#f59e0b', // Amber
    indexTicker: 'SPD'
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    icon: '📚',
    description: 'Learning, mindfulness',
    color: '#8b5cf6', // Purple
    indexTicker: 'GRW'
  }
};

// Predefined habits per category with tickers, rates, and defaults
export const PREDEFINED_HABITS = {
  fitness: [
    {
      id: 'running',
      ticker: 'RUN',
      name: 'Running',
      rateType: 'per_unit',
      unit: 'mile',
      defaultRate: 1.00,
      rateOptions: [0.50, 1.00, 2.00],
      icon: '🏃',
      description: 'Track your runs by distance'
    },
    {
      id: 'gym',
      ticker: 'GYM',
      name: 'Gym Session',
      rateType: 'per_day',
      unit: 'session',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 10.00],
      icon: '💪',
      description: 'Log each gym visit'
    },
    {
      id: 'yoga',
      ticker: 'YOGA',
      name: 'Yoga',
      rateType: 'per_day',
      unit: 'session',
      defaultRate: 3.00,
      rateOptions: [2.00, 3.00, 5.00],
      icon: '🧘',
      description: 'Daily yoga practice'
    },
    {
      id: 'cycling',
      ticker: 'BIKE',
      name: 'Cycling',
      rateType: 'per_unit',
      unit: 'mile',
      defaultRate: 0.50,
      rateOptions: [0.25, 0.50, 1.00],
      icon: '🚴',
      description: 'Track cycling by distance'
    },
    {
      id: 'walking',
      ticker: 'WALK',
      name: 'Walking',
      rateType: 'per_unit',
      unit: 'step',
      defaultRate: 0.001, // $1 per 1000 steps
      rateOptions: [0.0005, 0.001, 0.002],
      icon: '🚶',
      description: 'Track daily steps'
    },
    {
      id: 'swimming',
      ticker: 'SWIM',
      name: 'Swimming',
      rateType: 'per_unit',
      unit: 'lap',
      defaultRate: 0.25,
      rateOptions: [0.15, 0.25, 0.50],
      icon: '🏊',
      description: 'Track swimming laps'
    },
    {
      id: 'stretching',
      ticker: 'STRCH',
      name: 'Stretching',
      rateType: 'per_day',
      unit: 'session',
      defaultRate: 2.00,
      rateOptions: [1.00, 2.00, 3.00],
      icon: '🤸',
      description: 'Daily stretching routine'
    },
    {
      id: 'strength',
      ticker: 'LIFT',
      name: 'Strength Training',
      rateType: 'per_day',
      unit: 'session',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 8.00],
      icon: '🏋️',
      description: 'Weight training sessions'
    }
  ],
  nutrition: [
    {
      id: 'meal_prep',
      ticker: 'PREP',
      name: 'Meal Prep',
      rateType: 'per_day',
      unit: 'session',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 8.00],
      icon: '🍱',
      description: 'Prepare meals in advance'
    },
    {
      id: 'hydration',
      ticker: 'H2O',
      name: 'Hydration',
      rateType: 'per_unit',
      unit: 'glass',
      defaultRate: 0.25,
      rateOptions: [0.15, 0.25, 0.50],
      icon: '💧',
      description: 'Track water intake'
    },
    {
      id: 'vegetables',
      ticker: 'VEG',
      name: 'Eat Vegetables',
      rateType: 'per_unit',
      unit: 'serving',
      defaultRate: 1.00,
      rateOptions: [0.50, 1.00, 2.00],
      icon: '🥦',
      description: 'Track vegetable servings'
    },
    {
      id: 'home_cooking',
      ticker: 'COOK',
      name: 'Cook at Home',
      rateType: 'per_day',
      unit: 'meal',
      defaultRate: 3.00,
      rateOptions: [2.00, 3.00, 5.00],
      icon: '👨‍🍳',
      description: 'Prepare meals at home'
    },
    {
      id: 'no_doordash',
      ticker: 'NDASH',
      name: 'No DoorDash',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 8.00,
      rateOptions: [5.00, 8.00, 12.00],
      icon: '🚫',
      description: 'Skip food delivery apps'
    },
    {
      id: 'no_fast_food',
      ticker: 'NFF',
      name: 'No Fast Food',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 8.00],
      icon: '🍔',
      description: 'Avoid fast food'
    },
    {
      id: 'no_soda',
      ticker: 'NSODA',
      name: 'No Soda',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 2.00,
      rateOptions: [1.00, 2.00, 3.00],
      icon: '🥤',
      description: 'Skip sugary drinks'
    },
    {
      id: 'protein',
      ticker: 'PROT',
      name: 'Protein Goal',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 3.00,
      rateOptions: [2.00, 3.00, 5.00],
      icon: '🥩',
      description: 'Hit daily protein target'
    }
  ],
  spending: [
    {
      id: 'no_amazon',
      ticker: 'NAMZN',
      name: 'No Amazon',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 10.00],
      icon: '📦',
      description: 'Avoid impulse Amazon purchases'
    },
    {
      id: 'no_impulse',
      ticker: 'NIMP',
      name: 'No Impulse Buys',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 8.00],
      icon: '🛒',
      description: 'Resist impulse purchases'
    },
    {
      id: 'budget_review',
      ticker: 'BUDG',
      name: 'Budget Review',
      rateType: 'per_day',
      unit: 'session',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 8.00],
      icon: '📊',
      description: 'Review weekly budget'
    },
    {
      id: 'savings_transfer',
      ticker: 'SAVE',
      name: 'Savings Transfer',
      rateType: 'per_day',
      unit: 'transfer',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 10.00],
      icon: '🏦',
      description: 'Transfer to savings'
    },
    {
      id: 'no_subscriptions',
      ticker: 'NSUB',
      name: 'Cancel Unused Subs',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 3.00,
      rateOptions: [2.00, 3.00, 5.00],
      icon: '📺',
      description: 'Audit subscriptions'
    },
    {
      id: 'expense_tracking',
      ticker: 'TRACK',
      name: 'Track Expenses',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 2.00,
      rateOptions: [1.00, 2.00, 3.00],
      icon: '📝',
      description: 'Log daily expenses'
    },
    {
      id: 'no_coffee_shop',
      ticker: 'NCOF',
      name: 'No Coffee Shop',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 7.00],
      icon: '☕',
      description: 'Make coffee at home'
    },
    {
      id: 'no_eating_out',
      ticker: 'NOUT',
      name: 'No Eating Out',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 10.00,
      rateOptions: [5.00, 10.00, 15.00],
      icon: '🍽️',
      description: 'Eat at home'
    }
  ],
  growth: [
    {
      id: 'reading',
      ticker: 'READ',
      name: 'Reading',
      rateType: 'per_unit',
      unit: 'page',
      defaultRate: 0.10,
      rateOptions: [0.05, 0.10, 0.25],
      icon: '📖',
      description: 'Track pages read'
    },
    {
      id: 'meditation',
      ticker: 'ZEN',
      name: 'Meditation',
      rateType: 'per_day',
      unit: 'session',
      defaultRate: 3.00,
      rateOptions: [2.00, 3.00, 5.00],
      icon: '🧘',
      description: 'Daily meditation practice'
    },
    {
      id: 'journaling',
      ticker: 'JRNL',
      name: 'Journaling',
      rateType: 'per_day',
      unit: 'entry',
      defaultRate: 2.00,
      rateOptions: [1.00, 2.00, 3.00],
      icon: '📓',
      description: 'Write journal entries'
    },
    {
      id: 'learning',
      ticker: 'LEARN',
      name: 'Learning',
      rateType: 'per_unit',
      unit: 'minute',
      defaultRate: 0.10,
      rateOptions: [0.05, 0.10, 0.20],
      icon: '🎓',
      description: 'Online courses, tutorials'
    },
    {
      id: 'gratitude',
      ticker: 'GRAT',
      name: 'Gratitude Practice',
      rateType: 'per_day',
      unit: 'session',
      defaultRate: 2.00,
      rateOptions: [1.00, 2.00, 3.00],
      icon: '🙏',
      description: 'Daily gratitude list'
    },
    {
      id: 'no_social_media',
      ticker: 'NSM',
      name: 'No Social Media',
      rateType: 'per_day',
      unit: 'day',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 8.00],
      icon: '📵',
      description: 'Avoid social media'
    },
    {
      id: 'deep_work',
      ticker: 'DEEP',
      name: 'Deep Work',
      rateType: 'per_unit',
      unit: 'hour',
      defaultRate: 5.00,
      rateOptions: [3.00, 5.00, 10.00],
      icon: '🎯',
      description: 'Focused work sessions'
    },
    {
      id: 'language',
      ticker: 'LANG',
      name: 'Language Practice',
      rateType: 'per_unit',
      unit: 'minute',
      defaultRate: 0.10,
      rateOptions: [0.05, 0.10, 0.15],
      icon: '🌍',
      description: 'Practice a new language'
    }
  ]
};

// Helper to get category by ID
export const getCategory = (categoryId) => CATEGORIES[categoryId] || null;

// Helper to get predefined habits for a category
export const getHabitsForCategory = (categoryId) => PREDEFINED_HABITS[categoryId] || [];

// Helper to get a specific predefined habit
export const getPredefinedHabit = (categoryId, habitId) => {
  const habits = PREDEFINED_HABITS[categoryId];
  return habits?.find(h => h.id === habitId) || null;
};

// Helper to generate ticker for custom habits
export const generateTicker = (habitName) => {
  // Take first 4-5 letters, uppercase, remove vowels if too long
  const clean = habitName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (clean.length <= 5) return clean;
  
  // Remove vowels to shorten
  const noVowels = clean.replace(/[AEIOU]/g, '');
  if (noVowels.length >= 3) return noVowels.slice(0, 5);
  
  return clean.slice(0, 5);
};

// Default schedule - all days
export const DEFAULT_SCHEDULE = {
  type: 'daily',
  days: [0, 1, 2, 3, 4, 5, 6] // Sunday = 0
};

// Schedule presets
export const SCHEDULE_PRESETS = {
  daily: {
    label: 'Every day',
    type: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6]
  },
  weekdays: {
    label: 'Weekdays',
    type: 'weekdays',
    days: [1, 2, 3, 4, 5]
  },
  weekends: {
    label: 'Weekends',
    type: 'weekends',
    days: [0, 6]
  },
  custom: {
    label: 'Specific days',
    type: 'specific_days',
    days: []
  }
};

export default {
  CATEGORIES,
  PREDEFINED_HABITS,
  getCategory,
  getHabitsForCategory,
  getPredefinedHabit,
  generateTicker,
  DEFAULT_SCHEDULE,
  SCHEDULE_PRESETS
};
