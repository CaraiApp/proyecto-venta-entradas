// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth, AuthResult, UserRegistrationData } from "@/hooks/useAuth";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<AuthResult<{ user: User; session: Session }>>;
  signUp: (
    email: string,
    password: string,
    userData: UserRegistrationData
  ) => Promise<AuthResult<{ user: User | null; session: Session | null }>>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext debe ser usado dentro de un AuthProvider");
  }
  return context;
}
