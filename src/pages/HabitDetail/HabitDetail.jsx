import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import { 
  calculateStreak, 
  calculateHabitStats,
  formatActivityTime 
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import HabitChart from '../../components/HabitChart';
import CalendarHeatmap from '../../components/CalendarHeatmap';
import BackButton from '../../components/BackButton';
import './HabitDetail.css';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, logs, updateHabit } = useHabits();
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editing state
  const [editForm, setEditForm] = useState({});
  
  const habit = habits.find(h => h.id === id);
  
  if (!habit) {
    return (
      <div className="habit-detail-page">
        <div className="error-container">
          <p>Habit not found</p>
          <button onClick={() => navigate('/', { state: { direction: 'back' } })}>Back to Portfolio</button>
        </div>
      </div>
    );
  }

  // Get all logs for this habit
  const habitLogs = logs.filter(log => log.habitId === habit.id);
  
  // Calculate statistics
  const lifetimeEarnings = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);
  const currentStreak = calculateStreak(logs, habit.id);
  const stats = calculateHabitStats(habitLogs);
  
  // Check if logged today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isLoggedToday = habitLogs.some(log => {
    const logDate = new Date(log.timestamp);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });

  // Get recent activity (last 20 logs)
  const recentActivity = habitLogs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);

  const isBuildHabit = habit.type === 'build';

  // Get rate data from actual structure
  const rateAmount = habit.rate || 0;
  const rateType = habit.rateType || 'completion';

  // Format rate type display
  const getRateTypeDisplay = (type) => {
    const types = {
      'completion': 'Completion',
      'duration': 'Per Minute',
      'minute': 'Per Minute',
      'unit': 'Per Unit',
      'calorie': 'Per Calorie'
    };
    return types[type] || 'Completion';
  };

  // Format rate unit
  const getRateUnit = (type) => {
    const units = {
      'duration': 'minute',
      'minute': 'minute',
      'unit': 'unit',
      'calorie': 'calorie'
    };
    return units[type] || '';
  };

  // Start editing
  const startEditing = () => {
    setEditForm({
      name: habit.name,
      rateType: habit.rateType,
      rate: habit.rate,
      allowTopUp: habit.allowTopUp || false
    });
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  // Save changes
  const saveChanges = () => {
    // Update habit with new values
    const updates = {
      name: editForm.name,
      rateType: editForm.rateType,
      rate: parseFloat(editForm.rate),
      allowTopUp: editForm.allowTopUp
    };
    
    updateHabit(habit.id, updates);
    setIsEditing(false);
    setEditForm({});
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="habit-detail-page">
      <div className="habit-detail-container">
        {/* Header */}
        <header className="detail-header">
          <BackButton to="/" />
          <h1 className="header-title">Position Details</h1>
          <button className="menu-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <h2 className="habit-name-large">{habit.name}</h2>
          <div className="total-earned">
            <div className="earned-amount">{formatCurrency(lifetimeEarnings)}</div>
            <span className="earned-label">lifetime earnings</span>
          </div>
          {isLoggedToday && (
            <div className="today-status">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Completed today</span>
            </div>
          )}
        </section>

        {/* Toggle Chart */}
        <HabitChart habit={habit} logs={habitLogs} />

        {/* Calendar Heatmap */}
        <CalendarHeatmap habit={habit} logs={habitLogs} />

        {/* Streaks Section */}
        <section className="streaks-section">
          <h2 className="section-title">Streaks</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{currentStreak}</div>
              <div className="stat-label">Current</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.longestStreak || 0}</div>
              <div className="stat-label">Longest</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.weekCount || 0}/7</div>
              <div className="stat-label">This week</div>
            </div>
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="activity-section">
          <h2 className="section-title">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.map((log) => (
                <div key={log.id} className="activity-item">
                  <div className="activity-icon">
                    {isBuildHabit ? (
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="activity-info">
                    <div className="activity-title">
                      {log.amount ? `${log.amount} ${log.unit || 'minutes'}` : 'Completed'}
                    </div>
                    <div className="activity-time">{formatActivityTime(log.timestamp)}</div>
                  </div>
                  <div className="activity-amount">
                    +{formatCurrency(log.totalEarnings || 0)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="activity-empty">
              <p>No activity logged yet</p>
            </div>
          )}
        </section>

        {/* Position Details Section */}
        <section className="details-section">
          <div 
            className="details-header" 
            onClick={() => !isEditing && setDetailsExpanded(!detailsExpanded)}
          >
            <h2 className="details-title">Position Details</h2>
            {!isEditing && (
              <svg 
                className={`chevron ${detailsExpanded ? 'open' : ''}`} 
                width="20" 
                height="20" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {detailsExpanded && (
            <div className="details-content">
              {!isEditing ? (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Habit Type</span>
                    <span className="detail-value">
                      {isBuildHabit ? 'Build Habit' : 'Break Habit'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Rate Type</span>
                    <span className="detail-value">{getRateTypeDisplay(rateType)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Rate Amount</span>
                    <span className="detail-value">
                      {formatCurrency(rateAmount)}
                      {rateType !== 'completion' && ` / ${getRateUnit(rateType)}`}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">Active</span>
                  </div>
                  {!isBuildHabit && (
                    <div className="detail-row">
                      <span className="detail-label">Top-up Enabled</span>
                      <span className="detail-value">{habit.allowTopUp ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  <button className="edit-button" onClick={startEditing}>
                    Edit Position
                  </button>
                </>
              ) : (
                <div className="edit-form">
                  <div className="edit-field">
                    <label className="edit-label">Habit Name</label>
                    <input 
                      type="text"
                      className="edit-input"
                      value={editForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="edit-field">
                    <label className="edit-label">Rate Type</label>
                    <select 
                      className="edit-select"
                      value={editForm.rateType}
                      onChange={(e) => handleFormChange('rateType', e.target.value)}
                    >
                      <option value="completion">Completion</option>
                      <option value="duration">Per Minute</option>
                      <option value="unit">Per Unit</option>
                      <option value="calorie">Per Calorie</option>
                    </select>
                  </div>

                  <div className="edit-field">
                    <label className="edit-label">Rate Amount</label>
                    <div className="currency-input-group">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number"
                        className="edit-input currency-input"
                        value={editForm.rate}
                        onChange={(e) => handleFormChange('rate', e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {!isBuildHabit && (
                    <div className="edit-field checkbox-field">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox"
                          checked={editForm.allowTopUp}
                          onChange={(e) => handleFormChange('allowTopUp', e.target.checked)}
                        />
                        <span>Allow top-up entries</span>
                      </label>
                    </div>
                  )}

                  <div className="edit-actions">
                    <button className="cancel-button" onClick={cancelEditing}>
                      Cancel
                    </button>
                    <button className="save-button" onClick={saveChanges}>
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
