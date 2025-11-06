/**
 * Format currency values for display
 * Always shows 2 decimal places, uses $ prefix
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format duration in minutes to display string
 * e.g., 45 → "45 min"
 * e.g., 90 → "1h 30m"
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}m`
}

/**
 * Format rate for display based on rate type
 * e.g., duration: "$0.05/min"
 * e.g., completion: "$0.50/time"
 */
export function formatRate(habit) {
  const formattedAmount = formatCurrency(habit.rate)

  if (habit.rateType === 'duration') {
    return `${formattedAmount}/min`
  } else {
    return `${formattedAmount}/time`
  }
}

/**
 * Format timestamp for display
 * Returns relative time for recent dates, absolute for older
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  // For older dates, show full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Format date for section headers
 * e.g., "Today", "Yesterday", "Mon, Nov 4"
 */
export function formatDateHeader(dateString) {
  const date = new Date(dateString)
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  if (date.toDateString() === today) return 'Today'
  if (date.toDateString() === yesterday) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format time only (for log entries)
 * e.g., "2:30 PM"
 */
export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Get initials from name for avatar
 * e.g., "Ryan Watters" → "RW"
 */
export function getInitials(name) {
  if (!name) return '?'
  
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
