import { createContext, useContext, useState, useEffect } from 'react';
import { getHabitById, RATE_TYPES } from '../utils/HABIT_LIBRARY';

const HabitContext = createContext();

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitProvider');
  }
  return context;
}

export function HabitProvider({ children }) {
  // ========== STATE ==========
  
  // User's active habits (selected from library)
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('flux_habits');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Activity logs
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('flux_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  // User profile and settings
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('flux_user');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      hasCompletedOnboarding: false,
    };
  });

  // Transfer history
  const [transfers, setTransfers] = useState(() => {
    const saved = localStorage.getItem('flux_transfers');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastTransferDate, setLastTransferDate] = useState(() => {
    return localStorage.getItem('flux_last_transfer') || null;
  });

  // ========== PERSISTENCE ==========
  
  useEffect(() => {
    localStorage.setItem('flux_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('flux_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('flux_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('flux_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    if (lastTransferDate) {
      localStorage.setItem('flux_last_transfer', lastTransferDate);
    }
  }, [lastTransferDate]);

  // ========== HABIT OPERATIONS ==========
  
  /**
   * Add a habit from the library
   * @param {Object} habitConfig - { libraryId, rate (optional custom rate) }
   */
  const addHabit = (habitConfig) => {
    const libraryHabit = getHabitById(habitConfig.libraryId);
    
    if (!libraryHabit) {
      console.error('Habit not found in library:', habitConfig.libraryId);
      return null;
    }

    // Check if habit already exists
    const existing = habits.find(h => h.libraryId === habitConfig.libraryId);
    if (existing) {
      console.warn('Habit already added:', habitConfig.libraryId);
      return existing;
    }

    const newHabit = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      libraryId: habitConfig.libraryId,
      
      // Copy from library
      name: libraryHabit.name,
      ticker: libraryHabit.ticker,
      icon: libraryHabit.icon,
      rateType: libraryHabit.rateType,
      unit: libraryHabit.unit,
      unitPlural: libraryHabit.unitPlural,
      
      // Custom rate or default
      rate: habitConfig.rate ?? libraryHabit.defaultRate,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      
      // Pattern recognition (populated after logs)
      baseline: null
    };

    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  };

  /**
   * Add multiple habits at once (used during onboarding)
   * @param {Array} habitConfigs - Array of { libraryId, rate }
   */
  const addHabits = (habitConfigs) => {
    const newHabits = habitConfigs
      .filter(config => {
        const libraryHabit = getHabitById(config.libraryId);
        const exists = habits.find(h => h.libraryId === config.libraryId);
        return libraryHabit && !exists;
      })
      .map(config => {
        const libraryHabit = getHabitById(config.libraryId);
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${config.libraryId}`,
          libraryId: config.libraryId,
          name: libraryHabit.name,
          ticker: libraryHabit.ticker,
          icon: libraryHabit.icon,
          rateType: libraryHabit.rateType,
          unit: libraryHabit.unit,
          unitPlural: libraryHabit.unitPlural,
          rate: config.rate ?? libraryHabit.defaultRate,
          createdAt: new Date().toISOString(),
          baseline: null
        };
      });

    if (newHabits.length > 0) {
      setHabits(prev => [...prev, ...newHabits]);
    }
    
    return newHabits;
  };

  /**
   * Update habit (mainly for rate changes)
   */
  const updateHabit = (id, updates) => {
    setHabits(prev =>
      prev.map(habit => 
        habit.id === id ? { ...habit, ...updates } : habit
      )
    );
  };

  /**
   * Delete habit and its logs
   */
  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
    setLogs(prev => prev.filter(log => log.habitId !== id));
  };

  /**
   * Check if a library habit is already added
   */
  const isHabitAdded = (libraryId) => {
    return habits.some(h => h.libraryId === libraryId);
  };

  // ========== LOG OPERATIONS ==========
  
  /**
   * Add a log entry
   * @param {Object} logData - { habitId, units (for non-binary), notes (optional) }
   */
  const addLog = (logData) => {
    const habit = habits.find(h => h.id === logData.habitId);
    if (!habit) {
      console.error('Habit not found:', logData.habitId);
      return null;
    }

    // Calculate earnings - use custom earnings if provided, otherwise calculate from rate
    let totalEarnings;
    if (logData.customEarnings !== undefined) {
      totalEarnings = logData.customEarnings;
    } else if (habit.rateType === RATE_TYPES.BINARY) {
      totalEarnings = habit.rate || 0;
    } else {
      totalEarnings = (habit.rate || 0) * (logData.units || 1);
    }

    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      habitId: logData.habitId,
      timestamp: new Date().toISOString(),
      units: logData.units || 1,
      totalEarnings,
      notes: logData.notes || ''
    };

    setLogs(prev => [...prev, newLog]);
    return newLog;
  };

  /**
   * Update a log entry
   */
  const updateLog = (id, updates) => {
    setLogs(prev =>
      prev.map(log => {
        if (log.id !== id) return log;
        
        // Recalculate earnings if units changed
        if (updates.units !== undefined) {
          const habit = habits.find(h => h.id === log.habitId);
          if (habit && habit.rateType !== RATE_TYPES.BINARY) {
            updates.totalEarnings = habit.rate * updates.units;
          }
        }
        
        return { ...log, ...updates };
      })
    );
  };

  /**
   * Delete a log entry
   */
  const deleteLog = (id) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  /**
   * Get logs for a specific habit
   */
  const getHabitLogs = (habitId) => {
    return logs.filter(log => log.habitId === habitId);
  };

  /**
   * Check if habit was logged on a specific date
   */
  const isHabitLoggedOnDate = (habitId, date) => {
    const dateStr = new Date(date).toDateString();
    return logs.some(log => 
      log.habitId === habitId && 
      new Date(log.timestamp).toDateString() === dateStr
    );
  };

  /**
   * Get today's logs
   */
  const getTodayLogs = () => {
    const today = new Date().toDateString();
    return logs.filter(log => 
      new Date(log.timestamp).toDateString() === today
    );
  };

  // ========== BALANCE CALCULATIONS ==========
  
  /**
   * Get total transferred balance (completed transfers)
   */
  const getTransferredBalance = () => {
    return transfers.reduce((sum, transfer) => {
      if (transfer.status === 'completed') {
        return sum + transfer.amount;
      }
      return sum;
    }, 0);
  };

  /**
   * Get pending balance (earnings not yet transferred)
   */
  const getPendingBalance = () => {
    const totalEarnings = logs.reduce((sum, log) => sum + log.totalEarnings, 0);
    const transferred = getTransferredBalance();
    return totalEarnings - transferred;
  };

  /**
   * Get total earnings (all time)
   */
  const getTotalEarnings = () => {
    return logs.reduce((sum, log) => sum + log.totalEarnings, 0);
  };

  /**
   * Get today's earnings
   */
  const getTodayEarnings = () => {
    const today = new Date().toDateString();
    return logs
      .filter(log => new Date(log.timestamp).toDateString() === today)
      .reduce((sum, log) => sum + log.totalEarnings, 0);
  };

  /**
   * Get this week's earnings
   */
  const getWeekEarnings = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return logs
      .filter(log => new Date(log.timestamp) >= weekAgo)
      .reduce((sum, log) => sum + log.totalEarnings, 0);
  };

  // ========== TRANSFER OPERATIONS ==========
  
  /**
   * Process Friday transfer (move pending to transferred)
   */
  const processTransfer = () => {
    const pending = getPendingBalance();
    
    if (pending <= 0) {
      return { success: false, message: 'No pending balance to transfer' };
    }

    const now = new Date().toISOString();
    const newTransfer = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: pending,
      date: now,
      status: 'completed',
      breakdown: getTransferBreakdown()
    };

    setTransfers(prev => [...prev, newTransfer]);
    setLastTransferDate(now);

    return { 
      success: true, 
      message: `Transfer completed: $${pending.toFixed(2)}`,
      amount: pending 
    };
  };

  /**
   * Get breakdown of pending earnings by habit
   */
  const getTransferBreakdown = () => {
    // Get logs since last transfer
    const lastDate = lastTransferDate ? new Date(lastTransferDate) : new Date(0);
    const pendingLogs = logs.filter(log => new Date(log.timestamp) > lastDate);
    
    // Group by habit
    const breakdown = {};
    pendingLogs.forEach(log => {
      if (!breakdown[log.habitId]) {
        breakdown[log.habitId] = 0;
      }
      breakdown[log.habitId] += log.totalEarnings;
    });

    return Object.entries(breakdown).map(([habitId, amount]) => ({
      habitId,
      amount
    }));
  };

  /**
   * Manual transfer creation (for testing/example data)
   */
  const addTransfer = (transfer) => {
    const newTransfer = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      status: 'completed',
      ...transfer
    };
    setTransfers(prev => [...prev, newTransfer]);
    return newTransfer;
  };

  // ========== FLUX SCORE CALCULATIONS ==========
  
  /**
   * Calculate Flux Score for a habit (0-100 scale)
   * Components:
   * - Frequency Trend (30 pts): Recent vs baseline frequency
   * - Consistency (25 pts): Gap variance (lower = better)
   * - Recency (20 pts): Days since last log vs typical gap
   * - Volume/Intensity (15 pts): For non-binary habits only
   * - Data Maturity (10 pts): Total logs (confidence indicator)
   */
  const calculateFluxScore = (habitId) => {
    const habitLogs = getHabitLogs(habitId);
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return null;
    
    const totalLogs = habitLogs.length;
    
    // Not enough data - return building state
    if (totalLogs < 10) {
      return {
        score: null,
        status: 'building',
        logsNeeded: 10 - totalLogs,
        totalLogs
      };
    }
    
    const now = new Date();
    const sortedLogs = [...habitLogs].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Calculate date boundaries
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    // Get logs in each window
    const recentLogs = sortedLogs.filter(log => new Date(log.timestamp) >= fourteenDaysAgo);
    const baselineLogs = sortedLogs.filter(log => new Date(log.timestamp) >= ninetyDaysAgo);
    
    // === COMPONENT 1: Frequency Trend (30 pts) ===
    // Compare recent frequency to baseline frequency
    const recentFrequency = recentLogs.length / 14; // logs per day (last 14 days)
    const baselineDays = Math.min(90, Math.floor((now - new Date(sortedLogs[sortedLogs.length - 1].timestamp)) / (24 * 60 * 60 * 1000)));
    const baselineFrequency = baselineLogs.length / Math.max(baselineDays, 1);
    
    const frequencyRatio = baselineFrequency > 0 ? recentFrequency / baselineFrequency : 1;
    const frequencyScore = 30 * Math.min(1, frequencyRatio);
    
    // === COMPONENT 2: Consistency (25 pts) ===
    // Calculate gap variance - lower variance = more consistent
    const gaps = [];
    for (let i = 1; i < sortedLogs.length; i++) {
      const gap = (new Date(sortedLogs[i - 1].timestamp) - new Date(sortedLogs[i].timestamp)) / (24 * 60 * 60 * 1000);
      gaps.push(gap);
    }
    
    const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 1;
    const gapVariance = gaps.length > 0 
      ? Math.sqrt(gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length)
      : 0;
    
    const consistencyScore = 25 * Math.exp(-gapVariance / Math.max(avgGap, 0.5));
    
    // === COMPONENT 3: Recency (20 pts) ===
    // How recently logged relative to typical gap
    const daysSinceLog = sortedLogs.length > 0 
      ? (now - new Date(sortedLogs[0].timestamp)) / (24 * 60 * 60 * 1000)
      : 30;
    
    const recencyScore = 20 * Math.exp(-daysSinceLog / Math.max(avgGap, 1));
    
    // === COMPONENT 4: Volume/Intensity (15 pts) ===
    // Only for non-binary habits
    let volumeScore = 0;
    if (habit.rateType !== 'BINARY') {
      const recentUnits = recentLogs.reduce((sum, log) => sum + (log.units || 1), 0);
      const baselineUnits = baselineLogs.reduce((sum, log) => sum + (log.units || 1), 0);
      
      const recentAvgUnits = recentLogs.length > 0 ? recentUnits / recentLogs.length : 0;
      const baselineAvgUnits = baselineLogs.length > 0 ? baselineUnits / baselineLogs.length : 1;
      
      const volumeRatio = baselineAvgUnits > 0 ? recentAvgUnits / baselineAvgUnits : 1;
      volumeScore = 15 * Math.min(1, volumeRatio);
    }
    
    // === COMPONENT 5: Data Maturity (10 pts) ===
    // More logs = higher confidence
    const maturityScore = 10 * Math.min(1, totalLogs / 30);
    
    // === TOTAL SCORE ===
    let totalScore;
    if (habit.rateType === 'BINARY') {
      // For binary habits, scale to 100 (max possible is 85 without volume)
      const rawScore = frequencyScore + consistencyScore + recencyScore + maturityScore;
      totalScore = (rawScore / 85) * 100;
    } else {
      totalScore = frequencyScore + consistencyScore + recencyScore + volumeScore + maturityScore;
    }
    
    return {
      score: Math.round(totalScore),
      status: 'active',
      components: {
        frequency: Math.round(frequencyScore * 10) / 10,
        consistency: Math.round(consistencyScore * 10) / 10,
        recency: Math.round(recencyScore * 10) / 10,
        volume: Math.round(volumeScore * 10) / 10,
        maturity: Math.round(maturityScore * 10) / 10
      },
      meta: {
        totalLogs,
        avgGap: Math.round(avgGap * 10) / 10,
        daysSinceLog: Math.round(daysSinceLog * 10) / 10,
        recentLogs: recentLogs.length
      }
    };
  };

  /**
   * Calculate overall portfolio Flux Score
   * Weighted average of all habits with 10+ logs
   */
  const getPortfolioFluxScore = () => {
    const habitScores = habits
      .map(habit => ({
        habit,
        fluxScore: calculateFluxScore(habit.id)
      }))
      .filter(item => item.fluxScore?.status === 'active');
    
    if (habitScores.length === 0) {
      return {
        score: null,
        status: 'building',
        habitsWithScore: 0,
        totalHabits: habits.length
      };
    }
    
    // Simple average (could weight by earnings or logs later)
    const avgScore = habitScores.reduce((sum, item) => sum + item.fluxScore.score, 0) / habitScores.length;
    
    return {
      score: Math.round(avgScore),
      status: 'active',
      habitsWithScore: habitScores.length,
      totalHabits: habits.length
    };
  };

  // ========== HABIT STATS ==========
  
  /**
   * Get stats for a specific habit
   */
  const getHabitStats = (habitId) => {
    const habitLogs = getHabitLogs(habitId);
    const totalEarnings = habitLogs.reduce((sum, log) => sum + log.totalEarnings, 0);
    
    // Calculate current streak
    let streak = 0;
    const sortedLogs = [...habitLogs].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    if (sortedLogs.length > 0) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const lastLogDate = new Date(sortedLogs[0].timestamp).toDateString();

      // Only count streak if logged today or yesterday
      if (lastLogDate === today || lastLogDate === yesterday) {
        let currentDate = new Date(sortedLogs[0].timestamp);
        streak = 1;

        for (let i = 1; i < sortedLogs.length; i++) {
          const logDate = new Date(sortedLogs[i].timestamp);
          const dayDiff = Math.floor(
            (currentDate - logDate) / (1000 * 60 * 60 * 24)
          );

          if (dayDiff === 1) {
            streak++;
            currentDate = logDate;
          } else {
            break;
          }
        }
      }
    }

    return {
      totalLogs: habitLogs.length,
      totalEarnings,
      currentStreak: streak,
      lastLogDate: sortedLogs.length > 0 ? sortedLogs[0].timestamp : null,
    };
  };

  // ========== USER OPERATIONS ==========
  
  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  // ========== CONTEXT VALUE ==========
  
  const value = {
    // State
    habits,
    logs,
    user,
    transfers,
    lastTransferDate,
    
    // Habit operations
    addHabit,
    addHabits,
    updateHabit,
    deleteHabit,
    isHabitAdded,
    
    // Log operations
    addLog,
    updateLog,
    deleteLog,
    getHabitLogs,
    isHabitLoggedOnDate,
    getTodayLogs,
    
    // Balance calculations
    getTransferredBalance,
    getPendingBalance,
    getTotalEarnings,
    getTodayEarnings,
    getWeekEarnings,
    
    // Transfer operations
    processTransfer,
    getTransferBreakdown,
    addTransfer,
    
    // Stats
    getHabitStats,
    
    // Flux Score
    calculateFluxScore,
    getPortfolioFluxScore,
    
    // User operations
    updateUser,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}
