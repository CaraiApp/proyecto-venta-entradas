// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { AuthState, UserMetadata } from "@/types";

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

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserMetadata>,
    organizationData?: {
      name: string;
      email: string;
      phone?: string;
      tax_id?: string;
    }
  ) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // 1. Registrar usuario en Auth
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      // 2. Si el registro es exitoso y tenemos un usuario
      if (data.user) {
        const userId = data.user.id;

        // 3. Si es un organizador, crear la organización
        if (userData.role === "organizer" && organizationData) {
          // 3.1 Crear organización
          const { data: orgData, error: orgError } = await supabaseClient
            .from("organizations")
            .insert({
              name: organizationData.name,
              email: organizationData.email,
              phone: organizationData.phone || null,
              tax_id: organizationData.tax_id || null,
              status: "pending",
            })
            .select()
            .single();

          if (orgError) throw orgError;

          // 3.2 Crear relación entre usuario y organización
          if (orgData) {
            // Actualizar metadata de usuario con organization_id
            await supabaseClient.auth.updateUser({
              data: {
                ...userData,
                organization_id: orgData.id,
              },
            });

            // Crear entrada en organization_members
            const { error: memberError } = await supabaseClient
              .from("organization_members")
              .insert({
                organization_id: orgData.id,
                user_id: userId,
                role: "owner",
              });

            if (memberError) throw memberError;
          }
        }

        // 4. Crear perfil de usuario
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .insert({
            id: userId,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: email, // Añadimos el email al perfil
            phone: userData.phone || null,
            role: userData.role,
            organization_id: userData.organization_id || null,
          });

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
