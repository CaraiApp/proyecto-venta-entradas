// src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Session,
  User,
  AuthError,
  PostgrestError,
} from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | AuthError | PostgrestError | null;
};

export type UserMetadata = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
};

type AuthResult<T> = {
  data: T | null;
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
        console.error("Error getting session:", error);
        setAuthState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error("Unknown error"),
          loading: false,
        }));
      }
    };

    getInitialSession();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
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

      if (error) throw error;

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error) {
      console.error("Sign in error:", error);

      const typedError =
        error instanceof Error ? error : new Error("Unknown error");

      setAuthState((prev) => ({
        ...prev,
        error: typedError,
        loading: false,
      }));

      return { data: null, error: typedError };
    }
  };

  // Define un tipo para los datos de usuario
  interface UserMetadata {
    first_name: string;
    last_name: string;
    phone?: string;
    role: "customer" | "organizer" | "admin";
  }

  const signUp = async (
    email: string,
    password: string,
    userData: UserMetadata
  ) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Registro del usuario
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      // Comprobamos que el usuario se creó correctamente
      if (data.user) {
        console.log("Usuario creado con ID:", data.user.id);

        // Creamos el perfil en la tabla profiles
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: email, // Añadimos el email que faltaba
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone || null,
            role: userData.role,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Error al crear perfil:", profileError);
          throw new Error(
            `Error al crear perfil: ${JSON.stringify(profileError)}`
          );
        }

        setAuthState({
          user: data.user,
          session: data.session,
          loading: false,
          error: null,
        });

        return data;
      }
    } catch (error) {
      console.error("Error en registro:", error);
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  };

  const signOut = async (): Promise<{ error: Error | AuthError | null }> => {
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
      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);

      const typedError =
        error instanceof AuthError
          ? error
          : error instanceof Error
          ? error
          : new Error("Unknown error during signout");

      setAuthState((prev) => ({
        ...prev,
        error: typedError,
        loading: false,
      }));

      return { error: typedError };
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
