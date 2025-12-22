// src\pages\LogActivity\LogActivity.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/Button';
import './LogActivity.css';

export default function LogActivity() {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const { habits, addLog } = useHabits();
  
  const habit = habits.find(h => h.id === habitId);

  const [formData, setFormData] = useState({
    duration: 30, // default duration in minutes
    topUpAmount: 0,
    includeTopUp: false,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // If habit not found, go back
    if (!habit) {
      navigate('/', { state: { direction: 'back' } });
    }
  }, [habit, navigate]);

  if (!habit) {
    return null;
  }

  const calculateEarnings = () => {
    let baseEarnings = 0;
    
    if (habit.type === 'build') {
      if (habit.rateType === 'duration') {
        baseEarnings = formData.duration * habit.rate;
      } else {
        // Completion - flat rate
        baseEarnings = habit.rate;
      }
    } else {
      // Break habit - always flat rate
      baseEarnings = habit.rate;
    }

    const topUp = formData.includeTopUp ? parseFloat(formData.topUpAmount) || 0 : 0;
    return { baseEarnings, topUp, total: baseEarnings + topUp };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const earnings = calculateEarnings();
    
    // Validation
    if (habit.type === 'build' && habit.rateType === 'duration') {
      if (formData.duration <= 0) {
        alert('Please enter a valid duration');
        return;
      }
    }

    if (formData.includeTopUp && formData.topUpAmount < 0) {
      alert('Top-up amount cannot be negative');
      return;
    }

    // Create the log
    addLog({
      habitId: habit.id,
      timestamp: formData.timestamp,
      duration: habit.rateType === 'duration' ? formData.duration : null,
      baseEarnings: earnings.baseEarnings,
      topUpAmount: earnings.topUp,
      totalEarnings: earnings.total
    });

    // Navigate back to portfolio with back direction
    navigate('/', { state: { direction: 'back' } });
  };

  const handleCancel = () => {
    navigate('/', { state: { direction: 'back' } });
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const earnings = calculateEarnings();
  const isBuildHabit = habit.type === 'build';
  const isDurationBased = habit.rateType === 'duration';

  return (
      <div className="log-activity-page">
        <div className="log-activity-container">
          {/* Header */}
          <header className="log-header">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <div className="header-title">
              {isBuildHabit ? 'Log Activity' : 'Log Resistance'}
            </div>
            <div className="placeholder" />
          </header>

          {/* Form Content */}
          <form className="log-content" onSubmit={handleSubmit}>
            
            {/* Habit Badge */}
            <div className="habit-badge">
              <div className={`habit-icon-large ${!isBuildHabit ? 'resist' : ''}`}>
                {isBuildHabit ? (
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="habit-name-large">{habit.name}</div>
            </div>

            {/* Build Habit - Duration Input */}
            {isBuildHabit && isDurationBased && (
              <div className="form-section">
                <label className="input-label">Duration</label>
                <div className="input-row">
                  <input
                    type="number"
                    className="number-input"
                    value={formData.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    min="1"
                    autoFocus
                  />
                  <span className="unit-label">minutes</span>
                </div>
                <div className="quick-buttons">
                  <Button variant="secondary" size="sm" onClick={() => updateField('duration', 15)}>15</Button>
                  <Button variant="secondary" size="sm" onClick={() => updateField('duration', 30)}>30</Button>
                  <Button variant="secondary" size="sm" onClick={() => updateField('duration', 45)}>45</Button>
                  <Button variant="secondary" size="sm" onClick={() => updateField('duration', 60)}>60</Button>
                </div>
              </div>
            )}

            {/* Build Habit - Completion (no input needed, just confirmation) */}
            {isBuildHabit && !isDurationBased && (
              <div className="completion-badge">
                <div className="completion-icon">
                  <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="completion-text">Mark this position as complete</div>
              </div>
            )}

            {/* Break Habit - Resistance Badge */}
            {!isBuildHabit && (
              <div className="resistance-badge">
                <div className="resistance-icon">
                  <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="resistance-text">Successfully Resisted</div>
              </div>
            )}

            {/* Break Habit - Base Earnings Display */}
            {!isBuildHabit && (
              <div className="base-earnings">
                <span className="base-label">Base Earnings</span>
                <span className="base-amount">{formatCurrency(earnings.baseEarnings)}</span>
              </div>
            )}

            {/* Break Habit - Optional Top-up */}
            {!isBuildHabit && habit.allowTopUp && (
              <div className="topup-section">
                <div 
                  className="topup-toggle" 
                  onClick={() => updateField('includeTopUp', !formData.includeTopUp)}
                >
                  <div className="topup-info">
                    <div className="topup-label">Add Money Saved</div>
                    <div className="topup-desc">How much money did you save?</div>
                  </div>
                  <div className={`toggle-switch ${formData.includeTopUp ? 'on' : ''}`}>
                    <div className="toggle-knob" />
                  </div>
                </div>
                
                {formData.includeTopUp && (
                  <div className="topup-input-group">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      className="topup-input"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={formData.topUpAmount}
                      onChange={(e) => updateField('topUpAmount', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Date/Time */}
            <div className="form-section">
              <label className="input-label">When?</label>
              <div className="datetime-grid">
                <input
                  type="date"
                  className="datetime-input"
                  value={formData.timestamp.split('T')[0]}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const currentDate = new Date(formData.timestamp);
                    date.setHours(currentDate.getHours(), currentDate.getMinutes());
                    updateField('timestamp', date.toISOString());
                  }}
                />
                <input
                  type="time"
                  className="datetime-input"
                  value={formData.timestamp.split('T')[1].slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const date = new Date(formData.timestamp);
                    date.setHours(parseInt(hours), parseInt(minutes));
                    updateField('timestamp', date.toISOString());
                  }}
                />
              </div>
            </div>

            {/* Earnings Preview */}
            <div className="earnings-preview">
              <div className="preview-label">You'll earn</div>
              <div className="preview-total">{formatCurrency(earnings.total)}</div>
              {!isBuildHabit && formData.includeTopUp && formData.topUpAmount > 0 && (
                <div className="preview-breakdown">
                  {formatCurrency(earnings.baseEarnings)} base + {formatCurrency(earnings.topUp)} saved
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="success" size="lg" fullWidth>
              {isBuildHabit ? 'Log Activity' : 'Log Resistance'}
            </Button>

          </form>
        </div>
      </div>
  );
}
