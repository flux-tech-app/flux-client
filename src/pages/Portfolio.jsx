import { useHabits } from '../context/HabitContext'
import { formatCurrency } from '../utils/formatters'
import HabitCard from '../components/HabitCard'
import Navigation from '../components/Navigation'
import FAB from '../components/FAB'
import './Portfolio.css'

export default function Portfolio() {
  const { habits, getTotalEarnings, getTodayEarnings } = useHabits()

  const totalEarnings = getTotalEarnings()
  const todayEarnings = getTodayEarnings()
  const activeHabits = habits.length

  return (
    <div className="portfolio-page">
      {/* App Header */}
      <header className="app-header">
        <div className="app-logo">Flux</div>
        <div className="header-actions">
          <button className="icon-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="content">
        {/* Portfolio Header */}
        <div className="portfolio-header">
          <div className="portfolio-label">Total Portfolio Value</div>
          <div className="portfolio-value">{formatCurrency(totalEarnings)}</div>
          {todayEarnings > 0 && (
            <div className="portfolio-change">
              <svg className="trend-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span className="change-positive">+{formatCurrency(todayEarnings)}</span>
              <span className="change-label">today</span>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button className="view-tab active">Your Positions</button>
          <button className="view-tab">Analytics</button>
        </div>

        {/* Section Header */}
        {activeHabits > 0 ? (
          <>
            <div className="section-header">
              {activeHabits} Active Position{activeHabits !== 1 ? 's' : ''}
            </div>

            {/* Habit Cards */}
            <div className="habit-cards">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>No Positions Yet</h3>
            <p>Tap the + button to add your first position</p>
          </div>
        )}
      </div>

      <FAB />
      <Navigation />
    </div>
  )
}
