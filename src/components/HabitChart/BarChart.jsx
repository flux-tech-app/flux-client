import React from 'react';
import { getXAxisLabels, getYAxisLabels } from '../../utils/chartCalculations';
import './BarChart.css';

/**
 * BarChart Component
 * Displays progress data as vertical bars
 * Adapts to habit type (duration, count, or completion)
 */
function BarChart({ data, habit }) {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bar-chart-empty">
        <p>No data for this period</p>
      </div>
    );
  }

  const { data: chartPoints, valueType, maxValue, period } = data;

  // Get axis labels
  const xLabels = getXAxisLabels(chartPoints.map(d => d.date), period);
  const yLabels = getYAxisLabels(maxValue, valueType, habit?.unit);

  return (
    <div className="bar-chart">
      {/* Y-axis labels */}
      <div className="y-axis">
        {yLabels.map((label, idx) => (
          <div key={idx} className="y-label">{label}</div>
        ))}
      </div>

      {/* Chart area with bars */}
      <div className="chart-area">
        <div className="bars-container">
          {chartPoints.map((point, idx) => {
            const heightPercent = point.value !== null 
              ? (point.value / maxValue) * 100 
              : 0;

            return (
              <div 
                key={point.date}
                className="bar-wrapper"
                title={point.hasData ? `${point.date}: ${point.value}` : point.date}
              >
                <div 
                  className={`bar ${point.hasData ? 'has-data' : ''}`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="x-axis">
          {xLabels.map((label, idx) => (
            <div key={idx} className="x-label">{label.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BarChart;
