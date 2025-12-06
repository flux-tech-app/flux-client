import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Navigation.css'

export default function Navigation({ onCreateHabit, onLog, onPass }) {
  const location = useLocation()
  const [fabOpen, setFabOpen] = useState(false)

  const isActive = (path) => {
    return location.pathname === path
  }

  const toggleFab = () => setFabOpen(!fabOpen)

  const handleAction = (action) => {
    setFabOpen(false)
    action?.()
  }

  // FAB action configurations - horizontal layout: left to right
  const bubbles = [
    {
      id: 'add',
      label: 'Add Position',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      action: onCreateHabit,
      color: 'blue'
    },
    {
      id: 'log',
      label: 'Log Activity',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      action: onLog,
      color: 'green'
    },
    {
      id: 'pass',
      label: 'Skip Today',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      action: onPass,
      color: 'amber'
    }
  ]

  return (
    <>
      {/* Overlay when FAB is open */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            className="fab-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Actions - horizontal row above nav */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            className="fab-actions-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {bubbles.map((bubble, index) => (
              <motion.button
                key={bubble.id}
                className={`fab-action-item fab-action-${bubble.color}`}
                onClick={() => handleAction(bubble.action)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="fab-action-label">{bubble.label}</span>
                <div className="fab-action-icon">
                  {bubble.icon}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bottom-nav">
        {/* Portfolio - Pie chart icon */}
        <Link to="/portfolio" className={`nav-item ${isActive('/portfolio') ? 'active' : ''}`}>
          <svg className="nav-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 2v9H2a9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9zm2 0v7h7a9 9 0 0 0-7-7z" />
          </svg>
          <span>Portfolio</span>
        </Link>

        {/* Center FAB */}
        <div className="nav-fab-container">
          {/* Main FAB Button */}
          <motion.button
            className={`nav-fab ${fabOpen ? 'fab-open' : ''}`}
            onClick={toggleFab}
            aria-label={fabOpen ? "Close actions" : "Open actions"}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </motion.button>
        </div>

        {/* Account */}
        <Link to="/account" className={`nav-item ${isActive('/account') ? 'active' : ''}`}>
          <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <span>Account</span>
        </Link>
      </nav>
    </>
  )
}
