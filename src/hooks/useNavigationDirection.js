import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to determine navigation direction based on route hierarchy
 * Returns: 'forward', 'back', or 'fade'
 */
export function useNavigationDirection() {
  const location = useLocation();
  const prevLocation = useRef(null);

  // Define route depth hierarchy
  const routeDepth = {
    '/': 0,
    '/activity': 0,
    '/indices': 0,
    '/account': 0,
    '/add': 1,
    '/habit/:id': 1,
    '/log/:habitId': 1,
    '/indices/:indexId': 1
  };

  // Get depth for a path
  const getDepth = (pathname) => {
    // Handle exact matches
    if (routeDepth[pathname] !== undefined) {
      return routeDepth[pathname];
    }
    
    // Handle dynamic routes
    if (pathname.startsWith('/habit/')) return routeDepth['/habit/:id'];
    if (pathname.startsWith('/log/')) return routeDepth['/log/:habitId'];
    if (pathname.startsWith('/indices/') && pathname !== '/indices') {
      return routeDepth['/indices/:indexId'];
    }
    
    return 0;
  };

  // Determine direction
  let direction = 'fade'; // Default for same-level navigation

  if (prevLocation.current) {
    const prevDepth = getDepth(prevLocation.current);
    const currentDepth = getDepth(location.pathname);
    
    // Check if navigating between bottom nav tabs (same depth = 0)
    const isBottomNavTransition = prevDepth === 0 && currentDepth === 0;
    
    if (isBottomNavTransition) {
      direction = 'fade';
    } else if (currentDepth > prevDepth) {
      direction = 'forward';
    } else if (currentDepth < prevDepth) {
      direction = 'back';
    }
  }

  // Update previous location
  useEffect(() => {
    prevLocation.current = location.pathname;
  }, [location.pathname]);

  return direction;
}
