import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { HabitProvider, useHabits } from './context/HabitContext'
import Portfolio from './pages/Portfolio'

// Placeholder components - will be built in phases

function HabitDetail() {
  return <div style={{ padding: '20px' }}>Habit Detail Page - Coming Soon</div>
}

function AddHabit() {
  return <div style={{ padding: '20px' }}>Add Habit Page - Coming Soon</div>
}

function LogActivity() {
  return <div style={{ padding: '20px' }}>Log Activity Page - Coming Soon</div>
}

function Activity() {
  return <div style={{ padding: '20px' }}>Activity Feed Page - Coming Soon</div>
}

function Account() {
  return <div style={{ padding: '20px' }}>Account Page - Coming Soon</div>
}

function Settings() {
  return <div style={{ padding: '20px' }}>Settings Page - Coming Soon</div>
}

function Onboarding() {
  const { updateUser } = useHabits()
  const navigate = useNavigate()

  const handleSkip = () => {
    updateUser({
      name: 'Ryan',
      email: 'ryan@example.com',
      hasCompletedOnboarding: true,
    })
    navigate('/')
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Onboarding Page - Coming Soon</h2>
      <button
        onClick={handleSkip}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Skip to Portfolio (Testing)
      </button>
    </div>
  )
}

// Route guard to handle onboarding
function AppRoutes() {
  const { user } = useHabits()

  // If user hasn't completed onboarding, redirect to onboarding
  if (!user.hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // Main app routes (after onboarding)
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/habit/:id" element={<HabitDetail />} />
      <Route path="/add" element={<AddHabit />} />
      <Route path="/log/:habitId" element={<LogActivity />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/account" element={<Account />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <HabitProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </HabitProvider>
    </Router>
  )
}

export default App
