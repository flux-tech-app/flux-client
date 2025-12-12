import { useState, useEffect } from 'react';
import { useHabits } from '../../context/HabitContext';
import { HABIT_LIBRARY, ACTION_TYPES } from '../../utils/HABIT_LIBRARY';
import {
  generateAllIndexData,
  generateDefaultIndexData,
  getIndexData,
  clearIndexData,
  hasIndexData
} from '../../utils/indexDataGenerator';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import BackButton from '../../components/BackButton';
import './DevTools.css';

export default function DevTools() {
  const {
    habits,
    logs,
    processTransfer,
    getPendingBalance,
    addHabits,
    addLog,
    addTransfer
  } = useHabits();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [indexDataStats, setIndexDataStats] = useState(null);
  const [distributionType, setDistributionType] = useState('realistic');

  // Load index data stats on mount
  useEffect(() => {
    updateIndexStats();
  }, []);

  const updateIndexStats = () => {
    if (hasIndexData()) {
      const data = getIndexData();
      setIndexDataStats({
        generatedAt: data.generatedAt,
        totalBehaviors: data.overall?.totalBehaviors || 0,
        totalParticipants: data.overall?.totalParticipants || 0,
        overallAverage: data.overall?.average || 0
      });
    } else {
      setIndexDataStats(null);
    }
  };

  /**
   * Generate example data optimized for Flux Score testing
   */
  const handleAddExampleData = () => {
    const existingHabits = JSON.parse(localStorage.getItem('flux_habits') || '[]');
    if (existingHabits.length > 0) {
      const confirmOverwrite = window.confirm(
        'You already have habits. Clear existing data first?\n\n' +
        'Click OK to clear and add fresh example data.\n' +
        'Click Cancel to keep your current data.'
      );
      if (!confirmOverwrite) return;

      localStorage.removeItem('flux_habits');
      localStorage.removeItem('flux_logs');
      localStorage.removeItem('flux_transfers');
      localStorage.removeItem('flux_last_transfer');
    }

    const confirmAdd = window.confirm(
      'Add example data for Flux Score testing?\n\n' +
      'This will add:\n' +
      '• 8 habits from the MVT behavior library\n' +
      '• 60-90 days of activity logs\n' +
      '• Varied patterns for Flux Score testing\n' +
      '• Mix of high/medium/building score habits\n\n' +
      'The page will reload after data is added.'
    );

    if (!confirmAdd) return;

    try {
      const today = new Date();

      const libraryHabits = {
        running: { name: 'Running', ticker: 'RUN', icon: 'running', rateType: 'DISTANCE', unit: 'mile', unitPlural: 'miles' },
        meditation: { name: 'Meditation', ticker: 'ZEN', icon: 'meditation', rateType: 'DURATION', unit: 'minute', unitPlural: 'minutes' },
        gym: { name: 'Gym Workout', ticker: 'GYM', icon: 'gym', rateType: 'BINARY', unit: 'session', unitPlural: 'sessions' },
        reading: { name: 'Reading', ticker: 'READ', icon: 'reading', rateType: 'COUNT', unit: 'chapter', unitPlural: 'chapters' },
        takeout: { name: 'Takeout', ticker: 'TAKEOUT', icon: 'takeout', rateType: 'BINARY', unit: 'pass', unitPlural: 'passes' },
        journal: { name: 'Journaling', ticker: 'JOURNAL', icon: 'journal', rateType: 'BINARY', unit: 'session', unitPlural: 'sessions' },
        pushups: { name: 'Push Ups', ticker: 'PUSH', icon: 'pushups', rateType: 'COUNT', unit: 'rep', unitPlural: 'reps' },
        doomscrolling: { name: 'Doomscrolling', ticker: 'SCROLL', icon: 'doomscrolling', rateType: 'BINARY', unit: 'pass', unitPlural: 'passes' }
      };

      const habitConfigs = [
        { libraryId: 'running', rate: 1.00, pattern: 'consistent', daysBack: 75, avgUnits: { min: 2, max: 5 } },
        { libraryId: 'meditation', rate: 0.20, pattern: 'consistent', daysBack: 60, avgUnits: { min: 10, max: 25 } },
        { libraryId: 'gym', rate: 5.00, pattern: 'regular', daysBack: 45, avgUnits: null },
        { libraryId: 'reading', rate: 0.50, pattern: 'regular', daysBack: 50, avgUnits: { min: 1, max: 3 } },
        { libraryId: 'takeout', rate: 7.00, pattern: 'sporadic', daysBack: 40, avgUnits: null },
        { libraryId: 'journal', rate: 2.00, pattern: 'building', daysBack: 20, avgUnits: null },
        { libraryId: 'pushups', rate: 0.05, pattern: 'new', daysBack: 10, avgUnits: { min: 20, max: 50 } },
        { libraryId: 'doomscrolling', rate: 3.00, pattern: 'new', daysBack: 7, avgUnits: null },
      ];

      const newHabits = [];

      habitConfigs.forEach((config, index) => {
        const libHabit = libraryHabits[config.libraryId];
        if (!libHabit) return;

        const habitId = `example-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date(today);
        createdAt.setDate(today.getDate() - config.daysBack - 5);

        newHabits.push({
          id: habitId,
          libraryId: config.libraryId,
          name: libHabit.name,
          ticker: libHabit.ticker,
          icon: libHabit.icon,
          rateType: libHabit.rateType,
          unit: libHabit.unit,
          unitPlural: libHabit.unitPlural,
          rate: config.rate,
          createdAt: createdAt.toISOString(),
          baseline: null,
          _config: config
        });
      });

      const newLogs = [];
      let totalEarnings = 0;
      const logCounts = {};

      newHabits.forEach(habit => {
        const config = habit._config;
        delete habit._config;

        logCounts[habit.name] = 0;

        let logProbability;
        switch (config.pattern) {
          case 'consistent': logProbability = 0.85; break;
          case 'regular': logProbability = 0.60; break;
          case 'sporadic': logProbability = 0.35; break;
          case 'building': logProbability = 0.55; break;
          case 'new': logProbability = 0.70; break;
          default: logProbability = 0.50;
        }

        for (let daysAgo = 0; daysAgo < config.daysBack; daysAgo++) {
          if (Math.random() > logProbability) continue;

          const logDate = new Date(today);
          logDate.setDate(today.getDate() - daysAgo);
          const dayOfWeek = logDate.getDay();

          if (config.pattern === 'regular' && (dayOfWeek === 0 || dayOfWeek === 6)) {
            if (Math.random() > 0.4) continue;
          }

          const hour = Math.floor(Math.random() * 16) + 6;
          const minute = Math.floor(Math.random() * 60);
          logDate.setHours(hour, minute, Math.floor(Math.random() * 60), 0);

          let units = 1;
          let earnings = habit.rate;

          if (config.avgUnits) {
            units = Math.floor(Math.random() * (config.avgUnits.max - config.avgUnits.min + 1)) + config.avgUnits.min;
            earnings = units * habit.rate;
          }

          const logId = `log-${Date.now()}-${daysAgo}-${Math.random().toString(36).substr(2, 9)}`;

          newLogs.push({
            id: logId,
            habitId: habit.id,
            timestamp: logDate.toISOString(),
            units: units,
            totalEarnings: earnings,
            notes: ''
          });

          totalEarnings += earnings;
          logCounts[habit.name]++;
        }
      });

      const newTransfers = [];
      const transferAmounts = [45.50, 52.25, 48.75, 55.00];

      for (let weeksAgo = 4; weeksAgo >= 1; weeksAgo--) {
        const transferDate = new Date(today);
        transferDate.setDate(today.getDate() - (weeksAgo * 7));
        transferDate.setHours(23, 59, 0, 0);

        newTransfers.push({
          id: `transfer-${Date.now()}-${weeksAgo}`,
          amount: transferAmounts[4 - weeksAgo],
          date: transferDate.toISOString(),
          status: 'completed',
          breakdown: []
        });
      }

      localStorage.setItem('flux_habits', JSON.stringify(newHabits));
      localStorage.setItem('flux_logs', JSON.stringify(newLogs));
      localStorage.setItem('flux_transfers', JSON.stringify(newTransfers));

      const habitSummary = Object.entries(logCounts)
        .map(([name, count]) => {
          let status = 'Active';
          if (count < 10) status = `Building (${10 - count} more needed)`;
          return `• ${name}: ${count} logs - ${status}`;
        })
        .join('\n');

      alert(
        'Example data added successfully!\n\n' +
        `✅ ${newHabits.length} habits created\n` +
        `✅ ${newLogs.length} activity logs generated\n` +
        `✅ ${newTransfers.length} historical transfers\n\n` +
        'Habit Summary:\n' +
        habitSummary + '\n\n' +
        `Total Earnings: $${totalEarnings.toFixed(2)}\n\n` +
        'Page will now reload...'
      );

      window.location.reload();

    } catch (error) {
      console.error('Error adding example data:', error);
      alert('Error adding example data. Check console for details.');
    }
  };

  const handleManualTransfer = () => {
    const pending = getPendingBalance();

    if (pending <= 0) {
      alert('No pending balance to transfer.');
      return;
    }

    const result = processTransfer();

    if (result.success) {
      alert(
        `Manual transfer completed!\n\n` +
        `Amount: $${result.amount.toFixed(2)}\n` +
        `This has been moved to your portfolio balance.\n\n` +
        `Reload the page to see changes.`
      );
    } else {
      alert(result.message);
    }
  };

  const handleClearAllData = () => {
    const confirmClear = window.confirm(
      '⚠️ Clear ALL data?\n\n' +
      'This will permanently delete:\n' +
      '• All habits\n' +
      '• All activity logs\n' +
      '• All transfer history\n' +
      '• User profile\n\n' +
      'This cannot be undone!'
    );

    if (!confirmClear) return;

    localStorage.removeItem('flux_habits');
    localStorage.removeItem('flux_logs');
    localStorage.removeItem('flux_transfers');
    localStorage.removeItem('flux_user');
    localStorage.removeItem('flux_last_transfer');

    alert('All data cleared. Reloading app...');
    window.location.reload();
  };

  const handleResetOnboarding = () => {
    const confirmReset = window.confirm(
      'Reset onboarding?\n\n' +
      'This will show the onboarding flow again on next load.\n' +
      'Your habits and data will NOT be deleted.'
    );

    if (!confirmReset) return;

    const user = JSON.parse(localStorage.getItem('flux_user') || '{}');
    user.hasCompletedOnboarding = false;
    localStorage.setItem('flux_user', JSON.stringify(user));

    alert('Onboarding reset. Reloading app...');
    window.location.reload();
  };

  // Index Data Management
  const handleGenerateDefaultIndexData = () => {
    const confirmGenerate = window.confirm(
      'Generate default index data?\n\n' +
      'This will create consistent example data for all 13 LOG behaviors with:\n' +
      '• Predefined participant counts (200-2000)\n' +
      '• Realistic index averages (54-79 range)\n' +
      '• Weekly change data\n' +
      '• Score distributions\n\n' +
      'Existing index data will be replaced.'
    );

    if (!confirmGenerate) return;

    generateDefaultIndexData();
    updateIndexStats();
    alert('Default index data generated successfully!');
  };

  const handleGenerateRandomIndexData = () => {
    const confirmGenerate = window.confirm(
      `Generate random index data?\n\n` +
      `Distribution: ${distributionType}\n\n` +
      'This will create randomized data for all 13 LOG behaviors.\n' +
      'Existing index data will be replaced.'
    );

    if (!confirmGenerate) return;

    generateAllIndexData({ distribution: distributionType });
    updateIndexStats();
    alert('Random index data generated successfully!');
  };

  const handleClearIndexData = () => {
    const confirmClear = window.confirm(
      'Clear index data?\n\n' +
      'This will remove all generated index data.\n' +
      'New data will be auto-generated when you visit the Indices page.'
    );

    if (!confirmClear) return;

    clearIndexData();
    updateIndexStats();
    alert('Index data cleared!');
  };

  const logBehaviors = HABIT_LIBRARY.filter(b => b.actionType === ACTION_TYPES.LOG);

  return (
    <div className="devtools-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="devtools-container">
        {/* Header */}
        <header className="devtools-header">
          <BackButton />
          <h1 className="devtools-title">Developer Tools</h1>
          <div className="header-spacer"></div>
        </header>

        {/* Warning Banner */}
        <div className="dev-warning">
          For testing only. Will be removed in production.
        </div>

        {/* Current Data Stats */}
        <div className="devtools-section">
          <div className="section-title">Current Data</div>
          <div className="devtools-item">
            <span className="item-label">Habits</span>
            <span className="item-value">{habits.length}</span>
          </div>
          <div className="devtools-item">
            <span className="item-label">Logs</span>
            <span className="item-value">{logs.length}</span>
          </div>
          <div className="devtools-item">
            <span className="item-label">Pending Balance</span>
            <span className="item-value">${getPendingBalance().toFixed(2)}</span>
          </div>
        </div>

        {/* Data Management */}
        <div className="devtools-section">
          <div className="section-title">Data Management</div>
          <div className="devtools-item action" onClick={handleAddExampleData}>
            <span className="item-label">Add Example Data</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="devtools-item action danger" onClick={handleClearAllData}>
            <span className="item-label">Clear All Data</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Indices Test Data */}
        <div className="devtools-section">
          <div className="section-title">Indices Test Data</div>

          {/* Current Index Data Stats */}
          {indexDataStats ? (
            <div className="index-stats-box">
              <div className="index-stat-row">
                <span>Behaviors</span>
                <span>{indexDataStats.totalBehaviors}</span>
              </div>
              <div className="index-stat-row">
                <span>Total Users</span>
                <span>{indexDataStats.totalParticipants.toLocaleString()}</span>
              </div>
              <div className="index-stat-row">
                <span>Overall Average</span>
                <span>{indexDataStats.overallAverage.toFixed(1)}</span>
              </div>
              <div className="index-stat-row muted">
                <span>Generated</span>
                <span>{new Date(indexDataStats.generatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="index-stats-box empty">
              <span>No index data generated</span>
            </div>
          )}

          {/* Distribution Type Selector */}
          <div className="distribution-selector">
            <span className="selector-label">Distribution Type</span>
            <div className="selector-options">
              <button
                className={`selector-option ${distributionType === 'realistic' ? 'active' : ''}`}
                onClick={() => setDistributionType('realistic')}
              >
                Realistic
              </button>
              <button
                className={`selector-option ${distributionType === 'high' ? 'active' : ''}`}
                onClick={() => setDistributionType('high')}
              >
                High
              </button>
              <button
                className={`selector-option ${distributionType === 'mixed' ? 'active' : ''}`}
                onClick={() => setDistributionType('mixed')}
              >
                Mixed
              </button>
            </div>
          </div>

          <div className="devtools-item action" onClick={handleGenerateDefaultIndexData}>
            <span className="item-label">Generate Default Data</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="devtools-item action" onClick={handleGenerateRandomIndexData}>
            <span className="item-label">Generate Random Data</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="devtools-item action danger" onClick={handleClearIndexData}>
            <span className="item-label">Clear Index Data</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Transfer Testing */}
        <div className="devtools-section">
          <div className="section-title">Transfers</div>
          <div className="devtools-item action" onClick={handleManualTransfer}>
            <span className="item-label">Process Manual Transfer</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* App State */}
        <div className="devtools-section">
          <div className="section-title">App State</div>
          <div className="devtools-item action" onClick={handleResetOnboarding}>
            <span className="item-label">Reset Onboarding</span>
            <svg className="chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
