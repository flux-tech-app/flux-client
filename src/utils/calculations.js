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

/**
 * Get next Friday transfer date
 * Returns formatted string like "Friday, Nov 8"
 */
export function getNextTransferDate() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
  
  let daysUntilFriday;
  if (dayOfWeek <= 5) {
    // If today is Sunday through Friday, get this Friday
    daysUntilFriday = 5 - dayOfWeek;
  } else {
    // If today is Saturday, get next Friday (6 days away)
    daysUntilFriday = 6;
  }
  
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  
  // Format as "Friday, Nov 8"
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  return nextFriday.toLocaleDateString('en-US', options);
}

/**
 * Calculate comprehensive habit statistics
 * Used in HabitDetail page for streaks and weekly data
 */
export function calculateHabitStats(habitLogs) {
  if (habitLogs.length === 0) {
    return {
      longestStreak: 0,
      thisWeekCount: 0,
      thisWeekTotal: 7,
      totalLogs: 0
    };
  }

  // Calculate longest streak
  const sortedLogs = [...habitLogs].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  let longestStreak = 0;
  let currentStreakCount = 1;
  let previousDate = new Date(sortedLogs[0].timestamp);
  previousDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedLogs.length; i++) {
    const currentDate = new Date(sortedLogs[i].timestamp);
    currentDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      currentStreakCount++;
      longestStreak = Math.max(longestStreak, currentStreakCount);
    } else if (daysDiff > 1) {
      currentStreakCount = 1;
    }
    // If same day, don't increment streak
    
    previousDate = currentDate;
  }
  
  longestStreak = Math.max(longestStreak, currentStreakCount);

  // Calculate this week's activity
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekLogs = habitLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= startOfWeek;
  });

  // Count unique days in this week
  const uniqueDays = new Set(
    thisWeekLogs.map(log => {
      const date = new Date(log.timestamp);
      return date.toDateString();
    })
  );

  return {
    longestStreak,
    thisWeekCount: uniqueDays.size,
    thisWeekTotal: 7,
    totalLogs: habitLogs.length
  };
}

/**
 * Get activity chart data for different time periods
 * Used in HabitDetail page for activity visualization
 */
export function getActivityChartData(habitLogs, period) {
  if (habitLogs.length === 0) {
    return [];
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Determine start date based on period
  let startDate = new Date(now);
  let numBars;
  
  switch (period) {
    case '30D':
      startDate.setDate(now.getDate() - 30);
      numBars = 30;
      break;
    case '90D':
      startDate.setDate(now.getDate() - 90);
      numBars = 30; // Show 30 bars, each representing 3 days
      break;
    case '1Y':
      startDate.setFullYear(now.getFullYear() - 1);
      numBars = 52; // Show 52 bars, each representing 1 week
      break;
    case 'All':
      // Use earliest log date
      const sortedLogs = [...habitLogs].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      startDate = new Date(sortedLogs[0].timestamp);
      startDate.setHours(0, 0, 0, 0);
      
      // Calculate weeks between start and now
      const weeks = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24 * 7));
      numBars = Math.min(weeks, 52); // Cap at 52 bars
      break;
    default:
      startDate.setDate(now.getDate() - 30);
      numBars = 30;
  }

  // Filter logs within the date range
  const relevantLogs = habitLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    logDate.setHours(0, 0, 0, 0);
    return logDate >= startDate && logDate <= now;
  });

  if (relevantLogs.length === 0) {
    return [];
  }

  // Group logs by time buckets
  const totalDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  const daysPerBar = Math.max(1, Math.ceil(totalDays / numBars));
  
  const buckets = Array(numBars).fill(0).map(() => ({ count: 0, isToday: false }));
  
  relevantLogs.forEach(log => {
    const logDate = new Date(log.timestamp);
    logDate.setHours(0, 0, 0, 0);
    
    const daysFromStart = Math.floor((logDate - startDate) / (1000 * 60 * 60 * 24));
    const bucketIndex = Math.min(Math.floor(daysFromStart / daysPerBar), numBars - 1);
    
    buckets[bucketIndex].count++;
  });

  // Mark today's bucket
  const todayIndex = Math.min(Math.floor((now - startDate) / (1000 * 60 * 60 * 24) / daysPerBar), numBars - 1);
  buckets[todayIndex].isToday = true;

  // Calculate max count for percentage scaling
  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  // Convert to chart data with percentages
  return buckets.map(bucket => ({
    count: bucket.count,
    percentage: Math.max((bucket.count / maxCount) * 100, 5), // Minimum 5% for visibility
    isToday: bucket.isToday
  }));
}

/**
 * Format activity timestamp for display
 * Used in HabitDetail page activity feed
 */
export function formatActivityTime(timestamp) {
  const logDate = new Date(timestamp);
  const now = new Date();
  
  // Reset hours for date comparison
  const logDay = new Date(logDate);
  logDay.setHours(0, 0, 0, 0);
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const daysDiff = Math.floor((today - logDay) / (1000 * 60 * 60 * 24));
  
  // Format time
  const timeStr = logDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Determine date label
  if (daysDiff === 0) {
    return `Today at ${timeStr}`;
  } else if (daysDiff === 1) {
    return `Yesterday at ${timeStr}`;
  } else if (daysDiff < 7) {
    const dayName = logDate.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} at ${timeStr}`;
  } else {
    const dateStr = logDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${dateStr} at ${timeStr}`;
  }
}
