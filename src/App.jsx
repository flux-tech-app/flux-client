// src/App.jsx
import { useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { HabitProvider } from "@/providers/HabitProvider";
import useHabits from "@/hooks/useHabits";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";
import Dashboard from "@/pages/Dashboard";
import AddHabit from "@/pages/AddHabit";
import LogActivity from "@/pages/LogActivity";
import Activity from "@/pages/Activity";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import DevTools from "@/pages/DevTools";
import HabitDetail from "@/pages/HabitDetail";
import Indices from "@/pages/Indices";
import IndexDetail from "@/pages/IndexDetail";
import Transfers from "@/pages/Transfers";
import Growth from "@/pages/Growth";

// Components
import Navigation from "@/components/Navigation";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const { session, isAuthLoading } = useAuth();

  // comes from HabitProvider (bootstrap + actions)
  const { isLoading, error, refresh, user, completeOnboarding } = useHabits();

  const skipOnboarding = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("skip") === "true";
  }, []);

  const hasCompletedOnboarding = !!user?.hasCompletedOnboarding;

  // Dev helper: ?skip=true => complete onboarding via backend
  useEffect(() => {
    if (!skipOnboarding) return;
    if (!session) return;
    if (!user) return;
    if (hasCompletedOnboarding) return;

    (async () => {
      try {
        await completeOnboarding();
        // refresh is usually redundant because completeOnboarding updates boot.user,
        // but keep this if your backend returns something else you want reloaded.
        await refresh?.();
      } catch (e) {
        console.error("skip onboarding failed:", e);
      }
    })();
  }, [skipOnboarding, session, user, hasCompletedOnboarding, completeOnboarding, refresh]);

  // Auth is still initializing
  if (isAuthLoading) {
    return (
      <>
        <ScrollToTop />
        <div style={{ padding: 24 }}>
          <h3>Loading…</h3>
        </div>
      </>
    );
  }

  // Signed out => Auth page
  if (!session) {
    return (
      <>
        <ScrollToTop />
        <Auth />
      </>
    );
  }

  // Signed in => waiting for bootstrap
  if (isLoading) {
    return (
      <>
        <ScrollToTop />
        <div style={{ padding: 24 }}>
          <h3>Loading…</h3>
        </div>
      </>
    );
  }

  // Bootstrap failed
  if (error) {
    return (
      <>
        <ScrollToTop />
        <div style={{ padding: 24 }}>
          <h3>Couldn’t load app</h3>
          <p>{error?.message || "Unknown error"}</p>
          {refresh && (
            <button onClick={refresh} style={{ marginTop: 12 }}>
              Retry
            </button>
          )}
        </div>
      </>
    );
  }

  // Bootstrap succeeded but user missing (shouldn’t happen; keep safe)
  if (!user) {
    return (
      <>
        <ScrollToTop />
        <div style={{ padding: 24 }}>
          <h3>Couldn’t load user</h3>
          {refresh && (
            <button onClick={refresh} style={{ marginTop: 12 }}>
              Retry
            </button>
          )}
        </div>
      </>
    );
  }

  // Backend is source of truth for onboarding gate
  if (!hasCompletedOnboarding) {
    return (
      <Onboarding
        onComplete={async () => {
          await completeOnboarding();
          await refresh?.();
        }}
      />
    );
  }

  const hideNavPaths = ["/add", "/log"];
  const shouldHideNav = hideNavPaths.some((p) => location.pathname.startsWith(p));

  return (
    <>
      <ScrollToTop />

      <Routes location={location}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/indices" element={<Indices />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/account" element={<Navigate to="/profile" replace />} />

        <Route path="/activity" element={<Activity />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/devtools" element={<DevTools />} />

        <Route path="/add" element={<AddHabit />} />
        <Route path="/log/:habitId" element={<LogActivity />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="/indices/:indexId" element={<IndexDetail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!shouldHideNav && <Navigation />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <HabitProvider>
          <AppRoutes />
        </HabitProvider>
      </Router>
    </AuthProvider>
  );
}