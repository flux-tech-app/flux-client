/**
 * Goal Calculations Utility
 *
 * Utility functions for calculating goal progress, earnings projections,
 * and rate-type-specific visualizations.
 */

/**
 * Normalize a value from one period to another
 * @param {number} value - The value to convert
 * @param {string} fromPeriod - The source period ('day' | 'week' | 'month')
 * @param {string} toPeriod - The target period ('day' | 'week' | 'month')
 * @returns {number} The converted value
 */
export function normalizeToPeriod(value, fromPeriod, toPeriod) {
  if (!value || !fromPeriod || !toPeriod) return 0;
  const daysMap = { day: 1, week: 7, month: 30 };
  const fromDays = daysMap[fromPeriod] || 1;
  const toDays = daysMap[toPeriod] || 1;
  return value * (toDays / fromDays);
}

/**
 * Group logs by week (returns array of arrays, most recent first)
 */
function groupLogsByWeek(logs, weeksCount = 4) {
  const now = new Date();
  const weeks = [];

  for (let i = 0; i < weeksCount; i++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    weeks.unshift(weekLogs); // Add to front so oldest is first
  }

  return weeks;
}

/**
 * Group logs by day (returns array for last N days)
 */
function groupLogsByDay(logs, daysCount = 14) {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const days = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const dayEnd = new Date(now);
    dayEnd.setDate(dayEnd.getDate() - i);
    dayEnd.setHours(23, 59, 59, 999);

    const dayStart = new Date(dayEnd);
    dayStart.setHours(0, 0, 0, 0);

    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= dayStart && logDate <= dayEnd;
    });

    days.push({
      date: new Date(dayStart),
      logs: dayLogs,
      total: dayLogs.reduce((sum, log) => sum + (log.units || log.amount || 1), 0)
    });
  }

  return days;
}

/**
 * Get current week data (Sunday to Saturday)
 * Returns an array of 7 days with their totals and labels
 */
function getCurrentWeekData(logs) {
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday

  // Find start of current week (Sunday)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const currentWeekDays = [];

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= dayStart && logDate <= dayEnd;
    });

    currentWeekDays.push({
      date: new Date(dayStart),
      label: dayLabels[i],
      logs: dayLogs,
      total: dayLogs.reduce((sum, log) => sum + (log.units || log.amount || 1), 0),
      count: dayLogs.length
    });
  }

  return currentWeekDays;
}

/**
 * Get today's logs
 */
function getTodayLogs(logs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= today && logDate < tomorrow;
  });
}

/**
 * Calculate earnings at goal vs current
 */
export function calculateEarningsImpact(habit, currentPerPeriod) {
  const { goal, rate } = habit;
  if (!goal || !rate) return null;

  const daysMap = { day: 1, week: 7, month: 30 };
  const periodDays = daysMap[goal.period] || 7;

  // Goal earnings
  const goalWeekly = (goal.amount / periodDays) * 7 * rate;
  const goalAnnual = goalWeekly * 52;

  // Current earnings
  const currentWeekly = (currentPerPeriod / periodDays) * 7 * rate;
  const currentAnnual = currentWeekly * 52;

  // Gap
  const gapWeekly = goalWeekly - currentWeekly;
  const gapAnnual = goalAnnual - currentAnnual;

  return {
    atGoal: { weekly: goalWeekly, annual: goalAnnual },
    current: { weekly: currentWeekly, annual: currentAnnual },
    gap: { weekly: gapWeekly, annual: gapAnnual }
  };
}

// ============================================
// RATE-TYPE-SPECIFIC CALCULATIONS
// ============================================

/**
 * BINARY Habits (Frequency-Based)
 * Examples: Gym, Meditation sessions, Reading sessions
 */
export function calculateBinaryGoalData(habit, logs) {
  const { goal, baseline } = habit;
  if (!goal) return null;

  // Group logs by week (last 4 weeks)
  const weeklyBuckets = groupLogsByWeek(logs, 4);

  // Count sessions per week
  const weeklyFrequencies = weeklyBuckets.map(weekLogs => weekLogs.length);

  // Normalize goal to weekly
  const goalFrequency = normalizeToPeriod(goal.amount, goal.period, 'week');
  const baselineFrequency = baseline?.avgPerPeriod
    ? normalizeToPeriod(baseline.avgPerPeriod, goal.period, 'week')
    : 0;

  // Calculate current average (4-week)
  const totalSessions = weeklyFrequencies.reduce((a, b) => a + b, 0);
  const currentFrequency = totalSessions / 4;

  // Hit rate = % of weeks that met goal
  const weeksAtGoal = weeklyFrequencies.filter(f => f >= goalFrequency).length;
  const hitRate = (weeksAtGoal / 4) * 100;

  // Progress percentage (from baseline to goal)
  const progress = goalFrequency > baselineFrequency
    ? Math.min(100, Math.max(0, ((currentFrequency - baselineFrequency) / (goalFrequency - baselineFrequency)) * 100))
    : currentFrequency >= goalFrequency ? 100 : 0;

  // Earnings impact
  const earnings = calculateEarningsImpact(habit, currentFrequency * (goal.period === 'week' ? 1 : goal.period === 'day' ? 7 : 7/4.3));

  // Current week data for visualization
  const currentWeekDays = getCurrentWeekData(logs);
  const today = new Date();
  const todayIndex = today.getDay();

  // For BINARY habits, check if each day has at least one session
  const daysAtGoalThisWeek = currentWeekDays
    .slice(0, todayIndex + 1)
    .filter(d => d.count >= 1).length;
  const totalDaysThisWeek = todayIndex + 1;

  return {
    type: 'BINARY',
    goalFrequency,
    baselineFrequency,
    currentFrequency,
    weeklyFrequencies,
    weeksAtGoal,
    hitRate,
    gap: goalFrequency - currentFrequency,
    progress,
    earnings,
    currentWeekDays,
    daysAtGoalThisWeek,
    totalDaysThisWeek
  };
}

/**
 * DURATION Habits (Time-Based)
 * Examples: Meditation (minutes), Study time, Deep work
 */
export function calculateDurationGoalData(habit, logs) {
  const { goal, baseline } = habit;
  if (!goal) return null;

  // Get last 14 days for daily view
  const dailyData = groupLogsByDay(logs, 14);
  const dailyTotals = dailyData.map(d => d.total);

  // Normalize goal to daily
  const goalDaily = normalizeToPeriod(goal.amount, goal.period, 'day');
  const baselineDaily = baseline?.avgPerPeriod
    ? normalizeToPeriod(baseline.avgPerPeriod, goal.period, 'day')
    : 0;

  // Count days at goal
  const daysAtGoal = dailyTotals.filter(d => d >= goalDaily).length;
  const achievementRate = (daysAtGoal / 14) * 100;

  // Current average (14-day)
  const currentDaily = dailyTotals.reduce((a, b) => a + b, 0) / 14;

  // Weekly breakdown
  const thisWeekTotal = dailyTotals.slice(7).reduce((a, b) => a + b, 0);
  const lastWeekTotal = dailyTotals.slice(0, 7).reduce((a, b) => a + b, 0);
  const goalWeekly = normalizeToPeriod(goal.amount, goal.period, 'week');

  // Longest session
  const allDurations = logs.map(l => l.units || l.amount || 0);
  const longestSession = allDurations.length > 0 ? Math.max(...allDurations) : 0;

  // Progress percentage
  const progress = goalDaily > baselineDaily
    ? Math.min(100, Math.max(0, ((currentDaily - baselineDaily) / (goalDaily - baselineDaily)) * 100))
    : currentDaily >= goalDaily ? 100 : 0;

  // Earnings impact
  const earnings = calculateEarningsImpact(habit, currentDaily * (goal.period === 'day' ? 1 : goal.period === 'week' ? 1/7 : 1/30));

  // Current week data for visualization
  const currentWeekDays = getCurrentWeekData(logs);
  const today = new Date();
  const todayIndex = today.getDay();

  // For DURATION habits, check if each day meets daily goal
  const daysAtGoalThisWeek = currentWeekDays
    .slice(0, todayIndex + 1)
    .filter(d => d.total >= goalDaily).length;
  const totalDaysThisWeek = todayIndex + 1;

  // Today's progress
  const todayLogs = getTodayLogs(logs);
  const todayTotal = todayLogs.reduce((sum, l) => sum + (l.units || l.amount || 0), 0);
  const todayRemaining = Math.max(0, goalDaily - todayTotal);

  return {
    type: 'DURATION',
    goalDaily,
    baselineDaily,
    currentDaily,
    dailyTotals,
    dailyData,
    daysAtGoal,
    achievementRate,
    thisWeekTotal,
    lastWeekTotal,
    goalWeekly,
    longestSession,
    gap: goalDaily - currentDaily,
    progress,
    earnings,
    currentWeekDays,
    daysAtGoalThisWeek,
    totalDaysThisWeek,
    todayTotal,
    todayRemaining
  };
}

/**
 * DISTANCE Habits (Distance-Based)
 * Examples: Running, Cycling, Swimming
 */
export function calculateDistanceGoalData(habit, logs) {
  const { goal, baseline } = habit;
  if (!goal) return null;

  // Get last 6 weeks for trend
  const weeklyBuckets = groupLogsByWeek(logs, 6);

  // Weekly totals
  const weeklyMileage = weeklyBuckets.map(weekLogs =>
    weekLogs.reduce((sum, log) => sum + (log.units || log.amount || 0), 0)
  );

  // Normalize to weekly
  const goalWeekly = normalizeToPeriod(goal.amount, goal.period, 'week');
  const baselineWeekly = baseline?.avgPerPeriod
    ? normalizeToPeriod(baseline.avgPerPeriod, goal.period, 'week')
    : 0;

  // Current average (6-week)
  const currentWeekly = weeklyMileage.reduce((a, b) => a + b, 0) / 6;

  // This week's progress (partial week)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysIntoWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // If Sunday, count as 7
  const currentWeekTotal = weeklyMileage[weeklyMileage.length - 1] || 0;
  const projectedThisWeek = daysIntoWeek > 0 ? (currentWeekTotal / daysIntoWeek) * 7 : 0;

  // Trend calculation (compare recent 3 weeks to older 3 weeks)
  const recentAvg = weeklyMileage.slice(3).reduce((a, b) => a + b, 0) / 3;
  const olderAvg = weeklyMileage.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const trend = recentAvg > olderAvg * 1.1 ? 'improving' :
                recentAvg < olderAvg * 0.9 ? 'declining' : 'stable';

  // Longest run
  const allDistances = logs.map(l => l.units || l.amount || 0);
  const longestRun = allDistances.length > 0 ? Math.max(...allDistances) : 0;

  // Recent runs (last 5)
  const recentRuns = [...logs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
    .map(log => ({
      date: new Date(log.timestamp),
      distance: log.units || log.amount || 0,
      earnings: (log.units || log.amount || 0) * habit.rate
    }));

  // Progress percentage
  const progress = goalWeekly > baselineWeekly
    ? Math.min(100, Math.max(0, ((currentWeekly - baselineWeekly) / (goalWeekly - baselineWeekly)) * 100))
    : currentWeekly >= goalWeekly ? 100 : 0;

  // This week progress percentage
  const thisWeekProgress = goalWeekly > 0 ? (currentWeekTotal / goalWeekly) * 100 : 0;

  // Earnings impact
  const earnings = calculateEarningsImpact(habit, currentWeekly * (goal.period === 'week' ? 1 : goal.period === 'day' ? 7 : 7/4.3));

  // Current week data for visualization
  const currentWeekDays = getCurrentWeekData(logs);
  const todayIndex = today.getDay();

  // For DISTANCE habits, show days with activity
  const dailyGoal = goalWeekly / 7;
  const daysAtGoalThisWeek = currentWeekDays
    .slice(0, todayIndex + 1)
    .filter(d => d.total >= dailyGoal).length;
  const totalDaysThisWeek = todayIndex + 1;

  return {
    type: 'DISTANCE',
    goalWeekly,
    baselineWeekly,
    currentWeekly,
    weeklyMileage,
    currentWeekTotal,
    projectedThisWeek,
    thisWeekProgress,
    trend,
    longestRun,
    recentRuns,
    gap: goalWeekly - currentWeekTotal,
    progress,
    earnings,
    currentWeekDays,
    daysAtGoalThisWeek,
    totalDaysThisWeek
  };
}

/**
 * COUNT Habits (Unit-Based)
 * Examples: Walking (steps), Pushups, Water glasses
 */
export function calculateCountGoalData(habit, logs) {
  const { goal, baseline } = habit;
  if (!goal) return null;

  // Get last 7 days for daily chart
  const dailyData = groupLogsByDay(logs, 7);
  const dailyCounts = dailyData.map(d => d.total);

  // Day labels
  const dayLabels = dailyData.map(d => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.date.getDay()];
  });

  // Normalize to daily
  const goalDaily = normalizeToPeriod(goal.amount, goal.period, 'day');
  const baselineDaily = baseline?.avgPerPeriod
    ? normalizeToPeriod(baseline.avgPerPeriod, goal.period, 'day')
    : 0;

  // Days at goal
  const daysAtGoal = dailyCounts.filter(d => d >= goalDaily).length;
  const achievementRate = (daysAtGoal / 7) * 100;

  // Current average (7-day)
  const currentDaily = dailyCounts.reduce((a, b) => a + b, 0) / 7;

  // This week total
  const thisWeekTotal = dailyCounts.reduce((a, b) => a + b, 0);
  const goalWeekly = normalizeToPeriod(goal.amount, goal.period, 'week');
  const weekProgress = goalWeekly > 0 ? (thisWeekTotal / goalWeekly) * 100 : 0;

  // Today's progress
  const todayLogs = getTodayLogs(logs);
  const todayTotal = todayLogs.reduce((sum, l) => sum + (l.units || l.amount || 1), 0);
  const todayRemaining = Math.max(0, goalDaily - todayTotal);
  const todayProgress = goalDaily > 0 ? (todayTotal / goalDaily) * 100 : 0;

  // Highest day
  const highestDay = dailyCounts.length > 0 ? Math.max(...dailyCounts) : 0;
  const highestDayIndex = dailyCounts.indexOf(highestDay);
  const highestDayLabel = dayLabels[highestDayIndex] || '';

  // Progress percentage (from baseline to goal)
  const progress = goalDaily > baselineDaily
    ? Math.min(100, Math.max(0, ((currentDaily - baselineDaily) / (goalDaily - baselineDaily)) * 100))
    : currentDaily >= goalDaily ? 100 : 0;

  // Earnings impact
  const earnings = calculateEarningsImpact(habit, currentDaily * (goal.period === 'day' ? 1 : goal.period === 'week' ? 1/7 : 1/30));

  // Current week data for visualization
  const currentWeekDays = getCurrentWeekData(logs);
  const today = new Date();
  const todayIndex = today.getDay();

  // For COUNT habits, check if each day meets daily goal
  const daysAtGoalThisWeek = currentWeekDays
    .slice(0, todayIndex + 1)
    .filter(d => d.total >= goalDaily).length;
  const totalDaysThisWeek = todayIndex + 1;

  return {
    type: 'COUNT',
    goalDaily,
    baselineDaily,
    currentDaily,
    dailyCounts,
    dailyData,
    dayLabels,
    daysAtGoal,
    achievementRate,
    thisWeekTotal,
    goalWeekly,
    weekProgress,
    todayTotal,
    todayRemaining,
    todayProgress,
    highestDay,
    highestDayLabel,
    gap: goalDaily - currentDaily,
    progress,
    earnings,
    currentWeekDays,
    daysAtGoalThisWeek,
    totalDaysThisWeek
  };
}

/**
 * Get the appropriate goal calculation based on rate type
 */
export function calculateGoalData(habit, logs) {
  if (!habit?.goal) return null;

  const rateType = habit.rateType?.toUpperCase() || 'BINARY';

  switch (rateType) {
    case 'BINARY':
      return calculateBinaryGoalData(habit, logs);
    case 'DURATION':
      return calculateDurationGoalData(habit, logs);
    case 'DISTANCE':
      return calculateDistanceGoalData(habit, logs);
    case 'COUNT':
      return calculateCountGoalData(habit, logs);
    default:
      return calculateBinaryGoalData(habit, logs);
  }
}

/**
 * Format a goal for display
 */
export function formatGoal(goal, unit) {
  if (!goal) return '';
  const amount = goal.amount.toLocaleString();
  return `${amount} ${unit} / ${goal.period}`;
}
