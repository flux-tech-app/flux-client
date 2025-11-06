/**
 * Calculate earnings for a Build habit log
 * Build habits use either duration or flat completion rates
 */
export function calculateBuildEarnings(habit, duration = null) {
  if (habit.rateType === 'duration' && duration) {
    // e.g., $0.05/min × 30 min = $1.50
    return habit.rate * duration
  } else if (habit.rateType === 'completion') {
    // e.g., $0.50 per completion
    return habit.rate
  }
  return 0
}

/**
 * Calculate earnings for a Break habit log
 * Break habits have base rate + optional top-up
 */
export function calculateBreakEarnings(habit, topUpAmount = 0) {
  const baseEarnings = habit.rate // Base rate for resisting
  return {
    baseEarnings,
    topUpAmount,
    totalEarnings: baseEarnings + topUpAmount,
  }
}

/**
 * Calculate total earnings from a log object
 */
export function calculateLogEarnings(habit, logData) {
  if (habit.type === 'build') {
    const baseEarnings = calculateBuildEarnings(habit, logData.duration)
    return {
      baseEarnings,
      topUpAmount: 0,
      totalEarnings: baseEarnings,
    }
  } else {
    // Break habit
    return calculateBreakEarnings(habit, logData.topUpAmount || 0)
  }
}

/**
 * Group logs by date for activity feed
 */
export function groupLogsByDate(logs) {
  const grouped = {}

  logs.forEach((log) => {
    const date = new Date(log.timestamp).toDateString()
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(log)
  })

  // Sort each group by time (newest first)
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )
  })

  return grouped
}

/**
 * Get logs for a specific date range
 */
export function getLogsInRange(logs, startDate, endDate) {
  const start = new Date(startDate).setHours(0, 0, 0, 0)
  const end = new Date(endDate).setHours(23, 59, 59, 999)

  return logs.filter((log) => {
    const logTime = new Date(log.timestamp).getTime()
    return logTime >= start && logTime <= end
  })
}

/**
 * Calculate streak for a habit
 * Returns 0 if not logged today or yesterday
 */
export function calculateStreak(logs) {
  if (logs.length === 0) return 0

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
  const lastLogDate = new Date(sortedLogs[0].timestamp).toDateString()

  // Must have logged today or yesterday to have an active streak
  if (lastLogDate !== today && lastLogDate !== yesterday) {
    return 0
  }

  let streak = 1
  let currentDate = new Date(sortedLogs[0].timestamp)

  for (let i = 1; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].timestamp)
    const dayDiff = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24))

    if (dayDiff === 1) {
      streak++
      currentDate = logDate
    } else if (dayDiff > 1) {
      break
    }
  }

  return streak
}

/**
 * Get chart data for habit detail page (last 7 days)
 */
export function getChartData(logs) {
  const last7Days = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    last7Days.push(date)
  }

  return last7Days.map((date) => {
    const dateStr = date.toDateString()
    const dayLogs = logs.filter(
      (log) => new Date(log.timestamp).toDateString() === dateStr
    )

    return {
      date: dateStr,
      earnings: dayLogs.reduce((sum, log) => sum + log.totalEarnings, 0),
      count: dayLogs.length,
    }
  })
}
