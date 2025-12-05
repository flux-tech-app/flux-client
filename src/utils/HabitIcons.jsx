/**
 * HabitIcons.jsx
 * 
 * Professional SVG icons for all 23 behaviors in the library
 * Usage: <HabitIcon habitId="running" size={28} />
 */

export function HabitIcon({ habitId, size = 24, className = '' }) {
  const iconPath = HABIT_ICON_PATHS[habitId];
  
  if (!iconPath) {
    // Fallback icon
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
        className={className}
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      className={className}
    >
      {iconPath}
    </svg>
  );
}

/**
 * Icon paths for each habit
 * All use stroke-based design for consistency
 */
const HABIT_ICON_PATHS = {
  // ===== LOG BEHAVIORS =====
  running: (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  ),
  
  gym: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5v11M17.5 6.5v11M6.5 12h11M2 8.5h3M2 15.5h3M19 8.5h3M19 15.5h3M4.5 8.5v7M19.5 8.5v7" />
    </g>
  ),
  
  pushups: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15l4-8 4 4 4-4 4 8" />
      <path d="M4 15h16" />
      <circle cx="12" cy="7" r="2" />
    </g>
  ),
  
  walking: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v5l-2 5M12 12l2 5M9 21l1-4M15 21l-1-4M10 12h4" />
    </g>
  ),
  
  crunches: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </g>
  ),

  budget: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 7h6M9 11h6M9 15h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </g>
  ),
  
  cook: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M8 3v3M16 3v3M4 11h16M6 11v8a2 2 0 002 2h8a2 2 0 002-2v-8" />
      <path d="M9 7h6a3 3 0 013 3v1H6v-1a3 3 0 013-3z" />
    </g>
  ),
  
  reading: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
    </g>
  ),
  
  study: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
      <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
    </g>
  ),

  meditation: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="2" />
      <path d="M12 8v3" />
      <path d="M8 21c0-3 2-4 4-4s4 1 4 4" />
      <path d="M6 15c-1 1-2 3-2 6h4" />
      <path d="M18 15c1 1 2 3 2 6h-4" />
      <path d="M8 14l4-3 4 3" />
    </g>
  ),
  
  journal: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7H12v-3z" />
      <path d="M5 19V5a2 2 0 012-2h10a2 2 0 012 2v5" />
      <path d="M9 7h6M9 11h3" />
    </g>
  ),
  
  compliment: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      <path d="M9 10h.01M15 10h.01M9 15s1 2 3 2 3-2 3-2" />
    </g>
  ),
  
  makebed: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 16v4h20v-4" />
      <path d="M2 16l2-8h16l2 8" />
      <path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" />
      <path d="M6 12h12" />
    </g>
  ),

  // ===== PASS BEHAVIORS =====
  takeout: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18M5 4h14l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 4z" />
      <path d="M10 11v6M14 11v6" />
      <path d="M4 4l16 16" />
    </g>
  ),
  
  alcohol: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l-2 6H10L8 2z" />
      <path d="M10 8h4v6a4 4 0 01-4 4 4 4 0 01-4-4v-6z" />
      <path d="M4 4l16 16" />
    </g>
  ),
  
  doomscrolling: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 6v12M8 10l4 4 4-4" />
      <path d="M3 3l18 18" />
    </g>
  ),
  
  smoking: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8c0-2.5-2-4.5-4.5-4.5S9 5.5 9 8M7 12h10M5 12h2M17 12h2" />
      <rect x="5" y="12" width="14" height="6" rx="1" />
      <path d="M3 3l18 18" />
    </g>
  ),
  
  vaping: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="12" width="4" height="10" rx="1" />
      <path d="M8 12V8a2 2 0 012-2h0a2 2 0 012 2v4" />
      <circle cx="16" cy="15" r="2" />
      <circle cx="16" cy="20" r="1" />
      <path d="M3 3l18 18" />
    </g>
  ),
  
  impulse: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 01-8 0" />
      <path d="M4 4l16 16" />
    </g>
  ),
  
  junkfood: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 00-5 5c0 1.5 1 3 2 4v2a2 2 0 002 2h2a2 2 0 002-2v-2c1-1 2-2.5 2-4a5 5 0 00-5-5z" />
      <path d="M8 15h8M9 18h6M10 21h4" />
      <path d="M3 3l18 18" />
    </g>
  ),
  
  midnight: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
      <path d="M21 12h-2M5 12H3M12 21v-2M12 5V3" />
      <path d="M3 3l18 18" />
    </g>
  ),
  
  gambling: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <path d="M3 3l18 18" />
    </g>
  ),
  
  snooze: (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M8 3h8M12 3v2" />
      <path d="M3 3l18 18" />
    </g>
  )
};

export default HabitIcon;
