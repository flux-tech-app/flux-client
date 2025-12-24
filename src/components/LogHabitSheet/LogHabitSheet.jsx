import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import useHabits from "@/hooks/useHabits";
import HabitIcon from "../../utils/HabitIcons";
import Button from "../Button";
import "./LogHabitSheet.css";

/**
 * @param {{
 *  actionType: "log" | "pass",
 *  initialHabitId?: string | null,
 *  onClose?: () => void,
 *  onLogComplete?: () => void
 * }} props
 */
export default function LogHabitSheet({ actionType, initialHabitId, onClose, onLogComplete }) {
  const { habits, isHabitLoggedOnDate, addLog } = useHabits();

  const [selectedHabit, setSelectedHabit] = useState(null);
  const [logValue, setLogValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const today = new Date();

  const isBinaryHabit = (h) => {
    const rt = (h?.rateType ?? "").toString().toUpperCase();
    return rt === "BINARY";
  };

  const filteredHabits = useMemo(() => {
    const list = habits || [];
    return list.filter((h) => (h?.actionType ?? "log") === actionType);
  }, [habits, actionType]);

  const searchedHabits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredHabits;
    return filteredHabits.filter((h) => (h?.name ?? "").toLowerCase().includes(q));
  }, [filteredHabits, searchQuery]);

  useEffect(() => {
    if (!initialHabitId) return;
    if (!habits?.length) return;
    const h = habits.find((x) => x.id === initialHabitId);
    if (h) handleHabitSelect(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHabitId, habits]);

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);

    if (!isBinaryHabit(habit)) {
      // lightweight defaults (optional)
      const u = habit?.unit;
      if (u === "minute") setLogValue("30");
      else if (u === "mile") setLogValue("3");
      else if (u === "step") setLogValue("5000");
      else if (u === "rep") setLogValue("20");
      else if (u === "chapter") setLogValue("1");
      else setLogValue("1");
    } else {
      setLogValue("");
    }
  };

  const getEarningsPreview = () => {
    if (!selectedHabit) return 0;
    const rate = Number(selectedHabit.rate || 0);
    if (Number.isNaN(rate)) return 0;

    if (isBinaryHabit(selectedHabit)) return rate;

    const units = Number.parseFloat(logValue) || 0;
    return rate * units;
  };

  const handleLog = async () => {
    if (!selectedHabit || isLogging) return;
    setIsLogging(true);

    try {
      const binary = isBinaryHabit(selectedHabit);
      const units = binary ? 1 : Number.parseFloat(logValue) || 0;

      if (!binary && units <= 0) {
        alert("Please enter a value greater than 0.");
        setIsLogging(false);
        return;
      }

      // Server computes earnings; FE sends only habitId + units
      await addLog({ habitId: selectedHabit.id, units });

      setIsLogging(false);
      onLogComplete?.();
      onClose?.();
    } catch (e) {
      console.error("Error logging activity:", e);
      setIsLogging(false);
      alert(e?.message || "Failed to log activity. Please try again.");
    }
  };

  // ==================== DETAIL VIEW ====================
  if (selectedHabit) {
    const binary = isBinaryHabit(selectedHabit);
    const rate = Number(selectedHabit.rate || 0);
    const rateText = rate < 0.01 ? rate.toFixed(4) : rate.toFixed(2);

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
              ${rateText}
              {!binary && selectedHabit.unit ? `/${selectedHabit.unit}` : ""}
            </span>
          </div>
        </div>

        {!binary && (
          <div className="log-quantity-section">
            <label className="log-label">
              How many {selectedHabit.unitPlural || selectedHabit.unit || "units"}?
            </label>

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

        {binary && (
          <div className="log-binary-section">
            <div className="binary-check">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(34, 197, 94, 0.1)" />
                <path d="M15 24l6 6 12-12" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="binary-text">
              {actionType === "log"
                ? `Log ${selectedHabit.name}?`
                : `Log pass for ${selectedHabit.name}?`}
            </p>
          </div>
        )}

        <div className="earnings-inline">
          <span className="earnings-label">You'll earn</span>
          <span className="earnings-value">+${getEarningsPreview().toFixed(2)}</span>
        </div>

        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={handleLog}
          disabled={isLogging || (!binary && !(Number.parseFloat(logValue) > 0))}
          loading={isLogging}
        >
          {actionType === "log" ? "Log Activity" : "Log Pass"}
        </Button>
      </div>
    );
  }

  // ==================== LIST VIEW ====================
  const title = actionType === "log" ? "Log Activity" : "Log Pass";
  const emptyText = actionType === "log"
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
          const r = Number(habit.rate || 0);
          const rateDisplay = r < 0.01 ? `$${r.toFixed(4)}` : `$${r.toFixed(2)}`;

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
