import React from 'react';
import './Onboarding.css';

function Welcome({ onContinue, onSkip }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <div className="flux-intro">
          <div className="flux-avatar-large">F</div>
          <h1 className="welcome-title">
            Meet <span className="gradient-text">Flux</span>
          </h1>
          <p className="welcome-subtitle">
            Your AI behavior coach that turns habits into savings
          </p>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="feature-content">
              <div className="feature-title">Natural conversation</div>
              <div className="feature-description">
                Just talk to Flux like you would a coach. No complex forms or confusing menus.
              </div>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="feature-content">
              <div className="feature-title">Real money accountability</div>
              <div className="feature-description">
                Transfer your own money between checking and savings based on habit completion.
              </div>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="feature-content">
              <div className="feature-title">Personalized insights</div>
              <div className="feature-description">
                Flux learns your patterns and offers smart suggestions to help you succeed.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <button className="primary-button" onClick={onContinue}>
          Continue
        </button>
        <button className="skip-button" onClick={onSkip}>
          Skip intro
        </button>
      </div>
    </div>
  );
}

export default Welcome;
