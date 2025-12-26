// src/components/BottomSheet/BottomSheet.jsx
import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./BottomSheet.css";

/**
 * @typedef {"auto" | "half" | "tall" | "full"} BottomSheetHeight
 *
 * @typedef {Object} BottomSheetProps
 * @property {boolean} isOpen - Controls visibility
 * @property {() => void} onClose - Called when sheet should close
 * @property {string=} title - Optional header title
 * @property {import("react").ReactNode=} headerRight - Optional right side of header (button, etc)
 * @property {BottomSheetHeight=} height - Sheet height (default: "tall")
 * @property {boolean=} showHandle - Show drag handle (default: true)
 * @property {import("react").ReactNode} children - Sheet content
 */

/** @type {import("framer-motion").Transition} */
const backdropTransition = { duration: 0.18 };

/** @type {import("framer-motion").Transition} */
const sheetTransition = {
  type: "spring",
  damping: 26,
  stiffness: 320,
};

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  headerRight,
  height = "tall",
  showHandle = true,
  children,
}) {
  // Handle escape key
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const heightClass =
    {
      auto: "sheet-auto",
      half: "sheet-half",
      tall: "sheet-tall",
      full: "sheet-full",
    }[height] || "sheet-tall";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="bottom-sheet-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
          />

          {/* Sheet */}
          <motion.div
            className={`bottom-sheet ${heightClass}`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={sheetTransition}
            role="dialog"
            aria-modal={true}
            aria-labelledby={title ? "sheet-title" : undefined}
          >
            {/* Header */}
            {(showHandle || title || headerRight) && (
              <div className="sheet-header">
                {showHandle && <div className="sheet-handle" />}
                {(title || headerRight) && (
                  <div className="sheet-title-row">
                    {title && (
                      <h2 id="sheet-title" className="sheet-title">
                        {title}
                      </h2>
                    )}
                    {headerRight && (
                      <div className="sheet-header-right">{headerRight}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="sheet-content">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
