/**
 * Sparkline - Minimal inline trend chart
 * Inspired by Coinbase asset sparklines
 */

export default function Sparkline({
  data = [],
  width = 60,
  height = 24,
  positive = true,
  className = ''
}) {
  // Need at least 2 points to draw a line
  if (!data || data.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        className={`sparkline ${className}`}
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={positive ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />
      </svg>
    );
  }

  // Extract values (handle both number arrays and object arrays)
  const values = data.map(d => typeof d === 'number' ? d : (d.average || d.value || 0));

  // Calculate min/max for scaling
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // Avoid division by zero

  // Add padding to prevent line from touching edges
  const padding = 2;
  const chartWidth = width;
  const chartHeight = height - (padding * 2);

  // Generate points
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const strokeColor = positive ? '#10b981' : '#ef4444';

  return (
    <svg
      width={width}
      height={height}
      className={`sparkline ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
