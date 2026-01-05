// src/pages/Activity/Activity.jsx
import { useState, useMemo } from "react";
import useHabits from "@/hooks/useHabits";
import SidebarMenu from "@/components/SidebarMenu/SidebarMenu";
import "./Activity.css";

import { formatUSDFromMicros, unitsToMicros, computeEarningsMicrosUI, isBinaryRateType } from "@/utils/micros";

/**
 * Activity (server-truth)
 *
 * Sources of truth:
 * - logs[]: { id, habitId, timestampMs, unitsMicros, notes?, earningsMicros? }
 * - transfers[]: { id, habitId?, timestampMs, amountMicros, status, ... }
 * - habits[] (instances): { id, catalogId, rateMicros, rateEnabled, rateType, goal, ... }
 * - catalogHabits[]: { id, name, unitPlural, goalUnit, ... }
 *
 * Notes:
 * - habit *display name* comes from catalog, not habit instance.
 * - earnings come from log.earningsMicros if present, else computed from habit config.
 * - rateEnabled=false => earnings are $0.
 */
export default function Activity() {
  // Adjust these exports to match your HabitProvider
  const {
    logs = [],
    transfers = [],
    habits = [],
    catalogHabits = [], // if your provider exposes catalog.habits instead, change this line
    deleteLog,          // should exist; if not, wire it to your /api/logs delete endpoint
  } = useHabits();

  const [selectedFilter, setSelectedFilter] = useState("today");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [deletingItem, setDeletingItem] = useState(null);

  // -----------------------
  // helpers
  // -----------------------
  const getDateHeader = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateKey.getTime() === today.getTime()) return "Today";
    if (dateKey.getTime() === yesterday.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const getTimeFromMs = (ms) => {
    return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };

      case "yesterday": {
        const y = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: y, end: today };
      }

      case "week": {
        // Sunday start (matches your old code)
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: new Date(now.getTime() + 24 * 60 * 60 * 1000) };
      }

      case "lastWeek": {
        const weekStart = new Date(today.getTime() - (today.getDay() + 7) * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: weekEnd };
      }

      case "month": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: new Date(now.getTime() + 24 * 60 * 60 * 1000) };
      }

      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  // Build maps for quick lookup
  const habitById = useMemo(() => {
    const m = new Map();
    for (const h of habits || []) m.set(String(h.id), h);
    return m;
  }, [habits]);

  const catalogById = useMemo(() => {
    const m = new Map();
    for (const c of catalogHabits || []) m.set(String(c.id), c);
    return m;
  }, [catalogHabits]);

  const getHabitDisplay = (habitId) => {
    const h = habitById.get(String(habitId));
    if (!h) return { name: "Unknown Habit", rateType: "BINARY", rateMicros: 0, rateEnabled: false, unitLabel: "times" };

    const cat = catalogById.get(String(h.catalogId));
    const name = cat?.name || "Habit";
    const rateType = String(h.rateType || cat?.rateType || "BINARY").toUpperCase();
    const rateMicros = Number(h.rateMicros || 0);
    const rateEnabled = Boolean(h.rateEnabled);

    // What we show as “unit” in activity
    const unitLabel =
      rateType === "COUNT"
        ? (cat?.unitPlural || cat?.goalUnit || "units")
        : (cat?.goalUnit || "times");

    return { name, rateType, rateMicros, rateEnabled, unitLabel };
  };

  const computeLogEarningsMicros = (log) => {
    // If backend already embedded earningsMicros, trust it
    if (Number.isFinite(Number(log?.earningsMicros))) return Number(log.earningsMicros);

    const h = habitById.get(String(log?.habitId));
    if (!h) return 0;

    const rateEnabled = Boolean(h.rateEnabled);
    if (!rateEnabled) return 0;

    const rateType = String(h.rateType || "BINARY").toUpperCase();
    const rateMicros = Number(h.rateMicros || 0);
    if (!Number.isFinite(rateMicros) || rateMicros <= 0) return 0;

    const unitsMicros = Number(log?.unitsMicros || 0);

    // Binary = flat per log
    if (isBinaryRateType(rateType)) return rateMicros;

    // COUNT = rateMicros * units
    return computeEarningsMicrosUI({
      rateType,
      rateMicros,
      unitsMicros: Number.isFinite(unitsMicros) ? unitsMicros : unitsToMicros(0),
    });
  };

  // -----------------------
  // Unified feed (logs + transfers)
  // -----------------------
  const feedItems = useMemo(() => {
    const { start, end } = getDateRange(selectedFilter);
    const startMs = start.getTime();
    const endMs = end.getTime();

    const logItems = (logs || [])
      .filter((l) => {
        const ts = Number(l?.timestampMs ?? 0);
        return ts >= startMs && ts < endMs;
      })
      .map((l) => {
        const display = getHabitDisplay(l.habitId);
        const earningsMicros = computeLogEarningsMicros(l);

        return {
          kind: "log",
          id: String(l.id),
          timestampMs: Number(l.timestampMs),
          habitId: l.habitId,
          title: display.name,
          subtitle: getTimeFromMs(Number(l.timestampMs)),
          notes: l.notes || "",
          amountMicros: earningsMicros,
          metaRight: "earned",
        };
      });

    const transferItems = (transfers || [])
      .filter((t) => {
        const ts = Number(t?.timestampMs ?? 0);
        return ts >= startMs && ts < endMs;
      })
      .map((t) => {
        const hasHabit = Boolean(t?.habitId);
        const display = hasHabit ? getHabitDisplay(t.habitId) : null;

        const status = String(t?.status || "").toLowerCase();
        const statusLabel = status === "completed" ? "Transfer completed" : status === "pending" ? "Transfer pending" : "Transfer";

        return {
          kind: "transfer",
          id: String(t.id),
          timestampMs: Number(t.timestampMs),
          habitId: t.habitId || null,
          title: hasHabit ? display?.name || "Habit" : "Portfolio",
          subtitle: `${statusLabel} • ${getTimeFromMs(Number(t.timestampMs))}`,
          notes: "",
          amountMicros: Number(t.amountMicros || 0),
          metaRight: status === "pending" ? "pending" : "transferred",
        };
      });

    return [...logItems, ...transferItems].sort((a, b) => b.timestampMs - a.timestampMs);
  }, [logs, transfers, selectedFilter, habitById, catalogById]); // maps are stable via useMemo

  const groupedActivities = useMemo(() => {
    const groups = new Map();

    for (const item of feedItems) {
      const date = new Date(item.timestampMs);
      const dateKey = date.toDateString();

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: dateKey,
          displayDate: getDateHeader(date),
          activities: [],
        });
      }
      groups.get(dateKey).activities.push(item);
    }

    return Array.from(groups.values());
  }, [feedItems]);

  // -----------------------
  // delete
  // -----------------------
  const openDeleteConfirm = (item) => setDeletingItem(item);
  const closeDeleteConfirm = () => setDeletingItem(null);

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    // Only logs are deletable (transfers shouldn’t be)
    if (deletingItem.kind !== "log") {
      closeDeleteConfirm();
      return;
    }

    try {
      await deleteLog?.(deletingItem.id);
    } finally {
      closeDeleteConfirm();
    }
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="activity-page">
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="activity-header">
        <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="activity-title">Activity</h1>
        <div className="header-spacer" />
      </header>

      <div className="activity-container">
        <div className="habits-view">
          <div className="date-tabs">
            <button className={`date-tab ${selectedFilter === "today" ? "active" : ""}`} onClick={() => setSelectedFilter("today")}>
              Today
            </button>
            <button className={`date-tab ${selectedFilter === "yesterday" ? "active" : ""}`} onClick={() => setSelectedFilter("yesterday")}>
              Yesterday
            </button>
            <button className={`date-tab ${selectedFilter === "week" ? "active" : ""}`} onClick={() => setSelectedFilter("week")}>
              This Week
            </button>
            <button className={`date-tab ${selectedFilter === "lastWeek" ? "active" : ""}`} onClick={() => setSelectedFilter("lastWeek")}>
              Last Week
            </button>
            <button className={`date-tab ${selectedFilter === "month" ? "active" : ""}`} onClick={() => setSelectedFilter("month")}>
              This Month
            </button>
          </div>

          <div className="activity-feed">
            {groupedActivities.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>No activity yet</h3>
                <p>Your habit logs and transfers will appear here</p>
              </div>
            ) : (
              groupedActivities.map((group) => (
                <div key={group.date} className="date-section">
                  <div className="date-header">{group.displayDate}</div>
                  <div className="activity-list">
                    {group.activities.map((activity, index) => (
                      <div key={`${activity.kind}-${activity.id}-${index}`} className="activity-card">
                        <div className="activity-header-row">
                          <div className="activity-info">
                            <div className="activity-title">{activity.title}</div>

                            <div className="activity-meta">
                              <span className="activity-time">
                                <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {activity.subtitle}
                              </span>
                            </div>

                            {activity.notes ? <div className="activity-notes">{activity.notes}</div> : null}
                          </div>

                          <div className="activity-amount-section">
                            <div className="activity-amount">{formatUSDFromMicros(activity.amountMicros)}</div>
                            <div className="holding-label">{activity.metaRight}</div>

                            <div className="activity-actions">
                              {activity.kind === "log" ? (
                                <button
                                  className="activity-action-btn delete-btn"
                                  onClick={() => openDeleteConfirm(activity)}
                                  title="Delete"
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {deletingItem && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon delete-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3>Delete Activity</h3>
              <p>
                Are you sure you want to delete this <b>{deletingItem.title}</b> activity? This action cannot be undone.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button className="confirm-btn cancel-btn" onClick={closeDeleteConfirm}>
                Cancel
              </button>
              <button className="confirm-btn delete-confirm-btn" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
