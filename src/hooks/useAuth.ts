// src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

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

  const signIn = async (email: string, password: string) => {
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

      return data;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Primero, registrar al usuario en la autenticación
      const { data, error: authError } = await supabaseClient.auth.signUp({
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
      });

      if (authError) throw authError;

      // Si el registro es exitoso, crear el perfil
      if (data.user) {
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .upsert(
            {
              id: data.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              phone: userData.phone,
              role: userData.role || "customer",
              email: email,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

        if (profileError) throw profileError;
      }

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return data;
    } catch (error) {
      console.error("Full signup error:", error);
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
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
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
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
