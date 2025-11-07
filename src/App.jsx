import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HabitProvider, useHabits } from './context/HabitContext';
import Portfolio from './pages/Portfolio';
import AddHabit from './pages/AddHabit';
import LogActivity from './pages/LogActivity';
import Activity from './pages/Activity';
import Account from './pages/Account';
import HabitDetail from './pages/HabitDetail';

// Onboarding guard wrapper
function AppRoutes() {
  const { user, updateUser } = useHabits();

  // Check if we should skip onboarding (for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const skipOnboarding = urlParams.get('skip') === 'true';

  // If skip parameter is present and user hasn't completed onboarding, mark as complete
  if (skipOnboarding && !user?.hasCompletedOnboarding) {
    updateUser({ hasCompletedOnboarding: true });
  }

  // Skip button for testing - allows bypassing onboarding
  if (!user?.hasCompletedOnboarding) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        padding: '20px'
      }}>
        <h1>Flux</h1>
        <p>Onboarding flow not yet implemented</p>
        <a 
          href="/?skip=true"
          style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Skip to Portfolio (Testing)
        </a>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/add" element={<AddHabit />} />
      <Route path="/log/:habitId" element={<LogActivity />} />
      <Route path="/habit/:id" element={<HabitDetail />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/account" element={<Account />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <HabitProvider>
        <AppRoutes />
      </HabitProvider>
    </Router>
  );
}
