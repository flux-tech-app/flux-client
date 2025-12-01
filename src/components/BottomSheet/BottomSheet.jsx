import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animations } from '../../utils/AnimationConfig';
import './BottomSheet.css';

/**
 * Generic, reusable BottomSheet component
 * Can render any content passed as children
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Called when sheet should close
 * @param {string} title - Optional header title
 * @param {React.ReactNode} headerRight - Optional right side of header (button, etc)
 * @param {string} height - Sheet height: 'auto', 'half', 'tall', 'full' (default: 'tall')
 * @param {boolean} showHandle - Show drag handle (default: true)
 * @param {React.ReactNode} children - Sheet content
 */
export default function BottomSheet({ 
  isOpen, 
  onClose, 
  title,
  headerRight,
  height = 'tall',
  showHandle = true,
  children 
}) {
  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Height classes
  const heightClass = {
    auto: 'sheet-auto',
    half: 'sheet-half',
    tall: 'sheet-tall',
    full: 'sheet-full'
  }[height] || 'sheet-tall';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            className="bottom-sheet-overlay" 
            onClick={onClose}
            initial={animations.backdrop.initial}
            animate={animations.backdrop.animate}
            exit={animations.backdrop.exit}
            transition={animations.backdrop.transition}
          />
          
          {/* Sheet */}
          <motion.div 
            className={`bottom-sheet ${heightClass}`}
            initial={animations.sheet.initial}
            animate={animations.sheet.animate}
            exit={animations.sheet.exit}
            transition={animations.sheet.transition}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "sheet-title" : undefined}
          >
            {/* Header */}
            {(showHandle || title || headerRight) && (
              <div className="sheet-header">
                {showHandle && <div className="sheet-handle" />}
                {(title || headerRight) && (
                  <div className="sheet-title-row">
                    {title && (
                      <h2 id="sheet-title" className="sheet-title">{title}</h2>
                    )}
                    {headerRight && (
                      <div className="sheet-header-right">{headerRight}</div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="sheet-content">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
