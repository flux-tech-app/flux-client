// Flux 2.0 - Calculation Utilities

/**
 * Calculate total portfolio value from all logs
 */
export function calculateTotalValue(logs) {
  if (!logs || logs.length === 0) return 0;
  return logs.reduce((total, log) => total + log.totalEarnings, 0);
}

/**
 * Calculate today's earnings from logs
 */
export function calculateTodayEarnings(logs) {
  if (!logs || logs.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });
  
  return todayLogs.reduce((total, log) => total + log.totalEarnings, 0);
}

/**
 * Calculate total earnings for a specific habit
 */
export function calculateHabitValue(logs, habitId) {
  if (!logs || logs.length === 0) return 0;
  return logs
    .filter(log => log.habitId === habitId)
    .reduce((total, log) => total + log.totalEarnings, 0);
}

/**
 * Calculate current streak for a habit
 */
export function calculateStreak(logs, habitId) {
  if (!logs || logs.length === 0) return 0;
  
  const habitLogs = logs
    .filter(log => log.habitId === habitId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (habitLogs.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Check if logged today
  const lastLogDate = new Date(habitLogs[0].timestamp);
  lastLogDate.setHours(0, 0, 0, 0);
  
  // If not logged today or yesterday, streak is 0
  const daysSinceLastLog = Math.floor((currentDate - lastLogDate) / (1000 * 60 * 60 * 24));
  if (daysSinceLastLog > 1) return 0;
  
  // Count consecutive days
  for (let i = 0; i < habitLogs.length; i++) {
    const logDate = new Date(habitLogs[i].timestamp);
    logDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - streak);
    
    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get logs for a specific habit
 */
export function getHabitLogs(logs, habitId) {
  if (!logs || logs.length === 0) return [];
  return logs
    .filter(log => log.habitId === habitId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get logs for a specific date
 */
export function getLogsByDate(logs, date) {
  if (!logs || logs.length === 0) return [];
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === targetDate.getTime();
  });
}

/**
 * Calculate weekly earnings
 */
export function calculateWeeklyEarnings(logs) {
  if (!logs || logs.length === 0) return 0;
  
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return logs
    .filter(log => new Date(log.timestamp) >= weekAgo)
    .reduce((total, log) => total + log.totalEarnings, 0);
}

/**
 * Calculate monthly earnings
 */
export function calculateMonthlyEarnings(logs) {
  if (!logs || logs.length === 0) return 0;
  
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  
  return logs
    .filter(log => new Date(log.timestamp) >= monthAgo)
    .reduce((total, log) => total + log.totalEarnings, 0);
}

/**
 * Get chart data for a habit (last 30 days)
 */
export function getChartData(logs, habitId, days = 30) {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayLogs = logs.filter(log => {
      if (log.habitId !== habitId) return false;
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === date.getTime();
    });
    
    const earnings = dayLogs.reduce((sum, log) => sum + log.totalEarnings, 0);
    
    data.push({
      date: date.toISOString().split('T')[0],
      earnings: earnings
    });
  }
  
  return data;
}
