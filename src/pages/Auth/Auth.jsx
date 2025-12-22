// src/pages/Auth/Auth.jsx
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const { signInWithProvider, isAuthLoading } = useAuth();

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>Sign in to Flux</h2>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Continue with a provider to start tracking habits.
      </p>

      <button
        disabled={isAuthLoading}
        onClick={() => signInWithProvider("google")}
        style={{ width: "100%", padding: 12, marginBottom: 10 }}
      >
        Continue with Google
      </button>

      <button
        disabled={isAuthLoading}
        onClick={() => signInWithProvider("apple")}
        style={{ width: "100%", padding: 12 }}
      >
        Continue with Apple
      </button>
    </div>
  );
}