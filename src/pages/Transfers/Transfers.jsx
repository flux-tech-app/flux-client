// src/pages/Transfers/Transfers.jsx
import { useMemo, useState } from "react";
import useHabits from "@/hooks/useHabits";
import { formatCurrency } from "@/utils/formatters";
import SidebarMenu from "@/components/SidebarMenu/SidebarMenu";
import "./Transfers.css";

function isPendingStatus(s) {
  return String(s || "").toLowerCase() === "pending";
}
function isCompletedStatus(s) {
  return String(s || "").toLowerCase() === "completed";
}

export default function Transfers() {
  const {
    logs,
    habits,
    transfers,
    isLoading,
    error,
  } = useHabits();

  const [expandedTransfers, setExpandedTransfers] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTransferBreakdown = (transferId) => {
    setExpandedTransfers((prev) => {
      const next = new Set(prev);
      if (next.has(transferId)) next.delete(transferId);
      else next.add(transferId);
      return next;
    });
  };

  // Build quick lookup maps (for breakdown)
  const habitById = useMemo(() => {
    const m = new Map();
    for (const h of habits || []) m.set(String(h.id), h);
    return m;
  }, [habits]);

  const logById = useMemo(() => {
    const m = new Map();
    for (const l of logs || []) m.set(String(l.id), l);
    return m;
  }, [logs]);

  // =========================
  // Totals: status-aware
  // =========================
  const pendingTotal = useMemo(() => {
    return (transfers || [])
      .filter((t) => isPendingStatus(t.status))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transfers]);

  const completedTotal = useMemo(() => {
    return (transfers || [])
      .filter((t) => isCompletedStatus(t.status))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transfers]);

  const completedCount = useMemo(() => {
    return (transfers || []).filter((t) => isCompletedStatus(t.status)).length;
  }, [transfers]);

  // =========================
  // Card helpers
  // =========================
  const getTransferDateRange = (transferDate) => {
    const date = new Date(transferDate);
    const weekStart = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);

    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Week of ${fmt(weekStart)} - ${fmt(date)}`;
  };

  // Breakdown:
  // - If transfer.logId exists (your schema says it usually will), show the single log/habit.
  // - Else fallback to the legacy “week window” approximation.
  const getTransferBreakdown = (transfer) => {
    const out = [];

    const logId = transfer?.logId ? String(transfer.logId) : null;
    if (logId && logById.has(logId)) {
      const log = logById.get(logId);
      const habit = habitById.get(String(log.habitId));

      out.push({
        name: habit?.name || "Habit",
        count: 1,
        // use transfer.amount as truth; fallback to enriched log.amount if present
        earnings: Number(transfer.amount || log.amount || 0),
      });

      return out;
    }

    const transferDate = new Date(transfer.date);
    const weekStart = new Date(transferDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const habitBreakdown = {};

    (logs || []).forEach((log) => {
      const logDate = new Date(log.timestamp);
      if (logDate >= weekStart && logDate < transferDate) {
        const habit = habitById.get(String(log.habitId));
        if (!habit) return;

        if (!habitBreakdown[habit.id]) {
          habitBreakdown[habit.id] = { name: habit.name, count: 0, earnings: 0 };
        }

        habitBreakdown[habit.id].count += 1;
        habitBreakdown[habit.id].earnings += Number(log.amount || 0);
      }
    });

    return Object.values(habitBreakdown).sort((a, b) => b.earnings - a.earnings);
  };

  return (
    <div className="transfers-page">
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="transfers-header">
        <button
          className="menu-button"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="transfers-title">Transfers</h1>
        <div className="header-spacer" />
      </header>

      <div className="transfers-container">
        {/* Summary */}
        <div className="transfers-summary">
          <div className="summary-stat">
            <div className="summary-label">Pending</div>
            <div className="summary-value">{formatCurrency(pendingTotal)}</div>
          </div>

          <div className="summary-stat">
            <div className="summary-label">Total Transferred</div>
            <div className="summary-value">{formatCurrency(completedTotal)}</div>
          </div>

          <div className="summary-stat">
            <div className="summary-label">Total Transfers</div>
            <div className="summary-value">{completedCount}</div>
          </div>
        </div>

        {/* Optional manual trigger button (if you want it visible in UI) */}
        {/* <div style={{ marginBottom: 12 }}>
          <button disabled={isTransferring} onClick={handleTransfer}>
            {isTransferring ? "Transferring…" : "Process transfer"}
          </button>
        </div> */}

        {isLoading && (
          <div className="empty-state">
            <p>Loading transfers…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="empty-state">
            <h3>Couldn’t load transfers</h3>
            <p>{error?.message || "Unknown error"}</p>
          </div>
        )}

        {!isLoading && !error && (transfers?.length || 0) === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3>No transfers yet</h3>
            <p>Weekly transfers will appear here every Friday (or you can test with the button above).</p>
          </div>
        ) : (
          <div className="transfers-list">
            {(transfers || []).map((transfer) => {
              const breakdown = getTransferBreakdown(transfer);
              const isExpanded = expandedTransfers.has(transfer.id);

              const pending = isPendingStatus(transfer.status);
              const completed = isCompletedStatus(transfer.status);

              const statusLabel = pending ? "Pending" : completed ? "Transferred" : String(transfer.status || "—");

              return (
                <div
                  key={transfer.id}
                  className={`transfer-card ${isExpanded ? "expanded" : ""} ${
                    pending ? "status-pending" : "status-completed"
                  }`}
                >
                  <div className="transfer-card-header">
                    <div className="transfer-date-section">
                      <div className="transfer-date-icon">
                        {pending ? (
                          // Clock icon for pending
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22a10 10 0 110-20 10 10 0 010 20z" />
                          </svg>
                        ) : (
                          // Check icon for completed
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>

                      <div className="transfer-date-info">
                        <h3>{getTransferDateRange(transfer.date)}</h3>
                        <p>
                          {new Date(transfer.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="transfer-amount-section">
                      <div className="transfer-amount-value">{formatCurrency(transfer.amount)}</div>
                      <div className="transfer-amount-label">{statusLabel}</div>
                    </div>
                  </div>

                  <div className="transfer-meta">
                    <div className="transfer-route">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Checking → Savings
                    </div>

                    <button
                      className="transfer-expand"
                      onClick={() => toggleTransferBreakdown(transfer.id)}
                      type="button"
                    >
                      {isExpanded ? "Hide details" : "View details"}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="transfer-breakdown">
                      <div className="transfer-breakdown-title">Breakdown</div>

                      {breakdown.length > 0 ? (
                        breakdown.map((item, index) => (
                          <div key={index} className="breakdown-row">
                            <span className="breakdown-label">
                              {item.name} ({item.count}×)
                            </span>
                            <span className="breakdown-value">{formatCurrency(item.earnings)}</span>
                          </div>
                        ))
                      ) : (
                        <p style={{ opacity: 0.8, margin: 0 }}>
                          No log found for this transfer.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
