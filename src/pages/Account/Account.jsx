import { useHabits } from '../../context/HabitContext';
import Navigation from '../../components/Navigation';
import './Account.css';

export default function Account() {
  const { 
    user, 
    habits,
    logs,
    processTransfer, 
    getPendingBalance, 
    addHabits, 
    addLog, 
    addTransfer 
  } = useHabits();

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  /**
   * Generate example data optimized for Flux Score testing
   * 
   * Creates:
   * - 8 habits from the MVT library
   * - 60-90 days of logs with varied patterns
   * - Some habits with 30+ logs (full Flux Score)
   * - Some habits with 10-20 logs (active but building)
   * - Some habits with <10 logs (building state)
   * - Realistic patterns (some consistent, some sporadic)
   */
  const handleAddExampleData = () => {
    // Check if data already exists
    const existingHabits = JSON.parse(localStorage.getItem('flux_habits') || '[]');
    if (existingHabits.length > 0) {
      const confirmOverwrite = window.confirm(
        'You already have habits. Clear existing data first?\n\n' +
        'Click OK to clear and add fresh example data.\n' +
        'Click Cancel to keep your current data.'
      );
      if (!confirmOverwrite) return;
      
      // Clear existing data
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
      
      // ========================================
      // HABIT LIBRARY REFERENCE
      // ========================================
      const libraryHabits = {
        running: {
          name: 'Running',
          ticker: 'RUN',
          icon: 'running',
          rateType: 'DISTANCE',
          unit: 'mile',
          unitPlural: 'miles'
        },
        meditation: {
          name: 'Meditation',
          ticker: 'ZEN',
          icon: 'meditation',
          rateType: 'DURATION',
          unit: 'minute',
          unitPlural: 'minutes'
        },
        gym: {
          name: 'Gym Workout',
          ticker: 'GYM',
          icon: 'gym',
          rateType: 'BINARY',
          unit: 'session',
          unitPlural: 'sessions'
        },
        reading: {
          name: 'Reading',
          ticker: 'READ',
          icon: 'reading',
          rateType: 'COUNT',
          unit: 'chapter',
          unitPlural: 'chapters'
        },
        takeout: {
          name: 'Takeout',
          ticker: 'TAKEOUT',
          icon: 'takeout',
          rateType: 'BINARY',
          unit: 'pass',
          unitPlural: 'passes'
        },
        journal: {
          name: 'Journaling',
          ticker: 'JOURNAL',
          icon: 'journal',
          rateType: 'BINARY',
          unit: 'session',
          unitPlural: 'sessions'
        },
        pushups: {
          name: 'Push Ups',
          ticker: 'PUSH',
          icon: 'pushups',
          rateType: 'COUNT',
          unit: 'rep',
          unitPlural: 'reps'
        },
        doomscrolling: {
          name: 'Doomscrolling',
          ticker: 'SCROLL',
          icon: 'doomscrolling',
          rateType: 'BINARY',
          unit: 'pass',
          unitPlural: 'passes'
        }
      };

      // ========================================
      // HABIT CONFIGURATIONS
      // ========================================
      const habitConfigs = [
        // HIGH FLUX SCORE HABITS (50+ logs, consistent patterns)
        {
          libraryId: 'running',
          rate: 1.00,
          pattern: 'consistent',
          daysBack: 75,
          avgUnits: { min: 2, max: 5 }, // 2-5 miles
        },
        {
          libraryId: 'meditation',
          rate: 0.20,
          pattern: 'consistent',
          daysBack: 60,
          avgUnits: { min: 10, max: 25 }, // 10-25 minutes
        },
        
        // MEDIUM FLUX SCORE HABITS (15-30 logs, regular patterns)
        {
          libraryId: 'gym',
          rate: 5.00,
          pattern: 'regular',
          daysBack: 45,
          avgUnits: null, // binary
        },
        {
          libraryId: 'reading',
          rate: 0.50,
          pattern: 'regular',
          daysBack: 50,
          avgUnits: { min: 1, max: 3 }, // 1-3 chapters
        },
        {
          libraryId: 'takeout',
          rate: 7.00,
          pattern: 'sporadic',
          daysBack: 40,
          avgUnits: null, // binary (PASS behavior)
        },
        
        // BUILDING STATE HABITS (10-15 logs)
        {
          libraryId: 'journal',
          rate: 2.00,
          pattern: 'building',
          daysBack: 20,
          avgUnits: null, // binary
        },
        
        // NEW HABITS (<10 logs - will show "X more logs needed")
        {
          libraryId: 'pushups',
          rate: 0.05,
          pattern: 'new',
          daysBack: 10,
          avgUnits: { min: 20, max: 50 }, // 20-50 reps
        },
        {
          libraryId: 'doomscrolling',
          rate: 3.00,
          pattern: 'new',
          daysBack: 7,
          avgUnits: null, // binary (PASS behavior)
        },
      ];

      // ========================================
      // CREATE HABITS
      // ========================================
      const newHabits = [];
      
      habitConfigs.forEach((config, index) => {
        const libHabit = libraryHabits[config.libraryId];
        if (!libHabit) return;
        
        const habitId = `example-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Set createdAt to before the first log
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
          // Store config for log generation
          _config: config
        });
      });

      // ========================================
      // GENERATE LOGS
      // ========================================
      const newLogs = [];
      let totalEarnings = 0;
      const logCounts = {};

      newHabits.forEach(habit => {
        const config = habit._config;
        delete habit._config; // Remove temp config
        
        logCounts[habit.ticker] = 0;
        
        // Determine log probability based on pattern
        let logProbability;
        switch (config.pattern) {
          case 'consistent': logProbability = 0.85; break;
          case 'regular': logProbability = 0.60; break;
          case 'sporadic': logProbability = 0.35; break;
          case 'building': logProbability = 0.55; break;
          case 'new': logProbability = 0.70; break;
          default: logProbability = 0.50;
        }

        // Generate logs for each day going back
        for (let daysAgo = 0; daysAgo < config.daysBack; daysAgo++) {
          // Skip some days randomly based on probability
          if (Math.random() > logProbability) continue;

          const logDate = new Date(today);
          logDate.setDate(today.getDate() - daysAgo);
          const dayOfWeek = logDate.getDay();
          
          // Reduce weekend activity for regular habits
          if (config.pattern === 'regular' && (dayOfWeek === 0 || dayOfWeek === 6)) {
            if (Math.random() > 0.4) continue;
          }

          // Set realistic time (6am - 10pm)
          const hour = Math.floor(Math.random() * 16) + 6;
          const minute = Math.floor(Math.random() * 60);
          logDate.setHours(hour, minute, Math.floor(Math.random() * 60), 0);

          // Calculate units and earnings
          let units = 1;
          let earnings = habit.rate;

          if (config.avgUnits) {
            units = Math.floor(
              Math.random() * (config.avgUnits.max - config.avgUnits.min + 1)
            ) + config.avgUnits.min;
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
          logCounts[habit.ticker]++;
        }
      });

      // ========================================
      // CREATE TRANSFERS
      // ========================================
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

      // ========================================
      // WRITE TO LOCALSTORAGE
      // ========================================
      localStorage.setItem('flux_habits', JSON.stringify(newHabits));
      localStorage.setItem('flux_logs', JSON.stringify(newLogs));
      localStorage.setItem('flux_transfers', JSON.stringify(newTransfers));

      // ========================================
      // SUMMARY
      // ========================================
      const habitSummary = Object.entries(logCounts)
        .map(([ticker, count]) => {
          let status = 'Active';
          if (count < 10) status = `Building (${10 - count} more needed)`;
          return `• $${ticker}: ${count} logs - ${status}`;
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

      // Force reload to pick up new data
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

    // Clear all localStorage
    localStorage.removeItem('flux_habits');
    localStorage.removeItem('flux_logs');
    localStorage.removeItem('flux_transfers');
    localStorage.removeItem('flux_user');
    localStorage.removeItem('flux_last_transfer');

    alert('All data cleared. Reloading app...');
    window.location.reload();
  };

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(user?.name || 'User')}
          </div>
          <div className="profile-name">{user?.name || 'User'}</div>
          <div className="profile-email">{user?.email || 'Set up your profile'}</div>
          <button className="edit-profile-button">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Developer Tools Section */}
        <div className="menu-section">
          <div className="section-title">Developer Tools</div>
          <div className="menu-items">
            <div className="menu-item" onClick={handleAddExampleData}>
              <div className="menu-icon green">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Add Example Data</div>
                <div className="menu-subtitle">60-90 days of logs for Flux Score testing</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>

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
          Flux v2.0.0 • Made with intention
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
