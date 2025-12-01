import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { formatCurrency } from '../../utils/formatters';
import { getNextTransferDate } from '../../utils/calculations';
import Navigation from '../../components/Navigation';
import './Portfolio.css';

// HHS to Star Rating mapping
const getStarRating = (hhs) => {
  if (hhs >= 90) return 5;
  if (hhs >= 80) return 4;
  if (hhs >= 70) return 3;
  if (hhs >= 60) return 2;
  return 1;
};

// Render star display using SVG for reliability
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= rating;
    stars.push(
      <svg 
        key={i} 
        className={`star-icon ${isFilled ? 'filled' : 'empty'}`}
        width="12" 
        height="12" 
        viewBox="0 0 24 24"
        fill={isFilled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    );
  }
  return <div className="star-rating">{stars}</div>;
};

// Trend arrow component
const TrendArrow = ({ trend }) => {
  if (trend === 'up') {
    return <span className="trend-arrow up">▲</span>;
  } else if (trend === 'down') {
    return <span className="trend-arrow down">▼</span>;
  }
  return <span className="trend-arrow neutral">—</span>;
};

export default function Portfolio() {
  const { 
    habits, 
    logs, 
    getTransferredBalance, 
    getPendingBalance, 
    getWeekEarnings,
    getHabitLogs 
  } = useHabits();
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState('1M');

  const transferredBalance = getTransferredBalance();
  const weekEarnings = getWeekEarnings();
  const nextTransfer = getNextTransferDate();
  const pendingBalance = getPendingBalance();

  // Calculate HHS for a habit (simplified for MVT)
  const calculateHHS = (habit) => {
    const habitLogs = getHabitLogs(habit.id);
    
    if (habitLogs.length === 0) return 0;

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLogs = habitLogs.filter(log => 
      new Date(log.timestamp) >= thirtyDaysAgo
    );

    // Calculate completion rate (35%)
    // For daily habits, expect ~30 entries; for specific days, calculate expected
    const schedule = habit.schedule || { type: 'daily', days: [0,1,2,3,4,5,6] };
    let expectedDays = 30;
    
    if (schedule.type === 'specific_days' && schedule.days) {
      // Count how many of the scheduled days fall in last 30 days
      expectedDays = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        if (schedule.days.includes(date.getDay())) {
          expectedDays++;
        }
      }
    } else if (schedule.type === 'weekdays') {
      expectedDays = 22; // ~22 weekdays in 30 days
    } else if (schedule.type === 'weekends') {
      expectedDays = 8; // ~8 weekend days in 30 days
    }

    const completionRate = expectedDays > 0 
      ? Math.min(100, (recentLogs.length / expectedDays) * 100)
      : 0;

    // Calculate streak score (25%) - currentStreak / 12 weeks * 100
    const streakScore = Math.min(100, ((habit.currentStreak || 0) / 12) * 100);

    // Consistency score (25%) - simplified: based on how spread out the logs are
    // For MVT, use completion rate as proxy
    const consistencyScore = completionRate;

    // Trend score (15%) - compare last 2 weeks vs previous 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentTwoWeeks = habitLogs.filter(log => 
      new Date(log.timestamp) >= twoWeeksAgo
    ).length;
    
    const previousTwoWeeks = habitLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= fourWeeksAgo && logDate < twoWeeksAgo;
    }).length;

    let trendScore = 50; // neutral
    if (recentTwoWeeks > previousTwoWeeks) {
      trendScore = 75 + Math.min(25, (recentTwoWeeks - previousTwoWeeks) * 5);
    } else if (recentTwoWeeks < previousTwoWeeks) {
      trendScore = 25 - Math.min(25, (previousTwoWeeks - recentTwoWeeks) * 5);
    }

    // Calculate final HHS
    const hhs = Math.round(
      (completionRate * 0.35) +
      (streakScore * 0.25) +
      (consistencyScore * 0.25) +
      (trendScore * 0.15)
    );

    return Math.min(100, Math.max(0, hhs));
  };

  // Determine trend direction
  const getTrend = (habit) => {
    const habitLogs = getHabitLogs(habit.id);
    
    if (habitLogs.length < 4) return 'neutral';

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentCount = habitLogs.filter(log => 
      new Date(log.timestamp) >= twoWeeksAgo
    ).length;
    
    const previousCount = habitLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= fourWeeksAgo && logDate < twoWeeksAgo;
    }).length;

    if (recentCount > previousCount) return 'up';
    if (recentCount < previousCount) return 'down';
    return 'neutral';
  };

  // Calculate total earned for a habit
  const getHabitTotalEarned = (habitId) => {
    const habitLogs = logs.filter(log => log.habitId === habitId);
    return habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
  };

  // Get holdings data (active habits with stats)
  const getHoldingsData = () => {
    return habits
      .filter(habit => habit.isActive !== false)
      .map(habit => ({
        ...habit,
        hhs: calculateHHS(habit),
        trend: getTrend(habit),
        totalEarned: getHabitTotalEarned(habit.id)
      }))
      .sort((a, b) => b.totalEarned - a.totalEarned); // Sort by earnings
  };

  const holdings = getHoldingsData();
  const hasHabits = habits.length > 0;

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        {/* Header */}
        <header className="portfolio-header">
          <div className="app-logo">Flux</div>
          <div className="header-actions">
            <button className="icon-button" onClick={() => navigate('/account')}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Portfolio Value Section */}
        <section className="portfolio-value-section">
          <div className="value-label">Total Portfolio Value</div>
          <div className="portfolio-value">{formatCurrency(transferredBalance)}</div>
          
          {hasHabits && weekEarnings > 0 && (
            <div className="value-change">
              <span className="change-badge">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
                +{formatCurrency(weekEarnings)}
              </span>
              <span className="change-period">this week</span>
            </div>
          )}

          {/* Pending Transfer */}
          {hasHabits && pendingBalance > 0 && (
            <div className="pending-transfer">
              <svg className="pending-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="pending-amount">{formatCurrency(pendingBalance)} pending</span>
              <span className="pending-separator">•</span>
              <span className="pending-schedule">transfers {nextTransfer}</span>
            </div>
          )}
        </section>

        {/* Chart Section */}
        {hasHabits && (
          <section className="chart-section">
            <div className="chart-header">
              <div className="chart-title">Growth</div>
              <div className="time-toggles">
                {['1M', '3M', '6M', 'YTD', '1Y', 'ALL'].map(period => (
                  <button 
                    key={period}
                    className={`time-toggle ${chartPeriod === period ? 'active' : ''}`}
                    onClick={() => setChartPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-placeholder">
              {/* Grid lines */}
              <div className="chart-grid">
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
              </div>
              
              {/* Simulated line chart */}
              <div className="chart-line-container">
                <div className="chart-line">
                  <div className="line-gradient"></div>
                  <div className="line-stroke"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Holdings Section */}
        {hasHabits ? (
          <section className="holdings-section">
            <div className="section-header">
              <div className="section-title">Holdings</div>
              <span className="holdings-count">{holdings.length} habits</span>
            </div>

            <div className="holdings-list">
              {holdings.map((holding, index) => {
                const starRating = getStarRating(holding.hhs);
                
                return (
                  <motion.div 
                    key={holding.id}
                    className="holding-row"
                    onClick={() => navigate(`/habit/${holding.id}`)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="holding-ticker">${holding.ticker}</div>
                    <div className="holding-metrics">
                      <StarRating rating={starRating} />
                      <span className="holding-hhs">{holding.hhs}</span>
                      <TrendArrow trend={holding.trend} />
                    </div>
                    <div className="holding-earned">{formatCurrency(holding.totalEarned)}</div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="empty-state-section">
            <div className="empty-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
            <h3>Start Building Your Portfolio</h3>
            <p>
              Create your first habit to begin tracking your behavioral investments.
              Your progress will appear here.
            </p>
          </section>
        )}

        {/* Savings Goals Section */}
        {hasHabits && (
          <section className="savings-goals-section">
            <div className="section-header">
              <div className="section-title">Savings Goals</div>
              <span className="coming-soon-badge">Coming Soon</span>
            </div>

            <div className="goal-card">
              <div className="goal-header">
                <div>
                  <div className="goal-title">Emergency Fund</div>
                  <div className="goal-target">Target: $5,000</div>
                </div>
                <div className="goal-amount">
                  <div className="goal-current">{formatCurrency(transferredBalance)}</div>
                  <div className="goal-remaining">
                    {formatCurrency(Math.max(0, 5000 - transferredBalance))} to go
                  </div>
                </div>
              </div>
              <div className="goal-progress">
                <div 
                  className="goal-progress-bar" 
                  style={{ width: `${Math.min(100, (transferredBalance / 5000) * 100)}%` }}
                ></div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
