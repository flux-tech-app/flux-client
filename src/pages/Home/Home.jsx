import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabits } from '../../context/HabitContext'
import Navigation from '../../components/Navigation'
import EmptyState from '../Portfolio/EmptyState'
import './Home.css'

export default function Home() {
  const { 
    habits, 
    logs, 
    isHabitLoggedOnDate,
    addLog 
  } = useHabits()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [logValue, setLogValue] = useState('')
  const [isLogging, setIsLogging] = useState(false)
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
        const scrollLeft = todayIndex * 52
        dateScrollRef.current.scrollLeft = scrollLeft
      }
    }
  }, [])

  // Date helpers
  const formatDay = (date) => date.toLocaleDateString('en-US', { weekday: 'short' })
  const formatDateNum = (date) => date.getDate()
  const isSelected = (date) => date.toDateString() === selectedDate.toDateString()
  const isToday = (date) => date.toDateString() === new Date().toDateString()
  const isFuture = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const check = new Date(date)
    check.setHours(0, 0, 0, 0)
    return check > today
  }

  // Check if date has any completions
  const hasCompletions = (date) => {
    const dateStr = date.toDateString()
    return logs.some(log => new Date(log.timestamp).toDateString() === dateStr)
  }

  // Get logs for selected date
  const getLogsForDate = (date) => {
    const dateStr = date.toDateString()
    return logs.filter(log => new Date(log.timestamp).toDateString() === dateStr)
  }

  const selectedDateLogs = getLogsForDate(selectedDate)

  // Get habit log for selected date
  const getHabitLog = (habitId) => {
    return selectedDateLogs.find(log => log.habitId === habitId)
  }

  // Format rate display for habit card
  const formatHabitRate = (habit) => {
    const rate = habit.rate ?? 0
    // For very small rates (like walking), show more decimals
    if (rate < 0.01) {
      return `$${rate.toFixed(4)}/${habit.unit || 'unit'}`
    }
    if (habit.rateType === 'BINARY') {
      return `$${rate.toFixed(2)}`
    }
    return `$${rate.toFixed(2)}/${habit.unit || 'unit'}`
  }

  // Handle habit card tap
  const handleHabitTap = (habit) => {
    // Don't allow logging for future dates
    if (isFuture(selectedDate)) return
    
    // Don't allow if already logged
    if (isHabitLoggedOnDate(habit.id, selectedDate)) return
    
    setSelectedHabit(habit)
    // Set smart default based on rate type
    if (habit.rateType === 'BINARY') {
      setLogValue('1')
    } else if (habit.ticker === 'WALK') {
      setLogValue('5000') // Default 5000 steps
    } else if (habit.rateType === 'DURATION') {
      setLogValue('30') // Default 30 minutes
    } else if (habit.rateType === 'DISTANCE') {
      setLogValue('3') // Default 3 miles/km
    } else {
      setLogValue('10') // Default 10 for counts
    }
  }

  // Handle log submission
  const handleLogSubmit = async () => {
    if (!selectedHabit) return
    
    setIsLogging(true)
    
    const units = selectedHabit.rateType === 'BINARY' 
      ? 1 
      : parseFloat(logValue) || 1
    
    const logData = {
      habitId: selectedHabit.id,
      units: units
    }

    addLog(logData)
    
    // Brief delay for feedback
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setIsLogging(false)
    setSelectedHabit(null)
    setLogValue('')
  }

  // Calculate earnings preview for log modal
  const getEarningsPreview = () => {
    if (!selectedHabit) return 0
    const rate = selectedHabit.rate ?? 0
    if (selectedHabit.rateType === 'BINARY') {
      return rate
    }
    return rate * (parseFloat(logValue) || 0)
  }

  // Smart value change based on habit type
  const handleValueChange = (delta) => {
    const current = parseFloat(logValue) || 0
    let increment = 1
    
    // Smart increments based on habit type
    if (selectedHabit?.ticker === 'WALK') {
      increment = delta > 0 ? 1000 : -1000
    } else if (selectedHabit?.rateType === 'DURATION') {
      increment = delta > 0 ? 5 : -5 // 5 minute increments
    } else if (selectedHabit?.rateType === 'DISTANCE') {
      increment = delta > 0 ? 0.5 : -0.5 // 0.5 mile increments
    } else {
      increment = delta > 0 ? 1 : -1
    }
    
    const newValue = Math.max(0, current + increment)
    setLogValue(newValue.toString())
  }

  // Get input label text
  const getInputLabel = () => {
    if (!selectedHabit) return ''
    if (selectedHabit.rateType === 'BINARY') return ''
    return `How many ${selectedHabit.unitPlural || selectedHabit.unit + 's'}?`
  }

  // Count logged habits for selected date
  const loggedCount = habits.filter(h => isHabitLoggedOnDate(h.id, selectedDate)).length

  return (
    <div className="home-page">
      <div className="home-container">
        {!hasHabits ? (
          <EmptyState />
        ) : (
          <>
            {/* Header */}
            <header className="home-header">
              <div className="header-top">
                <div className="header-content">
                  <h1 className="greeting">Today</h1>
                  <p className="day-date">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <button className="notification-button">
                  <svg className="notification-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                </button>
              </div>
            </header>

            {/* Date Picker */}
            <div className="date-picker-section">
              <div className="date-picker-scroll" ref={dateScrollRef}>
                {dateRange.map((date, index) => (
                  <div
                    key={index}
                    className={`date-square ${isSelected(date) ? 'active' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="date-day">{formatDay(date)}</span>
                    <span className="date-number">{formatDateNum(date)}</span>
                    {hasCompletions(date) && !isSelected(date) && (
                      <div className="completion-dot" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="insight-section">
              <div className="ai-insight-card">
                <div className="flux-badge">
                  <svg className="flux-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  FLUX
                </div>
                <div className="insight-text">
                  {isFuture(selectedDate) 
                    ? `You have ${habits.length} habits to track. Come back ${isToday(new Date(selectedDate.getTime() - 86400000)) ? 'tomorrow' : 'on this day'} to log.`
                    : loggedCount === habits.length 
                      ? `All ${habits.length} habits logged! Great work today.`
                      : loggedCount > 0 
                        ? `${loggedCount} of ${habits.length} habits logged. Keep going!`
                        : `${habits.length} habits ready to log. Tap to track your progress.`
                  }
                </div>
              </div>
            </div>

            {/* Habits List - All habits (no schedule filtering in MVT) */}
            <div className="habits-section">
              <div className="habit-cards">
                {habits.map(habit => {
                  const habitLog = getHabitLog(habit.id)
                  const isLogged = !!habitLog
                  const isFutureDate = isFuture(selectedDate)
                  
                  return (
                    <div
                      key={habit.id}
                      className={`habit-card ${isLogged ? 'logged' : ''} ${isFutureDate ? 'future' : ''}`}
                      onClick={() => handleHabitTap(habit)}
                    >
                      <div className="habit-card-main">
                        <div className="habit-card-left">
                          <span className="habit-ticker">${habit.ticker}</span>
                          <span className="habit-ticker-divider">·</span>
                          <span className="habit-name">{habit.name}</span>
                        </div>
                        <div className="habit-card-right">
                          {isLogged ? (
                            <div className="habit-status-logged">
                              <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                              </svg>
                              <span className="earned-amount">+${(habitLog.totalEarnings || 0).toFixed(2)}</span>
                            </div>
                          ) : isFutureDate ? (
                            <span className="habit-scheduled">Scheduled</span>
                          ) : (
                            <div className="habit-status-pending">
                              <div className="status-circle"></div>
                              <span className="habit-rate">{formatHabitRate(habit)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="habit-card-secondary">
                        {isLogged ? (
                          <span className="logged-time">
                            Logged {new Date(habitLog.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            {habitLog.units > 1 && habit.rateType !== 'BINARY' && ` · ${habitLog.units} ${habit.unitPlural || habit.unit + 's'}`}
                          </span>
                        ) : isFutureDate ? (
                          <span className="future-label">Complete on this day</span>
                        ) : (
                          <span className="tap-to-log">Tap to log</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <Navigation />

      {/* Log Habit Modal */}
      <AnimatePresence>
        {selectedHabit && (
          <>
            {/* Backdrop */}
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHabit(null)}
            />
            
            {/* Modal */}
            <motion.div
              className="log-modal-container"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="log-modal-handle" />
              
              <div className="log-habit-modal">
                <div className="log-modal-header">
                  <span className="log-habit-icon">{selectedHabit.icon || '📌'}</span>
                  <div className="log-habit-info">
                    <span className="log-habit-ticker">${selectedHabit.ticker}</span>
                    <span className="log-habit-name">{selectedHabit.name}</span>
                  </div>
                </div>

                {/* Unit-based habits get a number input */}
                {selectedHabit.rateType !== 'BINARY' ? (
                  <div className="log-input-section">
                    <label className="log-input-label">
                      {getInputLabel()}
                    </label>
                    <div className="log-stepper">
                      <button 
                        className="stepper-button"
                        onClick={() => handleValueChange(-1)}
                        disabled={parseFloat(logValue) <= 0}
                      >
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        className="stepper-input"
                        value={logValue}
                        onChange={(e) => setLogValue(e.target.value)}
                        min="0"
                        step={selectedHabit.ticker === 'WALK' ? '1000' : '1'}
                      />
                      <button 
                        className="stepper-button"
                        onClick={() => handleValueChange(1)}
                      >
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="log-confirmation-section">
                    <p className="log-confirmation-text">
                      Did you complete <strong>{selectedHabit.name}</strong>{isToday(selectedDate) ? ' today' : ''}?
                    </p>
                  </div>
                )}

                {/* Earnings preview */}
                <div className="earnings-preview-box">
                  <span className="earnings-preview-label">You'll earn</span>
                  <span className="earnings-preview-value">
                    +${getEarningsPreview().toFixed(2)}
                  </span>
                </div>

                {/* Confirm button */}
                <button 
                  className="log-confirm-button"
                  onClick={handleLogSubmit}
                  disabled={isLogging || (selectedHabit.rateType !== 'BINARY' && !parseFloat(logValue))}
                >
                  {isLogging ? (
                    <span className="logging-spinner" />
                  ) : (
                    selectedHabit.rateType !== 'BINARY' ? 'Log Activity' : 'Yes, I did it!'
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
