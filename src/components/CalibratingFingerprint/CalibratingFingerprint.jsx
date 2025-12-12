import React from 'react';
import './CalibratingFingerprint.css';

const CalibratingFingerprint = ({ daysRemaining, size = 'large' }) => {
  const displayDays = Math.max(0, daysRemaining);
  const isCompact = size === 'compact' || size === 'hero';

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
            ? `${displayDays} days left`
            : displayDays === 1
              ? '1 more day of data needed'
              : `${displayDays} more days of data needed`}
        </span>
      </div>
    </div>
  );
};

export default CalibratingFingerprint;
