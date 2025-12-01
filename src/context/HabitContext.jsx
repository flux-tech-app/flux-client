import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { CATEGORIES, getPredefinedHabit } from '../utils/HABIT_CATEGORIES'

const HabitContext = createContext()

// Current data schema version - increment when making breaking changes
const SCHEMA_VERSION = 3

export function useHabits() {
  const context = useContext(HabitContext)
  if (!context) {
    throw new Error('useHabits must be used within HabitProvider')
  }
  return context
}

/**
 * Migrate habits from v2 to v3
 * - Remove type (build/break) - all habits now require logging
 * - Update category structure to new 4-category system
 * - Add ticker field
 */
function migrateHabitsToV3(habits) {
  const categoryMapping = {
    'fitness': 'fitness',
    'nutrition': 'nutrition', 
    'mental_health': 'growth',
    'productivity': 'growth',
    'financial': 'spending',
    'social': 'growth',
    'wellness': 'fitness'
  }

  return habits.map(habit => {
    // Already migrated
    if (habit.schemaVersion === 3) return habit

    // Map old category to new
    const newCategory = categoryMapping[habit.category] || 'growth'
    
    // Generate ticker if missing
    const ticker = habit.ticker || generateTickerFromName(habit.name)

    // Remove type field, add new fields
    const { type, ...rest } = habit

    return {
      ...rest,
      category: newCategory,
      ticker,
      schemaVersion: 3,
      // Ensure schedule exists
      schedule: habit.schedule || {
        type: 'daily',
        days: [0, 1, 2, 3, 4, 5, 6]
      }
    }
  })
}

// Generate ticker from habit name
function generateTickerFromName(name) {
  const clean = (name || 'HABIT').replace(/[^a-zA-Z]/g, '').toUpperCase()
  if (clean.length <= 5) return clean
  const noVowels = clean.replace(/[AEIOU]/g, '')
  if (noVowels.length >= 3) return noVowels.slice(0, 5)
  return clean.slice(0, 5)
}

export function HabitProvider({ children }) {
  // Track if migration has run this session
  const migrationRan = useRef(false)

  // Core state - use lazy initialization to load from localStorage immediately
  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem('flux_habits')
    return savedHabits ? JSON.parse(savedHabits) : []
  })
  
  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem('flux_logs')
    return savedLogs ? JSON.parse(savedLogs) : []
  })
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('flux_user')
    return savedUser ? JSON.parse(savedUser) : {
      name: '',
      email: '',
      hasCompletedOnboarding: false,
    }
  })

  // Transfer state
  const [transfers, setTransfers] = useState(() => {
    const savedTransfers = localStorage.getItem('flux_transfers')
    return savedTransfers ? JSON.parse(savedTransfers) : []
  })

  const [lastTransferDate, setLastTransferDate] = useState(() => {
    const saved = localStorage.getItem('flux_last_transfer')
    return saved || null
  })

  // Chat logs state
  const [chatLogs, setChatLogs] = useState(() => {
    const savedChatLogs = localStorage.getItem('flux_chat_logs')
    return savedChatLogs ? JSON.parse(savedChatLogs) : []
  })

  // Schema version tracking
  const [schemaVersion, setSchemaVersion] = useState(() => {
    const saved = localStorage.getItem('flux_schema_version')
    return saved ? parseInt(saved, 10) : 1
  })

  // Run migration on mount if needed
  useEffect(() => {
    if (migrationRan.current) return
    
    if (schemaVersion < SCHEMA_VERSION && habits.length > 0) {
      console.log(`Migrating habits from schema v${schemaVersion} to v${SCHEMA_VERSION}`)
      
      const migratedHabits = migrateHabitsToV3(habits)
      setHabits(migratedHabits)
      setSchemaVersion(SCHEMA_VERSION)
      
      console.log('Migration complete:', migratedHabits)
    }
    
    migrationRan.current = true
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('flux_habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('flux_logs', JSON.stringify(logs))
  }, [logs])

  useEffect(() => {
    localStorage.setItem('flux_user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem('flux_transfers', JSON.stringify(transfers))
  }, [transfers])

  useEffect(() => {
    if (lastTransferDate) {
      localStorage.setItem('flux_last_transfer', lastTransferDate)
    }
  }, [lastTransferDate])

  useEffect(() => {
    localStorage.setItem('flux_chat_logs', JSON.stringify(chatLogs))
  }, [chatLogs])

  useEffect(() => {
    localStorage.setItem('flux_schema_version', schemaVersion.toString())
  }, [schemaVersion])

  // Habit CRUD operations
  const addHabit = (habit) => {
    const category = CATEGORIES[habit.category]
    
    const newHabit = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      schemaVersion: SCHEMA_VERSION,
      // Defaults that can be overridden
      category: 'fitness',
      ticker: generateTickerFromName(habit.name),
      rateType: 'per_day',
      unit: 'day',
      schedule: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
      // HSS tracking fields
      currentHHS: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalLogged: 0,
      totalEarned: 0,
      completionRate: 0,
      // Override with provided values
      ...habit,
    }
    
    setHabits((prev) => [...prev, newHabit])
    return newHabit
  }

  const updateHabit = (id, updates) => {
    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit))
    )
  }

  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
    // Also delete all logs for this habit
    setLogs((prev) => prev.filter((log) => log.habitId !== id))
  }

  const pauseHabit = (id) => {
    updateHabit(id, { isActive: false, pausedAt: new Date().toISOString() })
  }

  const resumeHabit = (id) => {
    updateHabit(id, { isActive: true, pausedAt: null })
  }

  // Log CRUD operations
  const addLog = (log) => {
    const habit = habits.find(h => h.id === log.habitId)
    if (!habit) return null

    // Calculate earnings based on rate type
    let totalEarnings = 0
    if (habit.rateType === 'per_unit' && log.amount) {
      totalEarnings = habit.rate * log.amount
    } else {
      totalEarnings = habit.rate
    }

    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      totalEarnings,
      ...log,
    }
    
    setLogs((prev) => [...prev, newLog])

    // Update habit stats
    updateHabitStats(habit.id)

    return newLog
  }

  const updateLog = (id, updates) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    )
  }

  const deleteLog = (id) => {
    const log = logs.find(l => l.id === id)
    setLogs((prev) => prev.filter((log) => log.id !== id))
    
    // Update habit stats after deletion
    if (log) {
      updateHabitStats(log.habitId)
    }
  }

  // Update habit statistics after logging
  const updateHabitStats = (habitId) => {
    const habitLogs = logs.filter(l => l.habitId === habitId)
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const totalEarned = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
    const totalLogged = habitLogs.reduce((sum, log) => sum + (log.amount || 1), 0)
    
    // Calculate streak
    const streak = calculateStreak(habitLogs)
    
    updateHabit(habitId, {
      totalEarned,
      totalLogged,
      currentStreak: streak,
      bestStreak: Math.max(habit.bestStreak || 0, streak)
    })
  }

  // Calculate current streak
  const calculateStreak = (habitLogs) => {
    if (habitLogs.length === 0) return 0

    const sortedLogs = [...habitLogs].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastLogDate = new Date(sortedLogs[0].timestamp)
    lastLogDate.setHours(0, 0, 0, 0)

    // Only count streak if logged today or yesterday
    if (lastLogDate.getTime() !== today.getTime() && 
        lastLogDate.getTime() !== yesterday.getTime()) {
      return 0
    }

    let streak = 1
    let currentDate = lastLogDate

    for (let i = 1; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].timestamp)
      logDate.setHours(0, 0, 0, 0)
      
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

  // Chat log operations
  const addChatLog = (chatLog) => {
    const newChatLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...chatLog,
    }
    setChatLogs((prev) => [...prev, newChatLog])
    return newChatLog
  }

  const updateChatLog = (id, updates) => {
    setChatLogs((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, ...updates } : chat))
    )
  }

  const deleteChatLog = (id) => {
    setChatLogs((prev) => prev.filter((chat) => chat.id !== id))
  }

  // Transfer calculations
  const getTransferredBalance = () => {
    return transfers.reduce((sum, transfer) => {
      if (transfer.status === 'completed') {
        return sum + transfer.amount
      }
      return sum
    }, 0)
  }

  const getPendingBalance = () => {
    const totalEarnings = logs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
    const transferred = getTransferredBalance()
    return totalEarnings - transferred
  }

  const processTransfer = () => {
    const pending = getPendingBalance()
    
    if (pending <= 0) {
      return { success: false, message: 'No pending balance to transfer' }
    }

    const now = new Date().toISOString()
    const newTransfer = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: pending,
      date: now,
      status: 'completed'
    }

    setTransfers(prev => [...prev, newTransfer])
    setLastTransferDate(now)

    return { 
      success: true, 
      message: `Transfer completed: $${pending.toFixed(2)}`,
      amount: pending 
    }
  }

  const addTransfer = (transfer) => {
    const newTransfer = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      status: 'completed',
      ...transfer,
    }
    setTransfers(prev => [...prev, newTransfer])
    return newTransfer
  }

  // Earnings calculations
  const getTotalEarnings = () => {
    return logs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
  }

  const getTodayEarnings = () => {
    const today = new Date().toDateString()
    return logs
      .filter((log) => new Date(log.timestamp).toDateString() === today)
      .reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
  }

  const getWeekEarnings = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return logs
      .filter((log) => new Date(log.timestamp) >= weekAgo)
      .reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
  }

  const getHabitLogs = (habitId) => {
    return logs.filter((log) => log.habitId === habitId)
  }

  const getHabitStats = (habitId) => {
    const habitLogs = getHabitLogs(habitId)
    const totalEarnings = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
    const streak = calculateStreak(habitLogs)

    return {
      totalLogs: habitLogs.length,
      totalEarnings,
      currentStreak: streak,
      lastLogDate: habitLogs.length > 0 ? habitLogs[0].timestamp : null,
    }
  }

  // Category helpers (updated for new 4-category structure)
  const getHabitsByCategory = (category) => {
    return habits.filter((habit) => habit.category === category && habit.isActive !== false)
  }

  const getCategoryStats = (categoryId) => {
    const categoryHabits = getHabitsByCategory(categoryId)
    const totalEarned = categoryHabits.reduce((sum, h) => sum + (h.totalEarned || 0), 0)
    const avgHHS = categoryHabits.length > 0
      ? categoryHabits.reduce((sum, h) => sum + (h.currentHHS || 0), 0) / categoryHabits.length
      : 0

    return {
      habitCount: categoryHabits.length,
      totalEarned,
      avgHHS,
      habits: categoryHabits
    }
  }

  // Schedule helpers
  const isScheduledForDay = (habit, dayOfWeek) => {
    if (!habit.schedule) return true
    
    const { type, days } = habit.schedule
    
    switch (type) {
      case 'daily':
        return true
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5
      case 'weekends':
        return dayOfWeek === 0 || dayOfWeek === 6
      case 'specific_days':
        return days.includes(dayOfWeek)
      default:
        return true
    }
  }

  const getTodayHabits = () => {
    const today = new Date().getDay()
    return habits.filter((habit) => 
      habit.isActive !== false && isScheduledForDay(habit, today)
    )
  }

  const getHabitsForDate = (date) => {
    const dayOfWeek = new Date(date).getDay()
    return habits.filter((habit) => 
      habit.isActive !== false && isScheduledForDay(habit, dayOfWeek)
    )
  }

  // Check if habit was logged on a specific date
  const isHabitLoggedOnDate = (habitId, date) => {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    return logs.some(log => {
      if (log.habitId !== habitId) return false
      const logDate = new Date(log.timestamp)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === targetDate.getTime()
    })
  }

  // Get potential earnings for today (if all habits completed)
  const getTodayPotentialEarnings = () => {
    const todayHabits = getTodayHabits()
    return todayHabits.reduce((sum, habit) => sum + habit.rate, 0)
  }

  // User operations
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }))
  }

  // Clear all data (for testing/reset)
  const clearAllData = () => {
    setHabits([])
    setLogs([])
    setTransfers([])
    setChatLogs([])
    setLastTransferDate(null)
    localStorage.removeItem('flux_habits')
    localStorage.removeItem('flux_logs')
    localStorage.removeItem('flux_transfers')
    localStorage.removeItem('flux_chat_logs')
    localStorage.removeItem('flux_last_transfer')
  }

  const value = {
    // State
    habits,
    logs,
    user,
    transfers,
    lastTransferDate,
    chatLogs,
    schemaVersion,
    // Habit operations
    addHabit,
    updateHabit,
    deleteHabit,
    pauseHabit,
    resumeHabit,
    // Log operations
    addLog,
    updateLog,
    deleteLog,
    // Chat log operations
    addChatLog,
    updateChatLog,
    deleteChatLog,
    // Transfer operations
    getTransferredBalance,
    getPendingBalance,
    processTransfer,
    addTransfer,
    // Calculations
    getTotalEarnings,
    getTodayEarnings,
    getWeekEarnings,
    getHabitLogs,
    getHabitStats,
    // Category helpers
    getHabitsByCategory,
    getCategoryStats,
    // Schedule helpers
    isScheduledForDay,
    getTodayHabits,
    getHabitsForDate,
    isHabitLoggedOnDate,
    getTodayPotentialEarnings,
    // User operations
    updateUser,
    // Utility
    clearAllData,
  }

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
}
