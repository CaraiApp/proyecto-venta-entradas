// src/app/auth/register-organization/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { OrganizationForm } from "@/components/admin/OrganizationForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Registro para organizadores | Plataforma de Venta de Entradas",
  description: "Registra tu organización en la plataforma de venta de entradas",
};

export default async function RegisterOrganizationPage() {
  const supabase = createServerSupabaseClient();

  // Verificar si ya hay una sesión
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Si ya hay sesión, redirigir al dashboard
  if (session) {
    return redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro para organizadores
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Completa el formulario para solicitar tu cuenta de organizador. Una
            vez enviada, revisaremos tu solicitud y nos pondremos en contacto
            contigo a la mayor brevedad.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Información de la organización
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Debes completar todos los campos marcados con *
            </p>
          </div>
          <OrganizationForm isAdmin={false} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Iniciar sesión
            </Link>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            ¿Eres un asistente a eventos?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate como cliente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
