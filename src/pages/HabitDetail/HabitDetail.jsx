import { useState, useMemo } from 'react';
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
import BackButton from '../../components/BackButton';
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
  
  // Chart state
  const [chartType, setChartType] = useState('fluxScore');
  const [chartPeriod, setChartPeriod] = useState('1M');
  
  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showCalibrationInfo, setShowCalibrationInfo] = useState(false);

  // Calendar month navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  
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

  // Get recent activity (last 10 logs)
  const recentActivity = useMemo(() => {
    return [...habitLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, [habitLogs]);

  // Star rating based on HSS
  const getStarRating = (hss) => {
    if (hss >= 90) return { stars: 5, label: 'Exceptional' };
    if (hss >= 80) return { stars: 4, label: 'Strong' };
    if (hss >= 70) return { stars: 3, label: 'Solid' };
    if (hss >= 60) return { stars: 2, label: 'Developing' };
    return { stars: 1, label: 'Building' };
  };
  
  const rating = getStarRating(stats.hss);

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

      days.push({
        date,
        day,
        count,
        isPadding: false,
        isFuture,
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

    return {
      labels,
      datasets: [{
        label: chartType === 'fluxScore' ? 'Flux Score' : 'Earnings',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#3b82f6',
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

  // HSS ring calculations
  const hssProgress = stats.hss / 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference * (1 - hssProgress);

  return (
    <div className="habit-detail-page">
      <div className="habit-detail-container">
        {/* Header with Habit Name */}
        <header className="detail-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <BackButton to="/portfolio" />
          <span className="header-title" style={{ display: 'inline' }}>{habit.name}</span>
        </header>

        {/* Hero Section - Two Column Layout */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-left">
              <div className="hero-ticker">${habit.ticker || 'HABIT'}</div>
              <div className="habit-meta-line">
                <span className="meta-rate">{formatCurrency(habit.rate ?? 0)}/{habit.rateType === 'per_unit' ? habit.unit || 'unit' : 'day'}</span>
                <span className="meta-dot">·</span>
                <span className="meta-schedule">{habit.schedule?.type === 'specific_days' ? 'Custom' : habit.schedule?.type || 'Daily'}</span>
              </div>
              <div className="total-earned">
                <div className="detail-earned-amount">{formatCurrency(stats.totalEarnings)}</div>
                <span className="earned-label">lifetime earnings</span>
              </div>
              <div className="status-badges">
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
            </div>
            <div className="hero-right">
              <div className="hss-tappable" onClick={() => {
                setShowComingSoon(true);
                setTimeout(() => setShowComingSoon(false), 2000);
              }}>
                <div className="hss-main">
                  <div className="hss-ring-container">
                    <svg className="hss-ring" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="url(#hssGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 40 40)"
                      />
                      <defs>
                        <linearGradient id="hssGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="hss-ring-value">
                      <span className="hss-number">{stats.hss}</span>
                      <span className="hss-label">HSS</span>
                    </div>
                  </div>
                  <div className="hero-star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`hero-star ${star <= rating.stars ? 'filled' : 'empty'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hss-chevron">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Chart */}
        <section className="detail-chart-section">
          <div className="detail-chart-header">
            <div className={`chart-change ${periodChange.value >= 0 ? 'positive' : 'negative'}`}>
              {periodChange.value >= 0 ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {periodChange.formatted}
            </div>
            <div className="chart-toggle-group">
              <button
                className={`chart-toggle-btn ${chartType === 'fluxScore' ? 'active' : ''}`}
                onClick={() => setChartType('fluxScore')}
              >
                Flux Score
              </button>
              <button
                className={`chart-toggle-btn ${chartType === 'earnings' ? 'active' : ''}`}
                onClick={() => setChartType('earnings')}
              >
                Earnings
              </button>
            </div>
          </div>

          {/* View Index Link */}
          {chartType === 'fluxScore' && (
            <div className="view-index-row">
              <button
                className="view-index-link"
                onClick={() => {
                  setShowComingSoon(true);
                  setTimeout(() => setShowComingSoon(false), 2000);
                }}
              >
                View Index
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Chart */}
          <div className="chart-container">
            <Line data={getChartConfig} options={chartOptions} />
          </div>

          {/* Time Period Toggles */}
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

        {/* Calendar Heatmap - Month View */}
        <section className="calendar-section">
          <div className="calendar-header">
            <h3 className="detail-section-title">Activity</h3>
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
          <div className="calendar-heatmap">
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
                      }`}
                      title={day.isPadding || day.isFuture ? '' : `${day.date.toLocaleDateString()}: ${day.count} ${day.count === 1 ? 'log' : 'logs'}`}
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

        {/* === NEW INSIGHTS SECTION === */}
        
        {/* Progress Milestone */}
        <section className="insight-section">
          <div className="insight-card milestone">
            <div className="insight-header">
              <span className="insight-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="6" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </span>
              <h3 className="insight-title">Next Milestone</h3>
            </div>
            {insights.milestone.reached ? (
              <p className="insight-message">{insights.milestone.message}</p>
            ) : (
              <>
                <div className="milestone-target">
                  <span className="milestone-amount">${insights.milestone.target}</span>
                  <span className="milestone-label">lifetime earnings</span>
                </div>
                <div className="milestone-progress-container">
                  <div className="milestone-progress-bar">
                    <div 
                      className="milestone-progress-fill"
                      style={{ width: `${insights.milestone.progress}%` }}
                    />
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
        </section>

        {/* Habit Maturity Stage */}
        <section className="insight-section">
          <div className={`insight-card maturity ${insights.maturity.stage}`}>
            <div className="insight-header">
              <span className="insight-icon">
                {insights.maturity.stage === 'forming' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 14l-3-3m3 3l3-3M5 12a7 7 0 1114 0"/>
                  </svg>
                )}
                {insights.maturity.stage === 'establishing' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                )}
                {insights.maturity.stage === 'strengthening' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                )}
                {insights.maturity.stage === 'stable' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                )}
                {insights.maturity.stage === 'mastered' && (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                )}
              </span>
              <h3 className="insight-title">{insights.maturity.title}</h3>
              <span className="maturity-badge">{insights.maturity.dayRange}</span>
            </div>
            <p className="maturity-description">{insights.maturity.description}</p>
            {insights.maturity.nextStage && (
              <div className="maturity-progress-container">
                <div className="maturity-progress-bar">
                  <div 
                    className="maturity-progress-fill"
                    style={{ width: `${insights.maturity.progress}%` }}
                  />
                </div>
                <p className="maturity-next">
                  {insights.maturity.daysUntilNext} days until {insights.maturity.nextStage}
                </p>
              </div>
            )}
            <p className="insight-advice">{insights.maturity.insight}</p>
          </div>
        </section>

        {/* Difficulty Calibration */}
        <section className="insight-section">
          <div className={`insight-card calibration ${insights.calibration.status}`}>
            <div className="insight-header">
              <span className="insight-icon">
                {insights.calibration.status === 'evaluating' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                )}
                {insights.calibration.status === 'struggling' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                )}
                {insights.calibration.status === 'challenging' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                )}
                {insights.calibration.status === 'calibrated' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
                {insights.calibration.status === 'mastered' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                )}
              </span>
              <h3 className="insight-title">{insights.calibration.title}</h3>
              <button 
                className="info-button"
                onClick={() => setShowCalibrationInfo(true)}
                aria-label="What is difficulty calibration?"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
            </div>
            <p className="insight-message">{insights.calibration.message}</p>
            {insights.calibration.suggestion && (
              <p className="insight-suggestion">{insights.calibration.suggestion}</p>
            )}
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
              <p>No activity logged yet</p>
            </div>
          )}
          {habitLogs.length > 5 && (
            <button className="view-history-btn" onClick={() => navigate('/activity', { state: { habitId: habit.id } })}>
              View Full History
            </button>
          )}
        </section>

        {/* Action Buttons */}
        <section className="actions-section">
          <button className="action-btn edit" onClick={handleEdit}>
            Edit Habit
          </button>
          <button className="action-btn pause" onClick={handlePause}>
            Pause Habit
          </button>
          <button className="action-btn delete" onClick={handleDelete}>
            Delete Habit
          </button>
        </section>
      </div>

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
              <li><strong>Evaluating:</strong> Still gathering data (first 14 days)</li>
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
