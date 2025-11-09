import React, { useState, useMemo } from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { 
  getProgressChartData, 
  getEarningsChartData, 
  calculatePeriodSummary 
} from '../../utils/chartCalculations';
import { format } from 'date-fns';
import './HabitChart.css';

/**
 * HabitChart Component
 * Toggle between Progress (bar chart) and Earnings (line chart) views
 * Supports 5 time periods: 7D, 30D, 90D, 1Y, All
 * Earnings view has Coinbase/Robinhood style interactive hover
 */
function HabitChart({ habit, logs }) {
  const [view, setView] = useState('progress'); // 'progress' or 'earnings'
  const [period, setPeriod] = useState('30D');
  const [hoverState, setHoverState] = useState(null);

  // Calculate chart data based on current view and period
  const chartData = useMemo(() => {
    if (!habit || !logs) return null;

    if (view === 'progress') {
      return getProgressChartData(habit, logs, period);
    } else {
      return getEarningsChartData(logs, period);
    }
  }, [habit, logs, view, period]);

  // Calculate summary metric
  const summary = useMemo(() => {
    if (!habit || !logs || logs.length === 0) return null;
    return calculatePeriodSummary(habit, logs, period, view);
  }, [habit, logs, period, view]);

  // Calculate period label for earnings view
  const periodLabel = useMemo(() => {
    const labels = {
      '7D': 'Last 7 days',
      '30D': 'Last 30 days',
      '90D': 'Last 90 days',
      '1Y': 'Last year',
      'All': 'All time'
    };
    return labels[period] || 'Period';
  }, [period]);

  // Format progress value for display
  const formatProgressValue = (value, valueType) => {
    if (value === null) return '—';
    
    switch (valueType) {
      case 'duration':
        return `${value} min`;
      case 'count':
        return `${value}`;
      case 'completion':
        return value > 0 ? 'Complete' : 'Missed';
      default:
        return value.toString();
    }
  };

  // Get current display value and label based on view and hover state
  const displayValue = useMemo(() => {
    if (!chartData) return null;

    if (view === 'earnings') {
      const value = hoverState?.isHovering 
        ? hoverState.value 
        : chartData.data[chartData.data.length - 1]?.cumulativeEarnings || 0;
      return `$${value.toFixed(2)}`;
    } else {
      // Progress view
      if (hoverState?.isHovering && hoverState.value !== null) {
        return formatProgressValue(hoverState.value, chartData.valueType);
      }
      // Find most recent value
      const recentPoint = [...chartData.data].reverse().find(p => p.value !== null);
      return recentPoint ? formatProgressValue(recentPoint.value, chartData.valueType) : '—';
    }
  }, [view, chartData, hoverState]);

  // Get current date label
  const displayDate = useMemo(() => {
    if (hoverState?.isHovering && hoverState.date) {
      return format(new Date(hoverState.date), 'MMM d, yyyy');
    }
    return periodLabel;
  }, [hoverState, periodLabel]);

  // Handle hover change from LineChart
  const handleHoverChange = (hoverData) => {
    setHoverState(hoverData);
  };

  // Calculate change for earnings view
  const earningsChange = useMemo(() => {
    if (view !== 'earnings' || !chartData || !chartData.data || chartData.data.length === 0) {
      return null;
    }

    const startValue = chartData.data[0].cumulativeEarnings;
    const currentValue = hoverState?.isHovering 
      ? hoverState.value 
      : chartData.data[chartData.data.length - 1].cumulativeEarnings;

    const change = currentValue - startValue;
    const changePercent = startValue > 0 ? ((change / startValue) * 100).toFixed(1) : 0;

    return {
      amount: change,
      percent: changePercent,
      isPositive: change >= 0
    };
  }, [view, chartData, hoverState]);

  // Handle empty state
  if (!habit || !logs) {
    return (
      <div className="habit-chart">
        <div className="empty-state">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Handle no logs yet
  if (logs.length === 0) {
    return (
      <div className="habit-chart">
        <div className="chart-header">
          <h2 className="chart-title">Activity</h2>
        </div>
        <div className="empty-state">
          <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" opacity="0.3"/>
          </svg>
          <h3>Start Tracking Your Progress</h3>
          <p>Log your first activity to see charts and insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="habit-chart">
      {/* Header with view toggle */}
      <div className="chart-header">
        <h2 className="chart-title">Activity</h2>
        
        <div className="view-toggle">
          <button 
            className={`view-option ${view === 'progress' ? 'active' : ''}`}
            onClick={() => setView('progress')}
          >
            Progress
          </button>
          <button 
            className={`view-option ${view === 'earnings' ? 'active' : ''}`}
            onClick={() => setView('earnings')}
          >
            Earnings
          </button>
        </div>
      </div>

      {/* Period controls */}
      <div className="chart-controls">
        {['7D', '30D', '90D', '1Y', 'All'].map(p => (
          <button
            key={p}
            className={`chart-toggle ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Summary metric card - unified display for both views */}
      {view === 'earnings' && summary ? (
        <div className="metric-display earnings-display">
          <div className="metric-label">Total Earnings</div>
          <div className="metric-value-large earnings">
            {displayValue}
          </div>
          {earningsChange && (
            <div className={`metric-change ${earningsChange.isPositive ? 'positive' : 'negative'}`}>
              {earningsChange.isPositive ? '+' : ''}
              ${Math.abs(earningsChange.amount).toFixed(2)} ({earningsChange.isPositive ? '+' : ''}
              {earningsChange.percent}%)
            </div>
          )}
          <div className="metric-date">
            {displayDate}
          </div>
        </div>
      ) : view === 'progress' && chartData ? (
        <div className="metric-display progress-display">
          <div className="metric-label">{summary?.label || 'Progress'}</div>
          <div className="metric-value-large">
            {displayValue}
          </div>
          <div className="metric-date">
            {displayDate}
          </div>
        </div>
      ) : null}

      {/* Chart display */}
      <div className="chart-container">
        {view === 'progress' ? (
          <BarChart 
            data={chartData} 
            habit={habit}
            onHoverChange={handleHoverChange}
          />
        ) : (
          <LineChart 
            data={chartData} 
            onHoverChange={handleHoverChange}
          />
        )}
      </div>
    </div>
  );
}

export default HabitChart;
