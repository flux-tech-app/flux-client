import { useState, useMemo } from 'react';
import { useHabits } from '../../context/HabitContext';
import Navigation from '../../components/Navigation';
import { formatCurrency, formatTime, formatDuration } from '../../utils/formatters';
import './Activity.css';

export default function Activity() {
  const { logs, habits, transfers, chatLogs, getHabitStats, updateLog, deleteLog } = useHabits();
  const [viewMode, setViewMode] = useState('habits'); // 'habits' | 'transfers'
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [expandedTransfers, setExpandedTransfers] = useState(new Set());
  const [selectedChat, setSelectedChat] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);

  // Toggle transfer breakdown
  const toggleTransferBreakdown = (transferId) => {
    setExpandedTransfers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transferId)) {
        newSet.delete(transferId);
      } else {
        newSet.add(transferId);
      }
      return newSet;
    });
  };

  // Open chat modal
  const openChatModal = (chatLog) => {
    setSelectedChat(chatLog);
  };

  // Close chat modal
  const closeChatModal = () => {
    setSelectedChat(null);
  };

  // Edit log handlers
  const openEditModal = (activity) => {
    // Convert activity back to log format for editing
    const log = logs.find(l => l.id === activity.id);
    if (log) {
      setEditingLog({
        ...log,
        habitName: activity.habitName,
        habitRateType: activity.habitRateType,
        habitRateAmount: habits.find(h => h.id === log.habitId)?.rateAmount || 0,
      });
    }
  };

  const closeEditModal = () => {
    setEditingLog(null);
  };

  const handleSaveEdit = (updatedData) => {
    if (!editingLog) return;

    // Recalculate earnings if value changed
    const earnings = editingLog.habitRateAmount * updatedData.value;

    updateLog(editingLog.id, {
      value: updatedData.value,
      duration: updatedData.duration,
      notes: updatedData.notes,
      totalEarnings: earnings,
    });

    closeEditModal();
  };

  // Delete log handlers
  const openDeleteConfirm = (activity) => {
    setDeletingLog(activity);
  };

  const closeDeleteConfirm = () => {
    setDeletingLog(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingLog) return;
    deleteLog(deletingLog.id);
    closeDeleteConfirm();
  };

  // Get date ranges for filtering
  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };

      case 'yesterday': {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      }

      case 'week': {
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: new Date(now.getTime() + 24 * 60 * 60 * 1000) };
      }

      case 'lastWeek': {
        const weekStart = new Date(today.getTime() - (today.getDay() + 7) * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: weekEnd };
      }

      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: new Date(now.getTime() + 24 * 60 * 60 * 1000) };
      }

      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  // Process habit logs with associated chat logs
  const enrichedActivities = useMemo(() => {
    const { start, end } = getDateRange(selectedFilter);

    // Process habit logs and find associated chat logs
    const habitActivities = logs
      .filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate < end;
      })
      .map(log => {
        const habit = habits.find(h => h.id === log.habitId);
        const stats = habit ? getHabitStats(habit.id) : null;

        // Find associated chat log (if chatLog has relatedLogId matching this log)
        const associatedChat = chatLogs.find(chat => chat.relatedLogId === log.id);

        // Debug: Log when we find an associated chat
        if (associatedChat) {
          console.log('Found associated chat for log:', log.id, associatedChat);
        }

        return {
          ...log,
          activityType: 'habit',
          habitName: habit?.name || 'Unknown Habit',
          habitType: habit?.type || 'build',
          habitRateType: habit?.rateType || 'completion',
          currentStreak: stats?.currentStreak || 0,
          associatedChat: associatedChat || null,
        };
      });

    // Debug: Log all chat logs and their relatedLogIds
    console.log('All chat logs:', chatLogs.map(c => ({ id: c.id, relatedLogId: c.relatedLogId })));
    console.log('All log IDs:', logs.map(l => l.id));

    // Sort by timestamp (most recent first)
    return habitActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [logs, chatLogs, habits, selectedFilter, getHabitStats]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups = {};

    enrichedActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dateKey = date.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          displayDate: getDateHeader(date),
          activities: [],
        };
      }

      groups[dateKey].activities.push(activity);
    });

    return Object.values(groups);
  }, [enrichedActivities]);

  // Get transfer breakdown by habit
  const getTransferBreakdown = (transfer) => {
    // Get the week range for this transfer
    const transferDate = new Date(transfer.date);
    const weekStart = new Date(transferDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Group logs by habit for this week
    const habitBreakdown = {};

    logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      if (logDate >= weekStart && logDate < transferDate) {
        const habit = habits.find(h => h.id === log.habitId);
        if (habit) {
          if (!habitBreakdown[habit.id]) {
            habitBreakdown[habit.id] = {
              name: habit.name,
              type: habit.type,
              count: 0,
              earnings: 0,
            };
          }
          habitBreakdown[habit.id].count++;
          habitBreakdown[habit.id].earnings += log.totalEarnings;
        }
      }
    });

    return Object.values(habitBreakdown).sort((a, b) => b.earnings - a.earnings);
  };

  // Format transfer date range
  const getTransferDateRange = (transferDate) => {
    const date = new Date(transferDate);
    const weekStart = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);

    return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Format date header
  function getDateHeader(date) {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return `Today • ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday • ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get activity description
  function getActivityDescription(activity) {
    const parts = [];

    // Add duration/completion info
    if (activity.habitRateType === 'duration' && activity.duration) {
      parts.push(`Completed ${formatDuration(activity.duration)} session`);
    } else {
      parts.push('Completed');
    }

    // Add streak if > 0
    if (activity.currentStreak > 0) {
      parts.push(`Streak: ${activity.currentStreak} day${activity.currentStreak !== 1 ? 's' : ''}`);
    }

    return parts.join(' • ');
  }

  // Sorted transfers (most recent first)
  const sortedTransfers = useMemo(() => {
    return [...transfers]
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transfers]);

  return (
    <div className="activity-page">
      <div className="activity-container">
        {/* Header */}
        <div className="activity-header">
          <div className="header-content">
            <h1 className="page-title">Activity</h1>
          </div>

          {/* Segmented Toggle */}
          <div className="segmented-control">
            <button
              className={`segment ${viewMode === 'habits' ? 'active' : ''}`}
              onClick={() => setViewMode('habits')}
            >
              Habits
            </button>
            <button
              className={`segment ${viewMode === 'transfers' ? 'active' : ''}`}
              onClick={() => setViewMode('transfers')}
            >
              Transfers
            </button>
          </div>

          {/* Date Filter Tabs (only show for habits view) */}
          {viewMode === 'habits' && (
            <div className="date-tabs">
              <button
                className={`date-tab ${selectedFilter === 'today' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('today')}
              >
                Today
              </button>
              <button
                className={`date-tab ${selectedFilter === 'yesterday' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('yesterday')}
              >
                Yesterday
              </button>
              <button
                className={`date-tab ${selectedFilter === 'week' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('week')}
              >
                This Week
              </button>
              <button
                className={`date-tab ${selectedFilter === 'lastWeek' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('lastWeek')}
              >
                Last Week
              </button>
              <button
                className={`date-tab ${selectedFilter === 'month' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('month')}
              >
                This Month
              </button>
            </div>
          )}
        </div>

        {/* HABITS VIEW */}
        {viewMode === 'habits' && (
          <div className="activity-feed">
            {groupedActivities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="empty-title">No activity yet</h3>
                <p className="empty-description">
                  {selectedFilter === 'today'
                    ? 'Start logging your habits to see your activity here'
                    : 'No activity found for this time period'}
                </p>
              </div>
            ) : (
              groupedActivities.map(group => (
                <div key={group.date} className="date-section">
                  <div className="date-header">{group.displayDate}</div>
                  <div className="activity-list">
                    {group.activities.map(activity => (
                      // HABIT LOG CARD
                      <div key={activity.id} className={`activity-card ${activity.associatedChat ? 'has-chat' : ''}`}>
                          <div className="activity-header-row">
                            <div className="activity-info">
                              <div className="activity-title">
                                {activity.habitName}
                                {activity.associatedChat && (
                                  <span className="flux-mini-badge">
                                    <span className="flux-mini-icon">F</span>
                                    via Flux
                                  </span>
                                )}
                              </div>
                              <div className="activity-meta">
                                <div className="activity-time">
                                  <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                  </svg>
                                  {formatTime(activity.timestamp)}
                                </div>
                                <span className={`activity-badge ${activity.habitType}`}>
                                  {activity.habitType === 'build' ? 'Build' : 'Resist'}
                                </span>
                              </div>
                            </div>
                            <div className="activity-amount-section">
                              <div className={`activity-amount ${activity.totalEarnings < 0 ? 'negative' : ''}`}>
                                {activity.totalEarnings >= 0 ? '+' : ''}{formatCurrency(activity.totalEarnings)}
                              </div>
                              <div className="activity-actions">
                                {activity.associatedChat && (
                                  <button
                                    className="activity-action-btn chat-btn"
                                    onClick={() => openChatModal(activity.associatedChat)}
                                    title="View chat conversation"
                                  >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                    </svg>
                                  </button>
                                )}
                                <button
                                  className="activity-action-btn edit-btn"
                                  onClick={() => openEditModal(activity)}
                                  title="Edit"
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                </button>
                                <button
                                  className="activity-action-btn delete-btn"
                                  onClick={() => openDeleteConfirm(activity)}
                                  title="Delete"
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="activity-description">
                            {getActivityDescription(activity)}
                          </div>
                          {activity.notes && (
                            <div className="activity-notes">
                              {activity.notes}
                            </div>
                          )}
                        </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TRANSFERS VIEW */}
        {viewMode === 'transfers' && (
          <div className="activity-feed">
            {sortedTransfers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </div>
                <h3 className="empty-title">No transfers yet</h3>
                <p className="empty-description">
                  Complete your weekly transfer to see your transfer history here
                </p>
              </div>
            ) : (
              <div className="transfers-list">
                {sortedTransfers.map(transfer => {
                  const breakdown = getTransferBreakdown(transfer);
                  const isExpanded = expandedTransfers.has(transfer.id);

                  return (
                    <div key={transfer.id} className="transfer-card">
                      <div className="transfer-card-header">
                        <div className="transfer-date-section">
                          <div className="transfer-date-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <div className="transfer-date-info">
                            <h3>{getTransferDateRange(transfer.date)}</h3>
                            <p>{new Date(transfer.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}</p>
                          </div>
                        </div>
                        <div className="transfer-amount-section">
                          <div className="transfer-amount-value">{formatCurrency(transfer.amount)}</div>
                          <div className="transfer-amount-label">Transferred</div>
                        </div>
                      </div>

                      <div className="transfer-meta">
                        <div className="transfer-route">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                          </svg>
                          Checking → Savings
                        </div>
                        <button
                          className="transfer-expand"
                          onClick={() => toggleTransferBreakdown(transfer.id)}
                        >
                          {isExpanded ? 'Hide details' : 'View details'}
                        </button>
                      </div>

                      {isExpanded && breakdown.length > 0 && (
                        <div className="transfer-breakdown">
                          <div className="transfer-breakdown-title">Breakdown</div>
                          {breakdown.map((item, index) => (
                            <div key={index} className="breakdown-row">
                              <span className="breakdown-label">
                                {item.name} ({item.count}×)
                              </span>
                              <span className="breakdown-value">{formatCurrency(item.earnings)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CHAT MODAL */}
      {selectedChat && (
        <div className="modal-overlay" onClick={closeChatModal}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <div className="chat-modal-title">
                <span className="flux-badge">
                  <span className="flux-icon">F</span>
                  FLUX
                </span>
                {selectedChat.title || 'Chat Conversation'}
              </div>
              <button className="close-modal-btn" onClick={closeChatModal}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="chat-modal-content">
              <div className="chat-timestamp">
                {new Date(selectedChat.timestamp).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
              <div className="chat-conversation">
                {selectedChat.conversation || selectedChat.preview}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLog && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon delete-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <h3>Delete Activity</h3>
              <p>Are you sure you want to delete this {deletingLog.habitName} activity? This action cannot be undone.</p>
            </div>
            <div className="confirm-modal-actions">
              <button className="confirm-btn cancel-btn" onClick={closeDeleteConfirm}>
                Cancel
              </button>
              <button className="confirm-btn delete-confirm-btn" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LOG MODAL */}
      {editingLog && <EditLogModal log={editingLog} onSave={handleSaveEdit} onClose={closeEditModal} />}

      <Navigation />
    </div>
  );
}

// EditLogModal Component
function EditLogModal({ log, onSave, onClose }) {
  const [formData, setFormData] = useState({
    value: log.value || 1,
    duration: log.duration || 0,
    notes: log.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>Edit Activity</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form className="edit-modal-content" onSubmit={handleSubmit}>
          <div className="edit-modal-habit-info">
            <div className="edit-modal-habit-name">{log.habitName}</div>
            <div className="edit-modal-habit-date">
              {new Date(log.timestamp).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>

          {log.habitRateType === 'duration' && (
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                id="duration"
                type="number"
                min="1"
                step="1"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                required
              />
            </div>
          )}

          {(log.habitRateType === 'per-minute' || log.habitRateType === 'per-rep') && (
            <div className="form-group">
              <label htmlFor="value">
                {log.habitRateType === 'per-minute' ? 'Minutes' : 'Reps'}
              </label>
              <input
                id="value"
                type="number"
                min="1"
                step="1"
                value={formData.value}
                onChange={(e) => handleChange('value', parseFloat(e.target.value))}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              rows="3"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add notes about this activity..."
            />
          </div>

          <div className="edit-modal-actions">
            <button type="button" className="edit-btn cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="edit-btn save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
