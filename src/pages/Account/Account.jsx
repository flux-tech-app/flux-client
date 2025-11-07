import { useHabits } from '../../context/HabitContext';
import Navigation from '../../components/Navigation';
import './Account.css';

export default function Account() {
  const { user, habits, logs, getTotalEarnings, getHabitStats, processTransfer, getPendingBalance } = useHabits();

  // Calculate stats
  const totalEarnings = getTotalEarnings();
  const activePositions = habits.length;
  
  // Get best streak across all habits
  const bestStreak = habits.reduce((max, habit) => {
    const stats = getHabitStats(habit.id);
    return Math.max(max, stats.currentStreak);
  }, 0);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleManualTransfer = () => {
    const pending = getPendingBalance();
    
    if (pending <= 0) {
      alert('No pending balance to transfer.');
      return;
    }

    const result = processTransfer();
    
    if (result.success) {
      alert(`Manual transfer completed!\n\nAmount: $${result.amount.toFixed(2)}\nThis has been moved to your portfolio balance.\n\nReload the page to see changes.`);
    } else {
      alert(result.message);
    }
  };

  const handleClearAllData = () => {
    const confirmClear = window.confirm(
      'Are you sure you want to clear ALL data?\n\n' +
      'This will delete:\n' +
      '• All habits\n' +
      '• All activity logs\n' +
      '• All transfers\n' +
      '• User profile\n\n' +
      'This action cannot be undone.'
    );

    if (confirmClear) {
      // Clear all localStorage keys
      localStorage.removeItem('flux_habits');
      localStorage.removeItem('flux_logs');
      localStorage.removeItem('flux_user');
      localStorage.removeItem('flux_transfers');
      localStorage.removeItem('flux_last_transfer');
      
      alert('All data cleared successfully!\n\nThe page will now reload.');
      
      // Reload to reset state
      window.location.href = '/';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(user.name || 'User')}
          </div>
          <div className="profile-name">{user.name || 'User'}</div>
          <div className="profile-email">{user.email || 'email@example.com'}</div>
          <button className="edit-profile-button">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{activePositions}</div>
            <div className="stat-label">Active Positions</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatCurrency(totalEarnings)}</div>
            <div className="stat-label">Total Earned</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{bestStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        {/* Developer Tools Section */}
        <div className="menu-section">
          <div className="section-title">Developer Tools</div>
          <div className="menu-items">
            <div className="menu-item" onClick={handleManualTransfer}>
              <div className="menu-icon orange">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Manual Transfer</div>
                <div className="menu-subtitle">Test transfer functionality</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="menu-item" onClick={handleClearAllData}>
              <div className="menu-icon red">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Clear All Data</div>
                <div className="menu-subtitle">Delete all habits and activity</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="dev-tools-note">
            This section is for testing only and will be removed before production.
          </div>
        </div>

        {/* Account Section */}
        <div className="menu-section">
          <div className="section-title">Account</div>
          <div className="menu-items">
            <div className="menu-item">
              <div className="menu-icon blue">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Bank Connection</div>
                <div className="menu-subtitle">Coming soon</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="menu-item">
              <div className="menu-icon green">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Transfer Schedule</div>
                <div className="menu-subtitle">Every Friday at 11:59 PM</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="menu-item">
              <div className="menu-icon purple">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Transaction History</div>
                <div className="menu-subtitle">View all transfers</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* App Section */}
        <div className="menu-section">
          <div className="section-title">App</div>
          <div className="menu-items">
            <div className="menu-item">
              <div className="menu-icon gray">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Settings</div>
                <div className="menu-subtitle">Preferences and notifications</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="menu-item">
              <div className="menu-icon gray">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Help & Support</div>
                <div className="menu-subtitle">FAQ, contact us</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="menu-item">
              <div className="menu-icon gray">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">About Flux</div>
                <div className="menu-subtitle">Mission, privacy, terms</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="version-info">
          Flux v1.0.0 • Made with intention
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
