import { motion } from 'framer-motion';
import { animations } from '../../utils/AnimationConfig';
import './FAB.css';

export default function FAB({ onClick, isOpen = false }) {
  return (
    <motion.button 
      className="fab" 
      onClick={onClick} 
      aria-label="Open actions"
      whileTap={animations.fab.tap}
      whileHover={animations.fab.hover}
      transition={animations.fab.transition}
      animate={{ rotate: isOpen ? 45 : 0 }}
    >
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path 
          fillRule="evenodd" 
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
          clipRule="evenodd" 
        />
      </svg>
    </motion.button>
  );
}
