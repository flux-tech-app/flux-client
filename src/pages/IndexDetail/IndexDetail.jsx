// src/pages/IndexDetail/IndexDetail.jsx
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHabits from "@/hooks/useHabits";
import BackButton from "../../components/BackButton";

import "./IndexDetail.css";

export default function IndexDetail() {
  const navigate = useNavigate();
  const { indexId } = useParams();

  // Only use catalog lookup (optional). No logs, no index generators.
  const { getCatalogHabit, catalogHabits } = useHabits();

  const behavior = useMemo(() => {
    if (!indexId) return null;

    // Prefer strict lookup if available
    if (typeof getCatalogHabit === "function") {
      try {
        return getCatalogHabit(indexId);
      } catch {
        return null;
      }
    }

    // Fallback if you expose catalogHabits instead
    return (catalogHabits || []).find((c) => String(c?.id) === String(indexId)) ?? null;
  }, [indexId, getCatalogHabit, catalogHabits]);

  // If we can’t resolve the behavior, still allow the page (coming soon)
  const title = behavior?.name ? `${behavior.name} Index` : "Index";
  const subtitle =
    behavior?.description || "Indices are coming soon. This page is not wired up yet.";

  return (
    <div className="idx-detail-page">
      <div className="idx-detail-container">
        <header className="idx-header">
          <BackButton />
          <div className="idx-header-content">
            <div className="idx-header-title">{title}</div>
            <div className="idx-header-subtitle">{subtitle}</div>
          </div>
        </header>

        <div className="idx-empty-state">
          <div className="idx-empty-icon">
            {/* Reuse an existing icon style */}
            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="idx-empty-title">Coming Soon</h3>
          <p className="idx-empty-text">
            We’re keeping this UI, but index calculations and community comparisons aren’t implemented yet.
          </p>

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/indices")}>Back to Indices</button>
            <button onClick={() => navigate("/home")}>Go Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}