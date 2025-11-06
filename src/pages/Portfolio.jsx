import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';
import { calculateTotalValue, calculateTodayEarnings } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import HabitCard from '../components/HabitCard';
import FAB from '../components/FAB';
import BottomSheet from '../components/BottomSheet';
import Navigation from '../components/Navigation';
import './Portfolio.css';

export default function Portfolio() {
  const { habits, logs } = useHabits();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const totalValue = calculateTotalValue(logs);
  const todayEarnings = calculateTodayEarnings(logs);

  const handleHabitClick = (habitId) => {
    navigate(`/habit/${habitId}`);
  };

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        {/* Header */}
        <header className="portfolio-header">
          <div className="app-logo">Flux</div>
          <button className="icon-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </header>

        {/* Portfolio Value */}
        <section className="portfolio-value-section">
          <div className="portfolio-value">{formatCurrency(totalValue)}</div>
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
        </section>

        {/* View Toggle */}
        <section className="view-toggle">
          <button className="toggle-button active">Positions</button>
          <button className="toggle-button">Analytics</button>
        </section>

        {/* Habit Cards */}
        <section className="habits-section">
          {habits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3>No positions yet</h3>
              <p>Tap the + button to create your first position</p>
            </div>
          ) : (
            <div className="habits-list">
              {habits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  logs={logs}
                  onClick={() => handleHabitClick(habit.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Floating Action Button */}
      <FAB onClick={() => setIsSheetOpen(true)} />

      {/* Bottom Sheet */}
      <BottomSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        habits={habits}
        logs={logs}
      />

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
