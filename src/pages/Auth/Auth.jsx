// src/pages/Auth/Auth.jsx
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const {
    isAuthLoading,
    authError,
    authMessage,
    signInWithPassword,
    signUpWithPassword,
  } = useAuth();

  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();

    const eTrim = (email ?? "").trim();

    console.groupCollapsed("[AuthPage] submit");
    console.info("mode:", isSigningUp ? "signUp" : "signIn");
    console.info("email:", eTrim);
    console.groupEnd();

    if (isSigningUp) {
      await signUpWithPassword(eTrim, password);
    } else {
      await signInWithPassword(eTrim, password);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>{isSigningUp ? "Create account" : "Sign in to Flux"}</h2>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Use your email and password to continue.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          disabled={isAuthLoading}
          onClick={() => setIsSigningUp(false)}
          style={{ flex: 1, padding: 10, opacity: !isSigningUp ? 1 : 0.7 }}
        >
          Sign In
        </button>
        <button
          type="button"
          disabled={isAuthLoading}
          onClick={() => setIsSigningUp(true)}
          style={{ flex: 1, padding: 10, opacity: isSigningUp ? 1 : 0.7 }}
        >
          Sign Up
        </button>
      </div>

      {authError && (
        <div style={{ background: "#3b0a0a", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>Auth error</strong>
          <div style={{ opacity: 0.9 }}>{authError}</div>
        </div>
      )}

      {authMessage && (
        <div style={{ background: "#0a2b3b", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ opacity: 0.9 }}>{authMessage}</div>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 6 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete={isSigningUp ? "new-password" : "current-password"}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <button disabled={isAuthLoading} type="submit" style={{ width: "100%", padding: 12 }}>
          {isSigningUp ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
