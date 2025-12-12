import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import { HABIT_LIBRARY, ACTION_TYPES } from '../../utils/HABIT_LIBRARY';
import { getIndexData, generateDefaultIndexData, hasIndexData } from '../../utils/indexDataGenerator';
import Sparkline from '../../components/Sparkline';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import './Indices.css';

export default function Indices() {
  const navigate = useNavigate();
  const { habits } = useHabits();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [indexData, setIndexData] = useState(null);

  // Load index data on mount (don't auto-generate)
  useEffect(() => {
    if (hasIndexData()) {
      setIndexData(getIndexData());
    }
  }, []);

  // Get LOG behaviors from library
  const logBehaviors = HABIT_LIBRARY.filter(b => b.actionType === ACTION_TYPES.LOG);

  // Build index list with user habit matching
  const indices = logBehaviors.map(behavior => {
    const behaviorIndexData = indexData?.behaviors?.[behavior.id];
    const userHabit = habits.find(h => h.libraryId === behavior.id);

    return {
      id: behavior.id,
      name: behavior.name,
      indexAverage: behaviorIndexData?.indexAverage || 70,
      change: behaviorIndexData?.change || 0,
      participants: behaviorIndexData?.participants || 0,
      history: behaviorIndexData?.history || [],
      userHabit,
      userPercentile: userHabit ? Math.round(5 + Math.random() * 40) : null
    };
  });

  // Split into user's indices and discover indices
  const userIndices = indices.filter(idx => idx.userHabit);
  const discoverIndices = indices.filter(idx => !idx.userHabit);

  return (
    <div className="indices-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="indices-container">
        {/* Header */}
        <header className="indices-header">
          <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="page-title">Indices</h1>
          <button className="icon-button" onClick={() => setShowInfoModal(true)}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </header>

        {/* Empty State when no index data */}
        {!indexData && (
          <div className="indices-empty-state">
            <div className="indices-empty-icon">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 className="indices-empty-title">No Index Data</h3>
            <p className="indices-empty-text">
              Community index data hasn't been loaded. Use Developer Tools to generate example data.
            </p>
          </div>
        )}

        {/* Your Indices Section */}
        {indexData && userIndices.length > 0 && (
          <div className="indices-section">
            <div className="section-header-row">
              <span className="section-title">Your Indices</span>
              <span className="example-data-badge">Example Data</span>
            </div>
            <div className="indices-list">
              {userIndices.map((index) => (
                <div
                  key={index.id}
                  className="index-row"
                  onClick={() => navigate(`/indices/${index.id}`)}
                >
                  <div className="index-info">
                    <div className="index-name">{index.name}</div>
                    <div className="index-meta">{index.participants.toLocaleString()} tracking</div>
                  </div>

                  <Sparkline
                    data={index.history}
                    width={56}
                    height={24}
                    positive={index.change >= 0}
                  />

                  <div className="index-value-section">
                    <div className="index-value">{index.indexAverage.toFixed(1)}</div>
                    <div className={`index-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                      {index.change >= 0 ? '+' : ''}{index.change.toFixed(1)}
                    </div>
                  </div>

                  {index.userPercentile && (
                    <span className="percentile-badge">Top {index.userPercentile}%</span>
                  )}

                  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discover Indices Section */}
        {indexData && (
        <div className="indices-section">
          <div className="section-header-row">
            <span className="section-title">Discover Indices</span>
            {userIndices.length === 0 && <span className="example-data-badge">Example Data</span>}
          </div>
          <div className="indices-list">
            {discoverIndices.map((index) => (
              <div
                key={index.id}
                className="index-row discover"
                onClick={() => navigate(`/indices/${index.id}`)}
              >
                <div className="index-info">
                  <div className="index-name">{index.name}</div>
                  <div className="index-meta">{index.participants.toLocaleString()} tracking</div>
                </div>

                <Sparkline
                  data={index.history}
                  width={56}
                  height={24}
                  positive={index.change >= 0}
                />

                <div className="index-value-section">
                  <div className="index-value">{index.indexAverage.toFixed(1)}</div>
                  <div className={`index-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                    {index.change >= 0 ? '+' : ''}{index.change.toFixed(1)}
                  </div>
                </div>

                <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Pass Behavior Indices Coming Soon */}
        {indexData && (
        <div className="indices-section">
          <div className="section-header-row">
            <span className="section-title">Pass Indices</span>
            <span className="coming-soon-badge">Coming Soon</span>
          </div>
          <div className="coming-soon-row">
            <span>Avoidance behavior indices are in development.</span>
          </div>
        </div>
        )}
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
              <div className="example-notice">
                <svg className="example-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Example data for demonstration</span>
              </div>

              <div className="modal-info-section">
                <h4>Behavior Indices</h4>
                <p className="modal-info-text">
                  Each index shows the average Flux Score across all users tracking that behavior.
                </p>
              </div>

              <div className="modal-info-section">
                <h4>Sparkline</h4>
                <p className="modal-info-text">
                  The mini chart shows the 12-week trend. Green means improving, red means declining.
                </p>
              </div>

              <div className="modal-info-section">
                <h4>Your Percentile</h4>
                <p className="modal-info-text">
                  "Top 15%" means you're outperforming 85% of users tracking that behavior.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
