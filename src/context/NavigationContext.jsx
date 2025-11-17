import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [direction, setDirection] = useState('fade');
  const historyStack = useRef([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      historyStack.current = [location.pathname];
      return;
    }

    const currentPath = location.pathname;
    const previousPath = historyStack.current[historyStack.current.length - 1];

    // Determine if this is bottom nav navigation (both at root level)
    const rootPaths = ['/', '/portfolio', '/activity', '/indices', '/account'];
    const isFromRoot = rootPaths.includes(previousPath);
    const isToRoot = rootPaths.includes(currentPath);
    
    if (isFromRoot && isToRoot) {
      // Bottom nav - fade only
      setDirection('fade');
      historyStack.current.push(currentPath);
      return;
    }

    // Check navigation type from React Router
    if (navigationType === 'POP') {
      // Browser back button or history.back()
      setDirection('back');
      historyStack.current.pop();
    } else {
      // Check if going back to a previous path in history
      const indexInHistory = historyStack.current.indexOf(currentPath);
      
      if (indexInHistory !== -1 && indexInHistory < historyStack.current.length - 1) {
        // Going back to a previous page
        setDirection('back');
        historyStack.current = historyStack.current.slice(0, indexInHistory + 1);
      } else {
        // Going forward to a new page
        setDirection('forward');
        historyStack.current.push(currentPath);
      }
    }

    // Keep history stack reasonable size
    if (historyStack.current.length > 50) {
      historyStack.current = historyStack.current.slice(-50);
    }

  }, [location, navigationType]);

  return (
    <NavigationContext.Provider value={{ direction }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationDirection() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationDirection must be used within NavigationProvider');
  }
  return context.direction;
}
