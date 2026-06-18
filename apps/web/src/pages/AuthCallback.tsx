// This page handles the redirect back from Google OAuth.
// Supabase redirects here after Google auth completes.
// The onAuthStateChange listener in AuthContext fires automatically
// and handles exchanging the token with your backend.
// This page just shows a loading state while that happens.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthCallback() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Once auth resolves and we have a user → go to dashboard
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0a",
      color: "#ffffff",
    }}>
      <p>Signing you in...</p>
    </div>
  );
}