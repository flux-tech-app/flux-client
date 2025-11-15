import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * iOS-style navigation direction detection
 * Tracks navigation history to determine slide direction
 *
 * Returns:
 * - 'forward': Navigating deeper (slide from right)
 * - 'back': Navigating back (slide to right)
 * - 'fade': Bottom nav transitions (fade only)
 */
export function useNavigationDirection() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [direction, setDirection] = useState('fade');
  const prevPathRef = useRef(null);
  const historyStackRef = useRef([]);
  const isInitialMount = useRef(true);

  // Bottom nav paths that should fade
  const bottomNavPaths = ['/', '/activity', '/indices', '/account'];

  useEffect(() => {
    // Initialize on first mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathRef.current = location.pathname;
      historyStackRef.current = [location.pathname];
      return;
    }

    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;

    // Check for explicit direction in location state (most reliable)
    if (location.state?.direction) {
      setDirection(location.state.direction);

      // Update history stack based on explicit direction
      if (location.state.direction === 'forward') {
        historyStackRef.current.push(currentPath);
      } else if (location.state.direction === 'back' && historyStackRef.current.length > 1) {
        historyStackRef.current.pop();
      }

      prevPathRef.current = currentPath;
      return;
    }

    // Bottom nav transitions should fade (both paths are root-level)
    if (bottomNavPaths.includes(prevPath) && bottomNavPaths.includes(currentPath)) {
      setDirection('fade');
      prevPathRef.current = currentPath;
      return;
    }

    // Detect browser back button (POP = back/forward browser buttons)
    if (navigationType === 'POP') {
      // Check if we're going back in our history
      const currentIndex = historyStackRef.current.indexOf(currentPath);
      const prevIndex = historyStackRef.current.indexOf(prevPath);

      if (currentIndex !== -1 && currentIndex < prevIndex) {
        // Going back to an earlier page
        setDirection('back');
        historyStackRef.current = historyStackRef.current.slice(0, currentIndex + 1);
      } else if (prevIndex !== -1 && currentIndex > prevIndex) {
        // Going forward (browser forward button)
        setDirection('forward');
        historyStackRef.current.push(currentPath);
      } else {
        // Default POP behavior is back
        setDirection('back');
        if (historyStackRef.current.length > 1) {
          historyStackRef.current.pop();
        }
      }

      prevPathRef.current = currentPath;
      return;
    }

    // Check if we're returning to a page already in history (programmatic back)
    const indexInHistory = historyStackRef.current.indexOf(currentPath);
    if (indexInHistory !== -1 && indexInHistory < historyStackRef.current.length - 1) {
      // Going back to a previous page
      setDirection('back');
      historyStackRef.current = historyStackRef.current.slice(0, indexInHistory + 1);
    } else {
      // Going forward to a new page
      setDirection('forward');
      historyStackRef.current.push(currentPath);
    }

    // Keep history stack manageable
    if (historyStackRef.current.length > 50) {
      historyStackRef.current = historyStackRef.current.slice(-25);
    }

    prevPathRef.current = currentPath;
  }, [location.pathname, location.state, navigationType]);

  return direction;
}

/**
 * Check if back navigation is available
 * Used to enable/disable swipe-back gesture
 *
 * Returns true if:
 * - History stack has more than one entry
 * - Current page is not a root/bottom-nav page
 */
export function useCanGoBack() {
  const location = useLocation();
  const historyStackRef = useRef([location.pathname]);
  const [canGoBack, setCanGoBack] = useState(false);

  // Bottom nav paths cannot swipe back
  const bottomNavPaths = ['/', '/activity', '/indices', '/account'];

  useEffect(() => {
    // Track history
    const currentPath = location.pathname;

    // Check if current path is already in history
    if (!historyStackRef.current.includes(currentPath)) {
      historyStackRef.current.push(currentPath);
    }

    // Can go back if:
    // 1. History has more than one entry
    // 2. Current page is not a bottom nav page
    const hasHistory = historyStackRef.current.length > 1;
    const isNotBottomNav = !bottomNavPaths.includes(currentPath);

    setCanGoBack(hasHistory && isNotBottomNav);
  }, [location.pathname]);

  return canGoBack;
}
