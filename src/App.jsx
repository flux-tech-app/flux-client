// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HabitProvider, useHabits } from "./context/HabitContext";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

// Pages
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Dashboard from "./pages/Dashboard";
import AddHabit from "./pages/AddHabit";
import LogActivity from "./pages/LogActivity";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import DevTools from "./pages/DevTools";
import HabitDetail from "./pages/HabitDetail";
import Indices from "./pages/Indices";
import IndexDetail from "./pages/IndexDetail";
import Transfers from "./pages/Transfers";
import Growth from "./pages/Growth";

// Components
import Navigation from "./components/Navigation";

function AppRoutes() {
  const location = useLocation();

  // Optional context loading/error if you expose it (recommended during migration)
  const { isLoading, error, refresh } = useHabits();

  const skipOnboarding = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("skip") === "true";
  }, []);

  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem("flux_onboarded") === "1";
  });

  useEffect(() => {
    if (skipOnboarding && !onboarded) {
      localStorage.setItem("flux_onboarded", "1");
      setOnboarded(true);
    }
  }, [skipOnboarding, onboarded]);

  // If your HabitContext fetches bootstrap on mount, this prevents flashing onboarding/home
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

  if (!onboarded) {
    return (
      <Onboarding
        onComplete={() => {
          localStorage.setItem("flux_onboarded", "1");
          setOnboarded(true);
        }}
      />
    );
  }

  const hideNavPaths = ["/add", "/log"];
  const shouldHideNav = hideNavPaths.some((path) => location.pathname.startsWith(path));

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