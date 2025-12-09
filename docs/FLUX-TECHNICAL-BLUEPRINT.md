# Flux Technical Blueprint

**Architecture, Stack & Implementation**

**Last Updated:** December 8, 2025

---

## Document Purpose

This document defines the technical architecture for Flux. It covers the current prototype, target architecture, and implementation details. This is a living document that will expand during the build phase.

For product specifications, see FLUX-PRODUCT-BLUEPRINT.md.
For timeline, see FLUX-ROADMAP.md.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Current Prototype](#2-current-prototype)
3. [Target Architecture](#3-target-architecture)
4. [Data Models](#4-data-models)
5. [Key Algorithms](#5-key-algorithms)
6. [Goal Algorithms](#6-goal-algorithms)
7. [API Integrations](#7-api-integrations)
8. [Security Considerations](#8-security-considerations)
9. [Development Workflow](#9-development-workflow)

---

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React)                          │
├─────────────────────────────────────────────────────────────┤
│  UI Components  │  Contexts  │  Utilities  │  Styles        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
├─────────────────────────────────────────────────────────────┤
│  HabitContext (behaviors, logs, transfers, goals)           │
│  NavigationContext (page transitions)                        │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
│  localStorage   │ │  Anthropic    │ │  Future:        │
│  (MVT)          │ │  Claude API   │ │  Supabase +     │
│                 │ │               │ │  Stripe + Plaid │
└─────────────────┘ └───────────────┘ └─────────────────┘
```

### Architecture Principles

1. **Single Source of Truth** - All behavior data flows through HabitContext
2. **Client-First for MVT** - localStorage persistence, no backend required
3. **Mobile-First Design** - Touch interactions, responsive layouts
4. **Offline Capable** - App functions without network (except AI features)
5. **Migration Ready** - Data structures designed for cloud migration

---

## 2. Current Prototype

### Tech Stack (Deployed)

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React 18 | Vite build system |
| State | React Context | HabitContext, NavigationContext |
| Styling | CSS Modules | CSS variables for theming |
| Persistence | localStorage | Client-side only |
| Hosting | Vercel | Automatic deployments |
| Version Control | GitHub | Main branch deploys |

### Folder Structure

```
flux-2.0/
├── src/
│   ├── components/
│   │   ├── common/          # Shared UI components
│   │   ├── behaviors/       # Behavior-related components
│   │   ├── portfolio/       # Portfolio views
│   │   ├── goals/           # Goal setup and progress
│   │   ├── activity/        # Activity feed
│   │   └── GoalSetup/       # Goal configuration component
│   ├── contexts/
│   │   ├── HabitContext.jsx
│   │   └── NavigationContext.jsx
│   ├── pages/
│   │   ├── Home/
│   │   ├── Portfolio/
│   │   ├── Indices/
│   │   ├── Activity/
│   │   ├── Settings/
│   │   ├── Onboarding/
│   │   └── BehaviorDetail/
│   ├── utils/
│   │   ├── HABIT_LIBRARY.js  # Behavior definitions with goal configs
│   │   ├── calculations.js   # Money & score calculations
│   │   ├── patterns.js       # Pattern recognition
│   │   ├── goals.js          # Goal progress & projections
│   │   └── formatters.js     # Display formatting
│   ├── styles/
│   │   └── variables.css    # Theme variables
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

### Context Architecture

**HabitContext.jsx** - Central state management
```javascript
{
  habits: [...],           // All behavior configurations with goals
  logs: [...],             // Activity log entries
  pendingBalance: number,  // Current week earnings
  portfolioBalance: number, // Total transferred
  transfers: [...],        // Transfer history
  user: {...}              // User preferences
}
```

**NavigationContext.jsx** - Page transitions
```javascript
{
  direction: 'forward' | 'back',
  setDirection: function
}
```

---

## 3. Target Architecture

### Phase 4+ Architecture (Post-Validation)

```
┌─────────────────────────────────────────────────────────────┐
│                   MOBILE CLIENT                              │
│              (React Native - iOS/Android)                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions  │  Anthropic API                  │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
│  Supabase       │ │  Stripe       │ │  Plaid          │
│  PostgreSQL     │ │  Treasury     │ │  Link           │
│  Auth           │ │  Transfers    │ │  Bank Connect   │
└─────────────────┘ └───────────────┘ └─────────────────┘
```

### Target Tech Stack

| Layer | Technology | Phase |
|-------|------------|-------|
| Mobile | React Native | Phase 6 |
| Web | React (maintained) | Phase 1+ |
| Backend | Supabase | Phase 4 |
| Database | PostgreSQL | Phase 4 |
| Auth | Supabase Auth | Phase 4 |
| Banking | Stripe Treasury | Phase 4 |
| Bank Linking | Plaid | Phase 4 |
| AI | Anthropic Claude | Phase 1+ |
| Notifications | Firebase/OneSignal | Phase 5 |

---

## 4. Data Models

### Behavior Model

```javascript
{
  id: string,              // UUID
  ticker: string,          // e.g., "$RUN", "$GYM"
  name: string,            // Display name
  libraryId: string,       // Reference to HABIT_LIBRARY
  rateType: string,        // BINARY | DURATION | DISTANCE | COUNT
  rateAmount: number,      // Dollar amount per unit
  rateUnit: string,        // "session" | "minute" | "mile" | "step"
  isPassBehavior: boolean, // true for avoidance behaviors
  createdAt: timestamp,
  
  // User-set goal (REQUIRED at setup)
  goal: {
    amount: number,        // Target value (e.g., 15, 10000, 30)
    period: string,        // 'day' | 'week' | 'month'
    setAt: timestamp       // When goal was created/updated
  },
  
  // Pattern Recognition (calculated, not stored directly)
  baseline: {
    frequency: number,     // Logs per 14-day period
    typicalGap: number,    // Median days between logs
    gapVariance: number,   // Consistency measure
    avgUnits: number,      // Average units per log
    avgPerPeriod: {        // Avg units normalized to common periods
      day: number,
      week: number,
      month: number
    },
    status: string,        // 'building' | 'emerging' | 'established'
    lastRatchet: timestamp | null  // When baseline last increased
  }
}
```

### HABIT_LIBRARY.js Structure

```javascript
// Example entries with goal configuration
{
  id: 'running',
  ticker: '$RUN',
  name: 'Running',
  description: 'Track your runs by distance',
  rateType: 'DISTANCE',
  rateUnit: 'mile',
  rateOptions: [
    { label: '$0.50/mile', value: 0.50, description: 'Light commitment' },
    { label: '$1.00/mile', value: 1.00, description: 'Recommended' },
    { label: '$2.00/mile', value: 2.00, description: 'High stakes' }
  ],
  
  // Goal configuration
  goalConfig: {
    unit: 'miles',                    // Display unit for goals
    defaultPeriod: 'week',            // Pre-selected period
    suggestedGoals: [
      { label: '5-10 miles/week', amount: 7.5, period: 'week' },
      { label: '10-20 miles/week', amount: 15, period: 'week' },
      { label: '20-30 miles/week', amount: 25, period: 'week' },
      { label: '30+ miles/week', amount: 35, period: 'week' }
    ],
    defaultGoal: { amount: 10, period: 'week' }
  }
}

// Pass behavior example (avoidance - lower is better)
{
  id: 'takeout',
  ticker: '$TAKEOUT',
  name: 'Takeout',
  description: 'Track when you pass on ordering takeout',
  rateType: 'BINARY',
  rateUnit: 'pass',
  isPassBehavior: true,
  rateOptions: [
    { label: '$5/pass', value: 5, description: 'Light commitment' },
    { label: '$7/pass', value: 7, description: 'Recommended' },
    { label: '$10/pass', value: 10, description: 'High stakes' }
  ],
  
  goalConfig: {
    unit: 'orders',                    // What you're avoiding
    defaultPeriod: 'week',
    isAvoidance: true,                 // Lower is better
    suggestedGoals: [
      { label: 'Max 3x/week', amount: 3, period: 'week' },
      { label: 'Max 2x/week', amount: 2, period: 'week' },
      { label: 'Max 1x/week', amount: 1, period: 'week' },
      { label: 'None (0/week)', amount: 0, period: 'week' }
    ],
    defaultGoal: { amount: 2, period: 'week' }
  }
}
```

### Log Model

```javascript
{
  id: string,              // UUID
  habitId: string,         // Reference to behavior
  timestamp: timestamp,    // When logged
  units: number,           // Duration/distance/count (1 for binary)
  earned: number,          // Dollar amount earned
  notes: string,           // Optional user notes
  
  // For Pass behaviors
  isPass: boolean,         // true if this was a "Pass" action
}
```

### Transfer Model

```javascript
{
  id: string,              // UUID
  date: timestamp,         // Friday transfer date
  amount: number,          // Total transferred
  breakdown: [             // Per-behavior breakdown
    { habitId: string, amount: number }
  ],
  status: string           // "pending" | "completed" | "failed"
}
```

### User Model (Phase 4+)

```javascript
{
  id: string,              // UUID
  email: string,
  createdAt: timestamp,
  
  // Plaid (Phase 4)
  plaidAccessToken: string,
  linkedAccountId: string,
  
  // Stripe Treasury (Phase 4)
  stripeCustomerId: string,
  treasuryAccountId: string,
  
  // Preferences
  preferences: {
    notifications: boolean,
    weeklyReports: boolean
  }
}
```

---

## 5. Key Algorithms

### Flux Score Calculation

**Total Score: 100 points across 5 components**

```javascript
function calculateFluxScore(habit, logs) {
  // Require minimum 10 logs
  if (logs.length < 10) {
    return { score: null, status: 'building' };
  }
  
  const baseline = calculateBaseline(logs);
  const recentLogs = logs.filter(l => isWithin14Days(l.timestamp));
  
  // 1. Frequency Trend (30 points)
  const recentFrequency = recentLogs.length;
  const frequencyScore = 30 * Math.min(1, recentFrequency / baseline.frequency);
  
  // 2. Consistency (25 points)
  const gaps = calculateGaps(recentLogs);
  const gapVariance = standardDeviation(gaps);
  const consistencyScore = 25 * Math.exp(-gapVariance / baseline.typicalGap);
  
  // 3. Recency (20 points)
  const daysSinceLog = daysSince(mostRecentLog(logs));
  const recencyScore = 20 * Math.exp(-daysSinceLog / baseline.typicalGap);
  
  // 4. Volume/Intensity (15 points)
  const recentAvgUnits = average(recentLogs.map(l => l.units));
  const volumeScore = 15 * Math.min(1, recentAvgUnits / baseline.avgUnits);
  
  // 5. Data Maturity (10 points)
  const maturityScore = 10 * Math.min(1, logs.length / 30);
  
  const totalScore = frequencyScore + consistencyScore + 
                     recencyScore + volumeScore + maturityScore;
  
  return {
    score: Math.round(totalScore),
    components: {
      frequency: frequencyScore,
      consistency: consistencyScore,
      recency: recencyScore,
      volume: volumeScore,
      maturity: maturityScore
    },
    status: 'established'
  };
}
```

### Pattern Recognition

```javascript
function calculateBaseline(logs) {
  const sortedLogs = logs.sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate gaps between consecutive logs
  const gaps = [];
  for (let i = 1; i < sortedLogs.length; i++) {
    gaps.push(daysBetween(sortedLogs[i-1].timestamp, sortedLogs[i].timestamp));
  }
  
  const avgUnits = average(logs.map(l => l.units));
  const frequency = logs.length / 14;  // Logs per 14-day period
  
  return {
    frequency: frequency,
    typicalGap: median(gaps),
    gapVariance: standardDeviation(gaps),
    avgUnits: avgUnits,
    avgPerPeriod: {
      day: avgUnits * frequency / 14,
      week: avgUnits * frequency / 2,
      month: avgUnits * frequency * 2.14
    },
    status: getBaselineStatus(logs.length),
    lastRatchet: null
  };
}

function getBaselineStatus(logCount) {
  if (logCount < 10) return 'building';
  if (logCount < 30) return 'emerging';
  return 'established';
}
```

### Money Calculations

```javascript
function calculateEarnings(habit, log) {
  switch (habit.rateType) {
    case 'BINARY':
      return habit.rateAmount;  // Flat rate per session/pass
    case 'DURATION':
      return habit.rateAmount * log.units;  // $ per minute
    case 'DISTANCE':
      return habit.rateAmount * log.units;  // $ per mile
    case 'COUNT':
      return habit.rateAmount * log.units;  // $ per unit
    default:
      return 0;
  }
}

function processWeeklyTransfer(habits, logs, currentWeekStart) {
  const weekLogs = logs.filter(l => 
    l.timestamp >= currentWeekStart && 
    l.timestamp < addDays(currentWeekStart, 7)
  );
  
  let totalAmount = 0;
  const breakdown = [];
  
  for (const habit of habits) {
    const habitLogs = weekLogs.filter(l => l.habitId === habit.id);
    const habitTotal = habitLogs.reduce((sum, l) => sum + l.earned, 0);
    
    if (habitTotal > 0) {
      breakdown.push({ habitId: habit.id, amount: habitTotal });
      totalAmount += habitTotal;
    }
  }
  
  return {
    date: getFriday(currentWeekStart),
    amount: totalAmount,
    breakdown,
    status: 'completed'
  };
}
```

---

## 6. Goal Algorithms

### Goal Progress Calculation

```javascript
/**
 * Calculate goal progress for a behavior
 * @param {Object} habit - Behavior with goal and baseline
 * @param {Array} logs - All logs for this behavior
 * @returns {Object} Goal progress metrics
 */
function calculateGoalProgress(habit, logs) {
  const { goal, baseline } = habit;
  
  // Goal is required, but check for safety
  if (!goal) {
    console.warn('Behavior missing required goal:', habit.id);
    return { mode: 'error', message: 'Goal not set' };
  }
  
  // Baseline not established yet
  if (!baseline || baseline.status === 'building') {
    return {
      mode: 'calibrating',
      goal: goal,
      message: 'Building baseline...'
    };
  }
  
  // Normalize baseline to goal's period
  const baselineInPeriod = normalizeToPeriod(
    baseline.avgUnits,
    'week',  // baseline is typically calculated per week
    goal.period
  );
  
  // Calculate recent performance in goal's period
  const recentPerformance = calculateRecentPerformance(logs, goal.period);
  
  // Calculate gap and progress
  const gap = goal.amount - baselineInPeriod;
  const currentGap = goal.amount - recentPerformance;
  
  // Progress: 0% at baseline, 100% at goal
  let progressPercent = 0;
  if (gap > 0) {
    const progressFromBaseline = recentPerformance - baselineInPeriod;
    progressPercent = Math.max(0, Math.min(100, (progressFromBaseline / gap) * 100));
  } else {
    // Baseline already at or above goal
    progressPercent = 100;
  }
  
  return {
    mode: 'growth',
    goal: goal,
    baseline: baselineInPeriod,
    current: recentPerformance,
    gap: currentGap,
    progressPercent: Math.round(progressPercent),
    trend: calculateTrend(logs, goal.period),
    atOrAboveGoal: recentPerformance >= goal.amount
  };
}

/**
 * Normalize a value from one period to another
 */
function normalizeToPeriod(value, fromPeriod, toPeriod) {
  const daysMap = { day: 1, week: 7, month: 30 };
  const fromDays = daysMap[fromPeriod];
  const toDays = daysMap[toPeriod];
  return value * (toDays / fromDays);
}

/**
 * Calculate recent performance in a given period
 */
function calculateRecentPerformance(logs, period) {
  const daysMap = { day: 1, week: 7, month: 30 };
  const periodDays = daysMap[period];
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);
  
  const recentLogs = logs.filter(l => new Date(l.timestamp) >= cutoff);
  
  // Sum units for measurable behaviors, count for binary
  const totalUnits = recentLogs.reduce((sum, log) => sum + (log.units || 1), 0);
  
  return totalUnits;
}

/**
 * Calculate trend (recent period vs previous period)
 */
function calculateTrend(logs, period) {
  const daysMap = { day: 1, week: 7, month: 30 };
  const periodDays = daysMap[period];
  
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - periodDays);
  const prevPeriodStart = new Date(periodStart);
  prevPeriodStart.setDate(prevPeriodStart.getDate() - periodDays);
  
  const currentPeriodLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    return d >= periodStart && d <= now;
  });
  
  const prevPeriodLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    return d >= prevPeriodStart && d < periodStart;
  });
  
  const currentTotal = currentPeriodLogs.reduce((sum, l) => sum + (l.units || 1), 0);
  const prevTotal = prevPeriodLogs.reduce((sum, l) => sum + (l.units || 1), 0);
  
  if (prevTotal === 0) return { direction: 'neutral', percent: 0 };
  
  const percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
  
  return {
    direction: percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'neutral',
    percent: Math.round(percentChange)
  };
}
```

### Goal Financial Projections

```javascript
/**
 * Calculate financial projections for a goal
 * @param {Object} habit - Behavior with goal and rate
 * @returns {Object} Financial projections
 */
function calculateGoalProjections(habit) {
  const { goal, rateAmount, baseline } = habit;
  
  if (!goal) return null;
  
  // Calculate earnings at goal
  const goalPerWeek = normalizeToPeriod(goal.amount, goal.period, 'week');
  const earningsAtGoal = goalPerWeek * rateAmount;
  
  // Calculate earnings at baseline (if available)
  let earningsAtBaseline = 0;
  let gap = 0;
  
  if (baseline && baseline.status !== 'building') {
    const baselinePerWeek = baseline.avgUnits * (7 / 14); // baseline is per 14 days
    earningsAtBaseline = baselinePerWeek * rateAmount;
    gap = earningsAtGoal - earningsAtBaseline;
  }
  
  return {
    atGoal: {
      weekly: earningsAtGoal,
      monthly: earningsAtGoal * 4.33,
      yearly: earningsAtGoal * 52
    },
    atBaseline: {
      weekly: earningsAtBaseline,
      monthly: earningsAtBaseline * 4.33,
      yearly: earningsAtBaseline * 52
    },
    gap: {
      weekly: gap,
      monthly: gap * 4.33,
      yearly: gap * 52
    },
    capturePercent: earningsAtGoal > 0 
      ? Math.round((earningsAtBaseline / earningsAtGoal) * 100) 
      : 100
  };
}

/**
 * Calculate portfolio-level goal projections
 */
function calculatePortfolioGoalProjections(habits) {
  let totalAtBaseline = 0;
  let totalAtGoal = 0;
  
  habits.forEach(habit => {
    const projections = calculateGoalProjections(habit);
    if (projections) {
      totalAtBaseline += projections.atBaseline.weekly;
      totalAtGoal += projections.atGoal.weekly;
    }
  });
  
  return {
    atBaseline: {
      weekly: totalAtBaseline,
      monthly: totalAtBaseline * 4.33,
      yearly: totalAtBaseline * 52
    },
    atGoal: {
      weekly: totalAtGoal,
      monthly: totalAtGoal * 4.33,
      yearly: totalAtGoal * 52
    },
    potential: {
      weekly: totalAtGoal - totalAtBaseline,
      monthly: (totalAtGoal - totalAtBaseline) * 4.33,
      yearly: (totalAtGoal - totalAtBaseline) * 52
    },
    capturePercent: totalAtGoal > 0 
      ? Math.round((totalAtBaseline / totalAtGoal) * 100) 
      : 100
  };
}
```

### Baseline Ratchet Detection

```javascript
/**
 * Check if baseline should ratchet up
 * Minimum 4 weeks between ratchets
 * @param {Object} habit - Behavior with baseline
 * @param {Array} logs - All logs for this behavior
 * @returns {Object} Ratchet recommendation
 */
function checkBaselineRatchet(habit, logs) {
  const { baseline, goal } = habit;
  
  // Only ratchet if baseline is established
  if (!baseline || baseline.status !== 'established') {
    return { shouldRatchet: false, reason: 'Baseline not established' };
  }
  
  // Don't ratchet more than once per 4 weeks
  if (baseline.lastRatchet) {
    const weeksSinceRatchet = daysBetween(baseline.lastRatchet, new Date()) / 7;
    if (weeksSinceRatchet < 4) {
      return { 
        shouldRatchet: false, 
        reason: 'Too soon since last ratchet',
        weeksUntilEligible: Math.ceil(4 - weeksSinceRatchet)
      };
    }
  }
  
  // Get performance over last 4 weeks
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const recentLogs = logs.filter(l => new Date(l.timestamp) >= fourWeeksAgo);
  
  // Calculate weekly averages for last 4 weeks
  const weeklyTotals = [0, 0, 0, 0];
  recentLogs.forEach(log => {
    const daysAgo = daysBetween(new Date(log.timestamp), new Date());
    const weekIndex = Math.floor(daysAgo / 7);
    if (weekIndex < 4) {
      weeklyTotals[weekIndex] += log.units || 1;
    }
  });
  
  // Ratchet threshold: 15% above baseline
  const baselinePerWeek = baseline.avgUnits * (7 / 14);
  const threshold = baselinePerWeek * 1.15;
  
  // Count weeks above threshold
  const weeksAboveThreshold = weeklyTotals.filter(w => w >= threshold).length;
  
  // Need at least 3 of 4 weeks above threshold
  if (weeksAboveThreshold >= 3) {
    const recentAvg = weeklyTotals.reduce((a, b) => a + b, 0) / 4;
    
    // New baseline: weighted average (30% old, 70% recent)
    const newBaseline = (baselinePerWeek * 0.3) + (recentAvg * 0.7);
    
    return {
      shouldRatchet: true,
      oldBaseline: baselinePerWeek,
      newBaseline: newBaseline,
      improvement: Math.round(((newBaseline - baselinePerWeek) / baselinePerWeek) * 100),
      weeksAboveThreshold: weeksAboveThreshold
    };
  }
  
  return {
    shouldRatchet: false,
    reason: `Only ${weeksAboveThreshold} of 4 weeks above threshold`,
    threshold: threshold,
    weeklyTotals: weeklyTotals
  };
}

/**
 * Apply baseline ratchet
 */
function applyBaselineRatchet(habit, newBaselineValue) {
  return {
    ...habit,
    baseline: {
      ...habit.baseline,
      avgUnits: newBaselineValue * (14 / 7), // Convert back to 14-day format
      lastRatchet: new Date().toISOString()
    }
  };
}

// Helper function
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
}
```

### HabitContext Goal Methods

```javascript
// Add to HabitContext.jsx

// Set or update goal for a behavior (goals are required)
const setHabitGoal = (habitId, goal) => {
  if (!goal || !goal.amount || !goal.period) {
    console.warn('Invalid goal:', goal);
    return;
  }
  
  setHabits(prev => prev.map(habit => {
    if (habit.id === habitId) {
      return {
        ...habit,
        goal: {
          amount: goal.amount,
          period: goal.period,
          setAt: new Date().toISOString()
        }
      };
    }
    return habit;
  }));
};

// Check and apply baseline ratchet
const checkAndApplyRatchet = (habitId) => {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return null;
  
  const habitLogs = logs.filter(l => l.habitId === habitId);
  const ratchetResult = checkBaselineRatchet(habit, habitLogs);
  
  if (ratchetResult.shouldRatchet) {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return applyBaselineRatchet(h, ratchetResult.newBaseline);
      }
      return h;
    }));
  }
  
  return ratchetResult;
};

// Get goal progress for a behavior
const getGoalProgress = (habitId) => {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return null;
  
  const habitLogs = logs.filter(l => l.habitId === habitId);
  return calculateGoalProgress(habit, habitLogs);
};

// Get financial projections for a behavior
const getGoalProjections = (habitId) => {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return null;
  
  return calculateGoalProjections(habit);
};

// Get portfolio-level projections
const getPortfolioProjections = () => {
  return calculatePortfolioGoalProjections(habits);
};
```

---

## 7. API Integrations

### Anthropic Claude API (Phase 1)

**Use Cases:**
- Contextual insights on behavior performance
- Pattern observations
- Goal coaching suggestions
- Optional chat exploration

**Implementation:**
```javascript
// Vercel Edge Function or direct client call
async function getFluxInsight(habitData, userContext) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: FLUX_AI_SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: formatContextForAI(habitData, userContext) }
    ]
  });
  
  return response.content[0].text;
}
```

**Cost Management:**
- Cache common insights
- Limit to 3% of revenue target
- Optimize prompt length

### Plaid API (Phase 4)

**Use Cases:**
- Link user bank accounts
- Verify account ownership
- Check available balance before transfers

**Key Endpoints:**
- `/link/token/create` - Initialize Plaid Link
- `/item/public_token/exchange` - Get access token
- `/accounts/balance/get` - Check balance

### Stripe Treasury API (Phase 4)

**Use Cases:**
- Create FDIC-insured accounts
- Process Friday transfers
- Handle withdrawals

**Key Endpoints:**
- `/v1/treasury/financial_accounts` - Create/manage accounts
- `/v1/treasury/outbound_transfers` - Process transfers
- `/v1/treasury/transactions` - Transaction history

---

## 8. Security Considerations

### MVT Phase (localStorage)

| Risk | Mitigation |
|------|------------|
| Data in browser storage | Accept for MVP; warn users data is local-only |
| No authentication | Accept for MVP; single-user assumption |
| API key exposure | Use Vercel Edge Functions for AI calls |

### Phase 4+ (Production)

| Area | Implementation |
|------|----------------|
| Authentication | Supabase Auth (email, OAuth) |
| Data encryption | PostgreSQL encryption at rest |
| API security | Row-level security in Supabase |
| Banking | Stripe/Plaid handle PCI compliance |
| Secrets | Environment variables, Vercel secrets |

### Data Privacy

- Opt-in for index data contribution
- Anonymized aggregation for indices
- GDPR compliance planned
- Clear data deletion process

---

## 9. Development Workflow

### Git Workflow

```
main (production)
  └── develop (integration)
       ├── feature/goals-setup
       ├── feature/goal-progress
       └── fix/money-calculation
```

**Process:**
1. Create feature branch from develop
2. Implement and test locally
3. Push and create PR
4. Review and merge to develop
5. Test in staging
6. Merge develop to main for production

### Local Development

```bash
# Clone and install
git clone [repo]
cd flux-2.0
npm install

# Run development server
npm run dev

# Access on mobile (same network)
# Use network IP shown in terminal
```

### Deployment

- **Vercel** auto-deploys main branch
- Preview deployments for PRs
- Environment variables in Vercel dashboard

### Testing Strategy

**Manual Testing (MVT):**
- Test critical flows on mobile device
- Verify money calculations with edge cases
- Check data persistence across sessions
- Test goal setup and progress display

**Automated Testing (Phase 4+):**
- Unit tests for calculations (Jest)
- Integration tests for API flows
- E2E tests for critical paths (Playwright)

---

## Appendix: Technical Decisions

| Decision | Rationale |
|----------|-----------|
| React over React Native for MVT | Faster iteration, deploy via web, RN for Phase 6 |
| localStorage over backend | Reduces complexity for validation phase |
| Supabase over custom backend | Faster development, built-in auth, real-time |
| Stripe Treasury over alternatives | Best docs, ecosystem integration, FDIC included |
| Vercel over alternatives | Free tier, automatic deploys, edge functions |
| Goals required at setup | Ensures aspirational targets from day one |
| Min 4 weeks between ratchets | Prevents baseline from chasing user too aggressively |
| Goals don't affect Flux Score | Score measures health; goals measure aspiration |

---

*Flux Technologies LLC | December 2025*
