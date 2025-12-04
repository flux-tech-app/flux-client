import './Onboarding.css';

/**
 * Welcome Screen - Step 1
 * Professional introduction to Flux with elegant "F" avatar
 */
export default function Welcome({ onContinue, onSkip }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <div className="flux-intro">
          <div className="flux-avatar-large">F</div>
          <h1 className="welcome-title">
            Meet <span className="gradient-text">Flux</span>
          </h1>
          <p className="welcome-subtitle">
            Your behavioral investment platform that turns habits into savings
          </p>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-icon green">
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
                Transfer your own money to savings when you complete habits. It's your money—just moving it smarter.
              </div>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="feature-content">
              <div className="feature-title">Pattern recognition, not schedules</div>
              <div className="feature-description">
                Log habits when you complete them. No streaks to break—Flux learns your natural patterns.
              </div>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="feature-content">
              <div className="feature-title">Watch your wealth grow</div>
              <div className="feature-description">
                Every logged habit adds to your portfolio. See your savings grow as your habits improve.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <button className="primary-button" onClick={onContinue}>
          Get Started
        </button>
        <button className="skip-button" onClick={onSkip}>
          Skip intro
        </button>
      </div>
    </div>
  );
}
