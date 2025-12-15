import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HabitProvider, useHabits } from './context/HabitContext';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Pages
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Dashboard from './pages/Dashboard';
import AddHabit from './pages/AddHabit';
import LogActivity from './pages/LogActivity';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DevTools from './pages/DevTools';
import HabitDetail from './pages/HabitDetail';
import Indices from './pages/Indices';
import IndexDetail from './pages/IndexDetail';
import Transfers from './pages/Transfers';
import Growth from './pages/Growth';

// Components
import Navigation from './components/Navigation';

/**
 * Main App Routes
 * - Onboarding guard for first-time users
 * - Bottom navigation bar (Home, Portfolio, Indices)
 */
function AppRoutes() {
  const { user, updateUser } = useHabits();
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

  // Determine which pages should show the Navigation
  const hideNavPaths = ['/add', '/log'];
  const shouldHideNav = hideNavPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      <ScrollToTop />
      <Routes location={location}>
        {/* Bottom Nav Routes */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/indices" element={<Indices />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/account" element={<Navigate to="/profile" replace />} />

        {/* Secondary Pages */}
        <Route path="/activity" element={<Activity />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/devtools" element={<DevTools />} />

        {/* Stacked Navigation Routes */}
        <Route path="/add" element={<AddHabit />} />
        <Route path="/log/:habitId" element={<LogActivity />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="/indices/:indexId" element={<IndexDetail />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Navigation Bar */}
      {!shouldHideNav && <Navigation />}
    </>
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
