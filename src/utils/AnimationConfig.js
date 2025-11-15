// Centralized animation configuration for component interactions
// Following iOS and professional app standards

export const animations = {
  // Bottom sheet - iOS-style slide with spring
  sheet: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300
    }
  },

  // Backdrop fade (keep existing)
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: 0.2
    }
  },

  // FAB interactions (keep existing - nice touch)
  fab: {
    tap: { scale: 0.9 },
    hover: { scale: 1.05 },
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  },

  // Card press feedback (keep existing - subtle and nice)
  cardPress: {
    tap: { scale: 0.98 },
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  },

  // List item stagger (keep existing)
  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.05
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.3
      }
    }
  }
};
