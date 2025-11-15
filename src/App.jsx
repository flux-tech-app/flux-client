import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HabitProvider, useHabits } from './context/HabitContext';
import PageTransition from './components/PageTransition';
import Onboarding from './pages/Onboarding';
import Portfolio from './pages/Portfolio';
import AddHabit from './pages/AddHabit';
import LogActivity from './pages/LogActivity';
import Activity from './pages/Activity';
import Account from './pages/Account';
import HabitDetail from './pages/HabitDetail';
import Indices from './pages/Indices';
import IndexDetail from './pages/IndexDetail';

// Onboarding guard wrapper with route transitions
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

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Portfolio />
          </PageTransition>
        } />
        <Route path="/add" element={
          <PageTransition>
            <AddHabit />
          </PageTransition>
        } />
        <Route path="/log/:habitId" element={
          <PageTransition>
            <LogActivity />
          </PageTransition>
        } />
        <Route path="/habit/:id" element={
          <PageTransition>
            <HabitDetail />
          </PageTransition>
        } />
        <Route path="/activity" element={
          <PageTransition>
            <Activity />
          </PageTransition>
        } />
        <Route path="/indices" element={
          <PageTransition>
            <Indices />
          </PageTransition>
        } />
        <Route path="/indices/:indexId" element={
          <PageTransition>
            <IndexDetail />
          </PageTransition>
        } />
        <Route path="/account" element={
          <PageTransition>
            <Account />
          </PageTransition>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
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
