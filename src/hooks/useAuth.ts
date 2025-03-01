// src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { AuthResult } from "@/contexts/AuthContext";

// Tipo para los datos de registro de usuario
type UserRegistrationData = {
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
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

        if (error) {
          throw error;
        }

        // Si hay sesión, obtener información adicional del perfil
        let profileData = null;
        if (session?.user) {
          const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else {
            // Combinar metadata de usuario con datos del perfil
            session.user.user_metadata = {
              ...session.user.user_metadata,
              ...profile,
            };
          }
        }

        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          error: null,
        });
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
        }));
      }
    };

    getInitialSession();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        let updatedUser = session?.user;

        // Obtener información adicional del perfil si es un inicio de sesión
        if (event === "SIGNED_IN" && session?.user) {
          try {
            const { data: profile } = await supabaseClient
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              // Combinar metadata de usuario con datos del perfil
              updatedUser = {
                ...session.user,
                user_metadata: {
                  ...session.user.user_metadata,
                  ...profile,
                },
              };
            }

            // Actualizar último inicio de sesión
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
            console.error("Error updating profile or last login:", error);
          }
        }

        setAuthState({
          user: updatedUser || null,
          session,
          loading: false,
          error: null,
        });
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

      if (error) throw error;

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error) {
      const processedError =
        error instanceof Error ? error : new Error(String(error));
      setAuthState((prev) => ({
        ...prev,
        error: processedError,
        loading: false,
      }));
      return { data: null, error: processedError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: UserRegistrationData
  ): Promise<AuthResult<{ user: User | null; session: Session | null }>> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Crear perfil de usuario
      if (data.user) {
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            role: userData.role,
          });

        if (profileError) throw profileError;
      }

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error) {
      const processedError =
        error instanceof Error ? error : new Error(String(error));
      setAuthState((prev) => ({
        ...prev,
        error: processedError,
        loading: false,
      }));
      return { data: null, error: processedError };
    }
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });

      router.push("/");
    } catch (error) {
      const processedError =
        error instanceof Error ? error : new Error(String(error));
      setAuthState((prev) => ({
        ...prev,
        error: processedError,
        loading: false,
      }));
      throw processedError;
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
