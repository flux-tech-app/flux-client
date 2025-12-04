import React from 'react';
import './EmptyState.css';

/**
 * Empty State for Portfolio
 * Shown when user has no habits yet
 * Updated to remove AI chat references - now guides to FAB
 */
function EmptyState() {
  return (
    <>
      {/* Empty State Illustration */}
      <div className="empty-state">
        <div className="empty-illustration">
          <div className="empty-icon">📈</div>
        </div>
        <h2 className="empty-title">Build Your Portfolio</h2>
        <p className="empty-description">
          Add habits to start earning. Every activity you log moves money toward your savings.
        </p>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <svg className="info-banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div className="info-banner-content">
          <div className="info-banner-title">How it works</div>
          <div className="info-banner-text">
            Choose habits, set your rates, and log when you complete them. Earnings transfer to savings every Friday.
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-icon-box green">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <div className="feature-content">
            <h3>Add positions</h3>
            <p>Tap the + button to choose from 15 curated habits like running, meditation, or reading.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="feature-content">
            <h3>Log activities</h3>
            <p>Complete a habit? Log it to earn your transfer amount. Takes just seconds.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box purple">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="feature-content">
            <h3>Build savings</h3>
            <p>Your earnings transfer every Friday. Watch your portfolio grow with your habits.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-hint">
          <span className="cta-hint-icon">👆</span>
          <span className="cta-hint-text">Tap the <strong>+</strong> button below to add your first habit</span>
        </div>
      </div>
    </>
  );
}

export default EmptyState;
