import { createContext, useContext } from "react";
import type { User } from "../types/User";


export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);


 export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if(!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
  }
