import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import { formatCurrency } from '../../utils/formatters';
import { generateHabitInsights } from '../../utils/habitInsights';
import BackButton from '../../components/BackButton';
import './HabitDetail.css';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, logs, deleteHabit, pauseHabit, resumeHabit } = useHabits();
  
  // Chart state
  const [chartType, setChartType] = useState('earnings');
  const [timeRange, setTimeRange] = useState('1M');
  
  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showCalibrationInfo, setShowCalibrationInfo] = useState(false);
  
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

  // Calendar heatmap data (current month with padding)
  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // First day of the month
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    // Last day of the month
    const lastOfMonth = new Date(currentYear, currentMonth + 1, 0);
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
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
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
  }, [habitLogs]);

  // Chart data generation
  const chartData = useMemo(() => {
    const ranges = {
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      'YTD': Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24)),
      'ALL': Math.floor((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) + 1
    };
    
    const days = Math.max(7, Math.min(ranges[timeRange], 365));
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayLogs = habitLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === date.getTime();
      });
      
      const dayEarnings = dayLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
      
      data.push({
        date: date.toISOString(),
        earnings: dayEarnings,
        logged: dayLogs.length > 0
      });
    }
    
    let cumulative = 0;
    data.forEach(d => {
      cumulative += d.earnings;
      d.cumulativeEarnings = cumulative;
    });
    
    // Calculate rolling HSS (7-day window)
    data.forEach((d, i) => {
      const start = Math.max(0, i - 6);
      const slice = data.slice(start, i + 1);
      const completedDays = slice.filter(s => s.logged).length;
      d.hss = Math.round((completedDays / slice.length) * 100);
    });
    
    return data;
  }, [habitLogs, timeRange, habit.createdAt]);

  // Generate SVG line chart path
  const generateChartPath = useMemo(() => {
    if (chartData.length < 2) return { linePath: '', areaPath: '', points: [] };
    
    const width = 100;
    const height = 100;
    const paddingX = 0;
    const paddingTop = 5;
    const paddingBottom = 5;
    
    const values = chartData.map(d => chartType === 'hss' ? d.hss : d.cumulativeEarnings);
    const maxValue = chartType === 'hss' ? 100 : Math.max(...values, 10);
    const minValue = 0;
    
    const points = chartData.map((d, i) => {
      const x = paddingX + (i / (chartData.length - 1)) * (width - paddingX * 2);
      const value = chartType === 'hss' ? d.hss : d.cumulativeEarnings;
      const y = paddingTop + ((maxValue - value) / (maxValue - minValue || 1)) * (height - paddingTop - paddingBottom);
      return { x, y };
    });
    
    const linePath = points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, '');
    
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    
    return { linePath, areaPath, points };
  }, [chartData, chartType]);

  // Handle actions
  const handleEdit = () => {
    navigate(`/add?edit=${habit.id}`);
  };

  const handlePause = () => {
    if (habit.isActive === false) {
      resumeHabit(habit.id);
    } else {
      setShowPauseConfirm(true);
    }
  };

  const confirmPause = () => {
    pauseHabit(habit.id);
    setShowPauseConfirm(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteHabit(habit.id);
    navigate('/portfolio', { state: { direction: 'back' } });
  };

  // Chart display value - show change over period
  const chartChangeValue = useMemo(() => {
    if (chartData.length < 2) return { value: '$0.00', isPositive: true };
    
    const firstPoint = chartData[0];
    const lastPoint = chartData[chartData.length - 1];
    
    if (chartType === 'earnings') {
      const change = lastPoint.cumulativeEarnings - firstPoint.cumulativeEarnings;
      return {
        value: `${change >= 0 ? '+' : ''}${formatCurrency(change)}`,
        isPositive: change >= 0
      };
    } else {
      // HSS change
      const change = lastPoint.hss - firstPoint.hss;
      return {
        value: `${change >= 0 ? '+' : ''}${change}%`,
        isPositive: change >= 0
      };
    }
  }, [chartData, chartType]);

  // HSS ring calculations
  const hssProgress = stats.hss / 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference * (1 - hssProgress);

  return (
    <div className="habit-detail-page">
      <div className="habit-detail-container">
        {/* Header with Habit Name */}
        <header className="detail-header">
          <BackButton to="/portfolio" />
          <h1 className="header-title">{habit.name}</h1>
          <div className="header-spacer"></div>
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
            <div className="chart-title">Growth</div>
            <div className="chart-toggle-group">
              <button 
                className={`chart-toggle-btn ${chartType === 'earnings' ? 'active' : ''}`}
                onClick={() => setChartType('earnings')}
              >
                Earnings
              </button>
              <button 
                className={`chart-toggle-btn ${chartType === 'hss' ? 'active' : ''}`}
                onClick={() => setChartType('hss')}
              >
                HSS
              </button>
            </div>
          </div>
          
          <div className={`chart-change-value ${chartChangeValue.isPositive ? 'positive' : 'negative'}`}>
            {chartChangeValue.value}
          </div>
          
          <div className="detail-chart-container">
            <div className="chart-grid">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>
            
            {chartData.length >= 2 ? (
              <svg className="line-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={generateChartPath.areaPath}
                  fill="url(#chartGradient)"
                />
                <path
                  d={generateChartPath.linePath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ) : (
              <div className="chart-empty">Log more activities to see trends</div>
            )}
          </div>
          
          <div className="time-filters">
            {['1W', '1M', '3M', '6M', 'YTD', 'ALL'].map(range => (
              <button
                key={range}
                className={`time-filter-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </section>

        {/* Calendar Heatmap - Month View */}
        <section className="calendar-section">
          <div className="calendar-header">
            <h3 className="detail-section-title">Activity</h3>
            <span className="calendar-month-label">{calendarData.monthName}</span>
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
            {habit.isActive === false ? 'Resume Habit' : 'Pause Habit'}
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
          <span>HSS Details Coming Soon</span>
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
