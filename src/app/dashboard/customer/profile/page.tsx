// src/app/dashboard/customer/profile/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { UserProfile } from "@/components/profile/UserProfile";

export const metadata = {
  title: "Mi Perfil | Plataforma de Venta de Entradas",
  description:
    "Gestiona tu perfil de usuario en la plataforma de venta de entradas",
};

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient();

  // Verificar sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/dashboard/customer/profile");
  }

  // Obtener perfil de usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    // Si no hay perfil pero hay sesión, podríamos crear un perfil básico
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Perfil no encontrado
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                No se ha encontrado tu perfil. Por favor, contacta con el
                soporte técnico.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preparar datos para el componente
  const userData = {
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: session.user.email || "",
    phone: profile.phone || "",
    avatar_url: profile.avatar_url,
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
      <UserProfile userId={session.user.id} initialData={userData} />

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Cambiar contraseña
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Si deseas cambiar tu contraseña, puedes solicitar un enlace de
              restablecimiento que se enviará a tu correo electrónico.
            </p>
          </div>
          <div className="mt-5">
            <form action="/api/auth/reset-password" method="POST">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Solicitar cambio de contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
