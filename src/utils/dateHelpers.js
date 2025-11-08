/**
 * Date Helper Utilities for Chart Analytics
 * 
 * Uses date-fns for all date operations to ensure timezone consistency.
 * All dates are stored/manipulated as ISO strings in 'yyyy-MM-dd' format.
 */

import { 
  format, 
  subDays, 
  startOfDay, 
  endOfDay,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  getDay,
  isToday as isTodayFn,
  isFuture as isFutureFn,
  isAfter,
  isBefore,
  parseISO,
  addDays,
  startOfWeek,
  endOfWeek,
  differenceInDays
} from 'date-fns';

/**
 * Get the current date as ISO string (yyyy-MM-dd)
 * @returns {string} Current date in ISO format
 */
export function getCurrentDate() {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get date range for a given period
 * @param {string} period - One of: '7D', '30D', '90D', '1Y', 'All'
 * @param {string} [oldestLogDate] - Optional oldest log date for 'All' period
 * @returns {Object} { startDate: string, endDate: string, dates: string[] }
 */
export function getPeriodRange(period, oldestLogDate = null) {
  const today = new Date();
  const endDate = format(today, 'yyyy-MM-dd');
  let startDate;

  switch (period) {
    case '7D':
      startDate = format(subDays(today, 6), 'yyyy-MM-dd'); // Include today = 7 days
      break;
    case '30D':
      startDate = format(subDays(today, 29), 'yyyy-MM-dd'); // Include today = 30 days
      break;
    case '90D':
      startDate = format(subDays(today, 89), 'yyyy-MM-dd'); // Include today = 90 days
      break;
    case '1Y':
      startDate = format(subDays(today, 364), 'yyyy-MM-dd'); // Include today = 365 days
      break;
    case 'All':
      if (oldestLogDate) {
        startDate = oldestLogDate;
      } else {
        // Default to 1 year if no logs exist
        startDate = format(subDays(today, 364), 'yyyy-MM-dd');
      }
      break;
    default:
      startDate = format(subDays(today, 29), 'yyyy-MM-dd'); // Default to 30D
  }

  const dates = generateDateArray(startDate, endDate);

  return {
    startDate,
    endDate,
    dates
  };
}

/**
 * Get the previous period range (for comparison)
 * @param {string} period - One of: '7D', '30D', '90D', '1Y', 'All'
 * @param {string} currentStartDate - Start date of current period
 * @returns {Object} { startDate: string, endDate: string }
 */
export function getPreviousPeriodRange(period, currentStartDate) {
  const currentStart = parseISO(currentStartDate);
  let periodDays;

  switch (period) {
    case '7D':
      periodDays = 7;
      break;
    case '30D':
      periodDays = 30;
      break;
    case '90D':
      periodDays = 90;
      break;
    case '1Y':
      periodDays = 365;
      break;
    case 'All':
      return null; // No previous period for 'All'
    default:
      periodDays = 30;
  }

  const endDate = format(subDays(currentStart, 1), 'yyyy-MM-dd');
  const startDate = format(subDays(currentStart, periodDays), 'yyyy-MM-dd');

  return {
    startDate,
    endDate
  };
}

/**
 * Generate array of date strings between start and end (inclusive)
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {string[]} Array of date strings
 */
export function generateDateArray(startDate, endDate) {
  const dates = [];
  let currentDate = parseISO(startDate);
  const end = parseISO(endDate);

  while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

/**
 * Get calendar month information
 * @param {number} [year] - Year (defaults to current)
 * @param {number} [month] - Month 1-12 (defaults to current)
 * @returns {Object} Month metadata and day grid
 */
export function getCalendarMonthData(year = null, month = null) {
  const today = new Date();
  const targetDate = year && month 
    ? new Date(year, month - 1, 1) 
    : today;

  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);
  const daysInMonth = getDaysInMonth(targetDate);
  const firstDayOfWeek = getDay(monthStart); // 0 = Sunday, 6 = Saturday

  return {
    year: targetDate.getFullYear(),
    month: targetDate.getMonth() + 1, // 1-based
    monthName: format(targetDate, 'MMMM yyyy'),
    daysInMonth,
    firstDayOfWeek,
    startDate: format(monthStart, 'yyyy-MM-dd'),
    endDate: format(monthEnd, 'yyyy-MM-dd')
  };
}

/**
 * Generate calendar grid with empty cells and date data
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Array} Array of day objects
 */
export function generateCalendarGrid(year, month) {
  const monthData = getCalendarMonthData(year, month);
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < monthData.firstDayOfWeek; i++) {
    calendarDays.push({ isEmpty: true });
  }

  // Add actual days of the month
  for (let day = 1; day <= monthData.daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = format(date, 'yyyy-MM-dd');

    calendarDays.push({
      date: dateStr,
      day: day,
      isToday: isTodayFn(date),
      isFuture: isFutureFn(date),
      dayOfWeek: getDay(date) // 0=Sun, 6=Sat
    });
  }

  return calendarDays;
}

/**
 * Check if a date string is today
 * @param {string} dateStr - ISO date string (yyyy-MM-dd)
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return isTodayFn(parseISO(dateStr));
}

/**
 * Check if a date string is in the future
 * @param {string} dateStr - ISO date string (yyyy-MM-dd)
 * @returns {boolean}
 */
export function isFuture(dateStr) {
  return isFutureFn(parseISO(dateStr));
}

/**
 * Check if a date is within a range (inclusive)
 * @param {string} date - ISO date string
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {boolean}
 */
export function isDateInRange(date, startDate, endDate) {
  const checkDate = parseISO(date);
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  return (
    (isAfter(checkDate, start) || checkDate.getTime() === start.getTime()) &&
    (isBefore(checkDate, end) || checkDate.getTime() === end.getTime())
  );
}

/**
 * Format date for display
 * @param {string} dateStr - ISO date string
 * @param {string} [formatStr] - date-fns format string
 * @returns {string}
 */
export function formatDisplayDate(dateStr, formatStr = 'MMM d') {
  return format(parseISO(dateStr), formatStr);
}

/**
 * Get day of week name
 * @param {string} dateStr - ISO date string
 * @param {string} [formatStr] - 'short' (Mon) or 'long' (Monday)
 * @returns {string}
 */
export function getDayName(dateStr, formatStr = 'short') {
  const formatPattern = formatStr === 'long' ? 'EEEE' : 'EEE';
  return format(parseISO(dateStr), formatPattern);
}

/**
 * Calculate number of days between two dates
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {number}
 */
export function getDaysBetween(startDate, endDate) {
  return differenceInDays(parseISO(endDate), parseISO(startDate));
}
