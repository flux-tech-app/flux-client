import React, { useMemo, useState, useRef, useEffect } from 'react';
import { getXAxisLabels } from '../../utils/chartCalculations';
import './LineChart.css';

/**
 * LineChart Component - Coinbase/Robinhood Style
 * Interactive line chart with hover/touch support
 * No Y-axis labels for cleaner look
 * Shows value and date on hover
 */
function LineChart({ data, onHoverChange }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartRef = useRef(null);
  const svgRef = useRef(null);

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
    const height = 180;
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

  // Get X-axis labels
  const xLabels = getXAxisLabels(chartPoints.map(d => d.date), period);

  // Handle pointer move (mouse or touch)
  const handlePointerMove = (e) => {
    if (!chartRef.current || !svgRef.current) return;

    const rect = chartRef.current.getBoundingClientRect();
    const svgRect = svgRef.current.getBoundingClientRect();
    
    // Get X coordinate (handle both mouse and touch)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - svgRect.left;
    
    // Convert to SVG coordinates
    const svgX = (x / svgRect.width) * 300;

    // Find closest point
    let closestPoint = points[0];
    let minDistance = Math.abs(svgX - closestPoint.x);

    for (const point of points) {
      const distance = Math.abs(svgX - point.x);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }

    setHoveredPoint(closestPoint);
    
    // Notify parent component of hover change
    if (onHoverChange) {
      onHoverChange({
        value: closestPoint.data.cumulativeEarnings,
        date: closestPoint.data.date,
        isHovering: true
      });
    }
  };

  // Handle pointer leave
  const handlePointerLeave = () => {
    setHoveredPoint(null);
    
    if (onHoverChange) {
      onHoverChange({
        value: chartPoints[chartPoints.length - 1].cumulativeEarnings,
        date: null,
        isHovering: false
      });
    }
  };

  return (
    <div className="line-chart">
      <div 
        ref={chartRef}
        className="chart-area"
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerLeave}
      >
        <svg 
          ref={svgRef}
          className="line-chart-svg" 
          viewBox="0 0 300 180" 
          preserveAspectRatio="none"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.2 }} />
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
          
          {/* Hover line - vertical dashed line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1="0"
              x2={hoveredPoint.x}
              y2="180"
              className="hover-line"
            />
          )}
          
          {/* Hover dot - shows exact point on line */}
          {hoveredPoint && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="6"
              className="hover-dot"
            />
          )}
          
          {/* Current position dot - only show when not hovering */}
          {!hoveredPoint && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="5"
              className="current-dot"
            />
          )}
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
