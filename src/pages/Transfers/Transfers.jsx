// src/pages/Transfers/Transfers.jsx
import { useMemo, useState } from "react";
import { useHabits } from "../../context/HabitContext";
import { formatCurrency } from "../../utils/formatters";
import SidebarMenu from "../../components/SidebarMenu/SidebarMenu";
import "./Transfers.css";

export default function Transfers() {
  const {
    logs,
    habits,
    transfers,
    processTransfer,
    getPendingBalance,
    refresh,
    isLoading,
    error,
  } = useHabits();

  const [expandedTransfers, setExpandedTransfers] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const pending = getPendingBalance ? getPendingBalance() : 0;

  const toggleTransferBreakdown = (transferId) => {
    setExpandedTransfers((prev) => {
      const next = new Set(prev);
      if (next.has(transferId)) next.delete(transferId);
      else next.add(transferId);
      return next;
    });
  };

  // Breakdown is “best effort” UI logic. Backend does not provide a breakdown yet (Step A).
  const getTransferBreakdown = (transfer) => {
    const transferDate = new Date(transfer.date);
    const weekStart = new Date(transferDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const habitBreakdown = {};

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      if (logDate >= weekStart && logDate < transferDate) {
        const habit = habits.find((h) => h.id === log.habitId);
        if (!habit) return;

        if (!habitBreakdown[habit.id]) {
          habitBreakdown[habit.id] = {
            name: habit.name,
            count: 0,
            earnings: 0,
          };
        }
        habitBreakdown[habit.id].count += 1;
        habitBreakdown[habit.id].earnings += Number(log.totalEarnings || 0);
      }
    });

    return Object.values(habitBreakdown).sort((a, b) => b.earnings - a.earnings);
  };

  const getTransferDateRange = (transferDate) => {
    const date = new Date(transferDate);
    const weekStart = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);

    const fmt = (d) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return `Week of ${fmt(weekStart)} - ${fmt(date)}`;
  };

  const totalTransferred = useMemo(() => {
    return (transfers || []).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transfers]);

  const handleTransfer = async () => {
    if (!processTransfer) return;
    if (isTransferring) return;

    setIsTransferring(true);
    try {
      await processTransfer();
      // refresh is optional; processTransfer already updates boot.
      if (refresh) await refresh();
    } catch (e) {
      console.error(e);
      // Your http.js wraps to HttpError with status
      if (e?.status === 409) {
        alert("No pending balance to transfer.");
      } else {
        alert(e?.message || "Transfer failed. Please try again.");
      }
    } finally {
      setIsTransferring(false);
    }
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
        {/* Step A: pending + manual transfer button */}
        <div className="transfers-summary">
          <div className="summary-stat">
            <div className="summary-label">Pending</div>
            <div className="summary-value">{formatCurrency(pending)}</div>
          </div>

          <div className="summary-stat">
            <div className="summary-label">Total Transferred</div>
            <div className="summary-value">{formatCurrency(totalTransferred)}</div>
          </div>

          <div className="summary-stat">
            <div className="summary-label">Total Transfers</div>
            <div className="summary-value">{transfers?.length || 0}</div>
          </div>
        </div>

        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <button
            className="primary-button"
            onClick={handleTransfer}
            disabled={isTransferring || pending <= 0}
            style={{ width: "100%" }}
          >
            {isTransferring ? "Transferring..." : `Transfer Pending (${formatCurrency(pending)})`}
          </button>
        </div>

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

              return (
                <div key={transfer.id} className={`transfer-card ${isExpanded ? "expanded" : ""}`}>
                  <div className="transfer-card-header">
                    <div className="transfer-date-section">
                      <div className="transfer-date-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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
                      <div className="transfer-amount-label">Transferred</div>
                    </div>
                  </div>

                  <div className="transfer-meta">
                    <div className="transfer-route">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Checking → Savings
                    </div>
                    <button className="transfer-expand" onClick={() => toggleTransferBreakdown(transfer.id)}>
                      {isExpanded ? "Hide details" : "View details"}
                    </button>
                  </div>

                  {isExpanded && breakdown.length > 0 && (
                    <div className="transfer-breakdown">
                      <div className="transfer-breakdown-title">Breakdown</div>
                      {breakdown.map((item, index) => (
                        <div key={index} className="breakdown-row">
                          <span className="breakdown-label">
                            {item.name} ({item.count}×)
                          </span>
                          <span className="breakdown-value">{formatCurrency(item.earnings)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && breakdown.length === 0 && (
                    <div className="transfer-breakdown">
                      <div className="transfer-breakdown-title">Breakdown</div>
                      <p style={{ opacity: 0.8, margin: 0 }}>
                        No logs found in the week window for this transfer.
                      </p>
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
