// src/contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Session, User, AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type UserMetadata = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: "customer" | "organizer" | "admin";
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    userData: UserMetadata
  ) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();

        setSession(data.session);
        setUser(data.session?.user || null);
        setError(error);
        setLoading(false);
      } catch (error) {
        setError(error as AuthError);
        setLoading(false);
      }
    };

    getInitialSession();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);

        // Si el usuario acaba de iniciar sesión, actualizar su último acceso
        if (event === "SIGNED_IN" && session?.user) {
          try {
            await supabaseClient.from("profiles").upsert(
              {
                id: session.user.id,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "id",
              }
            );
          } catch (error) {
            console.error("Error updating last login:", error);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error);
        return { data: null, error };
      }

      setUser(data.user);
      setSession(data.session);
      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError);
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: UserMetadata
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        setError(error);
        return { data: null, error };
      }

      // Crear perfil de usuario en la tabla profiles
      if (data.user) {
        await supabaseClient.from("profiles").upsert({
          id: data.user.id,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone || "",
          role: userData.role || "customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError);
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        setError(error);
        return;
      }

      setUser(null);
      setSession(null);
      router.push("/");
    } catch (error) {
      setError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext debe ser usado dentro de un AuthProvider");
  }

  return context;
}
