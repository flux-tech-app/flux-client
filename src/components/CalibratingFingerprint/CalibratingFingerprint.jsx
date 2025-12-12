import React from 'react';
import './CalibratingFingerprint.css';

const CalibratingFingerprint = ({ logsNeeded, daysRemaining, size = 'large' }) => {
  // Support both logsNeeded (new) and daysRemaining (legacy) props
  const displayCount = Math.max(0, logsNeeded ?? daysRemaining ?? 0);
  const isCompact = size === 'compact' || size === 'hero';
  const unit = logsNeeded !== undefined ? 'log' : 'day';

  return (
    <div className={`calibrating-fingerprint ${size}`}>
      <div className="fingerprint-container">
        <div className="fingerprint-rings">
          <div className="fp-ring"></div>
          <div className="fp-ring"></div>
          <div className="fp-ring"></div>
          <div className="fp-ring"></div>
          <div className="fp-ring"></div>
          <div className="fp-ring"></div>
        </div>
        <div className="fp-center-dot"></div>
      </div>

      <div className="days-badge">
        <svg className="days-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <span className="days-badge-text">
          {isCompact
            ? `${displayCount} ${unit}${displayCount === 1 ? '' : 's'} left`
            : displayCount === 1
              ? `1 more ${unit} needed`
              : `${displayCount} more ${unit}s needed`}
        </span>
      </div>
    </div>
  );
};

export default CalibratingFingerprint;
