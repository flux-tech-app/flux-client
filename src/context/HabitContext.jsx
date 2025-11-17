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

  // Habit CRUD operations
  const addHabit = (habit) => {
    const newHabit = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    // Sum all completed transfers
    return transfers.reduce((sum, transfer) => {
      if (transfer.status === 'completed') {
        return sum + transfer.amount
      }
      return sum
    }, 0)
  }

  const getPendingBalance = () => {
    // Get total earnings
    const totalEarnings = logs.reduce((sum, log) => sum + log.totalEarnings, 0)
    
    // Subtract already transferred amount
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

  // Manual transfer creation (for example data)
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

  // Existing calculations
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
    transfers,
    lastTransferDate,
    chatLogs,
    // Habit operations
    addHabit,
    updateHabit,
    deleteHabit,
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
    // User operations
    updateUser,
  }

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
}
