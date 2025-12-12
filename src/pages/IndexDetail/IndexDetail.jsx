import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import { getCalibrationStatus } from '../../utils/calibrationStatus';
import { calculateFluxScore } from '../../utils/calculations';
import { getBehaviorIndexData, hasIndexData, calculateUserPercentile } from '../../utils/indexDataGenerator';
import { getHabitById } from '../../utils/HABIT_LIBRARY';
import BackButton from '../../components/BackButton';
import './IndexDetail.css';

export default function IndexDetail() {
  const navigate = useNavigate();
  const { indexId } = useParams();
  const { habits, logs } = useHabits();
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const periods = ['1W', '1M', '3M', '6M', '1Y', 'All'];

  // Get behavior definition from HABIT_LIBRARY
  const behavior = useMemo(() => {
    return getHabitById(indexId);
  }, [indexId]);

  // Get index data for this behavior
  const indexData = useMemo(() => {
    if (!hasIndexData()) return null;
    return getBehaviorIndexData(indexId);
  }, [indexId]);

  // Find user's habit for this behavior
  const userHabit = useMemo(() => {
    return habits.find(h => h.libraryId === indexId);
  }, [habits, indexId]);

  // Get user's logs for this habit
  const habitLogs = useMemo(() => {
    if (!userHabit) return [];
    return logs.filter(l => l.habitId === userHabit.id);
  }, [userHabit, logs]);

  // Calculate user's actual Flux Score
  const userFluxData = useMemo(() => {
    if (habitLogs.length === 0) return null;
    return calculateFluxScore(habitLogs);
  }, [habitLogs]);

  // Get calibration status
  const calibrationStatus = useMemo(() => {
    return getCalibrationStatus(habitLogs);
  }, [habitLogs]);

  // Calculate user's percentile
  const userPercentile = useMemo(() => {
    if (!userFluxData?.score || !indexData) return null;
    return calculateUserPercentile(userFluxData.score, indexData);
  }, [userFluxData, indexData]);

  // Calculate total earned
  const totalEarned = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);

  // If behavior doesn't exist, show error
  if (!behavior) {
    return (
      <div className="idx-detail-page">
        <div className="idx-detail-container">
          <header className="idx-header">
            <BackButton />
            <div className="idx-header-content">
              <div className="idx-header-title">Index Not Found</div>
            </div>
          </header>
          <div className="idx-empty-state">
            <p>This behavior index doesn't exist.</p>
            <button onClick={() => navigate('/indices')}>Back to Indices</button>
          </div>
        </div>
      </div>
    );
  }

  // If no index data exists (cleared), show empty state
  if (!indexData) {
    return (
      <div className="idx-detail-page">
        <div className="idx-detail-container">
          <header className="idx-header">
            <BackButton />
            <div className="idx-header-content">
              <div className="idx-header-title">{behavior.name} Index</div>
              <div className="idx-header-subtitle">{behavior.description}</div>
            </div>
          </header>
          <div className="idx-empty-state">
            <div className="idx-empty-icon">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 className="idx-empty-title">No Index Data Available</h3>
            <p className="idx-empty-text">Community data hasn't been loaded yet. Use Developer Tools to generate example index data.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate derived values for display
  const aheadOf = userPercentile ? Math.round(indexData.participants * (1 - userPercentile / 100)) : 0;
  const deltaFromIndex = userFluxData?.score ? userFluxData.score - indexData.indexAverage : 0;

  return (
    <div className="idx-detail-page">
      <div className="idx-detail-container">
        {/* Header */}
        <header className="idx-header">
          <BackButton />
          <div className="idx-header-content">
            <div className="idx-header-title">{behavior.name} Index</div>
            <div className="idx-header-subtitle">{behavior.description}</div>
          </div>
          <div className="idx-live-badge">
            <span className="idx-live-dot"></span>
            Live
          </div>
        </header>

        {/* Index Hero */}
        <div className="idx-hero-section">
          <div className="idx-hero-row">
            <div className="idx-hero-main">
              <div className="idx-hero-label">{behavior.name} Index</div>
              <div className="idx-hero-value-row">
                <div className="idx-hero-value">{indexData.indexAverage.toFixed(1)}</div>
                <div className={`idx-hero-change ${indexData.change >= 0 ? 'positive' : 'negative'}`}>
                  <svg className="idx-change-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d={indexData.change >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}/>
                  </svg>
                  {indexData.change >= 0 ? '+' : ''}{indexData.change.toFixed(1)}%
                </div>
              </div>
              <div className="idx-hero-meta">Avg Flux Score across all trackers · 30d</div>
            </div>
            <div className="idx-hero-participants">
              <div className="idx-participants-number">{indexData.participants.toLocaleString()}</div>
              <div className="idx-participants-label">tracking</div>
            </div>
          </div>
        </div>

        {/* Your Performance Card - Only show if user has this habit */}
        {userHabit && (
          <div className="idx-performance-card">
            <div className="idx-perf-header">
              <div className="idx-perf-label">Your {behavior.name} Flux Score</div>
              {userPercentile && <div className="idx-perf-badge">Top {userPercentile}%</div>}
            </div>
            <div className="idx-perf-main">
              {calibrationStatus.isCalibrating ? (
                <div className="idx-perf-calibrating">
                  <div className="idx-perf-score">--</div>
                  <div className="idx-perf-calibrating-msg">{calibrationStatus.message}</div>
                </div>
              ) : (
                <>
                  <div className="idx-perf-score">{userFluxData?.score || 0}</div>
                  <div className="idx-perf-delta">
                    <div className={`idx-delta-value ${deltaFromIndex >= 0 ? 'positive' : 'negative'}`}>
                      {deltaFromIndex >= 0 ? '+' : ''}{deltaFromIndex.toFixed(1)}
                    </div>
                    <div className="idx-delta-label">{deltaFromIndex >= 0 ? 'above' : 'below'} index</div>
                  </div>
                </>
              )}
            </div>
            {!calibrationStatus.isCalibrating && userPercentile && (
              <div className="idx-perf-context">Ahead of {aheadOf.toLocaleString()} users</div>
            )}
          </div>
        )}

        {/* Chart Section */}
        <div className="idx-chart-section">
          <div className="idx-chart-header">
            <div className="idx-chart-title">Performance</div>
            <span className="idx-random-badge">Demo Data</span>
          </div>

          <div className="idx-chart-wrapper">
            <svg className="idx-chart-svg" viewBox="0 0 320 140" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="35" x2="320" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              <line x1="0" y1="70" x2="320" y2="70" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              <line x1="0" y1="105" x2="320" y2="105" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>

              {/* Index line with gradient fill */}
              <defs>
                <linearGradient id="idxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path
                d={generateChartPath(indexData.history) + ' L 310 140 L 10 140 Z'}
                fill="url(#idxGradient)"
              />
              <path
                d={generateChartPath(indexData.history)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="310" cy={140 - (indexData.indexAverage / 100) * 105} r="4" fill="#3b82f6"/>
            </svg>
          </div>

          <div className="idx-chart-legend">
            <div className="idx-legend-item">
              <div className="idx-legend-line solid"></div>
              <span>{behavior.name} Index (community avg)</span>
            </div>
          </div>

          {/* Time Period Toggles */}
          <div className="idx-time-toggles">
            {periods.map(period => (
              <button
                key={period}
                className={`idx-time-toggle ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Distribution */}
        <div className="idx-distribution-section">
          <div className="idx-dist-title">Population Distribution</div>
          <div className="idx-distribution-bar">
            <div className="idx-dist-segment top" style={{ width: `${(indexData.distribution.top / indexData.participants) * 100}%` }}>
              {userPercentile && userPercentile <= 15 && (
                <div className="idx-you-marker">
                  <div className="idx-you-label">YOU</div>
                  <div className="idx-you-arrow"></div>
                </div>
              )}
            </div>
            <div className="idx-dist-segment strong" style={{ width: `${(indexData.distribution.strong / indexData.participants) * 100}%` }}></div>
            <div className="idx-dist-segment building" style={{ width: `${(indexData.distribution.building / indexData.participants) * 100}%` }}></div>
            <div className="idx-dist-segment starting" style={{ width: `${(indexData.distribution.starting / indexData.participants) * 100}%` }}></div>
          </div>
          <div className="idx-dist-labels">
            <span>Top {Math.round((indexData.distribution.top / indexData.participants) * 100)}%</span>
            <span>Strong {Math.round((indexData.distribution.strong / indexData.participants) * 100)}%</span>
            <span>Building {Math.round((indexData.distribution.building / indexData.participants) * 100)}%</span>
            <span>Starting {Math.round((indexData.distribution.starting / indexData.participants) * 100)}%</span>
          </div>
        </div>

        {/* Your Habit Section */}
        {userHabit && (
          <div className="idx-habit-section">
            <div className="idx-habit-title">Your Related Habit</div>
            <div className="idx-habit-card" onClick={() => navigate(`/habit/${userHabit.id}`)}>
              <div className="idx-habit-header">
                <div className="idx-habit-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div className="idx-habit-info">
                  <h3>{userHabit.name}</h3>
                  <p>${userHabit.rate?.toFixed(2) || '0.00'}/{userHabit.unit || 'unit'}</p>
                </div>
              </div>
              <div className="idx-habit-stats">
                <div className="idx-habit-stat">
                  {calibrationStatus.isCalibrating ? (
                    <>
                      <div className="idx-habit-stat-value idx-calibrating">--</div>
                      <div className="idx-habit-stat-label">{calibrationStatus.message}</div>
                    </>
                  ) : (
                    <>
                      <div className="idx-habit-stat-value">{userFluxData?.score || 0}</div>
                      <div className="idx-habit-stat-label">Flux Score</div>
                    </>
                  )}
                </div>
                <div className="idx-habit-stat">
                  <div className="idx-habit-stat-value">{habitLogs.length}</div>
                  <div className="idx-habit-stat-label">Total Logs</div>
                </div>
                <div className="idx-habit-stat">
                  <div className="idx-habit-stat-value">${totalEarned.toFixed(0)}</div>
                  <div className="idx-habit-stat-label">Earned</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* If user doesn't have this habit, show CTA */}
        {!userHabit && (
          <div className="idx-add-habit-section">
            <div className="idx-add-habit-card">
              <div className="idx-add-habit-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <div className="idx-add-habit-content">
                <h3>Start Tracking {behavior.name}</h3>
                <p>Join {indexData.participants.toLocaleString()} others tracking this behavior</p>
              </div>
              <button className="idx-add-habit-btn" onClick={() => navigate('/add-habit')}>
                Add Habit
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Teaser */}
        <div className="idx-leaderboard-section">
          <div className="idx-leaderboard-header">
            <span className="idx-leaderboard-title">{behavior.name} Leaderboard</span>
            <span className="idx-leaderboard-link">View all</span>
          </div>
          <div className="idx-leaderboard-list">
            <div className="idx-leaderboard-row">
              <span className="idx-lb-rank">1</span>
              <div className="idx-lb-avatar">🏆</div>
              <span className="idx-lb-name">Anonymous</span>
              <span className="idx-lb-score">94.2</span>
            </div>
            <div className="idx-leaderboard-row">
              <span className="idx-lb-rank">2</span>
              <div className="idx-lb-avatar">🥈</div>
              <span className="idx-lb-name">Anonymous</span>
              <span className="idx-lb-score">91.8</span>
            </div>
            <div className="idx-leaderboard-row">
              <span className="idx-lb-rank">3</span>
              <div className="idx-lb-avatar">🥉</div>
              <span className="idx-lb-name">Anonymous</span>
              <span className="idx-lb-score">89.3</span>
            </div>
            {userHabit && userFluxData?.score && !calibrationStatus.isCalibrating && (
              <div className="idx-leaderboard-row you">
                <span className="idx-lb-rank">{userPercentile ? Math.round(indexData.participants * (userPercentile / 100)) : '—'}</span>
                <div className="idx-lb-avatar">You</div>
                <span className="idx-lb-name">You</span>
                <span className="idx-lb-score">{userFluxData.score}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate SVG path from history data
 */
function generateChartPath(history) {
  if (!history || history.length === 0) return '';

  const width = 300;
  const height = 105;
  const startX = 10;

  const points = history.map((point, i) => {
    const x = startX + (i / (history.length - 1)) * width;
    const y = 140 - (point.average / 100) * height;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(0)} ${y.toFixed(0)}`;
  });

  return points.join(' ');
}
