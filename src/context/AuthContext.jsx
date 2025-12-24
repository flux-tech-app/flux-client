// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/auth/supabaseClient";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function redactEmail(email) {
  const e = (email ?? "").trim();
  if (!e.includes("@")) return e;
  const [u, d] = e.split("@");
  const u2 = u.length <= 2 ? `${u[0] ?? ""}*` : `${u.slice(0, 2)}***`;
  return `${u2}@${d}`;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      console.info("[Auth] getSession()");
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) console.error("[Auth] getSession error:", error);
      console.info("[Auth] getSession session:", data?.session ? "present" : "null");

      setSession(data?.session ?? null);
      setIsAuthLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.groupCollapsed("[Auth] onAuthStateChange");
      console.info("event:", event);
      console.info("session:", nextSession ? "present" : "null");
      console.groupEnd();

      setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  function clearAuthFeedback() {
    setAuthError(null);
    setAuthMessage(null);
  }

  async function signInWithPassword(email, password) {
    clearAuthFeedback();

    const e = (email ?? "").trim();
    if (!e) {
      setAuthError("Email is required.");
      return { data: null, error: new Error("Email is required") };
    }
    if (!password) {
      setAuthError("Password is required.");
      return { data: null, error: new Error("Password is required") };
    }

    console.groupCollapsed("[Auth] signInWithPassword");
    console.info("email:", redactEmail(e));

    const { data, error } = await supabase.auth.signInWithPassword({
      email: e,
      password, // do NOT log
    });

    if (error) {
      console.error("[Auth] signInWithPassword error:", error);
      setAuthError(error.message);
    } else {
      console.info("[Auth] signInWithPassword ok:", {
        session: data?.session ? "present" : "null",
        user: data?.user?.id ?? null,
      });
      setAuthMessage(null);
    }

    console.groupEnd();
    return { data, error };
  }

  async function signUpWithPassword(email, password) {
    clearAuthFeedback();

    const e = (email ?? "").trim();
    if (!e) {
      setAuthError("Email is required.");
      return { data: null, error: new Error("Email is required") };
    }
    if (!password) {
      setAuthError("Password is required.");
      return { data: null, error: new Error("Password is required") };
    }

    console.groupCollapsed("[Auth] signUp");
    console.info("email:", redactEmail(e));

    const { data, error } = await supabase.auth.signUp({
      email: e,
      password, // do NOT log
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("[Auth] signUp error:", error);
      setAuthError(error.message);
      console.groupEnd();
      return { data, error };
    }

    // With "Confirm email" OFF, session should be present immediately.
    console.info("[Auth] signUp ok:", {
      session: data?.session ? "present" : "null",
      user: data?.user?.id ?? null,
    });

    if (data?.session) {
      setAuthMessage("Account created and signed in.");
    } else {
      // If confirmations were still on, you'd land here.
      setAuthMessage("Account created. (No session yet.)");
    }

    console.groupEnd();
    return { data, error: null };
  }

  async function signOut() {
    clearAuthFeedback();
    console.info("[Auth] signOut()");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[Auth] signOut error:", error);
      setAuthError(error.message);
    }
    return { error };
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthLoading,
      authError,
      authMessage,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [session, isAuthLoading, authError, authMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
