// Centralized animation configuration for consistent feel across the app
// Following iOS and professional app standards

export const animations = {
  // Page transitions - iOS-style directional slides
  page: {
    // Forward navigation - slide in from right
    slideInRight: {
      initial: { x: '100%', opacity: 0 },
      animate: { 
        x: 0, 
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }
      },
      exit: { 
        x: '-30%', 
        opacity: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }
      }
    },

    // Back navigation - slide out to right
    slideOutRight: {
      initial: { x: '-30%', opacity: 0 },
      animate: { 
        x: 0, 
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }
      },
      exit: { 
        x: '100%', 
        opacity: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }
      }
    },

    // Bottom nav - subtle fade only (no slide)
    fade: {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: {
          duration: 0.2,
          ease: 'easeInOut'
        }
      },
      exit: { 
        opacity: 0,
        transition: {
          duration: 0.15,
          ease: 'easeInOut'
        }
      }
    }
  },

  // Bottom sheet - iOS-style slide with spring (keep existing - works great)
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
