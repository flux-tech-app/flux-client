import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHabits } from '../../context/HabitContext';
import { calculateTodayEarnings, getNextTransferDate } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import HabitCard from '../../components/HabitCard';
// CHAT DEMO: Old form-based flow disabled - FluxChat replaces FAB + BottomSheet
// import FAB from '../../components/FAB';
// import BottomSheet from '../../components/BottomSheet';
import Navigation from '../../components/Navigation';
import EmptyState from './EmptyState';
import { animations } from '../../utils/AnimationConfig';
import './Portfolio.css';

export default function Portfolio() {
  const { habits, logs, getTransferredBalance, getPendingBalance } = useHabits();
  const navigate = useNavigate();
  // CHAT DEMO: BottomSheet state no longer needed
  // const [isSheetOpen, setIsSheetOpen] = useState(false);

  const transferredBalance = getTransferredBalance();
  const pendingBalance = getPendingBalance();
  const todayEarnings = calculateTodayEarnings(logs);
  const nextTransfer = getNextTransferDate();
  const hasHabits = habits.length > 0;

  const handleHabitClick = (habitId) => {
    // Explicit forward direction
    navigate(`/habit/${habitId}`, { state: { direction: 'forward' } });
  };

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        {/* Header */}
        <header className="portfolio-header">
          <div className="app-logo">Flux</div>
          <button className="icon-button" onClick={() => navigate('/account')}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </header>

        {/* Portfolio Value */}
        <section className="portfolio-value-section">
          <div className="portfolio-value">{formatCurrency(transferredBalance)}</div>
          <div className="portfolio-subtitle">
            {hasHabits ? 'Total portfolio value' : 'Ready to start building habits'}
          </div>
          
          {hasHabits && (
            <>
              <div className="portfolio-change">
                {todayEarnings > 0 && (
                  <>
                    <svg className="trend-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    <span className="change-amount">+{formatCurrency(todayEarnings)} today</span>
                  </>
                )}
              </div>

              {/* Pending Transfer Line */}
              {pendingBalance > 0 && (
                <div className="pending-transfer-line">
                  <svg className="pending-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="pending-amount">{formatCurrency(pendingBalance)} pending</span>
                  <span className="pending-separator">•</span>
                  <span className="pending-schedule">transfers {nextTransfer}</span>
                </div>
              )}
            </>
          )}
        </section>

        {/* Conditional Rendering: Empty State vs Habit List */}
        {!hasHabits ? (
          <EmptyState />
        ) : (
          <>
            {/* View Toggle */}
            <section className="view-toggle">
              <button className="toggle-button active">Positions</button>
              <button className="toggle-button">Analytics</button>
            </section>

            {/* Habit Cards with Stagger Animation */}
            <section className="habits-section">
              <motion.div 
                className="habits-list"
                variants={animations.stagger.container}
                initial="initial"
                animate="animate"
              >
                {habits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    variants={animations.stagger.item}
                    custom={index}
                  >
                    <HabitCard
                      habit={habit}
                      logs={logs}
                      onClick={() => handleHabitClick(habit.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          </>
        )}
      </div>

      {/* CHAT DEMO: Old form-based interaction disabled - FluxChat (in App.jsx) replaces this */}
      {/* Floating Action Button */}
      {/* <FAB 
        onClick={() => setIsSheetOpen(true)}
        isOpen={isSheetOpen}
      /> */}

      {/* Bottom Sheet */}
      {/* <BottomSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        habits={habits}
        logs={logs}
      /> */}

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
