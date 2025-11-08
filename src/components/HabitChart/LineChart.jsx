import React, { useMemo } from 'react';
import { getXAxisLabels, getYAxisLabels } from '../../utils/chartCalculations';
import './LineChart.css';

/**
 * LineChart Component
 * Displays earnings data as a line chart with gradient fill and data points
 * Blue theme for financial data
 */
function LineChart({ data }) {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="line-chart-empty">
        <p>No earnings data for this period</p>
      </div>
    );
  }

  const { data: chartPoints, displayMax, period } = data;

  // Calculate SVG path and points using cumulative earnings
  const { pathData, areaData, points } = useMemo(() => {
    const width = 300;
    const height = 152;
    const pointsArray = [];
    const pathPoints = [];

    chartPoints.forEach((point, idx) => {
      const x = (idx / (chartPoints.length - 1)) * width;
      const y = height - ((point.cumulativeEarnings / displayMax) * height);
      
      pathPoints.push(`${x},${y}`);
      pointsArray.push({ x, y, data: point });
    });

    const pathData = pathPoints.join(' ');
    
    // Create area fill path (line + bottom edge)
    const areaData = `
      M 0,${height}
      L ${pathPoints[0]}
      L ${pathPoints.join(' L ')}
      L ${width},${height}
      Z
    `;

    return { pathData, areaData, points: pointsArray };
  }, [chartPoints, displayMax]);

  // Get axis labels using displayMax for Y-axis
  const xLabels = getXAxisLabels(chartPoints.map(d => d.date), period);
  const yLabels = getYAxisLabels(displayMax, 'earnings');

  return (
    <div className="line-chart">
      {/* Y-axis labels */}
      <div className="y-axis">
        {yLabels.map((label, idx) => (
          <div key={idx} className="y-label">${label}</div>
        ))}
      </div>

      {/* Chart area */}
      <div className="chart-area">
        <svg 
          className="line-chart-svg" 
          viewBox="0 0 300 152" 
          preserveAspectRatio="none"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d={areaData}
            fill="url(#blueGradient)"
          />
          
          {/* Line */}
          <polyline
            points={pathData}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points - show every few points for clarity */}
          {points.map((point, idx) => {
            // Show points at regular intervals based on dataset size
            const showPoint = chartPoints.length <= 10 || idx % Math.ceil(chartPoints.length / 8) === 0;
            if (!showPoint && idx !== points.length - 1) return null;

            return (
              <circle
                key={idx}
                cx={point.x}
                cy={point.y}
                r={idx === points.length - 1 ? 5 : 3}
                className={idx === points.length - 1 ? "data-point active-dot" : "data-point"}
                fill={idx === points.length - 1 ? "#2563eb" : "white"}
                stroke="#2563eb"
                strokeWidth="2"
              />
            );
          })}
        </svg>

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

export default LineChart;
