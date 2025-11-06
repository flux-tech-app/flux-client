import { useNavigate } from 'react-router-dom'
import { useHabits } from '../context/HabitContext'
import './HabitCard.css'

export default function HabitCard({ habit }) {
  const navigate = useNavigate()
  const { getHabitLogs, getHabitStats } = useHabits()

  const logs = getHabitLogs(habit.id)
  const stats = getHabitStats(habit.id)

  // Check if habit was logged today
  const today = new Date().toDateString()
  const loggedToday = logs.some(
    (log) => new Date(log.timestamp).toDateString() === today
  )

  const handleCardClick = () => {
    navigate(`/habit/${habit.id}`)
  }

  const handleMenuClick = (e) => {
    e.stopPropagation()
    // TODO: Show menu options
    console.log('Menu clicked for habit:', habit.id)
  }

  return (
    <div className="habit-card" onClick={handleCardClick}>
      <div className="habit-header">
        <div className="habit-info">
          <div className="habit-name">{habit.name}</div>
          <div className="habit-goal">
            {habit.type === 'build' ? 'Build' : 'Break'} habit
          </div>
        </div>
        <button className="habit-menu" onClick={handleMenuClick}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="habit-progress">
        {loggedToday ? (
          <>
            <div className="progress-value progress-done">
              {habit.type === 'build' ? (
                <div className="checkmark">✓</div>
              ) : (
                <div className="checkmark checkmark-break">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              <span className="progress-text">
                {habit.type === 'build' ? 'Done' : 'Resisted'}
              </span>
            </div>
            <div className="status-complete">✓ Complete</div>
          </>
        ) : (
          <>
            <div className="progress-value">
              <span className="progress-inactive">—</span>
            </div>
            <div className="progress-status">
              <div className="progress-percent">Not logged</div>
              <div className="progress-label">today</div>
            </div>
          </>
        )}
      </div>

      {/* Streak indicator */}
      {stats.currentStreak > 0 && (
        <div className="streak-indicator">
          🔥 {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
