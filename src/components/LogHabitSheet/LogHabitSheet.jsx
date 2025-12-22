// src/components/LogHabitSheet/LogHabitSheet.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHabits } from "../../context/HabitContext";
import { RATE_TYPES, ACTION_TYPES, getHabitById } from "../../utils/HABIT_LIBRARY";
import HabitIcon from "../../utils/HabitIcons";
import Button from "../Button";
import "./LogHabitSheet.css";

/**
 * Log Habit Sheet - Modernized Design
 * Clean, minimal interface for quick habit logging
 *
 * @param {string} actionType - 'log' or 'pass'
 * @param {string} initialHabitId - Optional habit ID to pre-select
 * @param {function} onClose - Called when sheet closes
 * @param {function} onLogComplete - Called after successful log
 */
export default function LogHabitSheet({ actionType, initialHabitId, onClose, onLogComplete }) {
  const { habits, isHabitLoggedOnDate, addLog } = useHabits();

  const [selectedHabit, setSelectedHabit] = useState(null);
  const [logValue, setLogValue] = useState("");
  const [customRate, setCustomRate] = useState(null);
  const [showRateOptions, setShowRateOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const today = new Date();

  // Pre-select habit if initialHabitId is provided
  useEffect(() => {
    if (!initialHabitId) return;
    if (!habits?.length) return;

    const habit = habits.find((h) => h.id === initialHabitId);
    if (habit) handleHabitSelect(habit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHabitId, habits]);

  // Filter habits by action type
  const filteredHabits = (habits || []).filter((habit) => {
    const libraryHabit = getHabitById(habit.libraryId);
    return libraryHabit && libraryHabit.actionType === actionType;
  });

  // Apply search filter
  const searchedHabits = searchQuery.trim()
    ? filteredHabits.filter((habit) => habit.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredHabits;

  const isBinaryHabit = (habit) => {
    if (!habit) return false;
    return habit.rateType === RATE_TYPES.BINARY || habit.rateType === "BINARY";
  };

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    setCustomRate(null);
    setShowRateOptions(false);

    if (!isBinaryHabit(habit)) {
      if (habit.unit === "minute") setLogValue("30");
      else if (habit.unit === "mile") setLogValue("3");
      else if (habit.unit === "step") setLogValue("5000");
      else if (habit.unit === "rep") setLogValue("20");
      else if (habit.unit === "chapter") setLogValue("1");
      else setLogValue("1");
    } else {
      setLogValue("");
    }
  };

  const handleLog = async () => {
    if (!selectedHabit) return;
    if (isLogging) return;

    setIsLogging(true);

    try {
      const isBinary = isBinaryHabit(selectedHabit);

      const units = !isBinary ? Number.parseFloat(logValue) || 0 : 1;
      if (!isBinary && units <= 0) {
        alert("Please enter a value greater than 0.");
        setIsLogging(false);
        return;
      }

      const logData = {
        habitId: selectedHabit.id,
        units: isBinary ? 1 : units,
      };

      // Use custom rate if set
      if (customRate !== null && customRate !== undefined) {
        const cr = Number.parseFloat(customRate);
        if (!Number.isNaN(cr)) {
          if (isBinary) {
            logData.customEarnings = cr;
          } else {
            logData.customEarnings = cr * (Number.parseFloat(logValue) || 1);
          }
        }
      }

      await addLog(logData);

      setIsLogging(false);
      onLogComplete?.();
      onClose?.();
    } catch (error) {
      console.error("Error logging activity:", error);
      setIsLogging(false);
      alert(error?.message || "Failed to log activity. Please try again.");
    }
  };

  // Calculate earnings preview in dollars (UI-only)
  const getEarningsPreview = () => {
    if (!selectedHabit) return 0;

    const isBinary = isBinaryHabit(selectedHabit);
    const rate = customRate !== null ? Number.parseFloat(customRate) : Number(selectedHabit.rate || 0);

    if (Number.isNaN(rate)) return 0;

    if (isBinary) return rate;

    const units = Number.parseFloat(logValue) || 0;
    return rate * units;
  };

  const getRateOptions = () => {
    if (!selectedHabit) return [];
    const libraryHabit = getHabitById(selectedHabit.libraryId);
    if (!libraryHabit) return [Number(selectedHabit.rate || 0)];
    return libraryHabit.rateOptions || [Number(selectedHabit.rate || 0)];
  };

  const currentRate = customRate !== null ? Number(customRate) : Number(selectedHabit?.rate || 0);

  // ==================== LOGGING MODAL ====================
  if (selectedHabit) {
    const isBinary = isBinaryHabit(selectedHabit);
    const rateOptions = getRateOptions();
    const rateLabels = ["Low", "Default", "High"];

    return (
      <div className="log-sheet">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedHabit(null)}
          leftIcon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          }
          className="sheet-back-btn"
        >
          Back
        </Button>

        <div className="log-header">
          <div className="log-header-icon">
            <HabitIcon habitId={selectedHabit.libraryId} size={32} />
          </div>
          <div className="log-header-info">
            <h2 className="log-header-name">{selectedHabit.name}</h2>
            <span className="log-header-rate">
              ${currentRate < 0.01 ? currentRate.toFixed(4) : currentRate.toFixed(2)}
              {!isBinary && `/${selectedHabit.unit}`}
            </span>
          </div>
        </div>

        {!isBinary && (
          <div className="log-quantity-section">
            <label className="log-label">How many {selectedHabit.unitPlural}?</label>
            <div className="quantity-input-wrapper">
              <button
                className="quantity-btn"
                onClick={() => {
                  const step = selectedHabit.unit === "step" ? 1000 : selectedHabit.unit === "minute" ? 5 : 1;
                  setLogValue(Math.max(0, (Number.parseFloat(logValue) || 0) - step).toString());
                }}
              >
                −
              </button>
              <input
                type="number"
                className="quantity-input"
                value={logValue}
                onChange={(e) => setLogValue(e.target.value)}
                min="0"
              />
              <button
                className="quantity-btn"
                onClick={() => {
                  const step = selectedHabit.unit === "step" ? 1000 : selectedHabit.unit === "minute" ? 5 : 1;
                  setLogValue(((Number.parseFloat(logValue) || 0) + step).toString());
                }}
              >
                +
              </button>
            </div>
          </div>
        )}

        {isBinary && (
          <div className="log-binary-section">
            <div className="binary-check">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(34, 197, 94, 0.1)" />
                <path d="M15 24l6 6 12-12" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="binary-text">
              {actionType === ACTION_TYPES.LOG ? `Log ${selectedHabit.name}?` : `Successfully passed on ${selectedHabit.name}?`}
            </p>
          </div>
        )}

        <div className="rate-section">
          <button
            className={`rate-toggle ${showRateOptions ? "expanded" : ""}`}
            onClick={() => setShowRateOptions(!showRateOptions)}
          >
            <span className="rate-toggle-label">
              {customRate !== null ? "Using custom rate" : "Using default rate"}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="rate-toggle-icon">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L8 8.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <AnimatePresence>
            {showRateOptions && (
              <motion.div
                className="rate-options-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rate-options-grid">
                  {rateOptions.map((rate, index) => {
                    const isDefault = customRate === null && rate === selectedHabit.rate;
                    const isCustom = customRate !== null && rate === customRate;

                    return (
                      <button
                        key={`${rate}-${index}`}
                        className={`rate-option-btn ${(isDefault || isCustom) ? "active" : ""}`}
                        onClick={() => {
                          if (rate === selectedHabit.rate) setCustomRate(null);
                          else setCustomRate(rate);
                        }}
                      >
                        <span className="rate-option-label">{rateLabels[index] || "Rate"}</span>
                        <span className="rate-option-value">
                          ${rate < 0.01 ? Number(rate).toFixed(4) : Number(rate).toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="earnings-inline">
          <span className="earnings-label">You'll earn</span>
          <span className="earnings-value">+${getEarningsPreview().toFixed(2)}</span>
        </div>

        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={handleLog}
          disabled={isLogging || (!isBinary && !(Number.parseFloat(logValue) > 0))}
          loading={isLogging}
        >
          {actionType === ACTION_TYPES.LOG ? "Log Activity" : "Log Pass"}
        </Button>
      </div>
    );
  }

  // ==================== HABIT LIST VIEW ====================
  const title = actionType === ACTION_TYPES.LOG ? "Log Activity" : "Log Pass";
  const emptyText =
    actionType === ACTION_TYPES.LOG
      ? "Add Log habits to your portfolio to start tracking"
      : "Add Pass habits to track impulse resistance";

  return (
    <div className="log-sheet">
      <h2 className="sheet-title">{title}</h2>

      {filteredHabits.length > 0 && <p className="sheet-subtitle">Select a habit to log</p>}

      {filteredHabits.length > 3 && (
        <div className="search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-field"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="habit-list">
        {searchedHabits.map((habit, index) => {
          const isLogged = isHabitLoggedOnDate(habit.id, today);
          const rateDisplay = habit.rate < 0.01 ? `$${habit.rate.toFixed(4)}` : `$${habit.rate.toFixed(2)}`;

          return (
            <motion.button
              key={habit.id}
              className={`habit-row ${isLogged ? "completed" : ""}`}
              onClick={() => !isLogged && handleHabitSelect(habit)}
              disabled={isLogged}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileTap={!isLogged ? { scale: 0.98 } : {}}
            >
              <div className="habit-row-icon">
                <HabitIcon habitId={habit.libraryId} size={24} />
              </div>
              <span className="habit-row-name">{habit.name}</span>
              <div className="habit-row-right">
                {isLogged ? (
                  <span className="done-badge">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Done
                  </span>
                ) : (
                  <>
                    <span className="habit-row-rate">{rateDisplay}</span>
                    <svg className="habit-row-chevron" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {filteredHabits.length === 0 && (
        <div className="empty-state">
          <p>{emptyText}</p>
        </div>
      )}

      {searchQuery && searchedHabits.length === 0 && filteredHabits.length > 0 && (
        <div className="empty-state">
          <p>No habits found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}