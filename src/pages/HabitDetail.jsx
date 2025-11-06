import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits } = useHabits();
  
  const habit = habits.find(h => h.id === id);

  if (!habit) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Habit not found</p>
        <button onClick={() => navigate('/')}>Back to Portfolio</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Back
      </button>
      <h1>{habit.name}</h1>
      <p>Detailed habit view with charts and stats (coming soon)</p>
    </div>
  );
}
