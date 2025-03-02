// src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

// Tipo para el resultado de las operaciones de autenticación
export interface AuthResult<T> {
  data: T | null;
  error: Error | null;
}

// Tipo para los datos de registro de usuario
export interface UserRegistrationData {
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
}

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

        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          error: error ? new Error(error.message) : null,
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
        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          error: null,
        });

        // Si el usuario acaba de iniciar sesión, actualizar su último acceso
        if (event === "SIGNED_IN" && session?.user) {
          try {
            // Verificar si ya existe un perfil
            const { data: existingProfile } = await supabaseClient
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (existingProfile) {
              // Si existe, solo actualizar la fecha
              await supabaseClient.from("profiles").upsert(
                {
                  id: session.user.id,
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: "id",
                }
              );
            } else {
              // Si no existe, crear uno completo
              await supabaseClient.from("profiles").upsert(
                {
                  id: session.user.id,
                  email: session.user.email,
                  first_name: session.user.user_metadata?.first_name || "",
                  last_name: session.user.user_metadata?.last_name || "",
                  phone: session.user.user_metadata?.phone || "",
                  role: session.user.user_metadata?.role || "customer",
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: "id",
                }
              );
            }
          } catch (error) {
            console.error("Error updating profile after signin:", error);
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
        throw new Error(error.message);
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

      if (error) {
        throw new Error(error.message);
      }

      // Crear perfil de usuario
      if (data.user) {
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: email, // Incluir el email en el perfil
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            role: userData.role,
          });

        if (profileError) {
          throw new Error(profileError.message);
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

  const signOut = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

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
