import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

export default function Navigation() {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bottom-nav">
      {/* Home - House icon */}
      <Link to="/home" className={`nav-item ${isActive('/home') ? 'active' : ''}`}>
        <svg className="nav-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span>Home</span>
      </Link>

      {/* Portfolio - Pie chart icon */}
      <Link to="/portfolio" className={`nav-item ${isActive('/portfolio') ? 'active' : ''}`}>
        <svg className="nav-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 2v9H2a9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9zm2 0v7h7a9 9 0 0 0-7-7z" />
        </svg>
        <span>Portfolio</span>
      </Link>

      {/* Indices - Bar chart icon */}
      <Link to="/indices" className={`nav-item ${isActive('/indices') ? 'active' : ''}`}>
        <svg className="nav-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h2v8H3v-8zm4-5h2v13H7V8zm4-5h2v18h-2V3zm4 8h2v10h-2V11zm4-3h2v13h-2V8z" />
        </svg>
        <span>Indices</span>
      </Link>

      {/* Growth - Tree/Branch icon */}
      <Link to="/growth" className={`nav-item ${isActive('/growth') ? 'active' : ''}`}>
        <svg className="nav-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.77 1.02 3.29 2.5 4.03V22h4V10.53c1.48-.74 2.5-2.26 2.5-4.03C16.5 4 14.5 2 12 2zm0 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 4 12 4s2.5 1.12 2.5 2.5S13.38 9 12 9z" />
          <path d="M6 12c-1.66 0-3 1.34-3 3 0 1.31.84 2.42 2 2.83V22h2v-4.17c1.16-.41 2-1.52 2-2.83 0-1.66-1.34-3-3-3z" opacity="0.6" />
          <path d="M18 12c-1.66 0-3 1.34-3 3 0 1.31.84 2.42 2 2.83V22h2v-4.17c1.16-.41 2-1.52 2-2.83 0-1.66-1.34-3-3-3z" opacity="0.6" />
        </svg>
        <span>Growth</span>
      </Link>
    </nav>
  )
}
