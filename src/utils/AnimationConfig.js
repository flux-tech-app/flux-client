// src/utils/AnimationConfig.js
// Centralized animation configuration for component interactions
// Following iOS and professional app standards

// Force literal inference for TS (prevents: type: string -> type: "spring")
const SPRING = "spring";

export const animations = {
  // Bottom sheet - iOS-style slide with spring
  sheet: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: {
      type: SPRING,
      damping: 30,
      stiffness: 300,
    },
  },

  // Backdrop fade
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: 0.2,
    },
  },

  // FAB main button interactions - enhanced
  fab: {
    tap: { scale: 0.92 },
    hover: { scale: 1.05 },
    transition: {
      type: SPRING,
      stiffness: 350,
      damping: 20,
      mass: 0.8,
    },
  },

  // FAB expand animation for action bubbles
  fabExpand: {
    container: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: {
        type: SPRING,
        stiffness: 400,
        damping: 28,
      },
    },
    item: {
      initial: { opacity: 0, scale: 0.8, y: 10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.8, y: 10 },
      transition: {
        type: SPRING,
        stiffness: 400,
        damping: 25,
      },
    },
    staggerDelay: 0.05,
  },

  // Button interactions - premium feel
  button: {
    tap: { scale: 0.98 },
    hover: { y: -2, scale: 1.01 },
    transition: {
      type: SPRING,
      stiffness: 400,
      damping: 25,
    },
  },

  // Card press feedback - subtle and nice
  cardPress: {
    tap: { scale: 0.98 },
    transition: {
      type: SPRING,
      stiffness: 400,
      damping: 17,
    },
  },

  // List item stagger
  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.3,
      },
    },
  },

  // Scale fade for modals and popups
  scaleFade: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: {
      type: SPRING,
      stiffness: 350,
      damping: 25,
    },
  },
};
