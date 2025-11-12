import { motion } from 'framer-motion';
import { animations } from '../../utils/AnimationConfig';

/**
 * PageTransition - Reusable wrapper for page-level animations
 * Supports iOS-style directional transitions based on navigation direction
 * 
 * Props:
 * - direction: 'forward' | 'back' | 'fade'
 * - children: Page content
 * 
 * Usage:
 * <PageTransition direction={direction}>
 *   <YourPageContent />
 * </PageTransition>
 */
export default function PageTransition({ children, direction = 'fade', className = '' }) {
  // Select animation variant based on direction
  let animationVariant;
  switch (direction) {
    case 'forward':
      animationVariant = animations.page.slideInRight;
      break;
    case 'back':
      animationVariant = animations.page.slideOutRight;
      break;
    case 'fade':
    default:
      animationVariant = animations.page.fade;
      break;
  }

  return (
    <motion.div
      initial={animationVariant.initial}
      animate={animationVariant.animate}
      exit={animationVariant.exit}
      className={className}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
}
