import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/User";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("jwt");
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("jwt");
      return null;
    }
  });

  const [isLoading] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE}/auth/google-callback`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ access_token: session.access_token }),
            },
          );

          if (!res.ok) throw new Error("Backend auth failed");

          const data = await res.json();

          const userWithAvatar: User = {
            ...data.user,
          };

          localStorage.setItem("jwt", data.token);
          localStorage.setItem("user", JSON.stringify(userWithAvatar));
          setToken(data.token);
          setUser(userWithAvatar);
        } catch (err) {
          console.error("[auth] Failed to exchange token:", err);
        }
      }

      if (event === "SIGNED_OUT") {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
