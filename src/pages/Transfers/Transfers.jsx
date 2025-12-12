import { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { formatCurrency } from '../../utils/formatters';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import './Transfers.css';

export default function Transfers() {
  const { logs, habits, transfers } = useHabits();
  const [expandedTransfers, setExpandedTransfers] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Get transfer breakdown
  const getTransferBreakdown = (transfer) => {
    const transferDate = new Date(transfer.date);
    const weekStart = new Date(transferDate.getTime() - 7 * 24 * 60 * 60 * 1000);
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

  // Calculate total transferred
  const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="transfers-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="transfers-header">
        <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="transfers-title">Transfers</h1>
        <div className="header-spacer"></div>
      </header>

      <div className="transfers-container">
        {/* Summary Card */}
        {transfers.length > 0 && (
          <div className="transfers-summary">
            <div className="summary-stat">
              <div className="summary-label">Total Transferred</div>
              <div className="summary-value">{formatCurrency(totalTransferred)}</div>
            </div>
            <div className="summary-stat">
              <div className="summary-label">Total Transfers</div>
              <div className="summary-value">{transfers.length}</div>
            </div>
          </div>
        )}

        {/* Transfers List */}
        {transfers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <h3>No transfers yet</h3>
            <p>Weekly transfers will appear here every Friday</p>
          </div>
        ) : (
          <div className="transfers-list">
            {transfers.map(transfer => {
              const breakdown = getTransferBreakdown(transfer);
              const isExpanded = expandedTransfers.has(transfer.id);

              return (
                <div key={transfer.id} className={`transfer-card ${isExpanded ? 'expanded' : ''}`}>
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
    </div>
  );
}
