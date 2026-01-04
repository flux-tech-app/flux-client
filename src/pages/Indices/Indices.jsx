import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useHabits from "@/hooks/useHabits";
import SidebarMenu from "@/components/SidebarMenu/SidebarMenu";
import "./Indices.css";

export default function Indices() {
  const navigate = useNavigate();
  const { catalogHabits } = useHabits();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * UI-only placeholder indices.
   * We intentionally do NOT depend on any backend “index” services yet.
   * If a catalog habit exists, use it for nicer labels; otherwise show generic.
   */
  const placeholderIndices = useMemo(() => {
    const picks = (catalogHabits || []).slice(0, 6); // show a few if present
    if (picks.length > 0) {
      return picks.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
      }));
    }

    // If catalog isn't loaded or empty, still show UI.
    return [
      { id: "coming-soon-1", name: "Exercise", description: "Movement, training, and consistency." },
      { id: "coming-soon-2", name: "Sleep", description: "Rest quality and sleep habits." },
      { id: "coming-soon-3", name: "Hydration", description: "Water intake and consistency." },
      { id: "coming-soon-4", name: "Nutrition", description: "Food choices and tracking." },
    ];
  }, [catalogHabits]);

  return (
    <div className="indices-page">
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="indices-container">
        {/* Header */}
        <header className="indices-header">
          <button
            className="menu-button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="page-title">Indices</h1>

          <button className="icon-button" onClick={() => setShowInfoModal(true)} aria-label="About indices">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </header>

        {/* Coming Soon Hero */}
        <div className="indices-empty-state">
          <div className="indices-empty-icon">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          <h3 className="indices-empty-title">Coming soon!</h3>
          <p className="indices-empty-text">
            Indices will show community trends and your position for behaviors over time.
          </p>
        </div>

        {/* Optional: UI-only preview list (still “Coming Soon” on click) */}
        <div className="indices-section">
          <div className="section-header-row">
            <span className="section-title">Preview</span>
            <span className="coming-soon-badge">Coming Soon</span>
          </div>

          <div className="indices-list">
            {placeholderIndices.map((item) => (
              <div
                key={item.id}
                className="index-row discover"
                onClick={() => navigate(`/indices/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(`/indices/${item.id}`);
                }}
              >
                <div className="index-info">
                  <div className="index-name">{item.name}</div>
                  <div className="index-meta">{item.description || "Community index (coming soon)"}</div>
                </div>

                <span className="coming-soon-badge" style={{ marginLeft: "auto" }}>
                  Soon
                </span>

                <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">About Indices</h3>
              <button className="modal-close" onClick={() => setShowInfoModal(false)} aria-label="Close">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-info-section">
                <h4>Behavior Indices</h4>
                <p className="modal-info-text">
                  Indices will summarize how a behavior is trending and how you compare over time.
                </p>
              </div>

              <div className="modal-info-section">
                <h4>Status</h4>
                <p className="modal-info-text">
                  This page is currently UI-only. We’ll wire up calculations and community data later.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
