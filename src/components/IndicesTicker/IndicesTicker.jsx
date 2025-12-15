import { useNavigate } from 'react-router-dom';
import { useHabits } from '../../context/HabitContext';
import './IndicesTicker.css';

/**
 * IndicesTicker - Horizontally scrolling ticker showing index rankings
 * Displays user's habits with their simulated index rankings
 */
export default function IndicesTicker() {
  const navigate = useNavigate();
  const { habits } = useHabits();

  // Don't render if no habits
  if (!habits || habits.length === 0) {
    return null;
  }

  // Generate mock ranking data for each habit
  // In a real app, this would come from an API
  const getTickerData = () => {
    return habits
      .filter(habit => habit.libraryId) // Only include habits with a libraryId
      .map(habit => ({
        id: habit.id,
        libraryId: habit.libraryId,
        name: habit.name,
        // Generate a random ranking between 15-55%
        rank: Math.floor(Math.random() * 40 + 15),
      }));
  };

  const tickerItems = getTickerData();

  // Don't render if no valid ticker items
  if (tickerItems.length === 0) {
    return null;
  }

  // Duplicate items for seamless loop
  const allItems = [...tickerItems, ...tickerItems];

  const handleItemClick = (libraryId) => {
    navigate(`/indices/${libraryId}`);
  };

  return (
    <div className="indices-ticker-container">
      <div className="ticker-scroll-wrapper">
        <div className="ticker-track">
          {allItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="ticker-item"
              onClick={() => handleItemClick(item.libraryId)}
            >
              <div className="ticker-item-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="ticker-item-name">{item.name}</span>
              <span className={`ticker-item-rank ${item.rank <= 20 ? 'top-20' : item.rank <= 10 ? 'top-10' : ''}`}>
                Top {item.rank}%
              </span>
              <span className="ticker-live-dot"></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
