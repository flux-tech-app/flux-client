import { useState, useMemo } from 'react';
import useHabits from "@/hooks/useHabits";
import { formatCurrency } from '../../utils/formatters';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import './Activity.css';

export default function Activity() {
  const { logs, habits, getHabitStats, updateLog, deleteLog } = useHabits();
  const chatLogs = []; // Placeholder for future chat feature
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [selectedChat, setSelectedChat] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper functions
  const getDateHeader = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateKey.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateKey.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  const getTimeFromDate = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Chat modal handlers
  const openChatModal = (chatLog) => {
    setSelectedChat(chatLog);
  };

  const closeChatModal = () => {
    setSelectedChat(null);
  };

  // Edit log handlers
  const openEditModal = (activity) => {
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

  // Process habit logs
  const enrichedActivities = useMemo(() => {
    const { start, end } = getDateRange(selectedFilter);

    const habitActivities = logs
      .filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate < end;
      })
      .map(log => {
        const habit = habits.find(h => h.id === log.habitId);
        const stats = habit ? getHabitStats(habit.id) : null;
        const associatedChat = chatLogs.find(chat => chat.relatedLogId === log.id);

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

  return (
    <div className="activity-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="activity-header">
        <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="activity-title">Activity</h1>
        <div className="header-spacer"></div>
      </header>

      <div className="activity-container">
        {/* HABIT ACTIVITY VIEW */}
        <div className="habits-view">
            {/* Time Filter Chips */}
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

            {/* Activity Feed */}
            <div className="activity-feed">
              {groupedActivities.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3>No activity yet</h3>
                  <p>Your logged habits will appear here</p>
                </div>
              ) : (
                groupedActivities.map(group => (
                  <div key={group.date} className="date-section">
                    <div className="date-header">{group.displayDate}</div>
                    <div className="activity-list">
                      {group.activities.map((activity, index) => (
                        <div 
                          key={`${activity.id}-${index}`} 
                          className={`activity-card ${activity.associatedChat ? 'has-chat' : ''}`}
                        >
                          <div className="activity-header-row">
                            <div className="activity-info">
                              <div className="activity-title">
                                {activity.associatedChat && (
                                  <span className="flux-mini-badge">
                                    <span className="flux-mini-icon">F</span>
                                    FLUX
                                  </span>
                                )}
                                {activity.habitName}
                              </div>
                              <div className="activity-meta">
                                <span className="activity-time">
                                  <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                  </svg>
                                  {getTimeFromDate(activity.timestamp)}
                                </span>
                              </div>
                              {activity.notes && (
                                <div className="activity-notes">{activity.notes}</div>
                              )}
                            </div>
                            <div className="activity-amount-section">
                              <div className="activity-amount">{formatCurrency(activity.totalEarnings)}</div>
                              <div className="activity-actions">
                                {activity.associatedChat && (
                                  <button
                                    className="activity-action-btn chat-btn"
                                    onClick={() => openChatModal(activity.associatedChat)}
                                    title="View chat"
                                  >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                    </svg>
                                  </button>
                                )}
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
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>

      {/* MODALS */}
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
    </div>
  );
}
