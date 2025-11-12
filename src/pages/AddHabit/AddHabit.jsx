import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import PageTransition from '../../components/PageTransition';
import './AddHabit.css';

export default function AddHabit() {
  const navigate = useNavigate();
  const { addHabit } = useHabits();

  const [formData, setFormData] = useState({
    name: '',
    type: 'build',
    rateType: 'duration',
    rate: 0.05,
    allowTopUp: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a position name');
      return;
    }

    if (parseFloat(formData.rate) <= 0) {
      alert('Please enter a valid rate amount');
      return;
    }

    // Create the habit - different structure for build vs break
    const habitData = {
      name: formData.name.trim(),
      type: formData.type,
      rate: parseFloat(formData.rate),
      createdAt: new Date().toISOString()
    };

    // Only add rateType for build habits
    if (formData.type === 'build') {
      habitData.rateType = formData.rateType;
    }

    // Only add allowTopUp for break habits
    if (formData.type === 'break') {
      habitData.allowTopUp = formData.allowTopUp;
    }

    addHabit(habitData);

    // Navigate back to portfolio with back direction
    navigate('/', { state: { direction: 'back' } });
  };

  const handleCancel = () => {
    navigate('/', { state: { direction: 'back' } });
  };

  const updateField = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-adjust rate type when switching between build/break
      if (field === 'type') {
        if (value === 'build') {
          updated.rateType = 'duration';
          updated.rate = 0.05;
          updated.allowTopUp = false;
        } else {
          // Break habits don't have rateType, just flat rate
          updated.rate = 1.00;
          updated.allowTopUp = false;
        }
      }
      
      return updated;
    });
  };

  // Calculate weekly earnings estimate - ensure rate is a number
  const weeklyEstimate = () => {
    const rate = parseFloat(formData.rate) || 0;
    if (formData.type === 'build' && formData.rateType === 'duration') {
      return rate * 30 * 7; // 30 min/day * 7 days
    } else if (formData.type === 'build' && formData.rateType === 'completion') {
      return rate * 7; // 1x/day * 7 days
    } else {
      // Break habits - flat rate per day
      return rate * 7; // resist 1x/day * 7 days
    }
  };

  const isValid = formData.name.trim().length > 0 && parseFloat(formData.rate) > 0;
  
  // Ensure rate is always a number for display
  const displayRate = parseFloat(formData.rate) || 0;

  return (
    <PageTransition>
      <div className="add-habit-page">
        <div className="add-habit-container">
          {/* Header */}
          <header className="add-header">
            <div className="header-left">
              <button className="back-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
            <div className="header-title">Add Position</div>
            <button 
              className="save-button" 
              onClick={handleSubmit}
              disabled={!isValid}
            >
              Create
            </button>
          </header>

          {/* Form Content */}
          <form className="form-content" onSubmit={handleSubmit}>
            
            {/* Habit Type */}
            <div className="form-section">
              <div className="section-label">Position Type</div>
              <div className="type-toggle">
                <div 
                  className={`type-option ${formData.type === 'build' ? 'selected' : ''}`}
                  onClick={() => updateField('type', 'build')}
                >
                  <div className="type-icon">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="type-title">Build</div>
                  <div className="type-desc">Positive habits to do</div>
                </div>
                <div 
                  className={`type-option ${formData.type === 'break' ? 'selected' : ''}`}
                  onClick={() => updateField('type', 'break')}
                >
                  <div className="type-icon">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="type-title">Break</div>
                  <div className="type-desc">Habits to resist</div>
                </div>
              </div>
            </div>

            {/* Habit Name */}
            <div className="form-section">
              <div className="section-label">Position Details</div>
              <div className="input-group">
                <label className="input-label">Position Name</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder={formData.type === 'build' ? 'e.g. Morning Cardio' : 'e.g. Resist Doordash'}
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  autoFocus
                />
                <div className="input-helper">
                  Choose a clear, specific name for your position
                </div>
              </div>
            </div>

            {/* Rate Type (only for build habits) */}
            {formData.type === 'build' && (
              <div className="form-section">
                <div className="section-label">Rate Structure</div>
                <div className="rate-options">
                  <div 
                    className={`rate-option ${formData.rateType === 'duration' ? 'selected' : ''}`}
                    onClick={() => updateField('rateType', 'duration')}
                  >
                    <div className="rate-option-title">Per Minute</div>
                    <div className="rate-option-desc">Track duration</div>
                  </div>
                  <div 
                    className={`rate-option ${formData.rateType === 'completion' ? 'selected' : ''}`}
                    onClick={() => updateField('rateType', 'completion')}
                  >
                    <div className="rate-option-title">Flat Rate</div>
                    <div className="rate-option-desc">Per completion</div>
                  </div>
                </div>
              </div>
            )}

            {/* Base Rate */}
            <div className="form-section">
              <div className="section-label">Base Rate</div>
              <div className="input-group">
                <label className="input-label">
                  {formData.type === 'build' && formData.rateType === 'duration' 
                    ? 'Amount Per Minute'
                    : 'Amount Per Completion'
                  }
                </label>
                <div className="amount-input-group">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    className="amount-input"
                    step="0.01"
                    min="0.01"
                    max="10"
                    value={formData.rate}
                    onChange={(e) => updateField('rate', e.target.value)}
                  />
                  {formData.type === 'build' && formData.rateType === 'duration' && (
                    <span className="per-label">/ min</span>
                  )}
                </div>
                <div className="input-helper">
                  Keep rates small for sustainable motivation
                </div>
              </div>
            </div>

            {/* Top-up Toggle (only for break habits) */}
            {formData.type === 'break' && (
              <div className="topup-section">
                <div className="topup-header">
                  <div className="topup-title">Allow Money Saved Top-up</div>
                  <div 
                    className={`toggle-switch ${formData.allowTopUp ? 'on' : ''}`}
                    onClick={() => updateField('allowTopUp', !formData.allowTopUp)}
                  >
                    <div className="toggle-knob" />
                  </div>
                </div>
                <div className="topup-desc">
                  When logging resistance, optionally add the money you saved (e.g., $28.50 for skipped Doordash)
                </div>
              </div>
            )}

            {/* Preview Card */}
            <div className="form-section">
              <div className="section-label">Preview</div>
              <div className="preview-card">
                <div className="preview-label">How this position will appear:</div>
                <div className="preview-habit-name">
                  {formData.name || 'Position Name'}
                </div>
                <div className="preview-details">
                  {formData.type === 'build' 
                    ? formData.rateType === 'duration'
                      ? `$${displayRate.toFixed(2)}/min`
                      : `$${displayRate.toFixed(2)} per completion`
                    : `$${displayRate.toFixed(2)} per resistance${formData.allowTopUp ? ' + optional top-up' : ''}`
                  }
                </div>
                <div className="preview-estimate">
                  Weekly earnings estimate:
                  <div className="preview-amount">
                    ${weeklyEstimate().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="info-card">
              <div className="info-title">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Tip
              </div>
              <div className="info-text">
                Start with small rates. Even $0.05/min for exercise adds up to $10.50/week for daily 30-minute sessions.
              </div>
            </div>

          </form>
        </div>
      </div>
    </PageTransition>
  );
}
