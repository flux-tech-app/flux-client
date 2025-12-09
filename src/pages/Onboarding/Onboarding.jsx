import { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import Welcome from './Welcome';
import HowItWorks from './HowItWorks';
import SelectHabits from './SelectHabits';
import SetRates from './SetRates';
import Ready from './Ready';
import './Onboarding.css';

/**
 * Onboarding Flow - 5 Steps
 * 
 * 1. Welcome - Meet Flux introduction
 * 2. How It Works - Visual money flow explanation
 * 3. Select Habits - Browse and select from library
 * 4. Set Rates - Customize rates for selected habits
 * 5. Ready - Summary and launch
 */
export default function Onboarding({ onComplete }) {
  const { addHabits } = useHabits();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Track selected habits, their rates, and goals
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [habitRates, setHabitRates] = useState({});
  const [habitGoals, setHabitGoals] = useState({});

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Step 3: Select habits
  const handleHabitToggle = (libraryId) => {
    setSelectedHabits(prev => {
      if (prev.includes(libraryId)) {
        return prev.filter(id => id !== libraryId);
      } else {
        return [...prev, libraryId];
      }
    });
  };

  // Step 4: Set rates
  const handleRateChange = (libraryId, rate) => {
    setHabitRates(prev => ({
      ...prev,
      [libraryId]: rate
    }));
  };

  // Step 4: Set goals
  const handleGoalChange = (libraryId, goal) => {
    setHabitGoals(prev => ({
      ...prev,
      [libraryId]: goal
    }));
  };

  // Final step: Create habits and complete
  const handleComplete = () => {
    // Build habit configs with rates and goals
    const habitConfigs = selectedHabits.map(libraryId => ({
      libraryId,
      rate: habitRates[libraryId], // undefined will use default
      goal: habitGoals[libraryId] // Required - should always be set at this point
    }));

    // Add all habits
    addHabits(habitConfigs);

    // Complete onboarding
    onComplete();
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

      {/* Step Content */}
      {currentStep === 0 && (
        <Welcome 
          onContinue={handleNext} 
          onSkip={handleSkip}
        />
      )}
      
      {currentStep === 1 && (
        <HowItWorks 
          onContinue={handleNext}
          onBack={handleBack}
        />
      )}
      
      {currentStep === 2 && (
        <SelectHabits 
          selectedHabits={selectedHabits}
          onToggle={handleHabitToggle}
          onContinue={handleNext}
          onBack={handleBack}
        />
      )}
      
      {currentStep === 3 && (
        <SetRates
          selectedHabits={selectedHabits}
          habitRates={habitRates}
          habitGoals={habitGoals}
          onRateChange={handleRateChange}
          onGoalChange={handleGoalChange}
          onContinue={handleNext}
          onBack={handleBack}
        />
      )}
      
      {currentStep === 4 && (
        <Ready
          selectedHabits={selectedHabits}
          habitRates={habitRates}
          habitGoals={habitGoals}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
