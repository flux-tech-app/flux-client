import Button from '../../components/Button';
import './Onboarding.css';

/**
 * How It Works Screen - Step 2
 * Professional explanation with visual money flow
 */
export default function HowItWorks({ onContinue, onBack }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <div className="section-header">
          <h1 className="section-title">How It Works</h1>
          <p className="section-subtitle">
            A simple cycle that turns daily habits into real savings
          </p>
        </div>

        {/* Visual Flow - Clean, no emojis */}
        <div className="flow-visual">
          <div className="flow-step-card">
            <div className="flow-step-number">1</div>
            <div className="flow-step-content">
              <div className="flow-step-title">Complete & Log</div>
              <div className="flow-step-desc">Finish a habit, tap to log it</div>
            </div>
          </div>
          
          <div className="flow-connector">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="flow-step-card">
            <div className="flow-step-number">2</div>
            <div className="flow-step-content">
              <div className="flow-step-title">Earn to Pending</div>
              <div className="flow-step-desc">Earnings accumulate through the week</div>
            </div>
          </div>
          
          <div className="flow-connector">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="flow-step-card highlight">
            <div className="flow-step-number">3</div>
            <div className="flow-step-content">
              <div className="flow-step-title">Friday Transfer</div>
              <div className="flow-step-desc">Pending moves to transferred savings</div>
            </div>
          </div>
        </div>

        {/* Benefits List - Clean checkmarks */}
        <div className="benefits-list">
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="benefit-text">
              Track fitness, productivity, wellness, and financial habits
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="benefit-text">
              Set your own rates—start small or go big
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="benefit-text">
              No guilt, no streaks—Flux learns your natural patterns
            </div>
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="button-group">
          <Button variant="secondary" size="lg" onClick={onBack} className="onboarding-back">
            Back
          </Button>
          <Button variant="primary" size="lg" onClick={onContinue} className="onboarding-continue">
            Choose Habits
          </Button>
        </div>
      </div>
    </div>
  );
}
