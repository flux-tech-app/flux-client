import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { formatCurrency } from '../../utils/formatters';
import { getNextTransferDate } from '../../utils/calculations';
import Navigation from '../../components/Navigation';
import './Portfolio.css';

// Category configuration with icons
const CATEGORIES = {
  Fitness: {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    )
  },
  Nutrition: {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    )
  },
  'Mental Health': {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    )
  },
  Productivity: {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    )
  },
  Financial: {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    )
  },
  Social: {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    )
  },
  Wellness: {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    )
  },
  Miscellaneous: {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
      </svg>
    )
  }
};

export default function Portfolio() {
  const { habits, logs, getTransferredBalance, getPendingBalance, getWeekEarnings } = useHabits();
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState('1M');

  const transferredBalance = getTransferredBalance();
  const weekEarnings = getWeekEarnings();
  const nextTransfer = getNextTransferDate();

  // Calculate category breakdowns
  const getCategoryData = () => {
    const categoryData = {};
    
    habits.forEach(habit => {
      const category = habit.category || 'Miscellaneous';
      
      if (!categoryData[category]) {
        categoryData[category] = {
          habitCount: 0,
          totalEarnings: 0
        };
      }
      
      categoryData[category].habitCount++;
      
      // Calculate earnings for this habit
      const habitLogs = logs.filter(log => log.habitId === habit.id);
      const habitEarnings = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
      categoryData[category].totalEarnings += habitEarnings;
    });
    
    // Convert to array and add percentages
    return Object.entries(categoryData).map(([name, data]) => ({
      name,
      ...data,
      percentage: transferredBalance > 0 
        ? (data.totalEarnings / transferredBalance) * 100 
        : 0,
      ...CATEGORIES[name]
    })).sort((a, b) => b.totalEarnings - a.totalEarnings);
  };

  const categoryData = getCategoryData();
  const hasHabits = habits.length > 0;

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        {/* Header */}
        <header className="portfolio-header">
          <div className="app-logo">Flux</div>
          <div className="header-actions">
            <button className="icon-button" onClick={() => navigate('/search')}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
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
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
                +{formatCurrency(weekEarnings)}
              </span>
              <span className="change-period">this week</span>
            </div>
          )}

          {/* Pending Transfer */}
          {hasHabits && getPendingBalance() > 0 && (
            <div className="pending-transfer">
              <svg className="pending-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="pending-amount">{formatCurrency(getPendingBalance())} pending</span>
              <span className="pending-separator">•</span>
              <span className="pending-schedule">transfers {nextTransfer}</span>
            </div>
          )}
        </section>

        {/* Chart Section */}
        {hasHabits && (
          <section className="chart-section">
            <div className="chart-header">
              <div className="chart-title">Performance</div>
              <div className="time-toggles">
                <button 
                  className={`time-toggle ${chartPeriod === '1W' ? 'active' : ''}`}
                  onClick={() => setChartPeriod('1W')}
                >
                  1W
                </button>
                <button 
                  className={`time-toggle ${chartPeriod === '1M' ? 'active' : ''}`}
                  onClick={() => setChartPeriod('1M')}
                >
                  1M
                </button>
                <button 
                  className={`time-toggle ${chartPeriod === '3M' ? 'active' : ''}`}
                  onClick={() => setChartPeriod('3M')}
                >
                  3M
                </button>
                <button 
                  className={`time-toggle ${chartPeriod === '1Y' ? 'active' : ''}`}
                  onClick={() => setChartPeriod('1Y')}
                >
                  1Y
                </button>
                <button 
                  className={`time-toggle ${chartPeriod === 'All' ? 'active' : ''}`}
                  onClick={() => setChartPeriod('All')}
                >
                  All
                </button>
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

        {/* Indices Section */}
        {hasHabits ? (
          <section className="indices-section">
            <div className="section-header">
              <div className="section-title">Your Indices</div>
              <button 
                className="view-all-link"
                onClick={() => navigate('/indices')}
              >
                View All
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="indices-list">
              {categoryData.map(category => (
                <motion.div 
                  key={category.name}
                  className="index-card"
                  onClick={() => navigate(`/indices/${category.name.toLowerCase().replace(' ', '-')}`)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="index-icon">
                    {category.icon}
                  </div>
                  <div className="index-info">
                    <div className="index-name">{category.name}</div>
                    <div className="index-habits-count">
                      {category.habitCount} {category.habitCount === 1 ? 'habit' : 'habits'}
                    </div>
                  </div>
                  <div className="index-value">
                    <div className="index-amount">{formatCurrency(category.totalEarnings)}</div>
                    <div className="index-percentage">{category.percentage.toFixed(1)}%</div>
                  </div>
                </motion.div>
              ))}
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
