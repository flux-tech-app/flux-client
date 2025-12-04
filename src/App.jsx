import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HabitProvider, useHabits } from './context/HabitContext';

// Pages
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Dashboard from './pages/Dashboard';
import AddHabit from './pages/AddHabit';
import LogActivity from './pages/LogActivity';
import Activity from './pages/Activity';
import Account from './pages/Account';
import HabitDetail from './pages/HabitDetail';
import Indices from './pages/Indices';
import IndexDetail from './pages/IndexDetail';

// Components
import FAB from './components/FAB';
import BottomSheet from './components/BottomSheet';
import AddHabitFlow from './components/AddHabitFlow';
import LogHabitSheet from './components/LogHabitSheet';

/**
 * Main App Routes
 * - Onboarding guard for first-time users
 * - FAB with Create and Log actions
 * - Bottom sheets for quick actions
 */
function AppRoutes() {
  const { user, updateUser, addHabit } = useHabits();
  const location = useLocation();

  // Sheet states for FAB actions
  const [activeSheet, setActiveSheet] = useState(null); // 'create' | 'log' | null

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

  // Determine which pages should show the FAB
  const hideFABPaths = ['/add', '/log'];
  const shouldHideFAB = hideFABPaths.some(path => location.pathname.startsWith(path));

  // Handle FAB actions
  const handleCreateHabit = () => {
    setActiveSheet('create');
  };

  const handleLog = () => {
    setActiveSheet('log');
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
      <Routes location={location}>
        {/* Bottom Nav Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/indices" element={<Indices />} />
        <Route path="/account" element={<Account />} />

        {/* Secondary Pages */}
        <Route path="/activity" element={<Activity />} />

        {/* Stacked Navigation Routes */}
        <Route path="/add" element={<AddHabit />} />
        <Route path="/log/:habitId" element={<LogActivity />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="/indices/:indexId" element={<IndexDetail />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* FAB - Shows on main pages (2 actions: Create + Log) */}
      {!shouldHideFAB && (
        <FAB
          onCreateHabit={handleCreateHabit}
          onLog={handleLog}
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
