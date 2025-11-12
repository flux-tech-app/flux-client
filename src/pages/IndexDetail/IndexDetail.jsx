import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './IndexDetail.css';

export default function IndexDetail() {
  const navigate = useNavigate();
  const { indexId } = useParams();
  const [selectedPeriod, setSelectedPeriod] = useState('1W');
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Mock data - would be fetched based on indexId
  const indexData = {
    name: 'Exercise Index',
    value: '68.2%',
    change: '+2.4%',
    changeAmount: '+1.6pp',
    changePositive: true,
    participants: 1247,
    userScore: '82.5%',
    percentile: '87th',
    percentileLabel: 'Strong',
    high: { value: '70.8%', date: 'Nov 8' },
    low: { value: '64.3%', date: 'Oct 29' },
    avgDifficulty: '3.2',
    activeHabits: '2,891',
    description: 'The Exercise Index tracks completion rates across all physical activity habits on Flux. This includes cardio, strength training, sports, and active recovery activities.',
    subcategories: ['Cardio', 'Strength', 'Flexibility', 'Sports', 'Active Recovery']
  };

  const periods = ['1W', '1M', '3M', '6M', '1Y', 'All'];

  return (
    <div className="index-detail-page">
      <div className="index-detail-container">
        {/* Header */}
        <header className="detail-header">
          <button className="back-button" onClick={() => navigate('/indices')}>
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h1 className="header-title">{indexData.name}</h1>
          <button className="info-button" onClick={() => setShowInfoModal(true)}>
            <svg className="info-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </header>

        {/* Index Value Section */}
        <div className="index-value-section">
          <div className="index-value-large">{indexData.value}</div>
          <div className={`index-change-large ${indexData.changePositive ? 'positive' : 'negative'}`}>
            <svg className="change-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points={indexData.changePositive ? "23 6 13.5 15.5 8.5 10.5 1 18" : "23 18 13.5 8.5 8.5 13.5 1 6"}></polyline>
            </svg>
            {indexData.change} ({indexData.changeAmount})
          </div>
          <div className="period-label">This week • {indexData.participants.toLocaleString()} participants</div>
        </div>

        {/* Chart Section */}
        <div className="chart-section">
          <div className="chart-container">
            <svg className="chart-svg" viewBox="0 0 360 280" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              
              <path className="chart-area" d="M 20 200 L 70 175 L 120 160 L 170 180 L 220 165 L 270 150 L 320 130 L 340 120 L 340 280 L 20 280 Z"></path>
              <path className="chart-line" d="M 20 200 L 70 175 L 120 160 L 170 180 L 220 165 L 270 150 L 320 130 L 340 120"></path>
              <circle className="chart-dot" cx="340" cy="120" r="6"></circle>
            </svg>
          </div>

          {/* Time Period Selector */}
          <div className="time-period">
            {periods.map(period => (
              <button
                key={period}
                className={`period-button ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">High</div>
            <div className="stat-value">{indexData.high.value}</div>
            <div className="stat-sublabel">{indexData.high.date}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Low</div>
            <div className="stat-value">{indexData.low.value}</div>
            <div className="stat-sublabel">{indexData.low.date}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Difficulty</div>
            <div className="stat-value">{indexData.avgDifficulty}</div>
            <div className="stat-sublabel">Out of 5</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Habits</div>
            <div className="stat-value">{indexData.activeHabits}</div>
            <div className="stat-sublabel">Being tracked</div>
          </div>
        </div>

        {/* Performance Comparison Section */}
        <div className="comparison-section">
          <div className="comparison-header">
            <svg className="comparison-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            Your Performance
          </div>

          <div className="comparison-row">
            <span className="comparison-label">Your Success Rate</span>
            <span className="comparison-value">{indexData.userScore}</span>
          </div>

          <div className="comparison-bar-container">
            <div className="comparison-bar-fill" style={{ width: indexData.userScore }}></div>
            <div className="comparison-marker" style={{ left: indexData.value }}></div>
          </div>

          <div className="percentile-badge-large">
            <div className="percentile-info">
              <div className="percentile-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"></path>
                </svg>
              </div>
              <div className="percentile-text">
                <div className="percentile-label-large">Your Percentile</div>
                <div className="percentile-value-large">{indexData.percentile}</div>
              </div>
            </div>
            <div className="percentile-badge-text">{indexData.percentileLabel}</div>
          </div>
        </div>

        {/* Category Info Section */}
        <div className="category-info">
          <div className="info-header">About {indexData.name}</div>
          <div className="info-text">{indexData.description}</div>
          <div className="subcategories">
            {indexData.subcategories.map(sub => (
              <span key={sub} className="subcategory-chip">{sub}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">About {indexData.name}</h3>
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
              <p className="modal-info-text">{indexData.description}</p>
              
              {/* Subcategories */}
              <div className="modal-subcategories-label">Included Categories:</div>
              <div className="subcategories">
                {indexData.subcategories.map(sub => (
                  <span key={sub} className="subcategory-chip">{sub}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
