// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Session, User, AuthError } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";
import type { UserMetadata } from "@/hooks/useAuth";

type AuthResult<T> = {
  data: T | null;
  error: AuthError | PostgrestError | Error | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | AuthError | PostgrestError | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<AuthResult<{ user: User; session: Session }>>;
  signUp: (
    email: string,
    password: string,
    userData: UserMetadata
  ) => Promise<AuthResult<{ user: User | null; session: Session | null }>>;
  signOut: () => Promise<{ error: Error | AuthError | null }>;
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
