import { createContext, useContext } from "react";

export const NavigationContext = createContext(null);

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return ctx; // { direction, ...future fields }
}
