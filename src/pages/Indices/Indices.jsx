import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import './Indices.css';

export default function Indices() {
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Mock data for indices
  const userIndices = [
    {
      id: 'exercise',
      name: 'Exercise',
      value: '68.2%',
      change: '+2.4%',
      changePositive: true,
      participants: 1247,
      percentile: '87th',
      icon: 'trending'
    },
    {
      id: 'productivity',
      name: 'Productivity',
      value: '71.8%',
      change: '-1.2%',
      changePositive: false,
      participants: 892,
      percentile: '42nd',
      icon: 'check'
    },
    {
      id: 'recovery',
      name: 'Recovery',
      value: '76.9%',
      change: '+4.1%',
      changePositive: true,
      participants: 634,
      percentile: '96th',
      icon: 'activity'
    }
  ];

  const allIndices = [
    {
      id: 'nutrition',
      name: 'Nutrition',
      value: '81.5%',
      change: '+1.8%',
      changePositive: true,
      participants: 1103,
      isTracking: false,
      icon: 'food'
    },
    {
      id: 'financial',
      name: 'Financial',
      value: '69.3%',
      change: '+0.7%',
      changePositive: true,
      participants: 478,
      isTracking: false,
      icon: 'dollar'
    },
    {
      id: 'social',
      name: 'Social',
      value: '64.7%',
      change: '-2.3%',
      changePositive: false,
      participants: 312,
      isTracking: false,
      icon: 'users'
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      value: '78.4%',
      change: '+3.2%',
      changePositive: true,
      participants: 589,
      isTracking: false,
      icon: 'sun'
    }
  ];

  const getIcon = (iconType) => {
    const icons = {
      trending: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7"></path>
          <path d="M15 7h6v6"></path>
        </svg>
      ),
      check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      ),
      activity: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
      food: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      ),
      dollar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      users: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      sun: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l-4.2 4.2m10.4-8.2l-6 0m-6 0l-6 0m13.2 5.2l-4.2-4.2m0-6l-4.2-4.2"></path>
        </svg>
      )
    };
    return icons[iconType];
  };

  return (
    <div className="indices-page">
      <div className="indices-container">
        {/* Header */}
        <header className="indices-header">
          <h1 className="page-title">Indices</h1>
          <button className="icon-button" onClick={() => setShowInfoModal(true)}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </header>

        {/* Market Overview Banner */}
        <div className="market-overview">
          <div className="market-label">Flux Market Index</div>
          <div className="market-value">73.6%</div>
          <div className="market-change">
            <svg className="trend-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            </svg>
            +1.8% this week
          </div>
          <div className="market-subtitle">2,847 active users across all categories</div>
        </div>

        {/* Your Categories Section */}
        <div className="section-header">Your Categories</div>
        <div className="indices-list">
          {userIndices.map(index => (
            <div 
              key={index.id}
              className="index-item"
              onClick={() => navigate(`/indices/${index.id}`)}
            >
              <div className="index-icon">
                {getIcon(index.icon)}
              </div>
              <div className="index-info">
                <div className="index-header-row">
                  <span className="index-name">{index.name}</span>
                  <span className="your-badge">{index.percentile}</span>
                </div>
                <div className="index-meta">
                  {index.participants.toLocaleString()} participants
                </div>
              </div>
              <div className="index-value-section">
                <div className="index-value">{index.value}</div>
                <div className={`index-change ${index.changePositive ? 'positive' : 'negative'}`}>
                  <svg className="change-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points={index.changePositive ? "23 6 13.5 15.5 8.5 10.5 1 18" : "23 18 13.5 8.5 8.5 13.5 1 6"}></polyline>
                  </svg>
                  {index.change}
                </div>
              </div>
              <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          ))}
        </div>

        {/* All Categories Section */}
        <div className="section-header">All Categories</div>
        <div className="indices-list">
          {allIndices.map(index => (
            <div 
              key={index.id}
              className={`index-item ${!index.isTracking ? 'inactive' : ''}`}
              onClick={() => navigate(`/indices/${index.id}`)}
            >
              <div className="index-icon">
                {getIcon(index.icon)}
              </div>
              <div className="index-info">
                <div className="index-header-row">
                  <span className="index-name">{index.name}</span>
                </div>
                <div className="index-meta">
                  {index.participants.toLocaleString()} participants
                </div>
              </div>
              <div className="index-value-section">
                <div className="index-value">{index.value}</div>
                <div className={`index-change ${index.changePositive ? 'positive' : 'negative'}`}>
                  <svg className="change-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points={index.changePositive ? "23 6 13.5 15.5 8.5 10.5 1 18" : "23 18 13.5 8.5 8.5 13.5 1 6"}></polyline>
                  </svg>
                  {index.change}
                </div>
              </div>
              <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">About Indices</h3>
              <button className="modal-close" onClick={() => setShowInfoModal(false)}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Placeholder Notice */}
              <div className="placeholder-notice">
                <svg className="placeholder-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Placeholder data - Indices feature coming in Phase 2</span>
              </div>

              {/* Info Text */}
              <p className="modal-info-text">
                Indices compare your performance against other Flux users in specific habit categories. 
                Your percentile shows where you rank compared to all participants.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
