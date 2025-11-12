import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HabitProvider, useHabits } from './context/HabitContext';
import { useNavigationDirection } from './hooks/useNavigationDirection';
import PageTransition from './components/PageTransition';
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
  const direction = useNavigationDirection();

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
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition direction={direction}>
            <Portfolio />
          </PageTransition>
        } />
        <Route path="/add" element={
          <PageTransition direction={direction}>
            <AddHabit />
          </PageTransition>
        } />
        <Route path="/log/:habitId" element={
          <PageTransition direction={direction}>
            <LogActivity />
          </PageTransition>
        } />
        <Route path="/habit/:id" element={
          <PageTransition direction={direction}>
            <HabitDetail />
          </PageTransition>
        } />
        <Route path="/activity" element={
          <PageTransition direction={direction}>
            <Activity />
          </PageTransition>
        } />
        <Route path="/indices" element={
          <PageTransition direction={direction}>
            <Indices />
          </PageTransition>
        } />
        <Route path="/indices/:indexId" element={
          <PageTransition direction={direction}>
            <IndexDetail />
          </PageTransition>
        } />
        <Route path="/account" element={
          <PageTransition direction={direction}>
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
