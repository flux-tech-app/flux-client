import React, { useRef } from 'react';
import { getXAxisLabels } from '../../utils/chartCalculations';
import './BarChart.css';

/**
 * BarChart Component - Clean Style
 * Displays progress data as vertical bars without Y-axis
 * Interactive hover to see exact values
 */
function BarChart({ data, habit, onHoverChange }) {
  const hoverTimeoutRef = useRef(null);

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bar-chart-empty">
        <p>No data for this period</p>
      </div>
    );
  }

  const { data: chartPoints, valueType, maxValue, period } = data;

  // Get X-axis labels
  const xLabels = getXAxisLabels(chartPoints.map(d => d.date), period);

  // Format value for display
  const formatValue = (value, type, point) => {
    if (value === null) return 'No data';
    
    // For aggregated data (90D/1Y), show total or average
    const isAggregated = point?.isAggregated;
    const dayCount = point?.dayCount || 1;
    
    switch (type) {
      case 'duration':
        if (isAggregated) {
          return `${value} min total`;
        }
        return `${value} min`;
      case 'count':
        if (isAggregated) {
          return `${value} total`;
        }
        return `${value} ${habit?.unit || 'units'}`;
      case 'completion':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  // Handle bar hover - debounced
  const handleBarHover = (point) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (onHoverChange) {
      onHoverChange({
        value: point.value,
        date: point.date,
        isHovering: true,
        valueType
      });
    }
  };

  // Handle bar leave - debounced
  const handleBarLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      if (onHoverChange) {
        // Find most recent value
        const recentPoint = [...chartPoints].reverse().find(p => p.value !== null);
        onHoverChange({
          value: recentPoint?.value || null,
          date: null,
          isHovering: false,
          valueType
        });
      }
    }, 100);
  };

  return (
    <div className="bar-chart">
      <div className="chart-area">
        <div className="bars-container">
          {chartPoints.map((point, idx) => {
            const heightPercent = point.value !== null 
              ? (point.value / maxValue) * 100 
              : 0;

            const formattedValue = formatValue(point.value, valueType, point);

            return (
              <div 
                key={point.date}
                className="bar-wrapper"
                onMouseEnter={() => handleBarHover(point)}
                onMouseLeave={handleBarLeave}
                onTouchStart={() => handleBarHover(point)}
                onTouchEnd={handleBarLeave}
              >
                {/* Hover tooltip - pure CSS, no React state */}
                <div className="bar-tooltip" data-value={formattedValue}>
                  {formattedValue}
                </div>
                
                {/* Bar */}
                <div 
                  className={`bar ${point.hasData ? 'has-data' : 'no-data'}`}
                  style={{ height: point.hasData ? `${heightPercent}%` : '4px' }}
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
