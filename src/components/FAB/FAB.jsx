import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAB.css';

/**
 * Floating Action Button with 3-bubble expansion
 * Bubbles: Add Position, Log, Pass
 */
export default function FAB({ 
  onCreateHabit,
  onLog,
  onPass,
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action?.();
  };

  // Bubble configurations (3 actions: Add Position, Log, Pass)
  const bubbles = [
    {
      id: 'add',
      label: 'Add Position',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ),
      action: onCreateHabit,
      color: '#22c55e' // Green
    },
    {
      id: 'log',
      label: 'Log',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      action: onLog,
      color: '#3b82f6' // Blue
    },
    {
      id: 'pass',
      label: 'Pass',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
        </svg>
      ),
      action: onPass,
      color: '#f59e0b' // Amber
    }
  ];

  return (
    <div className="fab-container">
      {/* Overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fab-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action Bubbles */}
      <AnimatePresence>
        {isOpen && bubbles.map((bubble, index) => (
          <motion.div
            key={bubble.id}
            className="fab-bubble-wrapper"
            initial={{ opacity: 0, y: 0, scale: 0.3 }}
            animate={{ 
              opacity: 1, 
              y: -(70 + index * 64), // Stack upward with spacing
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              y: 0, 
              scale: 0.3 
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 22,
              delay: index * 0.05
            }}
          >
            <motion.button
              className="fab-bubble"
              onClick={() => handleAction(bubble.action)}
              whileTap={{ scale: 0.9 }}
              style={{ 
                '--bubble-color': bubble.color,
                background: `linear-gradient(135deg, ${bubble.color} 0%, ${bubble.color}99 100%)`
              }}
            >
              {bubble.icon}
            </motion.button>
            <span className="fab-bubble-label">{bubble.label}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button 
        className={`fab ${isOpen ? 'fab-open' : ''}`}
        onClick={toggleOpen}
        disabled={disabled}
        aria-label={isOpen ? "Close actions" : "Open actions"}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path 
            fillRule="evenodd" 
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
            clipRule="evenodd" 
          />
        </svg>
      </motion.button>
    </div>
  );
}
