import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import BackButton from '../../components/BackButton';
import './IndexDetail.css';

export default function IndexDetail() {
  const navigate = useNavigate();
  const { indexId } = useParams();
  const { habits, logs } = useHabits();
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  // Mock index data - would be fetched based on indexId
  const indexData = {
    cardio: {
      name: 'Cardio Index',
      category: 'Fitness',
      description: 'Running, cycling, swimming, etc.',
      value: 71.3,
      change: 1.8,
      participants: 847,
      userScore: 78.2,
      percentile: 16,
      deltaFromIndex: 6.9,
      aheadOf: 713,
      logsPerWeek: { user: 4.2, index: 3.1 },
      avgGap: { user: 1.8, index: 2.4 },
      consistency: { user: 94, index: 76 },
      distribution: { top: 15, strong: 32, building: 35, starting: 18 },
      insight: "Your cardio consistency (1.8 day avg gap) beats 84% of users. The index shows most users have 3-4 day gaps between sessions."
    },
    exercise: {
      name: 'Exercise Index',
      category: 'Fitness',
      description: 'All physical activity habits',
      value: 68.2,
      change: 2.4,
      participants: 1247,
      userScore: 82.5,
      percentile: 13,
      deltaFromIndex: 14.3,
      aheadOf: 1085,
      logsPerWeek: { user: 5.1, index: 3.8 },
      avgGap: { user: 1.4, index: 2.1 },
      consistency: { user: 91, index: 72 },
      distribution: { top: 12, strong: 28, building: 38, starting: 22 },
      insight: "You're in the top tier for exercise consistency. Your multi-habit approach puts you ahead of 87% of single-habit trackers."
    },
    mindfulness: {
      name: 'Mindfulness Index',
      category: 'Mental Health',
      description: 'Meditation, journaling, breathing',
      value: 54.7,
      change: -0.8,
      participants: 623,
      userScore: 62.1,
      percentile: 24,
      deltaFromIndex: 7.4,
      aheadOf: 473,
      logsPerWeek: { user: 3.2, index: 2.4 },
      avgGap: { user: 2.2, index: 3.1 },
      consistency: { user: 78, index: 61 },
      distribution: { top: 10, strong: 25, building: 40, starting: 25 },
      insight: "Mindfulness habits have high drop-off rates. Your 78% consistency beats most users who struggle to maintain daily practice."
    }
  };

  const data = indexData[indexId] || indexData.exercise;
  const periods = ['1W', '1M', '3M', '6M', '1Y', 'All'];

  // Find user's related habit for this index
  const relatedHabit = habits.find(h => {
    if (indexId === 'cardio') return ['running', 'cycling', 'swimming'].includes(h.libraryId);
    if (indexId === 'mindfulness') return ['meditation', 'journal'].includes(h.libraryId);
    return ['running', 'gym', 'pushups'].includes(h.libraryId);
  });

  const habitLogs = relatedHabit ? logs.filter(l => l.habitId === relatedHabit.id) : [];
  const totalEarned = habitLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0);

  return (
    <div className="idx-detail-page">
      <div className="idx-detail-container">
        {/* Header */}
        <header className="idx-header">
          <BackButton />
          <div className="idx-header-content">
            <div className="idx-header-title">{data.name}</div>
            <div className="idx-header-subtitle">{data.category} · {data.description}</div>
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
              <div className="idx-hero-label">{data.name}</div>
              <div className="idx-hero-value-row">
                <div className="idx-hero-value">{data.value.toFixed(1)}</div>
                <div className={`idx-hero-change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                  <svg className="idx-change-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d={data.change >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}/>
                  </svg>
                  {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
                </div>
              </div>
              <div className="idx-hero-meta">Avg Flux Score across all trackers · 30d</div>
            </div>
            <div className="idx-hero-participants">
              <div className="idx-participants-number">{data.participants}</div>
              <div className="idx-participants-label">tracking</div>
            </div>
          </div>
        </div>

        {/* Your Performance Card */}
        <div className="idx-performance-card">
          <div className="idx-perf-header">
            <div className="idx-perf-label">Your {data.name.replace(' Index', '')} Flux Score</div>
            <div className="idx-perf-badge">Top {data.percentile}%</div>
          </div>
          <div className="idx-perf-main">
            <div className="idx-perf-score">{data.userScore.toFixed(1)}</div>
            <div className="idx-perf-delta">
              <div className="idx-delta-value">+{data.deltaFromIndex.toFixed(1)}</div>
              <div className="idx-delta-label">above index</div>
            </div>
          </div>
          <div className="idx-perf-context">Ahead of {data.aheadOf.toLocaleString()} users</div>
        </div>

        {/* Chart Section */}
        <div className="idx-chart-section">
          <div className="idx-chart-header">
            <div className="idx-chart-title">Performance</div>
            <span className="idx-random-badge">Random Data</span>
          </div>

          <div className="idx-chart-wrapper">
            <svg className="idx-chart-svg" viewBox="0 0 320 140" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="35" x2="320" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              <line x1="0" y1="70" x2="320" y2="70" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              <line x1="0" y1="105" x2="320" y2="105" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>

              {/* Index line (dashed, gray) */}
              <path
                d="M 10 80 L 50 85 L 90 78 L 130 82 L 170 75 L 210 80 L 250 72 L 290 68 L 310 65"
                fill="none"
                stroke="rgba(44, 74, 110, 0.3)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* User line with fill */}
              <defs>
                <linearGradient id="idxUserGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path
                d="M 10 70 L 50 65 L 90 60 L 130 68 L 170 55 L 210 50 L 250 45 L 290 38 L 310 35 L 310 140 L 10 140 Z"
                fill="url(#idxUserGradient)"
              />
              <path
                d="M 10 70 L 50 65 L 90 60 L 130 68 L 170 55 L 210 50 L 250 45 L 290 38 L 310 35"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="310" cy="35" r="4" fill="#3b82f6"/>
            </svg>
          </div>

          <div className="idx-chart-legend">
            <div className="idx-legend-item">
              <div className="idx-legend-line dashed"></div>
              <span>{data.name} (all users)</span>
            </div>
            <div className="idx-legend-item">
              <div className="idx-legend-line solid"></div>
              <span>You</span>
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

        {/* Quick Stats */}
        <div className="idx-stats-section">
          <div className="idx-stats-title">Your Stats vs Index</div>
          <div className="idx-stats-grid">
            <div className="idx-stat-item">
              <div className="idx-stat-value">{data.logsPerWeek.user}</div>
              <div className="idx-stat-label">Your logs/wk</div>
              <div className={`idx-stat-compare ${data.logsPerWeek.user > data.logsPerWeek.index ? 'above' : 'below'}`}>
                Index: {data.logsPerWeek.index}
              </div>
            </div>
            <div className="idx-stat-item">
              <div className="idx-stat-value">{data.avgGap.user}d</div>
              <div className="idx-stat-label">Your avg gap</div>
              <div className={`idx-stat-compare ${data.avgGap.user < data.avgGap.index ? 'above' : 'below'}`}>
                Index: {data.avgGap.index}d
              </div>
            </div>
            <div className="idx-stat-item">
              <div className="idx-stat-value">{data.consistency.user}%</div>
              <div className="idx-stat-label">Consistency</div>
              <div className={`idx-stat-compare ${data.consistency.user > data.consistency.index ? 'above' : 'below'}`}>
                Index: {data.consistency.index}%
              </div>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="idx-distribution-section">
          <div className="idx-dist-title">Population Distribution</div>
          <div className="idx-distribution-bar">
            <div className="idx-dist-segment top" style={{ width: `${data.distribution.top}%` }}>
              {data.percentile <= data.distribution.top && (
                <div className="idx-you-marker" style={{ left: `${(data.percentile / data.distribution.top) * 100}%` }}>
                  <div className="idx-you-label">YOU</div>
                  <div className="idx-you-arrow"></div>
                </div>
              )}
            </div>
            <div className="idx-dist-segment strong" style={{ width: `${data.distribution.strong}%` }}></div>
            <div className="idx-dist-segment building" style={{ width: `${data.distribution.building}%` }}></div>
            <div className="idx-dist-segment starting" style={{ width: `${data.distribution.starting}%` }}></div>
          </div>
          <div className="idx-dist-labels">
            <span>Top {data.distribution.top}%</span>
            <span>Strong {data.distribution.strong}%</span>
            <span>Building {data.distribution.building}%</span>
            <span>Starting {data.distribution.starting}%</span>
          </div>
        </div>

        {/* Insight */}
        <div className="idx-insight-card">
          <div className="idx-insight-header">
            <svg className="idx-insight-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span className="idx-insight-title">Pattern Insight</span>
          </div>
          <div className="idx-insight-text">{data.insight}</div>
        </div>

        {/* Your Habit Section */}
        {relatedHabit && (
          <div className="idx-habit-section">
            <div className="idx-habit-title">Your Related Habit</div>
            <div className="idx-habit-card">
              <div className="idx-habit-header">
                <div className="idx-habit-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div className="idx-habit-info">
                  <h3>{relatedHabit.name}</h3>
                  <p>{relatedHabit.rateType === 'BINARY' ? 'Fixed rate' : 'Variable rate'} · ${relatedHabit.rate.toFixed(2)}/{relatedHabit.unit}</p>
                </div>
              </div>
              <div className="idx-habit-stats">
                <div className="idx-habit-stat">
                  <div className="idx-habit-stat-value">{data.userScore.toFixed(1)}</div>
                  <div className="idx-habit-stat-label">Flux Score</div>
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

        {/* Leaderboard Teaser */}
        <div className="idx-leaderboard-section">
          <div className="idx-leaderboard-header">
            <span className="idx-leaderboard-title">{data.name.replace(' Index', '')} Leaderboard</span>
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
            <div className="idx-leaderboard-row you">
              <span className="idx-lb-rank">{Math.round(data.participants * (data.percentile / 100))}</span>
              <div className="idx-lb-avatar">You</div>
              <span className="idx-lb-name">You</span>
              <span className="idx-lb-score">{data.userScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
