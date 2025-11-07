import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import { 
  calculateStreak, 
  calculateHabitStats,
  getActivityChartData,
  formatActivityTime 
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import './HabitDetail.css';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, logs, updateHabit } = useHabits();
  const [chartPeriod, setChartPeriod] = useState('30D');
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBarData, setSelectedBarData] = useState(null);
  
  // Editing state
  const [editForm, setEditForm] = useState({});
  
  const habit = habits.find(h => h.id === id);
  
  if (!habit) {
    return (
      <div className="habit-detail-page">
        <div className="error-container">
          <p>Habit not found</p>
          <button onClick={() => navigate('/')}>Back to Portfolio</button>
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
  const chartData = getActivityChartData(habitLogs, chartPeriod);
  
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

  // Handle bar click
  const handleBarClick = (barIndex) => {
    if (chartData.length === 0) return;

    const bar = chartData[barIndex];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    let startDate = new Date(now);
    let daysPerBar = 1;
    
    // Calculate date range based on period
    switch (chartPeriod) {
      case '30D':
        startDate.setDate(now.getDate() - 30);
        daysPerBar = 1;
        break;
      case '90D':
        startDate.setDate(now.getDate() - 90);
        daysPerBar = 3;
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        daysPerBar = 7;
        break;
      case 'All':
        const sortedLogs = [...habitLogs].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        startDate = new Date(sortedLogs[0].timestamp);
        startDate.setHours(0, 0, 0, 0);
        const totalDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
        daysPerBar = Math.max(1, Math.ceil(totalDays / chartData.length));
        break;
    }

    // Calculate date range for this bar
    const barStartDate = new Date(startDate);
    barStartDate.setDate(barStartDate.getDate() + (barIndex * daysPerBar));
    
    const barEndDate = new Date(barStartDate);
    barEndDate.setDate(barStartDate.getDate() + daysPerBar - 1);

    // Get logs for this date range
    const barLogs = habitLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate >= barStartDate && logDate <= barEndDate;
    });

    // Calculate total earned for this period
    const totalEarned = barLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);

    // Format date range
    let dateRangeText;
    if (daysPerBar === 1) {
      if (barStartDate.toDateString() === now.toDateString()) {
        dateRangeText = 'Today';
      } else if (barStartDate.toDateString() === new Date(now.getTime() - 24*60*60*1000).toDateString()) {
        dateRangeText = 'Yesterday';
      } else {
        dateRangeText = barStartDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } else {
      const startStr = barStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = barEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateRangeText = `${startStr} - ${endStr}`;
    }

    setSelectedBarData({
      dateRange: dateRangeText,
      logs: barLogs,
      totalEarned,
      count: bar.count
    });
  };

  // Close bar detail modal
  const closeBarDetail = () => {
    setSelectedBarData(null);
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
          <button className="back-button" onClick={() => navigate('/')}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="header-title">Position Details</div>
          <button className="menu-button" onClick={(e) => e.stopPropagation()}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="habit-name-large">{habit.name}</h1>
          <div className="total-earned">
            <span className="earned-amount">{formatCurrency(lifetimeEarnings)}</span>
            <span className="earned-label">lifetime earnings</span>
          </div>
          {isLoggedToday && (
            <div className="today-status">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{isBuildHabit ? 'Completed today' : 'Resisted today'}</span>
            </div>
          )}
        </section>

        {/* Activity Chart Section */}
        <section className="chart-section">
          <h2 className="section-title">Activity</h2>
          <div className="chart-controls">
            <button 
              className={`chart-toggle ${chartPeriod === '30D' ? 'active' : ''}`}
              onClick={() => setChartPeriod('30D')}
            >
              30D
            </button>
            <button 
              className={`chart-toggle ${chartPeriod === '90D' ? 'active' : ''}`}
              onClick={() => setChartPeriod('90D')}
            >
              90D
            </button>
            <button 
              className={`chart-toggle ${chartPeriod === '1Y' ? 'active' : ''}`}
              onClick={() => setChartPeriod('1Y')}
            >
              1Y
            </button>
            <button 
              className={`chart-toggle ${chartPeriod === 'All' ? 'active' : ''}`}
              onClick={() => setChartPeriod('All')}
            >
              All
            </button>
          </div>
          <div className="chart-container">
            {chartData.length > 0 ? (
              chartData.map((dataPoint, index) => (
                <div
                  key={index}
                  className={`chart-bar ${dataPoint.isToday ? 'active' : ''}`}
                  style={{ height: `${dataPoint.percentage}%` }}
                  title={`${dataPoint.count} log${dataPoint.count !== 1 ? 's' : ''}`}
                  onClick={() => handleBarClick(index)}
                />
              ))
            ) : (
              <div className="chart-empty">No activity data for this period</div>
            )}
          </div>
        </section>

        {/* Streaks Section */}
        <section className="streaks-section">
          <h2 className="section-title">Streaks</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{currentStreak}</div>
              <div className="stat-label">Current</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.longestStreak}</div>
              <div className="stat-label">Longest</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.thisWeekCount}/{stats.thisWeekTotal}</div>
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

      {/* Bar Detail Bottom Sheet */}
      {selectedBarData && (
        <>
          <div className="modal-overlay" onClick={closeBarDetail} />
          <div className="bar-detail-sheet">
            <div className="sheet-header">
              <h3 className="sheet-title">{selectedBarData.dateRange}</h3>
              <button className="sheet-close" onClick={closeBarDetail}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="sheet-summary">
              <div className="summary-item">
                <div className="summary-label">Total Logs</div>
                <div className="summary-value">{selectedBarData.count}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Total Earned</div>
                <div className="summary-value earned">{formatCurrency(selectedBarData.totalEarned)}</div>
              </div>
            </div>

            {selectedBarData.logs.length > 0 && (
              <div className="sheet-logs">
                <h4 className="sheet-subtitle">Activity</h4>
                <div className="sheet-logs-list">
                  {selectedBarData.logs.map(log => (
                    <div key={log.id} className="sheet-log-item">
                      <div className="sheet-log-info">
                        <div className="sheet-log-title">
                          {log.amount ? `${log.amount} ${log.unit || 'minutes'}` : 'Completed'}
                        </div>
                        <div className="sheet-log-time">{formatActivityTime(log.timestamp)}</div>
                      </div>
                      <div className="sheet-log-amount">
                        +{formatCurrency(log.totalEarnings || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
