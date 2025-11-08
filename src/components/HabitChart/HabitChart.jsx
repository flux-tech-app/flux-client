import React, { useState, useMemo } from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { 
  getProgressChartData, 
  getEarningsChartData, 
  calculatePeriodSummary 
} from '../../utils/chartCalculations';
import './HabitChart.css';

/**
 * HabitChart Component
 * Toggle between Progress (bar chart) and Earnings (line chart) views
 * Supports 5 time periods: 7D, 30D, 90D, 1Y, All
 */
function HabitChart({ habit, logs }) {
  const [view, setView] = useState('progress'); // 'progress' or 'earnings'
  const [period, setPeriod] = useState('30D');

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

      {/* Summary metric card */}
      {summary && (
        <div className="metric-display">
          <div className="metric-label">{summary.label}</div>
          <div className={`metric-value-large ${view === 'earnings' ? 'earnings' : ''}`}>
            {summary.value}
          </div>
          {summary.subtext && (
            <div className="metric-subtext">{summary.subtext}</div>
          )}
          {summary.change && (
            <div className="metric-change">
              {summary.change.direction === 'up' ? '↑' : '↓'} 
              {summary.change.amount >= 0 ? '+' : ''}
              ${Math.abs(summary.change.amount).toFixed(2)} from last period
            </div>
          )}
        </div>
      )}

      {/* Chart display */}
      <div className="chart-container">
        {view === 'progress' ? (
          <BarChart data={chartData} habit={habit} />
        ) : (
          <LineChart data={chartData} />
        )}
      </div>
    </div>
  );
}

export default HabitChart;
