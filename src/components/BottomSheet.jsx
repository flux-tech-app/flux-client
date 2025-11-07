import { useNavigate } from 'react-router-dom';
import './BottomSheet.css';

export default function BottomSheet({ isOpen, onClose, habits, logs }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if habit was logged today
  const isLoggedToday = (habitId) => {
    return logs.some(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return log.habitId === habitId && logDate.getTime() === today.getTime();
    });
  };

  const handleHabitClick = (habitId) => {
    navigate(`/log/${habitId}`);
  };

  const handleAddClick = () => {
    navigate('/add');
  };

  return (
    <>
      {/* Overlay */}
      <div className="bottom-sheet-overlay" onClick={onClose} />
      
      {/* Bottom Sheet */}
      <div className="bottom-sheet">
        <div className="sheet-header">
          <div className="sheet-handle" />
          <div className="sheet-title-row">
            <div className="sheet-title">Log Activity</div>
            <button className="add-button" onClick={handleAddClick}>
              Add
            </button>
          </div>
        </div>
        
        <div className="sheet-content">
          {habits.length === 0 ? (
            <div className="empty-state">
              <p>No positions yet. Tap "Add" to create your first one.</p>
            </div>
          ) : (
            habits.map(habit => {
              const logged = isLoggedToday(habit.id);
              
              return (
                <div 
                  key={habit.id}
                  className="habit-list-item"
                  onClick={() => handleHabitClick(habit.id)}
                >
                  <div className={`habit-icon ${habit.type === 'break' ? 'resist' : ''}`}>
                    {habit.type === 'build' ? (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="habit-info">
                    <div className="habit-list-name">{habit.name}</div>
                    <div className="habit-list-rate">
                      {habit.rateType === 'duration' 
                        ? `$${habit.rate.toFixed(2)}/min`
                        : `$${habit.rate.toFixed(2)}`
                      }
                    </div>
                  </div>
                  
                  <div className={`habit-status ${logged ? 'status-done' : 'status-pending'}`}>
                    {logged ? 'Done' : 'Pending'}
                  </div>
                  
                  <svg className="chevron" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
