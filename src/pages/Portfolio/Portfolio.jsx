import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { getNextTransferDate } from '../../utils/calculations';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import './Portfolio.css';

// Animated counter hook - counts up from 0 to target value
const useAnimatedCounter = (targetValue, duration = 1500) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef(null);
  const startValue = useRef(0);

  useEffect(() => {
    startValue.current = displayValue;
    startTime.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue.current + (targetValue - startValue.current) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
};

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

export default function Portfolio() {
  const {
    habits,
    logs,
    getTransferredBalance,
    getPendingBalance,
    getWeekEarnings,
    calculateFluxScore,
    getPortfolioFluxScore
  } = useHabits();
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const transferredBalance = getTransferredBalance();
  const weekEarnings = getWeekEarnings();
  const nextTransfer = getNextTransferDate();
  const pendingBalance = getPendingBalance();
  const portfolioScore = getPortfolioFluxScore();

  // Animated portfolio value - counts up from 0 on load
  const animatedBalance = useAnimatedCounter(transferredBalance, 1200);

  /**
   * Generate chart data for Flux Score view
   */
  const generateFluxScoreChartData = () => {
    const now = new Date();
    let dataPoints;
    let days;
    
    switch(chartPeriod) {
      case '1W':
        days = 7;
        dataPoints = 7;
        break;
      case '1M':
        days = 30;
        dataPoints = 15;
        break;
      case '3M':
        days = 90;
        dataPoints = 15;
        break;
      case '1Y':
        days = 365;
        dataPoints = 16;
        break;
      case 'YTD':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        days = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
        dataPoints = Math.min(15, days);
        break;
      case 'ALL':
      default:
        days = 90; // Default to 90 days for ALL
        dataPoints = 15;
    }
    
    const labels = [];
    const data = [];
    const interval = Math.max(1, Math.floor(days / dataPoints));
    
    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * interval * 24 * 60 * 60 * 1000));
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(dateLabel);
      // Simulate gradual improvement over time
      data.push(60 + (dataPoints - i) * 1.5 + Math.random() * 8);
    }
    
    return { labels, data };
  };

  // Generate chart data
  const chartData = generateFluxScoreChartData();

  // Chart.js configuration
  const chartConfig = {
    labels: chartData.labels,
    datasets: [{
      label: 'Your Flux Score',
      data: chartData.data,
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
            return `Score: ${Math.round(value)}`;
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
        display: false, // Hide Y-axis completely
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  };

  // Calculate total earned for a habit
  const getHabitTotalEarned = (habitId) => {
    const habitLogs = logs.filter(log => log.habitId === habitId);
    return habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
  };

  // Get holdings data with Flux Scores
  const getHoldingsData = () => {
    return habits
      .map(habit => {
        const fluxScoreData = calculateFluxScore(habit.id);
        return {
          ...habit,
          fluxScore: fluxScoreData?.score ?? null,
          fluxScoreStatus: fluxScoreData?.status ?? 'building',
          logsNeeded: fluxScoreData?.logsNeeded ?? 0,
          totalLogs: fluxScoreData?.totalLogs ?? 0,
          totalEarned: getHabitTotalEarned(habit.id)
        };
      })
      .sort((a, b) => b.totalEarned - a.totalEarned);
  };

  const holdings = getHoldingsData();
  const hasHabits = habits.length > 0;

  return (
    <div className="portfolio-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="portfolio-container">
        {/* Header */}
        <header className="portfolio-header">
          <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="header-actions">
            <button className="icon-button" aria-label="Notifications" onClick={() => alert('Coming soon!')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Portfolio Value Section */}
        <section className="portfolio-value-section">
          <div className="value-label">Total Portfolio Value</div>
          <div className="portfolio-value">{formatCurrency(animatedBalance)}</div>

          {/* Pending Transfer */}
          {hasHabits && pendingBalance > 0 && (
            <div className="pending-transfer">
              <svg className="pending-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="pending-amount">{formatCurrency(pendingBalance)} pending</span>
              <span className="pending-separator">•</span>
              <span className="pending-schedule">transfers {nextTransfer}</span>
            </div>
          )}
        </section>

        {/* Flux Score Section */}
        {hasHabits && (
          <section className="growth-section">
            {/* Growth Header */}
            <div className="growth-header">
              <div className="growth-title">Flux Score</div>
              <span className="random-data-badge">Random Data</span>
            </div>

            {/* Chart */}
            <div className="chart-container">
              <Line data={chartConfig} options={chartOptions} />
            </div>

            {/* Time Period Toggles - Added 1W, Removed 6M */}
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
        )}

        {/* Holdings Section */}
        {hasHabits ? (
          <section className="holdings-section">
            <div className="holdings-header">
              <span className="holdings-title">Holdings</span>
              <div className="holdings-header-right">
                <span className="random-data-badge">Random Rankings</span>
                <span className="holdings-count">{holdings.length} habits</span>
              </div>
            </div>

            <div className="holdings-list">
              {holdings.map((holding, index) => (
                <motion.div
                  key={holding.id}
                  className={`holding-item ${holding.fluxScoreStatus === 'building' ? 'inactive' : ''}`}
                  onClick={() => navigate(`/habit/${holding.id}`)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Name */}
                  <span className="holding-name">{holding.name}</span>

                  {/* Rank Badge */}
                  <div className="holding-middle">
                    {holding.fluxScoreStatus === 'active' ? (() => {
                      const rankPercent = Math.floor(Math.random() * 40 + 10);
                      return (
                        <span className={`holding-rank ${rankPercent <= 20 ? 'top-performer' : ''}`}>
                          Top {rankPercent}%
                        </span>
                      );
                    })() : (
                      <span className="holding-rank inactive">{holding.logsNeeded} more logs needed</span>
                    )}
                  </div>

                  {/* Earnings */}
                  <div className="holding-earnings">
                    <div className="holding-earnings-value">{formatCurrency(holding.totalEarned)}</div>
                    <div className="holding-earnings-label">earned</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ) : (
          <section className="empty-state-section">
            <div className="empty-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
            <h3>Start Building Your Portfolio</h3>
            <p>
              Create your first habit to begin tracking your behavioral investments.
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
    </div>
  );
}
