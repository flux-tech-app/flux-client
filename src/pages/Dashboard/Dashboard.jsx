import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabits } from '../../context/HabitContext'
import './Dashboard.css'

// Default star color for MVT (no categories)
const DEFAULT_STAR_COLOR = '#60a5fa'

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

/**
 * Calculate Flux Score for a habit (simplified for MVT)
 * Based on logging activity and patterns, not schedules
 */
const calculateFluxScore = (habit, logs) => {
  const habitLogs = logs.filter(l => l.habitId === habit.id)
  
  // Need at least 1 log
  if (habitLogs.length === 0) return 20

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  // Recent logs (last 30 days)
  const recentLogs = habitLogs.filter(log => 
    new Date(log.timestamp) >= thirtyDaysAgo
  )

  // Frequency score (40%) - logs in last 30 days, expected ~15 for active habit
  const frequencyScore = Math.min(100, (recentLogs.length / 15) * 100)

  // Recency score (30%) - exponential decay based on days since last log
  const sortedLogs = [...habitLogs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )
  const lastLogDate = new Date(sortedLogs[0].timestamp)
  const daysSinceLog = (now - lastLogDate) / (1000 * 60 * 60 * 24)
  const recencyScore = Math.max(0, 100 * Math.exp(-daysSinceLog / 4))

  // Trend score (20%) - recent activity vs previous period
  const recentCount = habitLogs.filter(log => 
    new Date(log.timestamp) >= twoWeeksAgo
  ).length

  let trendScore = 50
  if (recentCount >= 5) trendScore = 80
  else if (recentCount >= 3) trendScore = 65
  else if (recentCount >= 1) trendScore = 40
  else trendScore = 20

  // Maturity score (10%) - total logs accumulated
  const maturityScore = Math.min(100, (habitLogs.length / 20) * 100)

  // Calculate final score
  const score = Math.round(
    (frequencyScore * 0.40) +
    (recencyScore * 0.30) +
    (trendScore * 0.20) +
    (maturityScore * 0.10)
  )

  return Math.min(100, Math.max(0, score))
}

// Get star brightness class based on Flux Score
const getStarBrightness = (score) => {
  if (score >= 85) return 'blazing'
  if (score >= 70) return 'bright'
  if (score >= 50) return 'growing'
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

// Calculate current streak for a habit based on logs
const calculateHabitStreak = (habitId, logs) => {
  const habitLogs = logs.filter(l => l.habitId === habitId)
  if (habitLogs.length === 0) return 0

  const sortedLogs = [...habitLogs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today.getTime() - 86400000)

  const lastLogDate = new Date(sortedLogs[0].timestamp)
  lastLogDate.setHours(0, 0, 0, 0)

  // Only count streak if logged today or yesterday
  if (lastLogDate < yesterday) return 0

  // Get unique days with logs
  const logDays = new Set(
    sortedLogs.map(log => {
      const d = new Date(log.timestamp)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )

  let streak = 0
  let checkDate = new Date(lastLogDate)

  while (logDays.has(checkDate.getTime())) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
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
  
  // All habits (no isActive filter needed in MVT - all are active)
  const activeHabits = useMemo(() => {
    return habits
  }, [habits])
  
  // Calculate stats for each habit
  const habitStats = useMemo(() => {
    return activeHabits.map((habit, index) => {
      const fluxScore = calculateFluxScore(habit, logs)
      const habitLogs = logs.filter(l => l.habitId === habit.id)
      const totalEarned = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
      const position = getStarPosition(habit.id, index, activeHabits.length)
      const streak = calculateHabitStreak(habit.id, logs)
      
      return {
        ...habit,
        fluxScore,
        totalEarned,
        position,
        brightness: getStarBrightness(fluxScore),
        streak
      }
    })
  }, [activeHabits, logs])
  
  // Calculate overall stats
  const stats = useMemo(() => {
    const totalEarnings = getTotalEarnings()
    const weekEarnings = getWeekEarnings()
    const avgScore = habitStats.length > 0
      ? Math.round(habitStats.reduce((sum, h) => sum + h.fluxScore, 0) / habitStats.length)
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
      ? habitStats.reduce((best, h) => h.fluxScore > best.fluxScore ? h : best, habitStats[0])
      : null
    
    // Longest habit streak
    const longestStreak = habitStats.reduce((max, h) => Math.max(max, h.streak || 0), 0)
    
    // Peak score
    const peakScore = habitStats.reduce((max, h) => Math.max(max, h.fluxScore), avgScore)
    
    // Best week earnings (use current as baseline for MVT)
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
      avgScore,
      habitCount: activeHabits.length,
      daysSinceStart,
      overallStreak,
      longestStreak,
      peakScore,
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
    if (stats.avgScore >= 80) {
      earned.push({ id: 'performer', name: 'High Performer', icon: '🏆', desc: '80+ avg score' })
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
              <button className="icon-button" aria-label="Activity" onClick={() => navigate('/activity')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
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
                className={`star ${habit.brightness}`}
                style={{
                  left: `${habit.position.x}%`,
                  top: `${habit.position.y}%`,
                  '--star-color': DEFAULT_STAR_COLOR
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
                  <div className="tooltip-stats">
                    <div className="tooltip-stat">
                      <div className="tooltip-stat-value">{habit.fluxScore}</div>
                      <div className="tooltip-stat-label">Score</div>
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
                  <div className="record-value">{stats.peakScore}</div>
                  <div className="record-label">Peak Score</div>
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
                <div className="performer-name">{stats.topHabit.name}</div>
              </div>
              <div className="performer-stats">
                <div className="performer-hhs">{stats.topHabit.fluxScore} Score</div>
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
                <div className="summary-stat-value">{stats.avgScore}</div>
                <div className="summary-stat-label">Avg Score</div>
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
    </div>
  )
}
