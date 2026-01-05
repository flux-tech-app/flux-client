import { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { NavigationContext } from "@/context/NavigationContext";

// keep these here or move to a constants file
const ROOT_PATHS = ["/", "/portfolio", "/activity", "/indices", "/account"];
const MAX_STACK = 50;

export function NavigationProvider({ children }) {
  const location = useLocation();
  const navigationType = useNavigationType();

  const [direction, setDirection] = useState("fade");
  const historyStack = useRef([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const currentPath = location.pathname;

    // first render init
    if (isFirstRender.current) {
      isFirstRender.current = false;
      historyStack.current = [currentPath];
      setDirection("fade");
      return;
    }

    const prevPath = historyStack.current[historyStack.current.length - 1];

    const isFromRoot = ROOT_PATHS.includes(prevPath);
    const isToRoot = ROOT_PATHS.includes(currentPath);

    // bottom nav tab switch => fade only
    if (isFromRoot && isToRoot) {
      setDirection("fade");
      historyStack.current.push(currentPath);
      return;
    }

    if (navigationType === "POP") {
      // browser back
      setDirection("back");
      historyStack.current.pop();
    } else {
      const idx = historyStack.current.indexOf(currentPath);

      if (idx !== -1 && idx < historyStack.current.length - 1) {
        // navigate to an earlier entry => treat as back
        setDirection("back");
        historyStack.current = historyStack.current.slice(0, idx + 1);
      } else {
        setDirection("forward");
        historyStack.current.push(currentPath);
      }
    }

    // clamp stack size
    if (historyStack.current.length > MAX_STACK) {
      historyStack.current = historyStack.current.slice(-MAX_STACK);
    }
  }, [location.pathname, navigationType]);

  const value = useMemo(() => ({ direction }), [direction]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}