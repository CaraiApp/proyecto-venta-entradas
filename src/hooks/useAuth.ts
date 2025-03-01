// src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import type {
  Session,
  User,
  AuthError,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";

export type UserMetadata = {
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
};

type AuthResult<T> = {
  data: T | null;
  error: AuthError | PostgrestError | Error | null;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | PostgrestError | Error | null;
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession();

        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          error: error || null,
        });
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
      }
    };

    getInitialSession();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          error: null,
        });

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

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult<{ user: User; session: Session }>> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
      return {
        data: null,
        error: error as AuthError,
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: UserMetadata
  ): Promise<AuthResult<{ user: User | null; session: Session | null }>> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Prepare signup credentials
      const signUpData: SignUpWithPasswordCredentials = {
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            role: userData.role || "customer",
          },
        },
      };

      const { data, error } = await supabaseClient.auth.signUp(signUpData);

      if (error) {
        throw error;
      }

      // Create profile in profiles table
      if (data.user) {
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone || null,
            role: userData.role || "customer",
          });

        if (profileError) {
          throw profileError;
        }
      }

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error as AuthError | PostgrestError,
        loading: false,
      }));
      return {
        data: null,
        error: error as AuthError | PostgrestError,
      };
    }
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        throw error;
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });

      router.push("/");
      return { error: null };
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
      return {
        error: error as AuthError,
      };
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
  };
}
