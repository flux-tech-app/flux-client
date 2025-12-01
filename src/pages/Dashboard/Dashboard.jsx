import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabits } from '../../context/HabitContext'
import Navigation from '../../components/Navigation'
import './Dashboard.css'

// Category color mapping - matches 4-category system
const CATEGORY_COLORS = {
  fitness: { color: '#4ade80', name: 'Fitness' },
  nutrition: { color: '#fb923c', name: 'Nutrition' },
  spending: { color: '#a855f7', name: 'Spending' },
  growth: { color: '#60a5fa', name: 'Growth' },
  default: { color: '#94a3b8', name: 'Other' }
}

const getCategoryInfo = (category) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default
}

// Deterministic position generator based on habit ID
const getStarPosition = (habitId, index, total) => {
  const hash = habitId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Spread stars across the sky more evenly
  const cols = Math.ceil(Math.sqrt(total))
  const row = Math.floor(index / cols)
  const col = index % cols
  
  // Base grid position with randomization
  const baseX = 15 + (col / Math.max(1, cols - 1)) * 70
  const baseY = 20 + (row / Math.max(1, Math.ceil(total / cols) - 1)) * 55
  
  // Add variation based on hash
  const xVariation = ((hash % 15) - 7)
  const yVariation = (((hash * 7) % 15) - 7)
  
  return {
    x: Math.max(10, Math.min(90, baseX + xVariation)),
    y: Math.max(15, Math.min(80, baseY + yVariation))
  }
}

// Calculate HHS for a habit
const calculateHHS = (habit, logs) => {
  if (habit.currentHHS && habit.currentHHS > 0) {
    return habit.currentHHS
  }
  
  const habitLogs = logs.filter(l => l.habitId === habit.id)
  
  if (habitLogs.length === 0) return 25
  
  const recentDays = 7
  const now = new Date()
  const recentLogs = habitLogs.filter(log => {
    const logDate = new Date(log.timestamp)
    const daysDiff = (now - logDate) / (1000 * 60 * 60 * 24)
    return daysDiff <= recentDays
  })
  
  const consistencyScore = Math.min(100, (recentLogs.length / recentDays) * 100)
  const streakBonus = Math.min(20, (habit.currentStreak || 0) * 2)
  const hhs = Math.round(consistencyScore * 0.7 + streakBonus + 10)
  
  return Math.min(100, Math.max(0, hhs))
}

// Get star brightness class based on HHS
const getStarBrightness = (hhs) => {
  if (hhs >= 85) return 'blazing'
  if (hhs >= 70) return 'bright'
  if (hhs >= 50) return 'growing'
  return 'dim'
}

// Animated counter hook
const useAnimatedCounter = (targetValue, duration = 1500) => {
  const [displayValue, setDisplayValue] = useState(0)
  const startTime = useRef(null)
  const startValue = useRef(0)
  
  useEffect(() => {
    startValue.current = displayValue
    startTime.current = Date.now()
    
    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValue.current + (targetValue - startValue.current) * easeOut
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [targetValue, duration])
  
  return displayValue
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { habits, logs, user, getTotalEarnings, getWeekEarnings } = useHabits()
  const [activeTooltip, setActiveTooltip] = useState(null)
  const bgStarsRef = useRef(null)

  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }
  
  // Filter active habits
  const activeHabits = useMemo(() => {
    return habits.filter(h => h.isActive !== false)
  }, [habits])
  
  // Calculate stats for each habit
  const habitStats = useMemo(() => {
    return activeHabits.map((habit, index) => {
      const hhs = calculateHHS(habit, logs)
      const habitLogs = logs.filter(l => l.habitId === habit.id)
      const totalEarned = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
      const position = getStarPosition(habit.id, index, activeHabits.length)
      const categoryInfo = getCategoryInfo(habit.category)
      
      return {
        ...habit,
        hhs,
        totalEarned,
        position,
        brightness: getStarBrightness(hhs),
        categoryInfo
      }
    })
  }, [activeHabits, logs])
  
  // Calculate overall stats
  const stats = useMemo(() => {
    const totalEarnings = getTotalEarnings()
    const weekEarnings = getWeekEarnings()
    const avgHHS = habitStats.length > 0
      ? Math.round(habitStats.reduce((sum, h) => sum + h.hhs, 0) / habitStats.length)
      : 0
    
    // Days since first habit
    const firstHabit = habits.reduce((earliest, h) => {
      if (!earliest) return h
      return new Date(h.createdAt) < new Date(earliest.createdAt) ? h : earliest
    }, null)
    
    const daysSinceStart = firstHabit
      ? Math.floor((new Date() - new Date(firstHabit.createdAt)) / (1000 * 60 * 60 * 24))
      : 0
    
    // Overall streak (consecutive days with ANY activity)
    const overallStreak = calculateOverallStreak(logs)
    
    // Best performing habit
    const topHabit = habitStats.length > 0
      ? habitStats.reduce((best, h) => h.hhs > best.hhs ? h : best, habitStats[0])
      : null
    
    // Longest streak across all habits
    const longestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0)
    
    // Peak HHS ever achieved
    const peakHHS = habits.reduce((max, h) => Math.max(max, h.currentHHS || 0), avgHHS)
    
    // Best week earnings (simplified - use current week as proxy)
    const bestWeekEarnings = weekEarnings
    
    // Calculate week over week change
    const lastWeekStart = new Date()
    lastWeekStart.setDate(lastWeekStart.getDate() - 14)
    const lastWeekEnd = new Date()
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)
    
    const lastWeekEarnings = logs
      .filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate >= lastWeekStart && logDate < lastWeekEnd
      })
      .reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
    
    const weekChange = lastWeekEarnings > 0 
      ? ((weekEarnings - lastWeekEarnings) / lastWeekEarnings * 100).toFixed(0)
      : weekEarnings > 0 ? 100 : 0
    
    return {
      totalEarnings,
      weekEarnings,
      weekChange,
      avgHHS,
      habitCount: activeHabits.length,
      daysSinceStart,
      overallStreak,
      longestStreak,
      peakHHS,
      bestWeekEarnings,
      topHabit
    }
  }, [habits, logs, habitStats, activeHabits, getTotalEarnings, getWeekEarnings])
  
  // Calculate overall streak (days with any activity)
  function calculateOverallStreak(logs) {
    if (logs.length === 0) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get unique days with logs
    const logDays = new Set(
      logs.map(log => {
        const d = new Date(log.timestamp)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    )
    
    let streak = 0
    let checkDate = new Date(today)
    
    // Check if logged today or yesterday to start streak
    const todayTime = today.getTime()
    const yesterdayTime = todayTime - 86400000
    
    if (!logDays.has(todayTime) && !logDays.has(yesterdayTime)) {
      return 0
    }
    
    // Count consecutive days backwards
    while (logDays.has(checkDate.getTime())) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
    
    return streak
  }
  
  // Animated portfolio value
  const animatedPortfolioValue = useAnimatedCounter(stats.totalEarnings)
  
  // Get unique categories for legend
  const categories = useMemo(() => {
    const seen = new Set()
    return habitStats
      .filter(h => {
        const key = h.categoryInfo.name
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map(h => h.categoryInfo)
  }, [habitStats])
  
  // Generate background stars on mount
  useEffect(() => {
    if (!bgStarsRef.current) return
    
    const container = bgStarsRef.current
    container.innerHTML = ''
    
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div')
      star.className = 'bg-star'
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.animationDelay = `${Math.random() * 3}s`
      star.style.opacity = Math.random() * 0.4 + 0.1
      const size = Math.random() * 2 + 1
      star.style.width = `${size}px`
      star.style.height = `${size}px`
      container.appendChild(star)
    }
  }, [])
  
  // Handle star click
  const handleStarClick = (habit) => {
    navigate(`/habit/${habit.id}`)
  }
  
  // Format member since date
  const memberSince = useMemo(() => {
    const firstHabit = habits.reduce((earliest, h) => {
      if (!earliest) return h
      return new Date(h.createdAt) < new Date(earliest.createdAt) ? h : earliest
    }, null)
    
    if (!firstHabit) return 'Today'
    
    const date = new Date(firstHabit.createdAt)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [habits])
  
  // Achievement badges
  const achievements = useMemo(() => {
    const earned = []
    
    if (stats.totalEarnings >= 100) {
      earned.push({ id: 'century', name: 'Century Club', icon: '💯', desc: 'Earned $100+' })
    }
    if (stats.totalEarnings >= 50) {
      earned.push({ id: 'fifty', name: 'Halfway There', icon: '🎯', desc: 'Earned $50+' })
    }
    if (stats.overallStreak >= 7) {
      earned.push({ id: 'week', name: 'Week Warrior', icon: '🔥', desc: '7-day streak' })
    }
    if (stats.overallStreak >= 30) {
      earned.push({ id: 'month', name: 'Monthly Master', icon: '⭐', desc: '30-day streak' })
    }
    if (stats.habitCount >= 3) {
      earned.push({ id: 'diversified', name: 'Diversified', icon: '📊', desc: '3+ habits' })
    }
    if (stats.avgHHS >= 80) {
      earned.push({ id: 'performer', name: 'High Performer', icon: '🏆', desc: '80+ avg HHS' })
    }
    if (stats.habitCount >= 1) {
      earned.push({ id: 'first', name: 'First Star', icon: '✨', desc: 'Created first habit' })
    }
    
    return earned.slice(0, 4) // Show max 4
  }, [stats])

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* Dark Sky Section */}
        <div className="sky-section">
          
          {/* Header */}
          <header className="dashboard-header">
            <div className="app-logo">{getGreeting()}{user?.name ? `, ${user.name}` : ''}</div>
            <div className="header-actions">
              <button className="icon-button" aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>
          </header>
          
          {/* Hero: You've Paid Yourself */}
          <div className="hero-section">
            <div className="hero-label">You've paid yourself</div>
            <div className="hero-value">${animatedPortfolioValue.toFixed(2)}</div>
            {stats.weekEarnings > 0 && (
              <div className="hero-change">
                <span className="change-positive">+${stats.weekEarnings.toFixed(2)}</span>
                <span className="change-period">this week</span>
                {stats.weekChange > 0 && (
                  <span className="change-percent">↑ {stats.weekChange}%</span>
                )}
              </div>
            )}
          </div>
          
          {/* Constellation Container */}
          <div className="constellation-container">
            
            {/* Background Stars */}
            <div className="bg-stars" ref={bgStarsRef}></div>
            
            {/* Stars (Habits) */}
            {habitStats.map((habit) => (
              <div
                key={habit.id}
                className={`star ${habit.brightness} ${habit.category}`}
                style={{
                  left: `${habit.position.x}%`,
                  top: `${habit.position.y}%`,
                  '--star-color': habit.categoryInfo.color
                }}
                onClick={() => handleStarClick(habit)}
                onMouseEnter={() => setActiveTooltip(habit.id)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <div className="star-glow"></div>
                <div className="star-core"></div>
                
                {/* Tooltip */}
                <div className={`star-tooltip ${activeTooltip === habit.id ? 'visible' : ''}`}>
                  <div className="tooltip-name">{habit.name}</div>
                  <div className="tooltip-category" style={{ color: habit.categoryInfo.color }}>
                    {habit.categoryInfo.name}
                  </div>
                  <div className="tooltip-stats">
                    <div className="tooltip-stat">
                      <div className="tooltip-stat-value">{habit.hhs}</div>
                      <div className="tooltip-stat-label">HHS</div>
                    </div>
                    <div className="tooltip-stat">
                      <div className="tooltip-stat-value">${habit.totalEarned.toFixed(0)}</div>
                      <div className="tooltip-stat-label">Earned</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty State */}
            {habitStats.length === 0 && (
              <div className="constellation-empty">
                <div className="empty-star">✦</div>
                <p>Your sky is waiting</p>
                <span>Create your first habit to add a star</span>
              </div>
            )}
            
            {/* Label */}
            {habitStats.length > 0 && (
              <div className="constellation-label">
                <h2>Your Constellation</h2>
                <p>{stats.daysSinceStart} days of growth • {stats.habitCount} stars</p>
              </div>
            )}
          </div>
          
        </div>
        
        {/* Light Mode Content - Trophy Case */}
        <div className="content-section">
          
          {/* Legend */}
          {categories.length > 0 && (
            <div className="legend-card">
              <div className="legend-items">
                {categories.map((cat, i) => (
                  <div key={i} className="legend-item">
                    <div className="legend-dot" style={{ background: cat.color }}></div>
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Personal Records */}
          {stats.habitCount > 0 && (
            <div className="records-card">
              <div className="records-title">Personal Records</div>
              <div className="records-grid">
                <div className="record-item">
                  <div className="record-icon">🔥</div>
                  <div className="record-value">{stats.longestStreak}</div>
                  <div className="record-label">Best Streak</div>
                </div>
                <div className="record-item">
                  <div className="record-icon">📈</div>
                  <div className="record-value">{stats.peakHHS}</div>
                  <div className="record-label">Peak HHS</div>
                </div>
                <div className="record-item">
                  <div className="record-icon">💰</div>
                  <div className="record-value">${stats.bestWeekEarnings.toFixed(0)}</div>
                  <div className="record-label">Best Week</div>
                </div>
                <div className="record-item">
                  <div className="record-icon">⭐</div>
                  <div className="record-value">{stats.habitCount}</div>
                  <div className="record-label">Total Habits</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="achievements-card">
              <div className="achievements-title">Achievements</div>
              <div className="achievements-grid">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="achievement-item">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-desc">{achievement.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Top Performer */}
          {stats.topHabit && (
            <div 
              className="top-performer-card"
              onClick={() => navigate(`/habit/${stats.topHabit.id}`)}
            >
              <div className="performer-badge">Top Performer</div>
              <div className="performer-content">
                <div className="performer-ticker">${stats.topHabit.ticker}</div>
                <div className="performer-name">{stats.topHabit.name}</div>
              </div>
              <div className="performer-stats">
                <div className="performer-hhs">{stats.topHabit.hhs} HHS</div>
                <div className="performer-earned">${stats.topHabit.totalEarned.toFixed(2)}</div>
              </div>
            </div>
          )}
          
          {/* Summary Stats */}
          <div className="summary-card">
            <div className="summary-header">
              <span className="summary-title">Portfolio Overview</span>
            </div>
            <div className="summary-stats">
              <div className="summary-stat">
                <div className="summary-stat-value">{stats.daysSinceStart}</div>
                <div className="summary-stat-label">Days Invested</div>
              </div>
              <div className="summary-stat">
                <div className="summary-stat-value">{stats.avgHHS}</div>
                <div className="summary-stat-label">Avg HHS</div>
              </div>
              <div className="summary-stat">
                <div className="summary-stat-value">{logs.length}</div>
                <div className="summary-stat-label">Total Logs</div>
              </div>
            </div>
          </div>
          
          {/* Member Badge */}
          <div className="member-card">
            <div className="member-icon">⭐</div>
            <div className="member-text">
              <strong>Founding Member</strong> • Building your sky since {memberSince}
            </div>
          </div>
          
        </div>
        
      </div>
      
      <Navigation />
    </div>
  )
}
