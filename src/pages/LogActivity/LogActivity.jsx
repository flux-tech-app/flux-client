// src/pages/LogActivity/LogActivity.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHabits from "@/hooks/useHabits";
import HabitIcon from "@/utils/HabitIcons";
import Button from "@/components/Button";

import {
  computeEarningsMicrosUI,
  formatRateFromMicros,
  formatUSDFromMicros,
  isBinaryRateType,
  unitsToMicros,
} from "@/utils/micros";

import "./LogActivity.css";

/**
 * LogActivity ("/log/:habitId")
 * STRICT backend contract:
 *   - send ONLY { habitId, unitsMicros, notes?, timestampMs? }
 *   - server computes earnings + creates pending transfers
 */
export default function LogActivity() {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const { habits, addLog } = useHabits();

  const habit = useMemo(
    () => (habits || []).find((h) => String(h?.id) === String(habitId)),
    [habits, habitId]
  );

  const binary = useMemo(() => isBinaryRateType(habit?.rateType), [habit?.rateType]);

  const [logValue, setLogValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Optional UI timestamp — backend currently ignores it, but keeping is fine.
  const [timestampISO, setTimestampISO] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (!habit) return;
    if (binary) {
      setLogValue("");
      return;
    }

    const u = habit?.unit;
    if (u === "minute") setLogValue("30");
    else if (u === "mile") setLogValue("3");
    else if (u === "step") setLogValue("5000");
    else if (u === "rep") setLogValue("20");
    else if (u === "chapter") setLogValue("1");
    else setLogValue("1");
  }, [habit, binary]);

  useEffect(() => {
    if (!habitId) return;
    if (habit) return;
    if (!habits) return;
    navigate("/portfolio", { state: { direction: "back" } });
  }, [habitId, habit, habits, navigate]);

  if (!habit) return null;

  const unitsMicros = binary ? 0 : unitsToMicros(logValue);
  const earningsMicros = computeEarningsMicrosUI({
    rateType: habit.rateType,
    rateMicros: habit.rateMicros,
    unitsMicros,
  });

  const rateLabel = binary
    ? formatUSDFromMicros(habit.rateMicros)
    : formatRateFromMicros(habit.rateMicros, habit.unit);

  const handleCancel = () => navigate("/portfolio", { state: { direction: "back" } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    if (!binary && unitsMicros <= 0) {
      alert("Please enter a value greater than 0.");
      return;
    }

    setIsSaving(true);
    try {
      const timestampMs = Number.isFinite(Date.parse(timestampISO))
        ? Date.parse(timestampISO)
        : undefined;

      await addLog({
        habitId: habit.id,
        unitsMicros,
        notes: "",
        timestampMs,
      });

      navigate("/portfolio", { state: { direction: "back" } });
    } catch (err) {
      console.error("log failed", err);
      alert(err?.message || "Failed to log activity");
    } finally {
      setIsSaving(false);
    }
  };

  const unitLabel = habit?.unitPlural || habit?.unit || "units";

  return (
    <div className="log-activity-page">
      <div className="log-activity-container">
        <header className="log-header">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>

          <div className="header-title">
            {habit.actionType === "pass" ? "Log Pass" : "Log Activity"}
          </div>

          <div className="placeholder" />
        </header>

        <form className="log-content" onSubmit={handleSubmit}>
          <div className="habit-badge">
            <div className="habit-icon-large">
              <HabitIcon habitId={habit.libraryId} size={28} />
            </div>
            <div className="habit-name-large">{habit.name}</div>
            <div style={{ marginTop: 6, opacity: 0.8, fontSize: 13 }}>{rateLabel}</div>
          </div>

          {!binary && (
            <div className="form-section">
              <label className="input-label">How many {unitLabel}?</label>

              <div className="input-row">
                <input
                  type="number"
                  className="number-input"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  min="0"
                  autoFocus
                />
                <span className="unit-label">{habit.unit || ""}</span>
              </div>

              {habit.unit === "minute" && (
                <div className="quick-buttons">
                  <Button variant="secondary" size="sm" onClick={() => setLogValue("15")}>15</Button>
                  <Button variant="secondary" size="sm" onClick={() => setLogValue("30")}>30</Button>
                  <Button variant="secondary" size="sm" onClick={() => setLogValue("45")}>45</Button>
                  <Button variant="secondary" size="sm" onClick={() => setLogValue("60")}>60</Button>
                </div>
              )}
            </div>
          )}

          {binary && (
            <div className="completion-badge">
              <div className="completion-icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="completion-text">
                {habit.actionType === "pass" ? `Log pass for ${habit.name}` : `Log ${habit.name}`}
              </div>
            </div>
          )}

          <div className="form-section">
            <label className="input-label">When?</label>
            <div className="datetime-grid">
              <input
                type="date"
                className="datetime-input"
                value={timestampISO.split("T")[0]}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const currentDate = new Date(timestampISO);
                  date.setHours(currentDate.getHours(), currentDate.getMinutes());
                  setTimestampISO(date.toISOString());
                }}
              />
              <input
                type="time"
                className="datetime-input"
                value={timestampISO.split("T")[1].slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const date = new Date(timestampISO);
                  date.setHours(Number(hours), Number(minutes));
                  setTimestampISO(date.toISOString());
                }}
              />
            </div>
          </div>

          <div className="earnings-preview">
            <div className="preview-label">You&apos;ll earn</div>
            <div className="preview-total">{formatUSDFromMicros(earningsMicros)}</div>
          </div>

          <Button type="submit" variant="success" size="lg" fullWidth loading={isSaving}>
            {habit.actionType === "pass" ? "Log Pass" : "Log Activity"}
          </Button>
        </form>
      </div>
    </div>
  );
}
