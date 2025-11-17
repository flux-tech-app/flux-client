import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHabits } from '../../context/HabitContext'
import Navigation from '../../components/Navigation'
import EmptyState from '../Portfolio/EmptyState'
import './Home.css'

// Category icons mapping
const categoryIcons = {
  Fitness: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  ),
  Wellness: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
    </svg>
  ),
  Social: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  ),
  Financial: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  Nutrition: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  ),
  'Mental Health': (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    </svg>
  ),
  Productivity: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
    </svg>
  ),
  Misc: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
    </svg>
  ),
}

export default function Home() {
  const { habits, logs, user, getTotalEarnings } = useHabits()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [expandedCategories, setExpandedCategories] = useState({})
  const dateScrollRef = useRef(null)

  const hasHabits = habits.length > 0

  // Generate date range (7 days back, today, 3 days forward)
  const generateDateRange = () => {
    const dates = []
    const today = new Date()
    
    for (let i = -7; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    
    return dates
  }

  const dateRange = generateDateRange()

  // Auto-scroll to selected date on mount
  useEffect(() => {
    if (dateScrollRef.current) {
      const todayIndex = dateRange.findIndex(
        date => date.toDateString() === selectedDate.toDateString()
      )
      if (todayIndex !== -1) {
        const scrollLeft = todayIndex * 52 // 44px width + 8px gap
        dateScrollRef.current.scrollLeft = scrollLeft
      }
    }
  }, [])

  // Format date helpers
  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const formatDate = (date) => {
    return date.getDate()
  }

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString()
  }

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  // Check if date has any completions
  const hasCompletions = (date) => {
    const dateStr = date.toDateString()
    return logs.some(log => new Date(log.timestamp).toDateString() === dateStr)
  }

  // Get logs for selected date
  const getLogsForDate = (date) => {
    const dateStr = date.toDateString()
    const filteredLogs = logs.filter(log => new Date(log.timestamp).toDateString() === dateStr)
    
    // Debug logging
    if (filteredLogs.length > 0) {
      console.log('Logs for selected date:', filteredLogs)
    }
    
    return filteredLogs
  }

  const selectedDateLogs = getLogsForDate(selectedDate)

  // Get habits scheduled for selected date
  const getScheduledHabits = () => {
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
    const filtered = habits.filter(habit => {
      if (!habit.schedule || habit.schedule.length === 0) return true
      return habit.schedule.includes(dayOfWeek)
    })
    
    // Debug logging
    if (filtered.length > 0) {
      console.log('Scheduled habits for', dayOfWeek, ':', filtered)
    }
    
    return filtered
  }

  const scheduledHabits = getScheduledHabits()

  // Group habits by category
  const groupHabitsByCategory = () => {
    const grouped = {}
    
    scheduledHabits.forEach(habit => {
      const category = habit.category || 'Misc'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(habit)
    })
    
    return grouped
  }

  const groupedHabits = groupHabitsByCategory()

  // Calculate category stats
  const getCategoryStats = (categoryHabits) => {
    let completed = 0
    let totalEarnings = 0
    
    categoryHabits.forEach(habit => {
      const habitLog = selectedDateLogs.find(log => log.habitId === habit.id)
      if (habitLog) {
        completed++
        totalEarnings += (habitLog.totalEarnings || 0)
      }
    })
    
    return {
      completed,
      total: categoryHabits.length,
      earnings: totalEarnings || 0
    }
  }

  // Get habit log details for breakdown
  const getHabitBreakdown = (habit) => {
    const habitLog = selectedDateLogs.find(log => log.habitId === habit.id)
    const isCompleted = !!habitLog
    
    let logDisplay = ''
    let amount = ''
    
    if (isCompleted && habitLog) {
      const earnings = habitLog.totalEarnings || 0
      amount = `$${earnings.toFixed(2)}`
      
      if (habit.type === 'duration') {
        logDisplay = `${habitLog.value || 0} min`
      } else if (habit.type === 'count') {
        logDisplay = `${habitLog.value || 0} ${habit.unit || 'reps'}`
      } else if (habit.behaviorType === 'resist') {
        // For RESIST habits, show days completed
        logDisplay = '1 day'
      }
    }
    
    // Format rate display
    let rateDisplay = ''
    const rate = habit.rate || 0
    
    if (habit.rateType === 'perUnit') {
      if (habit.type === 'duration') {
        rateDisplay = `$${rate.toFixed(2)}/min`
      } else if (habit.type === 'count') {
        rateDisplay = `$${rate.toFixed(2)}/${habit.unit || 'rep'}`
      }
    } else if (habit.rateType === 'daily') {
      rateDisplay = `$${rate.toFixed(2)}/day`
    } else if (habit.rateType === 'fixed') {
      rateDisplay = `$${rate.toFixed(2)} each`
    }
    
    return { isCompleted, logDisplay, rateDisplay, amount }
  }

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const portfolioBalance = getTotalEarnings() || 0

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Header */}
        <div className="home-header">
          <div className="header-top">
            <div className="header-content">
              <div className="greeting">{getGreeting()}, {user.name || 'Ryan'}</div>
            </div>
            <button className="notification-button">
              <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {/* Uncomment to show notification badge */}
              {/* <div className="notification-badge"></div> */}
            </button>
          </div>
          <div className="day-date">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="portfolio-balance">Portfolio: ${portfolioBalance.toFixed(2)}</div>
        </div>

        {/* Conditional Rendering: Empty State vs Daily Dashboard */}
        {!hasHabits ? (
          <EmptyState />
        ) : (
          <>
            {/* Date Picker */}
            <div className="date-picker-section">
              <div className="date-picker-scroll" ref={dateScrollRef}>
                {dateRange.map((date, index) => (
                  <div
                    key={index}
                    className={`date-square ${isSelected(date) ? 'active' : ''} ${hasCompletions(date) ? 'completed' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="date-day">{formatDay(date)}</div>
                    <div className="date-number">{formatDate(date)}</div>
                    {hasCompletions(date) && <div className="completion-dot"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="insight-section">
              <div className="ai-insight-card">
                <div className="flux-badge">
                  <svg className="flux-icon" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  FLUX INSIGHT
                </div>
                <div className="insight-text">
                  You're building consistency! {scheduledHabits.length} habits scheduled for today.
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className="categories-section">
              <div className="section-divider"></div>
              <div className="categories-list">
                {Object.entries(groupedHabits).map(([category, categoryHabits]) => {
                  const stats = getCategoryStats(categoryHabits)
                  const isExpanded = expandedCategories[category]
                  const isFullyCompleted = stats.completed === stats.total && stats.total > 0
                  
                  return (
                    <div key={category} className={`category-card ${isExpanded ? 'expanded' : ''} ${isFullyCompleted ? 'category-completed' : ''}`}>
                      <div className="category-header" onClick={() => toggleCategory(category)}>
                        <div className="category-info">
                          <div className="category-name-row">
                            <div className="category-icon">{categoryIcons[category]}</div>
                            <div className="category-name">{category}</div>
                          </div>
                          <div className="category-stats">{stats.completed} of {stats.total} completed</div>
                        </div>
                        <div className="category-earnings-section">
                          <div className="category-earnings">${(stats.earnings || 0).toFixed(2)}</div>
                          <svg className="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Category Breakdown */}
                      <div className={`category-breakdown ${isExpanded ? 'visible' : ''}`}>
                        {categoryHabits.map(habit => {
                          const breakdown = getHabitBreakdown(habit)
                          
                          return (
                            <div key={habit.id} className="breakdown-row">
                              <svg className={`breakdown-check ${breakdown.isCompleted ? '' : 'empty'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                              </svg>
                              <span className="breakdown-name">{habit.name}</span>
                              <span className="breakdown-log">{breakdown.logDisplay}</span>
                              <span className="breakdown-rate">{breakdown.rateDisplay}</span>
                              <span className="breakdown-amount">{breakdown.amount}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Empty State for Scheduled Habits */}
                {scheduledHabits.length === 0 && (
                  <div className="empty-state">
                    <p className="empty-state-text">No habits scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>

            {/* View Activity Link */}
            <div className="view-activity-section">
              <Link to="/activity" className="view-activity-link">
                View All Activity
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}
