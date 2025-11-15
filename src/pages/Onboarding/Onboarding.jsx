import React, { useState } from 'react';
import Welcome from './Welcome';
import HowItWorks from './HowItWorks';
import './Onboarding.css';

function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 2;

  const handleContinue = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="onboarding-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        {[...Array(totalSteps)].map((_, index) => (
          <div
            key={index}
            className={`progress-dot ${index <= currentStep ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Screens */}
      {currentStep === 0 && (
        <Welcome 
          onContinue={handleContinue} 
          onSkip={onComplete}
        />
      )}
      
      {currentStep === 1 && (
        <HowItWorks 
          onContinue={onComplete}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default Onboarding;
