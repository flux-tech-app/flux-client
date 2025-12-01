import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import { formatCurrency } from '../../utils/formatters';
import BackButton from '../../components/BackButton';
import './HabitDetail.css';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, logs, deleteHabit, pauseHabit, resumeHabit } = useHabits();
  
  // Chart state
  const [chartType, setChartType] = useState('hhs'); // 'hhs' or 'earnings'
  const [timeRange, setTimeRange] = useState('1M');
  
  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  
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
  
  // Calculate statistics including Resilience
  const stats = useMemo(() => {
    const now = new Date();
    const habitCreated = new Date(habit.createdAt);
    const daysSinceCreation = Math.max(1, Math.floor((now - habitCreated) / (1000 * 60 * 60 * 24)));
    
    // Total earnings
    const totalEarnings = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
    
    // Total logged (units/minutes/etc)
    const totalLogged = habitLogs.reduce((sum, log) => sum + (log.amount || 1), 0);
    
    // Get logs from last 30 days
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
    
    // Completion rate (last 30 days or since creation)
    const periodDays = Math.min(30, daysSinceCreation);
    const expected = getExpectedCompletions(periodDays);
    const completionRate = expected > 0 ? Math.min(100, Math.round((recentLogs.length / expected) * 100)) : 0;
    
    // Calculate streaks and gaps for resilience
    const calculateStreaksAndResilience = () => {
      if (habitLogs.length === 0) return { current: 0, best: 0, resilience: 50 };
      
      const sortedLogs = [...habitLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Get unique dates sorted descending
      const uniqueDates = [...new Set(sortedLogs.map(log => {
        const d = new Date(log.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }))].sort((a, b) => b - a);
      
      if (uniqueDates.length === 0) return { current: 0, best: 0, resilience: 50 };
      
      const lastLogDate = new Date(uniqueDates[0]);
      
      // Calculate current streak
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
      
      // Calculate best streak and track gaps for resilience
      let bestStreak = currentStreak;
      let tempStreak = 1;
      const gaps = [];
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const diff = (uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          if (diff > 1 && diff <= 14) {
            gaps.push(diff - 1);
          }
          tempStreak = 1;
        }
      }
      
      // Calculate Resilience Score (0-100)
      let resilienceScore = 50;
      
      if (gaps.length > 0) {
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        
        if (avgGap <= 1) resilienceScore = 95;
        else if (avgGap <= 2) resilienceScore = 85;
        else if (avgGap <= 3) resilienceScore = 70;
        else if (avgGap <= 5) resilienceScore = 55;
        else if (avgGap <= 7) resilienceScore = 40;
        else resilienceScore = 25;
        
        if (gaps.length >= 3) resilienceScore = Math.min(100, resilienceScore + 10);
        if (gaps.length >= 5) resilienceScore = Math.min(100, resilienceScore + 5);
      } else if (currentStreak > 0) {
        resilienceScore = 70 + Math.min(20, currentStreak * 2);
      }
      
      return { 
        current: currentStreak, 
        best: Math.max(bestStreak, habit.bestStreak || 0),
        resilience: resilienceScore
      };
    };
    
    const streakData = calculateStreaksAndResilience();
    
    // Average per session
    const avgPerSession = habitLogs.length > 0 
      ? (totalLogged / habitLogs.length).toFixed(1) 
      : 0;
    
    // Consistency score
    const consistencyScore = Math.min(100, Math.round(
      completionRate * 0.7 + 
      (streakData.current > 7 ? 20 : streakData.current * 2.5) +
      (streakData.best > 14 ? 10 : streakData.best * 0.7)
    ));
    
    // Trend calculation
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    const recentTwoWeeks = habitLogs.filter(log => new Date(log.timestamp) >= twoWeeksAgo).length;
    const previousTwoWeeks = habitLogs.filter(log => {
      const date = new Date(log.timestamp);
      return date >= fourWeeksAgo && date < twoWeeksAgo;
    }).length;
    
    let trendDirection = 'stable';
    let trendChange = 0;
    if (previousTwoWeeks > 0) {
      trendChange = Math.round(((recentTwoWeeks - previousTwoWeeks) / previousTwoWeeks) * 100);
      trendDirection = trendChange > 5 ? 'up' : trendChange < -5 ? 'down' : 'stable';
    } else if (recentTwoWeeks > 0) {
      trendDirection = 'up';
      trendChange = 100;
    }
    
    // Calculate HHS with proper weighting (MVT version)
    const calculateHHS = () => {
      const consistencyComponent = (consistencyScore / 100) * 40;
      const resilienceComponent = (streakData.resilience / 100) * 30;
      const completionComponent = (completionRate / 100) * 30;
      
      return Math.round(consistencyComponent + resilienceComponent + completionComponent);
    };
    
    const hhs = calculateHHS();
    
    const previousHHS = Math.max(0, hhs - (trendChange > 0 ? Math.min(trendChange / 5, 10) : Math.max(trendChange / 5, -10)));
    const hhsChange = hhs - previousHHS;
    
    return {
      totalEarnings,
      totalLogged,
      completionRate,
      currentStreak: streakData.current,
      bestStreak: streakData.best,
      resilienceScore: streakData.resilience,
      avgPerSession,
      consistencyScore,
      trendDirection,
      trendChange,
      hhs,
      hhsChange,
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

  // Star rating based on HHS
  const getStarRating = (hhs) => {
    if (hhs >= 90) return { stars: 5, label: 'Exceptional' };
    if (hhs >= 80) return { stars: 4, label: 'Strong' };
    if (hhs >= 70) return { stars: 3, label: 'Solid' };
    if (hhs >= 60) return { stars: 2, label: 'Developing' };
    return { stars: 1, label: 'Building' };
  };
  
  const rating = getStarRating(stats.hhs);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format time for activity
  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(timestamp);
  };

  // Get unit label
  const getUnitLabel = () => {
    if (habit.unit) return habit.unit;
    if (habit.rateType === 'per_unit') return 'units';
    return 'sessions';
  };

  // Calendar heatmap data (last 12 weeks)
  const calendarData = useMemo(() => {
    const weeks = 12;
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startDate = new Date(startOfWeek);
    startDate.setDate(startDate.getDate() - (weeks - 1) * 7);
    
    const logMap = new Map();
    habitLogs.forEach(log => {
      const d = new Date(log.timestamp);
      d.setHours(0, 0, 0, 0);
      const key = d.getTime();
      logMap.set(key, (logMap.get(key) || 0) + 1);
    });
    
    for (let week = 0; week < weeks; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        const key = date.getTime();
        const count = logMap.get(key) || 0;
        const isFuture = date > today;
        
        weekData.push({
          date,
          count,
          isFuture,
          level: isFuture ? 0 : count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3
        });
      }
      data.push(weekData);
    }
    
    return data;
  }, [habitLogs]);

  // Chart data generation for line chart
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
    
    // Calculate rolling HHS (7-day window)
    data.forEach((d, i) => {
      const start = Math.max(0, i - 6);
      const slice = data.slice(start, i + 1);
      const completedDays = slice.filter(s => s.logged).length;
      d.hhs = Math.round((completedDays / slice.length) * 100);
    });
    
    return data;
  }, [habitLogs, timeRange, habit.createdAt]);

  // Generate SVG line chart path (Portfolio style)
  const generateChartPath = useMemo(() => {
    if (chartData.length < 2) return { linePath: '', areaPath: '', points: [] };
    
    const width = 100;
    const height = 100;
    const paddingX = 0;
    const paddingTop = 5;
    const paddingBottom = 5;
    
    const values = chartData.map(d => chartType === 'hhs' ? d.hhs : d.cumulativeEarnings);
    const maxValue = chartType === 'hhs' ? 100 : Math.max(...values, 10);
    const minValue = 0;
    
    const points = chartData.map((d, i) => {
      const x = paddingX + (i / (chartData.length - 1)) * (width - paddingX * 2);
      const value = chartType === 'hhs' ? d.hhs : d.cumulativeEarnings;
      const y = paddingTop + ((maxValue - value) / (maxValue - minValue || 1)) * (height - paddingTop - paddingBottom);
      return { x, y };
    });
    
    // Create smooth line path using basic line segments
    const linePath = points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, '');
    
    // Area path (for gradient fill)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    
    return { linePath, areaPath, points };
  }, [chartData, chartType]);

  // Calculate achievements
  const achievements = useMemo(() => {
    const earned = [];
    const { currentStreak, bestStreak, resilienceScore, hhs } = stats;
    
    if (bestStreak >= 28) earned.push({ type: 'streak', label: '4 Week Streak', icon: 'flame' });
    if (bestStreak >= 56) earned.push({ type: 'streak', label: '8 Week Streak', icon: 'flame' });
    if (bestStreak >= 84) earned.push({ type: 'streak', label: '12 Week Streak', icon: 'flame' });
    
    if (currentStreak >= 7) earned.push({ type: 'perfection', label: 'Perfect Week', icon: 'star' });
    
    if (resilienceScore >= 80) earned.push({ type: 'resilience', label: 'Quick Recovery', icon: 'refresh' });
    
    if (hhs >= 70) earned.push({ type: 'strength', label: 'HHS 70+', icon: 'chart' });
    if (hhs >= 80) earned.push({ type: 'strength', label: 'HHS 80+', icon: 'chart' });
    
    const total = stats.totalLogged;
    const milestones = habit.category === 'fitness' 
      ? [50, 100, 250, 500, 1000]
      : [25, 50, 100, 200, 500];
    
    const earnedMilestone = [...milestones].reverse().find(m => total >= m);
    if (earnedMilestone) {
      earned.push({ 
        type: 'milestone', 
        label: `${earnedMilestone} ${getUnitLabel()}`, 
        icon: 'trophy' 
      });
    }
    
    const nextMilestone = milestones.find(m => total < m);
    const remaining = nextMilestone ? nextMilestone - total : null;
    
    return { earned, nextMilestone, remaining };
  }, [stats, habit]);

  // HHS component scores for breakdown
  const hhsComponents = useMemo(() => ({
    consistency: stats.consistencyScore,
    resilience: stats.resilienceScore,
    completion: stats.completionRate
  }), [stats]);

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

  // Get current chart value for display
  // For HHS: show actual HHS score; for Earnings: show cumulative
  const currentChartValue = chartType === 'hhs' 
    ? stats.hhs.toString()
    : (chartData.length > 0 ? formatCurrency(chartData[chartData.length - 1].cumulativeEarnings) : '$0.00');

  // Calculate HHS ring progress
  const hhsProgress = stats.hhs / 100;
  const circumference = 2 * Math.PI * 36; // radius = 36
  const strokeDashoffset = circumference * (1 - hhsProgress);

  return (
    <div className="habit-detail-page">
      <div className="habit-detail-container">
        {/* Header with Ticker + HHS Ring */}
        <header className="detail-header">
          <BackButton to="/portfolio" />
          <div className="header-ticker">${habit.ticker || 'HABIT'}</div>
          <div className="header-hhs">
            <div className="hhs-ring-container">
              <svg className="hhs-ring" viewBox="0 0 80 80">
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                {/* Progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="url(#hhsGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 40 40)"
                />
                <defs>
                  <linearGradient id="hhsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="hhs-ring-value">
                <span className="hhs-number">{stats.hhs}</span>
                <span className="hhs-label">HHS</span>
              </div>
            </div>
            <div className="header-star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`header-star ${star <= rating.stars ? 'filled' : 'empty'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <h2 className="habit-name-large">{habit.name}</h2>
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
            <div className={`rating-badge ${rating.label.toLowerCase()}`}>
              {rating.label}
            </div>
          </div>
        </section>

        {/* Performance Chart - Portfolio Style */}
        <section className="detail-chart-section">
          <div className="detail-chart-header">
            <div className="chart-title">Growth</div>
            <div className="chart-toggle-group">
              <button 
                className={`chart-toggle-btn ${chartType === 'hhs' ? 'active' : ''}`}
                onClick={() => setChartType('hhs')}
              >
                HHS
              </button>
              <button 
                className={`chart-toggle-btn ${chartType === 'earnings' ? 'active' : ''}`}
                onClick={() => setChartType('earnings')}
              >
                Earnings
              </button>
            </div>
          </div>
          
          <div className="chart-current-value">{currentChartValue}</div>
          
          <div className="detail-chart-container">
            {/* Grid lines */}
            <div className="chart-grid">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>
            
            {chartData.length > 1 ? (
              <svg 
                className="line-chart-svg" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path 
                  d={generateChartPath.areaPath} 
                  fill="url(#chartAreaGradient)"
                />
                {/* Line */}
                <path 
                  d={generateChartPath.linePath} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* End dot */}
                {generateChartPath.points && generateChartPath.points.length > 0 && (
                  <circle 
                    cx={generateChartPath.points[generateChartPath.points.length - 1].x}
                    cy={generateChartPath.points[generateChartPath.points.length - 1].y}
                    r="3"
                    fill="#3b82f6"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>
            ) : (
              <div className="chart-empty">Not enough data yet</div>
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

        {/* Calendar Heatmap - GitHub Style */}
        <section className="calendar-section">
          <h3 className="detail-section-title">Activity</h3>
          <div className="calendar-heatmap">
            <div className="calendar-container">
              <div className="calendar-day-labels">
                <span></span>
                <span>M</span>
                <span></span>
                <span>W</span>
                <span></span>
                <span>F</span>
                <span></span>
              </div>
              <div className="calendar-grid">
                {calendarData.map((week, weekIndex) => (
                  <div key={weekIndex} className="calendar-week">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`calendar-day ${day.isFuture ? 'future' : `level-${day.level}`}`}
                        title={`${day.date.toLocaleDateString()}: ${day.count} ${day.count === 1 ? 'entry' : 'entries'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="calendar-legend">
              <span className="legend-label">Less</span>
              <div className="legend-squares">
                <div className="calendar-day level-0"></div>
                <div className="calendar-day level-1"></div>
                <div className="calendar-day level-2"></div>
                <div className="calendar-day level-3"></div>
              </div>
              <span className="legend-label">More</span>
            </div>
          </div>
        </section>

        {/* Key Statistics */}
        <section className="stats-section">
          <h3 className="detail-section-title">Key Statistics</h3>
          <div className="detail-stats-grid">
            <div className="stat-row">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">{stats.completionRate}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Resilience Score</span>
              <span className="stat-value">{stats.resilienceScore}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{stats.currentStreak} days</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Best Streak</span>
              <span className="stat-value">{stats.bestStreak} days</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total Sessions</span>
              <span className="stat-value">{habitLogs.length}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total {getUnitLabel()}</span>
              <span className="stat-value">{stats.totalLogged}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Avg per Session</span>
              <span className="stat-value">{stats.avgPerSession} {getUnitLabel()}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Days Active</span>
              <span className="stat-value">{stats.daysSinceCreation}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Lifetime Earnings</span>
              <span className="stat-value earned">{formatCurrency(stats.totalEarnings)}</span>
            </div>
          </div>
        </section>

        {/* HHS Breakdown */}
        <section className="breakdown-section">
          <h3 className="detail-section-title">HHS Breakdown</h3>
          <div className="breakdown-grid">
            <div className="breakdown-row">
              <span className="breakdown-label">Consistency</span>
              <div className="breakdown-bar-container">
                <div className="breakdown-bar consistency" style={{ width: `${hhsComponents.consistency}%` }} />
              </div>
              <span className="breakdown-value">{Math.round(hhsComponents.consistency)}</span>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label">Resilience</span>
              <div className="breakdown-bar-container">
                <div className="breakdown-bar resilience" style={{ width: `${hhsComponents.resilience}%` }} />
              </div>
              <span className="breakdown-value">{Math.round(hhsComponents.resilience)}</span>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label">Completion</span>
              <div className="breakdown-bar-container">
                <div className="breakdown-bar completion" style={{ width: `${hhsComponents.completion}%` }} />
              </div>
              <span className="breakdown-value">{Math.round(hhsComponents.completion)}</span>
            </div>
          </div>
          <p className="breakdown-note">
            Resilience measures how quickly you return after missing days
          </p>
        </section>

        {/* Achievements */}
        <section className="achievements-section">
          <h3 className="detail-section-title">Achievements</h3>
          {achievements.earned.length > 0 ? (
            <div className="achievements-grid">
              {achievements.earned.map((achievement, i) => (
                <div key={i} className={`achievement-badge ${achievement.type}`}>
                  <div className="achievement-icon">
                    {achievement.icon === 'flame' && (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.53 2.04-6.58 5-8.05V4c0-.55.45-1 1-1s1 .45 1 1v2.05c.47-.03.95-.05 1.43-.05.48 0 .96.02 1.43.05V4c0-.55.45-1 1-1s1 .45 1 1v1.95c2.96 1.47 5 4.52 5 8.05 0 4.97-4.03 9-9 9z"/>
                      </svg>
                    )}
                    {achievement.icon === 'star' && (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    )}
                    {achievement.icon === 'chart' && (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 3v18h18M9 17V9m4 8V5m4 12v-4"/>
                      </svg>
                    )}
                    {achievement.icon === 'trophy' && (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15c-3.87 0-7-3.13-7-7V4h14v4c0 3.87-3.13 7-7 7zm0 3c-1.1 0-2-.9-2-2v-1h4v1c0 1.1-.9 2-2 2zm-7-9H2V5h3v4zm14 0h3V5h-3v4zm-5 11H10v-2h4v2z"/>
                      </svg>
                    )}
                    {achievement.icon === 'refresh' && (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    )}
                  </div>
                  <span className="achievement-label">{achievement.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="achievements-empty">Complete your first week to unlock achievements</p>
          )}
          {achievements.nextMilestone && (
            <div className="next-milestone">
              Next: {achievements.nextMilestone} {getUnitLabel()} ({achievements.remaining} to go)
            </div>
          )}
        </section>

        {/* Flux Insights */}
        <section className="insights-section">
          <h3 className="detail-section-title">Flux Insights</h3>
          <div className="insights-card">
            <p className="detail-insight-text">
              <strong>${habit.ticker}</strong> is a {rating.label.toLowerCase()} habit in your portfolio.
              {stats.trendDirection === 'up' && ' Performance has been trending upward recently.'}
              {stats.trendDirection === 'down' && ' Consider focusing on consistency to improve your score.'}
              {stats.trendDirection === 'stable' && ' Maintain your current pace to keep building strength.'}
              {stats.resilienceScore >= 80 && ' Your recovery rate after missed days is excellent.'}
              {stats.resilienceScore < 50 && ' Try to get back on track quickly when you miss a day.'}
            </p>
            <div className="insight-meta">
              <div className="insight-item">
                <span className="insight-label">Risk</span>
                <span className={`insight-value ${stats.trendDirection === 'down' ? 'caution' : 'good'}`}>
                  {stats.trendDirection === 'down' ? 'Declining trend' : 'None identified'}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Outlook</span>
                <span className={`insight-value ${stats.trendDirection === 'down' ? 'neutral' : 'good'}`}>
                  {stats.trendDirection === 'up' ? 'Positive' : stats.trendDirection === 'stable' ? 'Neutral' : 'Caution advised'}
                </span>
              </div>
            </div>
            <p className="insight-note">AI-powered insights coming soon</p>
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
    </div>
  );
}
