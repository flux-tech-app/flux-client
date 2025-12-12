import { useState } from 'react';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import './Settings.css';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="settings-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="settings-container">
        {/* Header */}
        <header className="settings-header">
          <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="settings-title">Settings</h1>
          <div className="header-spacer"></div>
        </header>

        {/* Account Section */}
        <div className="settings-section">
          <div className="section-title">Account</div>
          <div className="settings-item disabled">
            <span className="item-label">Bank Connection</span>
            <span className="item-value coming-soon">Coming Soon</span>
          </div>
          <div className="settings-item">
            <span className="item-label">Transfer Schedule</span>
            <span className="item-value">Fridays at 11:59 PM</span>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <div className="section-title">Preferences</div>
          <div className="settings-item disabled">
            <span className="item-label">Notifications</span>
            <span className="item-value coming-soon">Coming Soon</span>
          </div>
          <div className="settings-item disabled">
            <span className="item-label">Appearance</span>
            <span className="item-value coming-soon">Coming Soon</span>
          </div>
        </div>

        {/* Support Section */}
        <div className="settings-section">
          <div className="section-title">Support</div>
          <div className="settings-item">
            <span className="item-label">Help & FAQ</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="settings-item">
            <span className="item-label">Contact Us</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <div className="section-title">About</div>
          <div className="settings-item">
            <span className="item-label">Privacy Policy</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="settings-item">
            <span className="item-label">Terms of Service</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Version Info */}
        <div className="version-info">
          Flux v2.0.0
        </div>
      </div>
    </div>
  );
}
