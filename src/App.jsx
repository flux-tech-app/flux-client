import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HabitProvider, useHabits } from './context/HabitContext';
import { ACTION_TYPES } from './utils/HABIT_LIBRARY';

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

// Components
import Navigation from './components/Navigation';
import BottomSheet from './components/BottomSheet';
import AddHabitFlow from './components/AddHabitFlow';
import LogHabitSheet from './components/LogHabitSheet';

/**
 * Main App Routes
 * - Onboarding guard for first-time users
 * - Navigation bar with integrated FAB
 * - Bottom sheets for quick actions
 */
function AppRoutes() {
  const { user, updateUser, addHabit } = useHabits();
  const location = useLocation();

  // Sheet states for FAB actions
  const [activeSheet, setActiveSheet] = useState(null); // 'create' | 'log' | 'pass' | null

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

  // Handle FAB actions
  const handleCreateHabit = () => {
    setActiveSheet('create');
  };

  const handleLog = () => {
    setActiveSheet('log');
  };

  const handlePass = () => {
    setActiveSheet('pass');
  };

  const closeSheet = () => {
    setActiveSheet(null);
  };

  // Handle habit creation completion
  const handleHabitCreated = (habitData) => {
    const newHabit = addHabit(habitData);
    console.log('Created habit:', newHabit);
    closeSheet();
  };

  // Handle log completion
  const handleLogComplete = (log) => {
    console.log('Logged activity:', log);
    closeSheet();
  };

  return (
    <>
      <ScrollToTop />
      <Routes location={location}>
        {/* Bottom Nav Routes */}
        <Route path="/" element={<Navigate to="/portfolio" replace />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/indices" element={<Indices />} />
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

      {/* Navigation Bar with integrated FAB */}
      {!shouldHideNav && (
        <Navigation
          onCreateHabit={handleCreateHabit}
          onLog={handleLog}
          onPass={handlePass}
        />
      )}

      {/* Create Habit Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'create'}
        onClose={closeSheet}
        height="tall"
      >
        <AddHabitFlow
          onComplete={handleHabitCreated}
          onClose={closeSheet}
        />
      </BottomSheet>

      {/* Log Activity Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'log'}
        onClose={closeSheet}
        height="tall"
      >
        <LogHabitSheet
          actionType={ACTION_TYPES.LOG}
          onClose={closeSheet}
          onLogComplete={handleLogComplete}
        />
      </BottomSheet>

      {/* Pass Activity Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'pass'}
        onClose={closeSheet}
        height="tall"
      >
        <LogHabitSheet
          actionType={ACTION_TYPES.PASS}
          onClose={closeSheet}
          onLogComplete={handleLogComplete}
        />
      </BottomSheet>
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
