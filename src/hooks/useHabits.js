// src/hooks/useHabits.js
import { useContext } from "react";
import HabitContext from "@/context/HabitContext";

export default function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used within HabitProvider");
  return ctx;
}
