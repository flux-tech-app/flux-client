import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHabits from "@/hooks/useHabits";
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, habits, logs, getTransferredBalance } = useHabits();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Calculate stats
  const totalEarned = getTransferredBalance();
  const totalLogs = logs.length;
  const activeHabits = habits.length;

  // Calculate member since
  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
    return 'Recently joined';
  };

  return (
    <div className="profile-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="profile-container">
        {/* Header */}
        <header className="profile-page-header">
          <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="profile-page-title">Profile</h1>
          <div className="header-spacer"></div>
        </header>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {getInitials(user?.name || 'User')}
          </div>
          <div className="profile-name-large">{user?.name || 'User'}</div>
          <div className="profile-email">{user?.email || 'Set up your profile'}</div>
          <div className="profile-member-since">Member since {getMemberSince()}</div>
          <button className="edit-profile-btn">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">${totalEarned.toFixed(2)}</div>
            <div className="stat-label">Total Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalLogs}</div>
            <div className="stat-label">Total Logs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activeHabits}</div>
            <div className="stat-label">Active Habits</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="menu-section">
          <div className="section-title">Quick Links</div>
          <div className="menu-items">
            <div className="menu-item" onClick={() => navigate('/activity')}>
              <div className="menu-icon blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Activity History</div>
                <div className="menu-subtitle">View all your logged activities</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="menu-item" onClick={() => navigate('/transfers')}>
              <div className="menu-icon green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Transfer History</div>
                <div className="menu-subtitle">View all your transfers</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
