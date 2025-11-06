import { createContext, useContext, useState, useEffect } from 'react'

const HabitContext = createContext()

export function useHabits() {
  const context = useContext(HabitContext)
  if (!context) {
    throw new Error('useHabits must be used within HabitProvider')
  }
  return context
}

export function HabitProvider({ children }) {
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

  // Habit CRUD operations
  const addHabit = (habit) => {
    const newHabit = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
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

  // Log CRUD operations
  const addLog = (log) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...log,
    }
    setLogs((prev) => [...prev, newLog])
    return newLog
  }

  const updateLog = (id, updates) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    )
  }

  const deleteLog = (id) => {
    setLogs((prev) => prev.filter((log) => log.id !== id))
  }

  // Calculations
  const getTotalEarnings = () => {
    return logs.reduce((sum, log) => sum + log.totalEarnings, 0)
  }

  const getTodayEarnings = () => {
    const today = new Date().toDateString()
    return logs
      .filter((log) => new Date(log.timestamp).toDateString() === today)
      .reduce((sum, log) => sum + log.totalEarnings, 0)
  }

  const getWeekEarnings = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return logs
      .filter((log) => new Date(log.timestamp) >= weekAgo)
      .reduce((sum, log) => sum + log.totalEarnings, 0)
  }

  const getHabitLogs = (habitId) => {
    return logs.filter((log) => log.habitId === habitId)
  }

  const getHabitStats = (habitId) => {
    const habitLogs = getHabitLogs(habitId)
    const totalEarnings = habitLogs.reduce((sum, log) => sum + log.totalEarnings, 0)
    
    // Calculate current streak
    let streak = 0
    const sortedLogs = [...habitLogs].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )

    if (sortedLogs.length > 0) {
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      const lastLogDate = new Date(sortedLogs[0].timestamp).toDateString()

      // Only count streak if logged today or yesterday
      if (lastLogDate === today || lastLogDate === yesterday) {
        let currentDate = new Date(sortedLogs[0].timestamp)
        streak = 1

        for (let i = 1; i < sortedLogs.length; i++) {
          const logDate = new Date(sortedLogs[i].timestamp)
          const dayDiff = Math.floor(
            (currentDate - logDate) / (1000 * 60 * 60 * 24)
          )

          if (dayDiff === 1) {
            streak++
            currentDate = logDate
          } else {
            break
          }
        }
      }
    }

    return {
      totalLogs: habitLogs.length,
      totalEarnings,
      currentStreak: streak,
      lastLogDate: habitLogs.length > 0 ? habitLogs[0].timestamp : null,
    }
  }

  // User operations
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }))
  }

  const value = {
    // State
    habits,
    logs,
    user,
    // Habit operations
    addHabit,
    updateHabit,
    deleteHabit,
    // Log operations
    addLog,
    updateLog,
    deleteLog,
    // Calculations
    getTotalEarnings,
    getTodayEarnings,
    getWeekEarnings,
    getHabitLogs,
    getHabitStats,
    // User operations
    updateUser,
  }

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
}
