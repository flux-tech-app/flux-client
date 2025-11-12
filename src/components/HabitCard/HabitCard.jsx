import { motion } from 'framer-motion';
import { calculateStreak } from '../../utils/calculations';
import { animations } from '../../utils/AnimationConfig';
import './HabitCard.css';

export default function HabitCard({ habit, logs, onClick }) {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if habit was logged today
  const isLoggedToday = logs.some(log => {
    const logDate = new Date(log.timestamp);
    logDate.setHours(0, 0, 0, 0);
    return log.habitId === habit.id && logDate.getTime() === today.getTime();
  });

  // Calculate current streak
  const streak = calculateStreak(logs, habit.id);

  const isBuildHabit = habit.type === 'build';

  return (
    <motion.div 
      className="habit-card" 
      onClick={onClick}
      whileTap={animations.cardPress.tap}
      transition={animations.cardPress.transition}
    >
      {/* Header */}
      <div className="habit-header">
        <div className="habit-info">
          <div className="habit-name">{habit.name}</div>
          <div className="habit-type">
            {isBuildHabit ? 'Build habit' : 'Break habit'}
          </div>
        </div>
        <button 
          className="habit-menu" 
          onClick={(e) => {
            e.stopPropagation();
            // Menu functionality for Phase 4
          }}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="habit-progress">
        <div className="progress-value">
          {isLoggedToday ? (
            isBuildHabit ? (
              <div className="progress-done">
                <div className="checkmark">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="progress-text">Done</span>
              </div>
            ) : (
              <div className="progress-resisted">
                <div className="shield-icon">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="progress-text">Resisted</span>
              </div>
            )
          ) : (
            <div className="progress-inactive">—</div>
          )}
        </div>

        <div className="progress-status">
          {isLoggedToday && (
            <div className="status-complete">✓ Complete</div>
          )}
          {streak > 0 && (
            <div className="streak-display">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              {streak} day{streak !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
