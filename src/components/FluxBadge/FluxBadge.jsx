import './FluxBadge.css';

/**
 * FluxBadge - Breathing circle animation displaying Flux Score
 *
 * Color Zones:
 * - Red (Critical): 0-25
 * - Gray (Fragile/Building): 26-65
 * - Blue (Strong/Automatic): 66-100
 *
 */
export default function FluxBadge({ score, size = 'md' }) {
  // Determine color zone based on score
  const getColorZone = (score) => {
    if (score <= 25) return 'critical';
    if (score <= 65) return 'gray';
    return 'blue';
  };

  const colorZone = getColorZone(score);

  return (
    <div className={`breath-container breath--${size} breath--${colorZone}`}>
      <div className="breath-glow"></div>
      <div className="breath-ring"></div>
      <div className="breath-core">
        <span className="breath-score">{Math.round(score)}</span>
      </div>
    </div>
  );
}
