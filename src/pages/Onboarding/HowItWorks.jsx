import React from 'react';
import './Onboarding.css';

function HowItWorks({ onContinue, onBack }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <div className="section-header">
          <h1 className="section-title">See how easy it is</h1>
          <p className="section-subtitle">
            Just tell Flux what you want to work on. No complicated setup required.
          </p>
        </div>

        {/* Chat Demo */}
        <div className="chat-demo">
          <div className="chat-messages">
            <div className="demo-message user-message">
              <div className="demo-avatar">Y</div>
              <div className="message-bubble">
                I want to start working out every morning
              </div>
            </div>

            <div className="demo-message">
              <div className="demo-avatar">F</div>
              <div className="message-bubble">
                Perfect! How much would you like to transfer to savings for each workout you complete?
              </div>
            </div>

            <div className="demo-message user-message">
              <div className="demo-avatar">Y</div>
              <div className="message-bubble">
                $10 sounds good
              </div>
            </div>

            <div className="demo-message">
              <div className="demo-avatar">F</div>
              <div className="message-bubble">
                Got it! I've set up your morning workout habit. You'll earn $10 per session, transferred directly to your savings. Ready to start today?
              </div>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="benefits-list">
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="benefit-text">
              Track any habit - fitness, reading, meditation, or breaking bad habits
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">
              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="benefit-text">
              Set your own transfer amounts - start small or go big
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">
              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="benefit-text">
              Get personalized coaching and insights as you build momentum
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">
              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="benefit-text">
              Watch your savings grow while you build better habits
            </div>
          </div>
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="button-group">
          <button className="secondary-button" onClick={onBack}>
            Back
          </button>
          <button className="primary-button" onClick={onContinue}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
