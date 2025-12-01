import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

export default function Navigation() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/indices') {
      return location.pathname === '/indices' || location.pathname.startsWith('/indices/')
    }
    return location.pathname === path
  }

  return (
    <nav className="bottom-nav">
      {/* Portfolio */}
      <Link to="/portfolio" className={`nav-item ${isActive('/portfolio') ? 'active' : ''}`}>
        <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" />
        </svg>
        <span>Portfolio</span>
      </Link>

      {/* Today (formerly Home) */}
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        <span>Today</span>
      </Link>

      {/* Dashboard (center) */}
      <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span>Dashboard</span>
      </Link>

      {/* Indices */}
      <Link to="/indices" className={`nav-item ${isActive('/indices') ? 'active' : ''}`}>
        <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        <span>Indices</span>
      </Link>

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
  )
}
