import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HabitProvider, useHabits } from './context/HabitContext';
import { FluxChatProvider } from './context/FluxChatContext';
import Onboarding from './pages/Onboarding';
import Portfolio from './pages/Portfolio';
import AddHabit from './pages/AddHabit';
import LogActivity from './pages/LogActivity';
import Activity from './pages/Activity';
import Account from './pages/Account';
import HabitDetail from './pages/HabitDetail';
import Indices from './pages/Indices';
import IndexDetail from './pages/IndexDetail';
import FluxChat from './components/FluxChat'; // CHAT DEMO: Added

// Onboarding guard wrapper with route transitions
function AppRoutes() {
  const { user, updateUser, habits } = useHabits();
  const location = useLocation();

  // Check if we should skip onboarding (for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const skipOnboarding = urlParams.get('skip') === 'true';

  // If skip parameter is present and user hasn't completed onboarding, mark as complete
  if (skipOnboarding && !user?.hasCompletedOnboarding) {
    updateUser({ hasCompletedOnboarding: true });
  }

  // Show onboarding flow for first-time users
  if (!user?.hasCompletedOnboarding) {
    return (
      <Onboarding
        onComplete={() => updateUser({ hasCompletedOnboarding: true })}
      />
    );
  }

  // Show FluxChat on Portfolio (always), Activity, and Indices (when there are habits)
  const isPortfolio = location.pathname === '/';
  const isActivityOrIndices = ['/activity', '/indices'].includes(location.pathname);
  const hasHabits = habits.length > 0;
  const showFluxChat = isPortfolio || (isActivityOrIndices && hasHabits);

  return (
    <>
      <Routes location={location}>
        {/* Bottom Nav Routes - NO transitions, instant navigation */}
        <Route path="/" element={<Portfolio />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/indices" element={<Indices />} />
        <Route path="/account" element={<Account />} />

        {/* Stacked Navigation Routes - NO PageTransition (native iOS-style) */}
        <Route path="/add" element={<AddHabit />} />
        <Route path="/log/:habitId" element={<LogActivity />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="/indices/:indexId" element={<IndexDetail />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showFluxChat && <FluxChat />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <HabitProvider>
        <FluxChatProvider>
          <AppRoutes />
        </FluxChatProvider>
      </HabitProvider>
    </Router>
  );
}
