import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFluxChat } from '../../context/FluxChatContext';
import './EmptyState.css';

function EmptyState() {
  const navigate = useNavigate();
  const { openChat } = useFluxChat();

  const handleTalkToFlux = () => {
    openChat();
  };

  const handleLearnMore = () => {
    // TODO: Navigate to help/info page or show modal
    console.log('Learn more clicked');
  };

  return (
    <>
      {/* Empty State Illustration */}
      <div className="empty-state">
        <div className="empty-illustration">
          <div className="flux-spinner">flux</div>
        </div>
        <h2 className="empty-title">Let's build your first habit</h2>
        <p className="empty-description">
          Talk to Flux about what you want to work on. Every habit you complete moves money to your savings automatically.
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
            Set your own transfer amounts for each habit. Complete the habit, earn the transfer to savings. It's that simple.
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-icon-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div className="feature-content">
            <h3>Talk naturally</h3>
            <p>Just tell Flux what habit you want to build. No forms or setup required.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="feature-content">
            <h3>Real accountability</h3>
            <p>Your own money transfers between your accounts based on completion.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <div className="feature-content">
            <h3>Track progress</h3>
            <p>See your streaks, earnings, and compare with others through behavioral indices.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <button className="cta-button" onClick={handleTalkToFlux}>
          <div className="flux-avatar-btn">F</div>
          Talk to Flux to get started
        </button>
        
        <div className="secondary-cta">
          <button className="secondary-cta-button" onClick={handleLearnMore}>
            Learn more about how Flux works
          </button>
        </div>
      </div>
    </>
  );
}

export default EmptyState;
