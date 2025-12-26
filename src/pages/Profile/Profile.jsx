// src/pages/Profile/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useHabits from "@/hooks/useHabits";
import SidebarMenu from "../../components/SidebarMenu/SidebarMenu";
import { supabase } from "@/auth/supabaseClient";
import { formatUSDFromMicros } from "@/utils/micros";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user, habits, logs, getTransferredBalance, updateUser, refresh } = useHabits();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [emailDraft, setEmailDraft] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formMessage, setFormMessage] = useState(null);

  // Keep drafts in sync when user loads/changes
  useEffect(() => {
    setNameDraft(user?.name ?? "");
    setEmailDraft(user?.email ?? "");
  }, [user?.name, user?.email]);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase();
    return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase() || "?";
  };

  // totals are MICROS (int64) coming from backend / HabitProvider selectors
  const totalEarnedMicros = useMemo(() => Number(getTransferredBalance?.() ?? 0), [getTransferredBalance]);

  const totalLogs = logs?.length ?? 0;
  const activeHabits = habits?.length ?? 0;

  const memberSince = useMemo(() => {
    // backend has been using createdAtMs more often; support both
    const ms = user?.createdAtMs ?? user?.createdAt ?? null;
    if (ms == null) return "Recently joined";

    const d = new Date(Number(ms));
    if (Number.isNaN(d.getTime())) return "Recently joined";

    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [user?.createdAtMs, user?.createdAt]);

  async function onSave() {
    setFormError(null);
    setFormMessage(null);

    const nextName = (nameDraft ?? "").trim();
    const nextEmail = (emailDraft ?? "").trim().toLowerCase();

    const nameChanged = nextName !== (user?.name ?? "");
    const emailChanged = nextEmail !== (user?.email ?? "");

    if (!nameChanged && !emailChanged) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      // 1) Update display name via API (public.users.name)
      if (nameChanged) {
        await updateUser({ name: nextName });
      }

      // 2) Update email via Supabase Auth ONLY
      if (emailChanged) {
        const { error } = await supabase.auth.updateUser({ email: nextEmail });
        if (error) throw error;

        setFormMessage("Email update requested. If prompted, check your inbox to confirm.");

        // 3) Refresh bootstrap
        await refresh({ silent: true });
      }

      setIsEditing(false);
    } catch (e) {
      setFormError(e?.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="profile-container">
        <header className="profile-page-header">
          <button className="menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="profile-page-title">Profile</h1>
          <div className="header-spacer" />
        </header>

        <div className="profile-card">
          <div className="profile-avatar-large">{getInitials(user?.name || "User")}</div>

          {!isEditing ? (
            <>
              <div className="profile-name-large">{user?.name || "User"}</div>
              <div className="profile-email">{user?.email || "Set up your profile"}</div>
              <div className="profile-member-since">Member since {memberSince}</div>

              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <div style={{ width: "100%", marginTop: 12 }}>
                <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Name</label>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Your name"
                  style={{ width: "100%", padding: 10, borderRadius: 10 }}
                  disabled={saving}
                />
              </div>

              <div style={{ width: "100%", marginTop: 12 }}>
                <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Email</label>
                <input
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: "100%", padding: 10, borderRadius: 10 }}
                  disabled={saving}
                />
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                  Email changes are handled by Supabase. You may need to confirm via email.
                </div>
              </div>

              {formError ? <div style={{ marginTop: 10, color: "crimson" }}>{formError}</div> : null}
              {formMessage ? <div style={{ marginTop: 10 }}>{formMessage}</div> : null}

              <div style={{ display: "flex", gap: 10, marginTop: 14, width: "100%" }}>
                <button className="edit-profile-btn" onClick={onSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="edit-profile-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setNameDraft(user?.name ?? "");
                    setEmailDraft(user?.email ?? "");
                    setFormError(null);
                    setFormMessage(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{formatUSDFromMicros(totalEarnedMicros)}</div>
            <div className="stat-label">Total Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalLogs}</div>
            <div className="stat-label">Total Logs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activeHabits}</div>
            <div className="stat-label">Active Habits</div>
          </div>
        </div>

        <div className="menu-section">
          <div className="section-title">Quick Links</div>
          <div className="menu-items">
            <div className="menu-item" onClick={() => navigate("/activity")}>
              <div className="menu-icon blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Activity History</div>
                <div className="menu-subtitle">View all your logged activities</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="menu-item" onClick={() => navigate("/transfers")}>
              <div className="menu-icon green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div className="menu-content">
                <div className="menu-title">Transfer History</div>
                <div className="menu-subtitle">View all your transfers</div>
              </div>
              <svg className="chevron" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
