import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Simple, reliable navigation direction hook
 * Uses explicit direction from location.state when available
 * Falls back to history tracking for browser back button
 */
export function useNavigationDirection() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPathRef = useRef(location.pathname);
  const historyStackRef = useRef([location.pathname]);

  // Bottom nav paths that should fade
  const bottomNavPaths = ['/', '/activity', '/indices', '/account'];
  
  // Get explicit direction from location state (most reliable)
  const explicitDirection = location.state?.direction;
  
  if (explicitDirection) {
    // Update history stack
    if (explicitDirection === 'forward') {
      historyStackRef.current.push(location.pathname);
    } else if (explicitDirection === 'back') {
      historyStackRef.current.pop();
    }
    prevPathRef.current = location.pathname;
    return explicitDirection;
  }

  // Fallback: Determine direction from navigation context
  const currentPath = location.pathname;
  const prevPath = prevPathRef.current;

  // Update ref for next render
  prevPathRef.current = currentPath;

  // Bottom nav transitions should fade
  if (bottomNavPaths.includes(prevPath) && bottomNavPaths.includes(currentPath)) {
    return 'fade';
  }

  // Browser back button detection
  if (navigationType === 'POP') {
    historyStackRef.current.pop();
    return 'back';
  }

  // Check if returning to a page we've seen before
  const lastIndex = historyStackRef.current.lastIndexOf(currentPath);
  if (lastIndex !== -1 && lastIndex < historyStackRef.current.length - 1) {
    // Going back to an earlier page
    historyStackRef.current = historyStackRef.current.slice(0, lastIndex + 1);
    return 'back';
  }

  // Default: Going forward to a new page
  historyStackRef.current.push(currentPath);
  return 'forward';
}
