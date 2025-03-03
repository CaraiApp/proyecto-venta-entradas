// src/lib/supabaseClient.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase"; // Asegúrate de crear este tipo

// Crea un cliente Supabase para componentes del lado del cliente
export const supabaseClient = createClientComponentClient<Database>();

// Función de utilidad para manejar errores de Supabase de manera consistente
export function handleSupabaseError(error: any): string {
  if (!error) return "Ocurrió un error desconocido";

  switch (error.code) {
    case "auth/email-already-in-use":
      return "El correo electrónico ya está registrado";
    case "auth/invalid-email":
      return "Formato de correo electrónico inválido";
    case "auth/weak-password":
      return "La contraseña es demasiado débil";
    case "auth/user-not-found":
      return "Usuario no encontrado";
    case "auth/wrong-password":
      return "Contraseña incorrecta";
    case "auth/too-many-requests":
      return "Demasiados intentos. Por favor, intenta de nuevo más tarde";
    default:
      return error.message || "Error de autenticación";
  }
}

// Función para obtener el usuario actual de manera segura
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return null;
  }
}

// Ejemplo de función para obtener el perfil del usuario
export async function getUserProfile() {
  const user = await getCurrentUser();

  if (!user) return null;

  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error);
    return null;
  }
}

// Función para cerrar sesión
export async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw error;
    }

    // Opcional: Redirigir o realizar acciones adicionales después de cerrar sesión
    return true;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return false;
  }
}
