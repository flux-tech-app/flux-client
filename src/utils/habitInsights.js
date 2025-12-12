/**
 * habitInsights.js
 * Pure calculation functions for habit insights
 * No AI required - deterministic logic + templates
 */

import { MIN_LOGS_FOR_FLUX, LOGS_FOR_ESTABLISHED } from './constants';
import { getCalibrationStatus } from './calibrationStatus';

/**
 * Calculate days since habit creation
 */
export const getDaysActive = (habit) => {
  const now = new Date();
  const created = new Date(habit.createdAt);
  return Math.max(1, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
};

/**
 * Calculate completion rate for a given period
 */
export const getCompletionRate = (habit, logs, days = 30) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const periodLogs = logs.filter(log => new Date(log.timestamp) >= startDate);
  
  // Calculate expected completions based on schedule
  const getExpectedCompletions = (numDays) => {
    if (!habit.schedule) return numDays;
    const { type, days: scheduleDays } = habit.schedule;
    switch (type) {
      case 'daily': return numDays;
      case 'weekdays': return Math.floor(numDays * 5 / 7);
      case 'weekends': return Math.floor(numDays * 2 / 7);
      case 'specific_days': return Math.floor(numDays * (scheduleDays?.length || 7) / 7);
      default: return numDays;
    }
  };
  
  const expected = getExpectedCompletions(days);
  return expected > 0 ? Math.min(100, Math.round((periodLogs.length / expected) * 100)) : 0;
};

/**
 * Progress Milestones
 * Shows progress toward next earnings milestone
 */
export const calculateMilestone = (habit, logs) => {
  const totalEarnings = logs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
  const milestones = [25, 50, 100, 250, 500, 1000, 2500, 5000];
  
  const nextMilestone = milestones.find(m => m > totalEarnings);
  const previousMilestone = [...milestones].reverse().find(m => m <= totalEarnings) || 0;
  
  if (!nextMilestone) {
    return {
      reached: true,
      current: totalEarnings,
      message: "You've reached all milestones!",
      celebrateAmount: milestones[milestones.length - 1]
    };
  }
  
  const remaining = nextMilestone - totalEarnings;
  const progress = ((totalEarnings - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  
  // Estimate completions needed
  const avgEarningsPerLog = logs.length > 0 ? totalEarnings / logs.length : (habit.rate || 1);
  const completionsNeeded = Math.ceil(remaining / avgEarningsPerLog);
  
  return {
    reached: false,
    current: totalEarnings,
    target: nextMilestone,
    remaining: remaining,
    progress: Math.round(progress),
    completionsNeeded: completionsNeeded,
    message: `${completionsNeeded} completion${completionsNeeded !== 1 ? 's' : ''} away from $${nextMilestone} lifetime`
  };
};

/**
 * Difficulty Calibration
 * Is the habit right-sized for the user?
 * Uses log count thresholds per blueprint (10 logs minimum)
 */
export const assessDifficulty = (habit, logs) => {
  const daysActive = getDaysActive(habit);
  const calibrationStatus = getCalibrationStatus(logs);
  const completionRate = getCompletionRate(habit, logs, Math.min(30, daysActive));

  // Need at least MIN_LOGS_FOR_FLUX (10) logs for meaningful calibration
  if (calibrationStatus.isCalibrating) {
    return {
      status: 'evaluating',
      icon: '📊',
      title: 'Gathering Data',
      message: calibrationStatus.message,
      suggestion: null,
      completionRate: completionRate,
      logCount: calibrationStatus.logCount
    };
  }

  // Mastered - too easy (at least 30 logs for established baseline)
  if (completionRate >= 95 && calibrationStatus.isEstablished) {
    return {
      status: 'mastered',
      icon: '🎯',
      title: 'Ready for More',
      message: `Above 95% with ${calibrationStatus.logCount} logs - this habit is locked in`,
      suggestion: 'Consider increasing frequency or transfer amount to grow your challenge',
      completionRate: completionRate,
      logCount: calibrationStatus.logCount
    };
  }

  // Struggling - too hard
  if (completionRate < 70) {
    return {
      status: 'struggling',
      icon: '⚠️',
      title: 'Needs Adjustment',
      message: `${completionRate}% completion rate suggests this might be too ambitious`,
      suggestion: 'Consider reducing frequency or lowering the transfer amount',
      completionRate: completionRate,
      logCount: calibrationStatus.logCount
    };
  }

  // Slightly challenging but manageable
  if (completionRate >= 70 && completionRate < 80) {
    return {
      status: 'challenging',
      icon: '💪',
      title: 'Challenging',
      message: `${completionRate}% completion - pushing yourself appropriately`,
      suggestion: 'This is a growth zone. Stick with it or adjust if needed.',
      completionRate: completionRate,
      logCount: calibrationStatus.logCount
    };
  }

  // Well calibrated
  return {
    status: 'calibrated',
    icon: '✓',
    title: 'Well Calibrated',
    message: `${completionRate}% completion rate is sustainable and challenging`,
    suggestion: null,
    completionRate: completionRate,
    logCount: calibrationStatus.logCount
  };
};

/**
 * Habit Maturity Stage
 * Different stages of habit formation
 */
export const getMaturityStage = (habit) => {
  const daysActive = getDaysActive(habit);
  
  if (daysActive < 21) {
    return {
      stage: 'forming',
      icon: '🌱',
      title: 'Forming',
      dayRange: '0-21 days',
      daysIn: daysActive,
      daysUntilNext: 21 - daysActive,
      progress: Math.round((daysActive / 21) * 100),
      description: 'Building the neural pathway',
      insight: 'Focus on consistency over perfection. Missing a day is normal - just get back on track.',
      nextStage: 'Establishing'
    };
  }
  
  if (daysActive < 60) {
    return {
      stage: 'establishing',
      icon: '🌿',
      title: 'Establishing',
      dayRange: '21-60 days',
      daysIn: daysActive,
      daysUntilNext: 60 - daysActive,
      progress: Math.round(((daysActive - 21) / 39) * 100),
      description: 'Habit is taking root',
      insight: 'The initial excitement may fade. This is where discipline matters most.',
      nextStage: 'Strengthening'
    };
  }
  
  if (daysActive < 90) {
    return {
      stage: 'strengthening',
      icon: '🌳',
      title: 'Strengthening',
      dayRange: '60-90 days',
      daysIn: daysActive,
      daysUntilNext: 90 - daysActive,
      progress: Math.round(((daysActive - 60) / 30) * 100),
      description: 'Becoming automatic',
      insight: 'The habit is integrating into your routine. Keep building momentum.',
      nextStage: 'Stable'
    };
  }
  
  if (daysActive < 180) {
    return {
      stage: 'stable',
      icon: '🏛️',
      title: 'Stable',
      dayRange: '90-180 days',
      daysIn: daysActive,
      daysUntilNext: 180 - daysActive,
      progress: Math.round(((daysActive - 90) / 90) * 100),
      description: 'Part of your identity',
      insight: 'This habit is now part of who you are. Consider increasing the challenge.',
      nextStage: 'Mastered'
    };
  }
  
  return {
    stage: 'mastered',
    icon: '⭐',
    title: 'Mastered',
    dayRange: '180+ days',
    daysIn: daysActive,
    daysUntilNext: null,
    progress: 100,
    description: 'Fully integrated behavior',
    insight: 'This behavior is second nature. Your consistency here can inspire other habits.',
    nextStage: null
  };
};

/**
 * Generate all insights for a habit
 * Main entry point for HabitDetail page
 */
export const generateHabitInsights = (habit, logs) => {
  const habitLogs = logs.filter(log => log.habitId === habit.id);
  
  return {
    milestone: calculateMilestone(habit, habitLogs),
    calibration: assessDifficulty(habit, habitLogs),
    maturity: getMaturityStage(habit),
    daysActive: getDaysActive(habit),
    totalLogs: habitLogs.length
  };
};

export default generateHabitInsights;
