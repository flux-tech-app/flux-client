/**
 * Chart Calculations for Habit Analytics
 * 
 * Transforms habit and log data into chart-ready formats.
 * Handles three habit types: duration, count, and binary/completion.
 * 
 * ADAPTED FOR EXISTING DATA STRUCTURE:
 * - Uses log.timestamp (not log.date)
 * - Uses log.totalEarnings (not log.earnings)
 * - Uses log.amount (not log.duration/count)
 * - Uses habit.rate (number, not object)
 */

import { 
  getPeriodRange, 
  getPreviousPeriodRange, 
  generateCalendarGrid,
  isDateInRange,
  isFuture,
  isToday
} from './dateHelpers.js';

/**
 * Convert timestamp to date string
 * @private
 */
function getDateFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0]; // 'yyyy-MM-dd'
}

/**
 * Get Progress Chart Data
 * Adapts to habit type: duration (minutes), count (units), or completion (%)
 * 
 * @param {Object} habit - Habit object with rateType
 * @param {Array} logs - Array of log objects for this habit
 * @param {string} period - Time period ('7D', '30D', '90D', '1Y', 'All')
 * @returns {Object} Chart data with values and metadata
 */
export function getProgressChartData(habit, logs, period) {
  // Convert logs to have date strings
  const logsWithDates = logs.map(log => ({
    ...log,
    date: getDateFromTimestamp(log.timestamp)
  }));

  // Get oldest log date for 'All' period
  const oldestLog = logsWithDates.length > 0 
    ? logsWithDates.reduce((oldest, log) => log.date < oldest ? log.date : oldest, logsWithDates[0].date)
    : null;

  const { startDate, endDate, dates } = getPeriodRange(period, oldestLog);

  // Filter logs to period
  const periodLogs = logsWithDates.filter(log => 
    isDateInRange(log.date, startDate, endDate)
  );

  // Group logs by date
  const logsByDate = groupLogsByDate(periodLogs);

  // Determine value type based on habit
  const valueType = getHabitValueType(habit);

  // Map each date to a data point
  const chartData = dates.map(date => {
    const log = logsByDate[date];
    let value = null;

    if (log) {
      switch (valueType) {
        case 'duration':
          // Check both 'duration' and 'amount' fields for backward compatibility
          value = log.duration || log.amount || 0;
          break;
        case 'count':
          // Check both 'count' and 'amount' fields
          value = log.count || log.amount || 0;
          break;
        case 'completion':
          // Check if any activity was logged
          value = (log.duration || log.amount || log.count) ? 100 : 0;
          break;
        default:
          value = 0;
      }
    }

    return {
      date,
      value,
      hasData: !!log,
      log: log || null
    };
  });

  // Calculate max value for scaling
  const actualMax = Math.max(...chartData.map(d => d.value || 0), 1);
  
  // Financial app scaling logic - context-dependent padding
  let displayMax;
  
  if (valueType === 'completion') {
    // Completion: always 0-100%
    displayMax = 100;
  } else if (actualMax === 0) {
    // No data: show minimal range
    displayMax = valueType === 'duration' ? 60 : 10;
  } else if (actualMax < 10) {
    // Very small values: 50% padding
    displayMax = actualMax * 1.5;
  } else if (actualMax < 30) {
    // Small values: 40% padding
    displayMax = actualMax * 1.4;
  } else {
    // Normal values: 35% padding
    displayMax = actualMax * 1.35;
  }

  return {
    data: chartData,
    valueType,
    maxValue: displayMax, // Use padded value for display
    period,
    startDate,
    endDate
  };
}

/**
 * Get Earnings Chart Data
 * Line chart showing daily earnings over time
 * 
 * @param {Array} logs - Array of log objects for this habit
 * @param {string} period - Time period ('7D', '30D', '90D', '1Y', 'All')
 * @returns {Object} Earnings chart data with cumulative totals
 */
export function getEarningsChartData(logs, period) {
  // Convert logs to have date strings
  const logsWithDates = logs.map(log => ({
    ...log,
    date: getDateFromTimestamp(log.timestamp),
    earnings: log.totalEarnings || 0
  }));

  // Get oldest log date for 'All' period
  const oldestLog = logsWithDates.length > 0 
    ? logsWithDates.reduce((oldest, log) => log.date < oldest ? log.date : oldest, logsWithDates[0].date)
    : null;

  const { startDate, endDate, dates } = getPeriodRange(period, oldestLog);

  // Filter logs to period
  const periodLogs = logsWithDates.filter(log => 
    isDateInRange(log.date, startDate, endDate)
  );

  // Group logs by date
  const logsByDate = groupLogsByDate(periodLogs);

  // Map each date to earnings
  let cumulativeEarnings = 0;
  const chartData = dates.map(date => {
    const log = logsByDate[date];
    const dailyEarnings = log ? (log.earnings || 0) : 0;
    cumulativeEarnings += dailyEarnings;

    return {
      date,
      earnings: dailyEarnings,
      cumulativeEarnings,
      hasData: !!log
    };
  });

  // Calculate max for scaling
  const maxEarnings = Math.max(...chartData.map(d => d.earnings), 0.01);
  const maxCumulative = Math.max(...chartData.map(d => d.cumulativeEarnings), 0.01);
  const minCumulative = Math.min(...chartData.map(d => d.cumulativeEarnings), 0);
  
  // Financial app scaling logic
  let displayMax;
  
  // Calculate actual range
  const range = maxCumulative - minCumulative;
  
  if (range === 0 || maxCumulative < 0.01) {
    // Flat or near-zero: show minimal range for visual interest
    displayMax = Math.max(maxCumulative * 2, 1);
  } else if (range < 1) {
    // Small values: 50% padding + round to nice number
    const padded = maxCumulative * 1.5;
    // Round to nearest $0.25, $0.50, or $1.00
    if (padded < 1) {
      displayMax = Math.ceil(padded * 4) / 4; // Round to $0.25
    } else if (padded < 5) {
      displayMax = Math.ceil(padded * 2) / 2; // Round to $0.50
    } else {
      displayMax = Math.ceil(padded);
    }
  } else if (range < 10) {
    // Medium values: 40% padding + round to $1 or $2
    const padded = maxCumulative * 1.4;
    if (padded < 10) {
      displayMax = Math.ceil(padded);
    } else {
      displayMax = Math.ceil(padded / 2) * 2;
    }
  } else if (range < 50) {
    // Larger values: 35% padding + round to $5
    const padded = maxCumulative * 1.35;
    displayMax = Math.ceil(padded / 5) * 5;
  } else {
    // Very large values: 30% padding + round to $10 or $25
    const padded = maxCumulative * 1.3;
    if (padded < 200) {
      displayMax = Math.ceil(padded / 10) * 10;
    } else {
      displayMax = Math.ceil(padded / 25) * 25;
    }
  }

  return {
    data: chartData,
    maxEarnings,
    totalEarnings: cumulativeEarnings,
    displayMax, // Padded value for Y-axis and scaling
    period,
    startDate,
    endDate
  };
}

/**
 * Get Calendar Heatmap Data
 * Shows completion status for each day of the current month
 * 
 * @param {Object} habit - Habit object
 * @param {Array} logs - Array of log objects for this habit
 * @param {number} [year] - Year (defaults to current)
 * @param {number} [month] - Month 1-12 (defaults to current)
 * @returns {Object} Calendar grid with status for each day
 */
export function getCalendarHeatmapData(habit, logs, year = null, month = null) {
  const calendarGrid = generateCalendarGrid(
    year || new Date().getFullYear(),
    month || new Date().getMonth() + 1
  );

  // Convert logs to have date strings
  const logsWithDates = logs.map(log => ({
    ...log,
    date: getDateFromTimestamp(log.timestamp)
  }));

  // Group logs by date for quick lookup
  const logsByDate = groupLogsByDate(logsWithDates);

  // Determine value type and max for intensity calculation
  const valueType = getHabitValueType(habit);
  const allValues = logsWithDates
    .map(log => {
      if (valueType === 'duration') return log.duration || log.amount || 0;
      if (valueType === 'count') return log.count || log.amount || 0;
      return 100; // completion type
    })
    .filter(v => v > 0);
  
  const maxValue = Math.max(...allValues, 1);

  // Enhance calendar grid with log data
  const enhancedGrid = calendarGrid.map(dayCell => {
    if (dayCell.isEmpty) return dayCell;

    const log = logsByDate[dayCell.date];

    return {
      ...dayCell,
      log: log || null,
      status: determineStatus(log, dayCell, habit, valueType, maxValue)
    };
  });

  return {
    grid: enhancedGrid,
    year: year || new Date().getFullYear(),
    month: month || new Date().getMonth() + 1,
    valueType
  };
}

/**
 * Calculate Period Summary Metric
 * Shows aggregate stat for current view/period
 * 
 * @param {Object} habit - Habit object
 * @param {Array} logs - Array of log objects for this habit
 * @param {string} period - Time period
 * @param {string} view - 'progress' or 'earnings'
 * @returns {Object} Summary metric data
 */
export function calculatePeriodSummary(habit, logs, period, view) {
  // Convert logs to have date strings
  const logsWithDates = logs.map(log => ({
    ...log,
    date: getDateFromTimestamp(log.timestamp)
  }));

  const { startDate, endDate } = getPeriodRange(period);

  const periodLogs = logsWithDates.filter(log => 
    isDateInRange(log.date, startDate, endDate)
  );

  if (view === 'earnings') {
    return calculateEarningsSummary(periodLogs, period);
  } else {
    return calculateProgressSummary(habit, periodLogs, period);
  }
}

/**
 * Calculate progress summary based on habit type
 * @private
 */
function calculateProgressSummary(habit, logs, period) {
  if (logs.length === 0) {
    return {
      label: 'No activity yet',
      value: '—',
      period
    };
  }

  const valueType = getHabitValueType(habit);

  switch (valueType) {
    case 'duration': {
      const totalAmount = logs.reduce((sum, log) => sum + (log.duration || log.amount || 0), 0);
      const avgAmount = Math.round(totalAmount / logs.length);
      return {
        label: `Average Duration (${period})`,
        value: `${avgAmount} min`,
        period,
        rawValue: avgAmount
      };
    }

    case 'count': {
      const totalCount = logs.reduce((sum, log) => sum + (log.count || log.amount || 0), 0);
      const avgCount = Math.round(totalCount / logs.length);
      const unit = habit.unit || 'units';
      return {
        label: `Average ${capitalize(unit)} (${period})`,
        value: `${avgCount} ${unit}`,
        period,
        rawValue: avgCount
      };
    }

    case 'completion': {
      const completedCount = logs.filter(log => log.duration || log.amount || log.count).length;
      const totalCount = logs.length;
      const percentage = Math.round((completedCount / totalCount) * 100);
      return {
        label: `Completion Rate (${period})`,
        value: `${percentage}%`,
        subtext: `${completedCount}/${totalCount} days`,
        period,
        rawValue: percentage
      };
    }

    default:
      return {
        label: 'Activity',
        value: `${logs.length} logs`,
        period
      };
  }
}

/**
 * Calculate earnings summary with comparison
 * @private
 */
function calculateEarningsSummary(logs, period) {
  const totalEarnings = logs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);

  // Get previous period for comparison
  const previousPeriod = logs.length > 0 ? getPreviousPeriodRange(period, logs[0].date) : null;
  let change = null;

  if (previousPeriod && logs.length > 0) {
    const previousLogs = logs.filter(log => 
      isDateInRange(log.date, previousPeriod.startDate, previousPeriod.endDate)
    );
    const previousEarnings = previousLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
    
    if (previousEarnings > 0) {
      const changeAmount = totalEarnings - previousEarnings;
      const changePercent = ((changeAmount / previousEarnings) * 100).toFixed(1);
      change = {
        amount: changeAmount,
        percent: changePercent,
        direction: changeAmount >= 0 ? 'up' : 'down'
      };
    }
  }

  return {
    label: `Total Earnings (${period})`,
    value: `$${totalEarnings.toFixed(2)}`,
    change,
    period,
    rawValue: totalEarnings
  };
}

/**
 * Determine calendar day status
 * @private
 */
function determineStatus(log, dayCell, habit, valueType, maxValue) {
  // Future days
  if (dayCell.isFuture) {
    return {
      type: 'future',
      color: 'gray',
      intensity: 0
    };
  }

  // No log for this day
  if (!log) {
    return {
      type: 'missed',
      color: 'red',
      intensity: 0
    };
  }

  // Has log - determine completion/intensity
  if (valueType === 'completion') {
    const hasActivity = log.duration || log.amount || log.count;
    return {
      type: hasActivity ? 'completed' : 'missed',
      color: hasActivity ? 'green' : 'red',
      intensity: hasActivity ? 1 : 0
    };
  }

  // Quantitative habits - calculate intensity (1-4)
  let value = 0;
  if (valueType === 'duration') {
    value = log.duration || log.amount || 0;
  } else if (valueType === 'count') {
    value = log.count || log.amount || 0;
  }
  
  const intensity = calculateIntensity(value, maxValue);

  return {
    type: 'completed',
    color: 'green',
    intensity,
    value
  };
}

/**
 * Calculate intensity level (1-4) based on value relative to max
 * @private
 */
function calculateIntensity(value, maxValue) {
  if (value === 0) return 0;
  const ratio = value / maxValue;
  
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.50) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

/**
 * Group logs by date for quick lookup
 * @private
 */
function groupLogsByDate(logs) {
  return logs.reduce((acc, log) => {
    acc[log.date] = log;
    return acc;
  }, {});
}

/**
 * Determine habit value type from rateType
 * @private
 */
function getHabitValueType(habit) {
  const rateType = habit.rateType || 'completion';

  if (rateType.includes('minute') || rateType === 'duration') {
    return 'duration';
  }
  
  if (rateType.includes('unit') || rateType === 'calorie') {
    return 'count';
  }

  return 'completion';
}

/**
 * Capitalize first letter
 * @private
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get X-axis labels for chart based on period
 * Returns evenly spaced date labels (typically 3-5 labels)
 * 
 * @param {Array} dates - Array of date strings
 * @param {string} period - Time period
 * @returns {Array} Array of { date, label } objects
 */
export function getXAxisLabels(dates, period) {
  if (!dates || dates.length === 0) return [];

  let labelCount;
  switch (period) {
    case '7D':
      labelCount = 3; // Start, middle, end
      break;
    case '30D':
      labelCount = 3;
      break;
    case '90D':
      labelCount = 4;
      break;
    case '1Y':
    case 'All':
      labelCount = 5;
      break;
    default:
      labelCount = 3;
  }

  const step = Math.floor(dates.length / (labelCount - 1));
  const labels = [];

  for (let i = 0; i < labelCount; i++) {
    const index = i === labelCount - 1 
      ? dates.length - 1 
      : i * step;
    
    if (index < dates.length) {
      labels.push({
        date: dates[index],
        label: formatDateLabel(dates[index], period)
      });
    }
  }

  return labels;
}

/**
 * Format date for X-axis label
 * @private
 */
function formatDateLabel(dateStr, period) {
  const date = new Date(dateStr + 'T00:00:00');
  
  if (period === '7D') {
    // Show day of week for 7-day view
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  if (period === '1Y' || period === 'All') {
    // Show month only for long periods
    return date.toLocaleDateString('en-US', { month: 'short' });
  }

  // Default: month + day
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get Y-axis labels for chart
 * Returns evenly spaced value labels (typically 5 labels)
 * 
 * @param {number} maxValue - Maximum value in dataset
 * @param {string} valueType - 'duration', 'count', or 'completion'
 * @param {string} [unit] - Unit name for count types
 * @returns {Array} Array of label strings
 */
export function getYAxisLabels(maxValue, valueType, unit = '') {
  // Handle edge case of very small or zero max
  if (maxValue === 0) {
    if (valueType === 'earnings') return ['$0', '$0', '$0', '$0', '$0'];
    if (valueType === 'duration') return ['0m', '0m', '0m', '0m', '0m'];
    if (valueType === 'completion') return ['0%', '0%', '0%', '0%', '0%'];
    return ['0', '0', '0', '0', '0'];
  }

  const labelCount = 5;
  
  // For earnings and small values, use smarter scaling
  if (valueType === 'earnings') {
    // Round max up to a nice number
    let niceMax;
    if (maxValue <= 1) {
      niceMax = Math.ceil(maxValue * 4) / 4; // Round to nearest $0.25
    } else if (maxValue <= 5) {
      niceMax = Math.ceil(maxValue);
    } else if (maxValue <= 10) {
      niceMax = Math.ceil(maxValue / 2) * 2; // Round to nearest $2
    } else if (maxValue <= 50) {
      niceMax = Math.ceil(maxValue / 5) * 5; // Round to nearest $5
    } else if (maxValue <= 100) {
      niceMax = Math.ceil(maxValue / 10) * 10; // Round to nearest $10
    } else {
      niceMax = Math.ceil(maxValue / 25) * 25; // Round to nearest $25
    }
    
    const step = niceMax / (labelCount - 1);
    const labels = [];
    
    for (let i = labelCount - 1; i >= 0; i--) {
      const value = i * step;
      // Show decimals only if needed
      if (niceMax < 5) {
        labels.push(`$${value.toFixed(2)}`);
      } else {
        labels.push(`$${Math.round(value)}`);
      }
    }
    
    return labels;
  }
  
  // For duration, use smart increments that divide nicely into 5 labels
  if (valueType === 'duration') {
    let niceMax;
    
    // Pick max values that divide evenly into 4 steps for clean labels
    if (maxValue <= 20) {
      niceMax = 20; // 0, 5, 10, 15, 20
    } else if (maxValue <= 40) {
      niceMax = 40; // 0, 10, 20, 30, 40
    } else if (maxValue <= 60) {
      niceMax = 60; // 0, 15, 30, 45, 60
    } else if (maxValue <= 80) {
      niceMax = 80; // 0, 20, 40, 60, 80
    } else if (maxValue <= 100) {
      niceMax = 100; // 0, 25, 50, 75, 100
    } else if (maxValue <= 120) {
      niceMax = 120; // 0, 30, 60, 90, 120
    } else if (maxValue <= 150) {
      niceMax = 160; // 0, 40, 80, 120, 160
    } else {
      // Above 2.5 hours, round to nearest 40 minutes
      niceMax = Math.ceil(maxValue / 40) * 40;
    }
    
    const step = niceMax / (labelCount - 1);
    const labels = [];
    
    for (let i = labelCount - 1; i >= 0; i--) {
      const value = Math.round(i * step);
      labels.push(`${value}m`);
    }
    
    return labels;
  }
  
  // For count/completion, ensure no duplicates
  let niceMax = maxValue;
  
  // Round up to a nice number
  if (maxValue <= 5) {
    niceMax = Math.ceil(maxValue);
  } else if (maxValue <= 10) {
    niceMax = Math.ceil(maxValue / 2) * 2;
  } else if (maxValue <= 20) {
    niceMax = Math.ceil(maxValue / 5) * 5;
  } else if (maxValue <= 50) {
    niceMax = Math.ceil(maxValue / 10) * 10;
  } else if (maxValue <= 100) {
    niceMax = Math.ceil(maxValue / 20) * 20;
  } else {
    niceMax = Math.ceil(maxValue / 50) * 50;
  }
  
  const step = niceMax / (labelCount - 1);
  const labels = [];
  
  for (let i = labelCount - 1; i >= 0; i--) {
    const value = Math.round(i * step);
    
    switch (valueType) {
      case 'count':
        labels.push(unit ? `${value}` : value.toString());
        break;
      case 'completion':
        labels.push(`${value}%`);
        break;
      default:
        labels.push(value.toString());
    }
  }

  return labels;
}
