/**
 * indexDataGenerator.js
 *
 * Generates realistic example data for behavior indices
 * Used for MVT demonstration purposes
 */

import { HABIT_LIBRARY, ACTION_TYPES } from './HABIT_LIBRARY';

const STORAGE_KEY = 'flux_index_demo_data';

/**
 * Generate a random number with normal distribution (bell curve)
 * Using Box-Muller transform
 */
function normalRandom(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate index data for a single behavior
 */
function generateBehaviorIndex(behavior, options = {}) {
  const {
    minParticipants = 200,
    maxParticipants = 2000,
    distribution = 'realistic'
  } = options;

  // Base participant count
  const participants = Math.floor(minParticipants + Math.random() * (maxParticipants - minParticipants));

  // Generate index average based on distribution type
  let indexAverage;
  switch (distribution) {
    case 'high':
      indexAverage = clamp(normalRandom(78, 6), 65, 95);
      break;
    case 'mixed':
      indexAverage = clamp(normalRandom(68, 12), 40, 95);
      break;
    case 'realistic':
    default:
      indexAverage = clamp(normalRandom(70, 10), 50, 90);
  }

  // Weekly change (-3% to +5%)
  const change = clamp(normalRandom(0.8, 2), -3, 5);

  // Generate score distribution buckets
  const distribution_buckets = generateDistribution(participants, indexAverage, distribution);

  // Generate historical data (weekly snapshots for last 12 weeks)
  const history = generateHistory(indexAverage, change);

  return {
    behaviorId: behavior.id,
    name: behavior.name,
    ticker: behavior.ticker,
    participants,
    indexAverage: Math.round(indexAverage * 10) / 10,
    change: Math.round(change * 10) / 10,
    distribution: distribution_buckets,
    history,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate score distribution across buckets
 */
function generateDistribution(participants, indexAverage, distType) {
  // Define buckets: 0-30, 30-50, 50-70, 70-85, 85-100
  const buckets = {
    struggling: 0,    // 0-30: Very low scores
    starting: 0,      // 30-50: Starting out
    building: 0,      // 50-70: Building consistency
    strong: 0,        // 70-85: Strong performers
    top: 0            // 85-100: Top performers
  };

  // Adjust distribution based on index average and type
  if (distType === 'high') {
    buckets.top = Math.floor(participants * 0.20);
    buckets.strong = Math.floor(participants * 0.35);
    buckets.building = Math.floor(participants * 0.30);
    buckets.starting = Math.floor(participants * 0.12);
    buckets.struggling = participants - buckets.top - buckets.strong - buckets.building - buckets.starting;
  } else if (distType === 'mixed') {
    buckets.top = Math.floor(participants * 0.08);
    buckets.strong = Math.floor(participants * 0.17);
    buckets.building = Math.floor(participants * 0.35);
    buckets.starting = Math.floor(participants * 0.25);
    buckets.struggling = participants - buckets.top - buckets.strong - buckets.building - buckets.starting;
  } else {
    // Realistic bell curve centered around index average
    const topRatio = indexAverage > 75 ? 0.12 : indexAverage > 65 ? 0.08 : 0.05;
    const strongRatio = indexAverage > 70 ? 0.25 : indexAverage > 60 ? 0.20 : 0.15;
    const buildingRatio = 0.40;
    const startingRatio = indexAverage < 65 ? 0.25 : indexAverage < 75 ? 0.20 : 0.15;

    buckets.top = Math.floor(participants * topRatio);
    buckets.strong = Math.floor(participants * strongRatio);
    buckets.building = Math.floor(participants * buildingRatio);
    buckets.starting = Math.floor(participants * startingRatio);
    buckets.struggling = participants - buckets.top - buckets.strong - buckets.building - buckets.starting;
  }

  return buckets;
}

/**
 * Generate historical weekly snapshots
 */
function generateHistory(currentAverage, recentChange) {
  const history = [];
  let avg = currentAverage;

  // Generate 12 weeks of history, working backwards
  for (let i = 0; i < 12; i++) {
    history.unshift({
      week: i,
      average: Math.round(avg * 10) / 10,
      date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Work backwards with some variation
    const weeklyChange = normalRandom(recentChange / 4, 1);
    avg = clamp(avg - weeklyChange, 50, 90);
  }

  return history;
}

/**
 * Generate example data for all LOG behaviors
 */
export function generateAllIndexData(options = {}) {
  const logBehaviors = HABIT_LIBRARY.filter(b => b.actionType === ACTION_TYPES.LOG);

  const behaviors = {};
  let totalParticipants = 0;
  let totalScore = 0;

  logBehaviors.forEach(behavior => {
    const indexData = generateBehaviorIndex(behavior, options);
    behaviors[behavior.id] = indexData;
    totalParticipants += indexData.participants;
    totalScore += indexData.indexAverage * indexData.participants;
  });

  // Calculate weighted average across all indices
  const overallAverage = totalParticipants > 0 ? totalScore / totalParticipants : 70;
  const overallChange = Object.values(behaviors).reduce((sum, b) => sum + b.change, 0) / logBehaviors.length;

  const data = {
    generatedAt: new Date().toISOString(),
    overall: {
      average: Math.round(overallAverage * 10) / 10,
      change: Math.round(overallChange * 10) / 10,
      totalBehaviors: logBehaviors.length,
      totalParticipants
    },
    behaviors
  };

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  return data;
}

/**
 * Get stored index data or generate new if none exists
 */
export function getIndexData() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored index data, generating new');
    }
  }

  return generateAllIndexData();
}

/**
 * Get index data for a specific behavior
 */
export function getBehaviorIndexData(behaviorId) {
  const data = getIndexData();
  return data.behaviors[behaviorId] || null;
}

/**
 * Clear stored index data
 */
export function clearIndexData() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if index data exists
 */
export function hasIndexData() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Calculate user percentile based on their score and index distribution
 */
export function calculateUserPercentile(userScore, indexData) {
  if (!indexData || !userScore) return null;

  const { distribution, participants, indexAverage } = indexData;

  // Estimate percentile based on user score relative to distribution
  // This is a simplified calculation for demo purposes
  if (userScore >= 85) {
    // Top bucket
    const topPercent = (distribution.top / participants) * 100;
    return Math.max(1, Math.round(topPercent * (1 - (userScore - 85) / 15)));
  } else if (userScore >= 70) {
    // Strong bucket
    const abovePercent = (distribution.top / participants) * 100;
    const bucketPercent = (distribution.strong / participants) * 100;
    const position = (userScore - 70) / 15; // 0 to 1 within bucket
    return Math.round(abovePercent + bucketPercent * (1 - position));
  } else if (userScore >= 50) {
    // Building bucket
    const abovePercent = ((distribution.top + distribution.strong) / participants) * 100;
    const bucketPercent = (distribution.building / participants) * 100;
    const position = (userScore - 50) / 20;
    return Math.round(abovePercent + bucketPercent * (1 - position));
  } else if (userScore >= 30) {
    // Starting bucket
    const abovePercent = ((distribution.top + distribution.strong + distribution.building) / participants) * 100;
    const bucketPercent = (distribution.starting / participants) * 100;
    const position = (userScore - 30) / 20;
    return Math.round(abovePercent + bucketPercent * (1 - position));
  } else {
    // Struggling bucket
    const abovePercent = ((participants - distribution.struggling) / participants) * 100;
    return Math.round(abovePercent + (distribution.struggling / participants) * 100 * (1 - userScore / 30));
  }
}

/**
 * Generate default index data with consistent seed for demo
 * This ensures the same "example" data appears consistently
 */
export function generateDefaultIndexData() {
  // Use predefined values for consistent demo experience
  const defaultData = {
    running: { participants: 847, indexAverage: 71.3, change: 1.8 },
    gym: { participants: 1247, indexAverage: 68.2, change: 2.4 },
    pushups: { participants: 634, indexAverage: 65.8, change: -0.3 },
    walking: { participants: 1892, indexAverage: 74.2, change: 1.2 },
    crunches: { participants: 423, indexAverage: 62.4, change: 0.9 },
    budget: { participants: 312, indexAverage: 69.7, change: -1.1 },
    cook: { participants: 756, indexAverage: 72.1, change: 2.8 },
    reading: { participants: 523, indexAverage: 67.9, change: 0.5 },
    study: { participants: 689, indexAverage: 64.3, change: 1.4 },
    meditation: { participants: 623, indexAverage: 54.7, change: -0.8 },
    journal: { participants: 445, indexAverage: 71.5, change: 1.9 },
    compliment: { participants: 289, indexAverage: 76.3, change: 3.2 },
    makebed: { participants: 934, indexAverage: 78.9, change: 0.7 }
  };

  const logBehaviors = HABIT_LIBRARY.filter(b => b.actionType === ACTION_TYPES.LOG);
  const behaviors = {};
  let totalParticipants = 0;
  let totalScore = 0;

  logBehaviors.forEach(behavior => {
    const preset = defaultData[behavior.id] || {
      participants: 500,
      indexAverage: 70,
      change: 0
    };

    const distribution = generateDistribution(preset.participants, preset.indexAverage, 'realistic');
    const history = generateHistory(preset.indexAverage, preset.change);

    behaviors[behavior.id] = {
      behaviorId: behavior.id,
      name: behavior.name,
      ticker: behavior.ticker,
      participants: preset.participants,
      indexAverage: preset.indexAverage,
      change: preset.change,
      distribution,
      history,
      generatedAt: new Date().toISOString()
    };

    totalParticipants += preset.participants;
    totalScore += preset.indexAverage * preset.participants;
  });

  const overallAverage = totalParticipants > 0 ? totalScore / totalParticipants : 70;
  const overallChange = Object.values(behaviors).reduce((sum, b) => sum + b.change, 0) / logBehaviors.length;

  const data = {
    generatedAt: new Date().toISOString(),
    overall: {
      average: Math.round(overallAverage * 10) / 10,
      change: Math.round(overallChange * 10) / 10,
      totalBehaviors: logBehaviors.length,
      totalParticipants
    },
    behaviors
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export default {
  generateAllIndexData,
  generateDefaultIndexData,
  getIndexData,
  getBehaviorIndexData,
  clearIndexData,
  hasIndexData,
  calculateUserPercentile
};
