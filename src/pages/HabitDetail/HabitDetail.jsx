import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useHabits } from '../../context/HabitContext';
import { formatCurrency } from '../../utils/formatters';
import { generateHabitInsights } from '../../utils/habitInsights';
import { getCalibrationStatus } from '../../utils/calibrationStatus';
import { calculateFluxScore } from '../../utils/calculations';
import BackButton from '../../components/BackButton';
import GoalSection from '../../components/GoalSection/GoalSection';
import CalibratingFingerprint from '../../components/CalibratingFingerprint';
import './HabitDetail.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, logs, deleteHabit } = useHabits();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Chart state
  const [chartType, setChartType] = useState('fluxScore');
  const [chartPeriod, setChartPeriod] = useState('1M');
  
  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showCalibrationInfo, setShowCalibrationInfo] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Insights accordion state
  const [expandedInsight, setExpandedInsight] = useState(null);

  // Calendar day detail state
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Calendar month navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Calendar swipe navigation
  const calendarRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50;

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left = next month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      if (!(calendarMonth.year === currentYear && calendarMonth.month === currentMonth)) {
        setCalendarMonth(prev => {
          const newMonth = prev.month + 1;
          if (newMonth > 11) {
            return { year: prev.year + 1, month: 0 };
          }
          return { ...prev, month: newMonth };
        });
      }
    } else if (isRightSwipe) {
      // Swipe right = previous month
      setCalendarMonth(prev => {
        const newMonth = prev.month - 1;
        if (newMonth < 0) {
          return { year: prev.year - 1, month: 11 };
        }
        return { ...prev, month: newMonth };
      });
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [calendarMonth]);
  
  const habit = habits.find(h => h.id === id);
  
  if (!habit) {
    return (
      <div className="habit-detail-page">
        <div className="error-container">
          <p>Habit not found</p>
          <button onClick={() => navigate('/portfolio', { state: { direction: 'back' } })}>
            Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  // Get all logs for this habit
  const habitLogs = logs.filter(log => log.habitId === habit.id);
  
  // Generate insights using utility
  const insights = useMemo(() => {
    return generateHabitInsights(habit, logs);
  }, [habit, logs]);
  
  // Calculate basic statistics for header/hero
  const stats = useMemo(() => {
    const now = new Date();
    const habitCreated = new Date(habit.createdAt);
    const daysSinceCreation = Math.max(1, Math.floor((now - habitCreated) / (1000 * 60 * 60 * 24)));
    
    // Total earnings
    const totalEarnings = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
    
    // Get logs from last 30 days for completion rate
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentLogs = habitLogs.filter(log => new Date(log.timestamp) >= thirtyDaysAgo);
    
    // Calculate expected completions based on schedule
    const getExpectedCompletions = (days) => {
      if (!habit.schedule) return days;
      const { type, days: scheduleDays } = habit.schedule;
      switch (type) {
        case 'daily': return days;
        case 'weekdays': return Math.floor(days * 5 / 7);
        case 'weekends': return Math.floor(days * 2 / 7);
        case 'specific_days': return Math.floor(days * (scheduleDays?.length || 7) / 7);
        default: return days;
      }
    };
    
    const periodDays = Math.min(30, daysSinceCreation);
    const expected = getExpectedCompletions(periodDays);
    const completionRate = expected > 0 ? Math.min(100, Math.round((recentLogs.length / expected) * 100)) : 0;
    
    // Calculate current streak
    const calculateCurrentStreak = () => {
      if (habitLogs.length === 0) return 0;
      
      const sortedLogs = [...habitLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const uniqueDates = [...new Set(sortedLogs.map(log => {
        const d = new Date(log.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }))].sort((a, b) => b - a);
      
      if (uniqueDates.length === 0) return 0;
      
      const lastLogDate = new Date(uniqueDates[0]);
      
      let currentStreak = 0;
      if (lastLogDate.getTime() === today.getTime() || lastLogDate.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        let checkDate = new Date(lastLogDate);
        
        for (let i = 1; i < uniqueDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          if (uniqueDates[i] === checkDate.getTime()) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
      
      return currentStreak;
    };
    
    const currentStreak = calculateCurrentStreak();
    
    // Simple HSS calculation for header display
    const consistencyScore = Math.min(100, completionRate);
    const streakBonus = Math.min(20, currentStreak * 2);
    const hss = Math.round((consistencyScore * 0.8) + streakBonus);
    
    return {
      totalEarnings,
      completionRate,
      currentStreak,
      hss: Math.min(100, hss),
      daysSinceCreation
    };
  }, [habit, habitLogs]);

  // Check if logged today
  const isLoggedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return habitLogs.some(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  }, [habitLogs]);

  // Get calibration status from centralized utility (log-based per blueprint)
  const calibrationStatus = useMemo(() => {
    return getCalibrationStatus(habitLogs);
  }, [habitLogs]);

  // Calculate Flux Score using the blueprint 5-component formula
  const fluxScoreData = useMemo(() => {
    return calculateFluxScore(habitLogs);
  }, [habitLogs]);

  // Derive habitDataStatus from calibration for UI compatibility
  const habitDataStatus = useMemo(() => {
    const logCount = calibrationStatus.logCount;

    if (logCount === 0) {
      return {
        status: 'no_data',
        message: 'Complete this habit to start tracking your progress',
        logCount
      };
    } else if (calibrationStatus.isCalibrating) {
      return {
        status: 'building',
        message: calibrationStatus.message,
        logCount
      };
    } else if (calibrationStatus.isEmerging) {
      return {
        status: 'emerging',
        message: 'Baseline emerging',
        logCount
      };
    }
    return { status: 'sufficient', logCount };
  }, [calibrationStatus]);

  // Get recent activity (last 10 logs)
  const recentActivity = useMemo(() => {
    return [...habitLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, [habitLogs]);

  // Weekly summary data
  const weeklySummary = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Start of current week (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    // Start of last week
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // End of last week
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setMilliseconds(-1);

    // This week's logs
    const thisWeekLogs = habitLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= weekStart;
    });

    // Last week's logs
    const lastWeekLogs = habitLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= lastWeekStart && logDate < weekStart;
    });

    // Count unique days this week
    const thisWeekDays = new Set(thisWeekLogs.map(log => {
      const d = new Date(log.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })).size;

    // Count unique days last week
    const lastWeekDays = new Set(lastWeekLogs.map(log => {
      const d = new Date(log.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })).size;

    // Earnings
    const thisWeekEarnings = thisWeekLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
    const lastWeekEarnings = lastWeekLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);

    // Days elapsed this week (including today)
    const daysElapsed = dayOfWeek + 1;

    // Comparison
    const daysDiff = thisWeekDays - lastWeekDays;
    const earningsDiff = thisWeekEarnings - lastWeekEarnings;

    return {
      thisWeekDays,
      lastWeekDays,
      daysElapsed,
      thisWeekEarnings,
      lastWeekEarnings,
      daysDiff,
      earningsDiff,
      isAhead: thisWeekDays >= Math.floor((daysElapsed / 7) * lastWeekDays) || thisWeekDays > lastWeekDays
    };
  }, [habitLogs]);

  // Get logs for a specific calendar day
  const getLogsForDay = (date) => {
    if (!date) return [];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return habitLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= dayStart && logDate <= dayEnd;
    });
  };


  // Format time for activity
  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get unit label
  const getUnitLabel = () => {
    if (habit.unit) return habit.unit;
    if (habit.rateType === 'per_unit') return 'units';
    return 'sessions';
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCalendarMonth(prev => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: newMonth };
    });
  };

  const goToNextMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Don't go past current month
    if (calendarMonth.year === currentYear && calendarMonth.month === currentMonth) {
      return;
    }

    setCalendarMonth(prev => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: newMonth };
    });
  };

  // Check if we can go to next month
  const canGoNext = useMemo(() => {
    const now = new Date();
    return !(calendarMonth.year === now.getFullYear() && calendarMonth.month === now.getMonth());
  }, [calendarMonth]);

  // Calendar heatmap data (selected month with padding)
  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { year, month } = calendarMonth;

    // First day of the month
    const firstOfMonth = new Date(year, month, 1);
    // Last day of the month
    const lastOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();

    // What day of week does the month start on? (0 = Sunday)
    const startDayOfWeek = firstOfMonth.getDay();
    // What day of week does the month end on?
    const endDayOfWeek = lastOfMonth.getDay();

    // Build log map for quick lookup
    const logMap = new Map();
    habitLogs.forEach(log => {
      const d = new Date(log.timestamp);
      d.setHours(0, 0, 0, 0);
      const key = d.getTime();
      logMap.set(key, (logMap.get(key) || 0) + 1);
    });

    const days = [];

    // Add padding days before the 1st (from previous month)
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        date: null,
        count: 0,
        isPadding: true,
        isFuture: false,
        level: 0
      });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = date.getTime();
      const count = logMap.get(key) || 0;
      const isFuture = date > today;
      const isToday = date.getTime() === today.getTime();

      days.push({
        date,
        day,
        count,
        isPadding: false,
        isFuture,
        isToday,
        level: isFuture ? 0 : count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3
      });
    }

    // Add padding days after the last day (to complete the week)
    const remainingDays = 6 - endDayOfWeek;
    for (let i = 0; i < remainingDays; i++) {
      days.push({
        date: null,
        count: 0,
        isPadding: true,
        isFuture: false,
        level: 0
      });
    }

    // Convert to weeks (array of 7-day arrays)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return {
      weeks,
      monthName: firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [habitLogs, calendarMonth]);

  // Chart data generation
  const chartData = useMemo(() => {
    const now = new Date();
    const ranges = {
      '1W': 7,
      '1M': 30,
      '3M': 90,
      'YTD': Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24)),
      '1Y': 365,
      'ALL': Math.floor((now - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) + 1
    };

    const days = Math.max(7, Math.min(ranges[chartPeriod], 365));
    const data = [];

    // Determine number of data points based on range
    let dataPoints;
    switch(chartPeriod) {
      case '1W':
        dataPoints = 7;
        break;
      case '1M':
        dataPoints = 15;
        break;
      case '3M':
        dataPoints = 15;
        break;
      case '1Y':
        dataPoints = 16;
        break;
      case 'YTD':
        dataPoints = Math.min(15, days);
        break;
      case 'ALL':
      default:
        dataPoints = 15;
    }

    const interval = Math.max(1, Math.floor(days / dataPoints));

    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * interval));
      date.setHours(0, 0, 0, 0);

      // Get all logs up to this date for cumulative earnings
      const logsUpToDate = habitLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() <= date.getTime();
      });

      const cumulativeEarnings = logsUpToDate.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);

      // Calculate rolling Flux Score (7-day window ending on this date)
      const sevenDaysAgo = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
      const logsInWindow = habitLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() > sevenDaysAgo.getTime() && logDate.getTime() <= date.getTime();
      });

      // Count unique days logged in window
      const uniqueDaysLogged = new Set(logsInWindow.map(log => {
        const d = new Date(log.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })).size;

      const fluxScore = Math.round((uniqueDaysLogged / 7) * 100);

      data.push({
        date: date,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cumulativeEarnings,
        fluxScore
      });
    }

    return data;
  }, [habitLogs, chartPeriod, habit.createdAt]);

  // Calculate change over period
  const periodChange = useMemo(() => {
    if (chartData.length < 2) return { value: 0, formatted: '0' };

    const firstPoint = chartData[0];
    const lastPoint = chartData[chartData.length - 1];

    if (chartType === 'fluxScore') {
      const change = lastPoint.fluxScore - firstPoint.fluxScore;
      return { value: change, formatted: `${Math.abs(change)}` };
    } else {
      const change = lastPoint.cumulativeEarnings - firstPoint.cumulativeEarnings;
      return { value: change, formatted: formatCurrency(Math.abs(change)) };
    }
  }, [chartData, chartType]);

  // Chart.js configuration
  const getChartConfig = useMemo(() => {
    const labels = chartData.map(d => d.label);
    const values = chartData.map(d => chartType === 'fluxScore' ? d.fluxScore : d.cumulativeEarnings);

    // Blue for Flux Score, Green for Earnings
    const isFlux = chartType === 'fluxScore';
    const lineColor = isFlux ? '#3b82f6' : '#22c55e';
    const gradientColorStart = isFlux ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)';
    const gradientColorEnd = isFlux ? 'rgba(59, 130, 246, 0)' : 'rgba(34, 197, 94, 0)';

    return {
      labels,
      datasets: [{
        label: isFlux ? 'Flux Score' : 'Earnings',
        data: values,
        borderColor: lineColor,
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, gradientColorStart);
          gradient.addColorStop(1, gradientColorEnd);
          return gradient;
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }]
    };
  }, [chartData, chartType]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#6b7280',
        bodyColor: '#111827',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            if (chartType === 'fluxScore') {
              return `Score: ${Math.round(value)}`;
            }
            return `Earned: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#9ca3af',
          maxTicksLimit: 5
        }
      },
      y: {
        display: false,
        grace: '10%',
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  }), [chartType]);

  // Handle actions
  const handleEdit = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  const handlePause = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  const confirmPause = () => {
    // Pause functionality coming soon
    setShowPauseConfirm(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteHabit(habit.id);
    navigate('/portfolio', { state: { direction: 'back' } });
  };

  return (
    <div className="habit-detail-page">
      <div className="habit-detail-container">
        {/* Header with Habit Name */}
        <header className="detail-header">
          <BackButton to="/portfolio" />
          <span className="header-title">{habit.name}</span>
          <div className="header-actions">
            <button
              className="more-menu-btn"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              aria-label="More options"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
            {showMoreMenu && (
              <>
                <div className="menu-backdrop" onClick={() => setShowMoreMenu(false)} />
                <div className="more-menu-dropdown">
                  <button className="menu-item" onClick={() => { setShowMoreMenu(false); handleEdit(); }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit Habit
                  </button>
                  <button className="menu-item" onClick={() => { setShowMoreMenu(false); handlePause(); }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Pause Habit
                  </button>
                  <button className="menu-item delete" onClick={() => { setShowMoreMenu(false); handleDelete(); }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete Habit
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Hero Section - Stacked/Centered */}
        <section className={`hero-section ${habitDataStatus.status !== 'sufficient' ? 'calibrating' : ''}`}>
          {/* Calibrating: Side-by-side layout */}
          {habitDataStatus.status !== 'sufficient' ? (
            <div className="hero-calibrating-layout">
              <div className="hero-section-left">
                <div className="calibrating-earnings">{formatCurrency(stats.totalEarnings)}</div>
                <span className="calibrating-earnings-label">lifetime earnings</span>
                {/* Status badges under earnings during calibration */}
                {(isLoggedToday || habit.isActive === false) && (
                  <div className="hero-status-inline">
                    {isLoggedToday && (
                      <div className="today-status">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Completed today</span>
                      </div>
                    )}
                    {habit.isActive === false && (
                      <div className="paused-status">
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                        <span>Paused</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="hero-section-right">
                <CalibratingFingerprint
                  logsNeeded={calibrationStatus.logsNeeded}
                  size="hero"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="hero-flux-score">
                <div className="flux-ring-container">
                  <svg className="flux-ring" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="7"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="url(#fluxGradient)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 44}
                      strokeDashoffset={2 * Math.PI * 44 * (1 - (fluxScoreData.score || 0) / 100)}
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="fluxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flux-ring-value">
                    <span className="flux-number">{fluxScoreData.score || 0}</span>
                    <span className="flux-label">Flux</span>
                  </div>
                </div>
              </div>
              {/* Earnings */}
              <div className="hero-earnings">
                <div className="detail-earned-amount">{formatCurrency(stats.totalEarnings)}</div>
                <span className="earned-label">lifetime earnings</span>
              </div>
              {/* Status Badges - normal position when calibrated */}
              {(isLoggedToday || habit.isActive === false) && (
                <div className="hero-status">
                  {isLoggedToday && (
                    <div className="today-status">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Completed today</span>
                    </div>
                  )}
                  {habit.isActive === false && (
                    <div className="paused-status">
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                      <span>Paused</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {/* Tab Navigation */}
        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`detail-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button
            className={`detail-tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
        </div>

        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === 'overview' && (
          <>
            {/* Performance Chart */}
            <section className="detail-chart-section">
              <div className="detail-chart-header">
                <h3 className="detail-section-title">Performance</h3>
                <div className="chart-toggle-group">
                  <button
                    className={`chart-toggle-btn ${chartType === 'fluxScore' ? 'active' : ''}`}
                    onClick={() => setChartType('fluxScore')}
                  >
                    Score
                  </button>
                  <button
                    className={`chart-toggle-btn ${chartType === 'earnings' ? 'active' : ''}`}
                    onClick={() => setChartType('earnings')}
                  >
                    Earnings
                  </button>
                </div>
              </div>

              {habitDataStatus.status === 'no_data' ? (
                <div className="chart-empty-state">
                  <div className="chart-empty-icon">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <p className="chart-empty-message">{habitDataStatus.message}</p>
                </div>
              ) : chartType === 'fluxScore' && calibrationStatus.isCalibrating ? (
                <div className="chart-calibrating-state">
                  <div className="chart-calibrating-icon">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                      <path strokeLinecap="round" strokeWidth="1.5" d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <p className="chart-calibrating-message">Flux Score calibrating</p>
                  <p className="chart-calibrating-submessage">{calibrationStatus.message}</p>
                </div>
              ) : (
                <>
                  {habitDataStatus.status !== 'sufficient' && chartType === 'earnings' && (
                    <div className="chart-building-notice">
                      <span className="building-dot"></span>
                      {habitDataStatus.message}
                    </div>
                  )}
                  <div className="chart-container">
                    <Line data={getChartConfig} options={chartOptions} />
                  </div>
                </>
              )}

              <div className="time-toggles">
                {['1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map(period => (
                  <button
                    key={period}
                    className={`time-toggle ${chartPeriod === period ? 'active' : ''}`}
                    onClick={() => setChartPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </section>

            {/* Goal Progress Section */}
            {habit.goal && (
              <GoalSection habit={habit} logs={habitLogs} />
            )}

            {/* Weekly Summary Card */}
            <section className="weekly-summary-section">
              <div className="weekly-summary-card">
                <div className="weekly-summary-header">
                  <h3 className="weekly-summary-title">This Week</h3>
                  <span className={`weekly-trend ${weeklySummary.isAhead ? 'positive' : 'neutral'}`}>
                    {weeklySummary.daysDiff > 0 ? '+' : ''}{weeklySummary.daysDiff} vs last week
                  </span>
                </div>
                <div className="weekly-summary-stats">
                  <div className="weekly-stat">
                    <span className="weekly-stat-value">{weeklySummary.thisWeekDays}</span>
                    <span className="weekly-stat-label">days completed</span>
                  </div>
                  <div className="weekly-stat-divider" />
                  <div className="weekly-stat">
                    <span className="weekly-stat-value">{formatCurrency(weeklySummary.thisWeekEarnings)}</span>
                    <span className="weekly-stat-label">earned</span>
                  </div>
                </div>
                {weeklySummary.lastWeekDays > 0 && (
                  <div className="weekly-comparison">
                    <span className="comparison-label">Last week:</span>
                    <span className="comparison-value">{weeklySummary.lastWeekDays} days · {formatCurrency(weeklySummary.lastWeekEarnings)}</span>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ========== ACTIVITY TAB ========== */}
        {activeTab === 'activity' && (
          <>
            {/* Calendar Heatmap */}
            <section className="calendar-section">
              <div className="calendar-header">
                <h3 className="detail-section-title">Calendar</h3>
                <div className="calendar-nav">
                  <span className="calendar-month-label">{calendarData.monthName}</span>
                  <div className="calendar-arrows">
                    <button className="calendar-arrow" onClick={goToPreviousMonth} aria-label="Previous month">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className={`calendar-arrow ${!canGoNext ? 'disabled' : ''}`}
                      onClick={goToNextMonth}
                      disabled={!canGoNext}
                      aria-label="Next month"
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div
                className="calendar-heatmap"
                ref={calendarRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="calendar-weekday-labels">
                  <span>S</span>
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                </div>
                <div className="calendar-month-grid">
                  {calendarData.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="calendar-week-row">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`calendar-day ${
                            day.isPadding ? 'padding' :
                            day.isFuture ? 'future' :
                            `level-${day.level}`
                          } ${day.isToday ? 'today' : ''} ${!day.isPadding && !day.isFuture && day.count > 0 ? 'tappable' : ''}`}
                          onClick={() => {
                            if (!day.isPadding && !day.isFuture && day.count > 0) {
                              setSelectedCalendarDay(day);
                            }
                          }}
                        >
                          {!day.isPadding && <span className="day-number">{day.day}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="calendar-legend">
                  <span className="legend-label">Less</span>
                  <div className="legend-squares">
                    <div className="legend-square level-0"></div>
                    <div className="legend-square level-1"></div>
                    <div className="legend-square level-2"></div>
                    <div className="legend-square level-3"></div>
                  </div>
                  <span className="legend-label">More</span>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="detail-activity-section">
              <h3 className="detail-section-title">Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <div className="detail-activity-list">
                  {recentActivity.slice(0, 5).map((log) => (
                    <div key={log.id} className="detail-activity-item">
                      <div className="activity-date">
                        <span className="date-day">{new Date(log.timestamp).getDate()}</span>
                        <span className="date-month">{new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short' })}</span>
                      </div>
                      <div className="activity-info">
                        <div className="activity-title">
                          {log.amount ? `${log.amount} ${log.unit || getUnitLabel()}` : 'Completed'}
                        </div>
                        <div className="activity-time">{formatActivityTime(log.timestamp)}</div>
                      </div>
                      <div className="activity-amount">+{formatCurrency(log.totalEarnings || 0)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="activity-empty">
                  <div className="empty-icon">
                    <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                  </div>
                  <p className="empty-title">No activity yet</p>
                  <p className="empty-subtitle">Complete this habit to start tracking</p>
                </div>
              )}
              {habitLogs.length > 5 && (
                <button className="view-history-btn" onClick={() => navigate('/activity', { state: { habitId: habit.id } })}>
                  View Full History
                </button>
              )}
            </section>
          </>
        )}

        {/* ========== INSIGHTS TAB ========== */}
        {activeTab === 'insights' && (
          <>
            {/* Insights Accordion */}
            <section className="insights-accordion-section">
              <h3 className="detail-section-title">Insights</h3>

              {/* Milestone Accordion */}
              <div className={`accordion-item ${expandedInsight === 'milestone' ? 'expanded' : ''}`}>
                <button
                  className="accordion-header"
                  onClick={() => setExpandedInsight(expandedInsight === 'milestone' ? null : 'milestone')}
                >
                  <div className="accordion-header-left">
                    <span className="accordion-icon milestone">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="4" fill="currentColor"/>
                      </svg>
                    </span>
                    <span className="accordion-title">Next Milestone</span>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-preview">{formatCurrency(insights.milestone.target)}</span>
                    <svg className="accordion-chevron" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </button>
                <div className="accordion-content">
                  {insights.milestone.reached ? (
                    <p className="insight-message">{insights.milestone.message}</p>
                  ) : (
                    <>
                      <div className="milestone-progress-container">
                        <div className="milestone-progress-bar">
                          <div className="milestone-progress-fill" style={{ width: `${insights.milestone.progress}%` }} />
                        </div>
                        <div className="milestone-progress-text">
                          <span>{formatCurrency(insights.milestone.current)}</span>
                          <span>{formatCurrency(insights.milestone.target)}</span>
                        </div>
                      </div>
                      <p className="insight-message">{insights.milestone.message}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Maturity Accordion */}
              <div className={`accordion-item ${expandedInsight === 'maturity' ? 'expanded' : ''}`}>
                <button
                  className="accordion-header"
                  onClick={() => setExpandedInsight(expandedInsight === 'maturity' ? null : 'maturity')}
                >
                  <div className="accordion-header-left">
                    <span className={`accordion-icon maturity ${insights.maturity.stage}`}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                    </span>
                    <span className="accordion-title">Habit Stage</span>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-preview">{insights.maturity.title}</span>
                    <svg className="accordion-chevron" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </button>
                <div className="accordion-content">
                  <p className="maturity-description">{insights.maturity.description}</p>
                  {insights.maturity.nextStage && (
                    <div className="maturity-progress-container">
                      <div className="maturity-progress-bar">
                        <div className="maturity-progress-fill" style={{ width: `${insights.maturity.progress}%` }} />
                      </div>
                      <p className="maturity-next">{insights.maturity.daysUntilNext} days until {insights.maturity.nextStage}</p>
                    </div>
                  )}
                  <p className="insight-advice">{insights.maturity.insight}</p>
                </div>
              </div>

              {/* Calibration Accordion */}
              <div className={`accordion-item ${expandedInsight === 'calibration' ? 'expanded' : ''}`}>
                <button
                  className="accordion-header"
                  onClick={() => setExpandedInsight(expandedInsight === 'calibration' ? null : 'calibration')}
                >
                  <div className="accordion-header-left">
                    <span className={`accordion-icon calibration ${insights.calibration.status}`}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </span>
                    <span className="accordion-title">Difficulty</span>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-preview">{insights.calibration.title}</span>
                    <svg className="accordion-chevron" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </button>
                <div className="accordion-content">
                  <p className="insight-message">{insights.calibration.message}</p>
                  {insights.calibration.suggestion && (
                    <p className="insight-suggestion">{insights.calibration.suggestion}</p>
                  )}
                  <button className="calibration-info-link" onClick={() => setShowCalibrationInfo(true)}>
                    Learn more about calibration
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

      </div>

      {/* Calendar Day Detail Modal */}
      {selectedCalendarDay && (
        <div className="modal-overlay" onClick={() => setSelectedCalendarDay(null)}>
          <div className="calendar-day-modal" onClick={e => e.stopPropagation()}>
            <div className="calendar-day-modal-header">
              <h3>{selectedCalendarDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedCalendarDay(null)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="calendar-day-modal-content">
              {getLogsForDay(selectedCalendarDay.date).map((log, idx) => (
                <div key={idx} className="calendar-day-log">
                  <div className="calendar-log-time">
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div className="calendar-log-details">
                    <span className="calendar-log-amount">
                      {log.amount ? `${log.amount} ${log.unit || getUnitLabel()}` : 'Completed'}
                    </span>
                    <span className="calendar-log-earnings">+{formatCurrency(log.totalEarnings || 0)}</span>
                  </div>
                </div>
              ))}
              <div className="calendar-day-summary">
                <span>Total:</span>
                <span className="calendar-day-total">
                  +{formatCurrency(getLogsForDay(selectedCalendarDay.date).reduce((sum, log) => sum + (log.totalEarnings || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Confirmation Modal */}
      {showPauseConfirm && (
        <div className="modal-overlay" onClick={() => setShowPauseConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Pause Habit?</h3>
            <p className="modal-text">
              Pausing will stop this habit from appearing in your daily schedule. 
              Your progress and earnings history will be preserved.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowPauseConfirm(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={confirmPause}>
                Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete Habit?</h3>
            <p className="modal-text">
              This will permanently delete this habit and all its activity history. 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="modal-btn delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Toast */}
      {showComingSoon && (
        <div className="coming-soon-toast">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Coming Soon</span>
        </div>
      )}

      {/* Calibration Info Modal */}
      {showCalibrationInfo && (
        <div className="modal-overlay" onClick={() => setShowCalibrationInfo(false)}>
          <div className="info-modal-content" onClick={e => e.stopPropagation()}>
            <div className="info-modal-header">
              <h3 className="info-modal-title">Difficulty Calibration</h3>
              <button 
                className="info-modal-close"
                onClick={() => setShowCalibrationInfo(false)}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <p className="info-modal-text">
              Difficulty calibration analyzes your completion rate to determine if this habit is set at the right level for you.
            </p>
            <ul className="info-modal-list">
              <li><strong>Building:</strong> Still gathering data (first 10 logs)</li>
              <li><strong>Struggling:</strong> Below 70% - consider making it easier</li>
              <li><strong>Challenging:</strong> 70-80% - a healthy growth zone</li>
              <li><strong>Well Calibrated:</strong> 80-95% - sustainable and challenging</li>
              <li><strong>Ready for More:</strong> Above 95% - consider increasing difficulty</li>
            </ul>
            <button 
              className="info-modal-button"
              onClick={() => setShowCalibrationInfo(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
