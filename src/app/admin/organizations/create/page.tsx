// src/app/admin/organizations/create/page.tsx
import { redirect } from "next/navigation";
import { OrganizationForm } from "@/components/admin/OrganizationForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export const metadata = {
  title: "Crear nueva organización | Plataforma de Venta de Entradas",
  description: "Crea una nueva organización en la plataforma",
};

export default async function CreateOrganizationPage() {
  const supabase = createServerSupabaseClient();

  // Verificar permisos - solo admin puede crear organizaciones
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/auth/login?redirect=/admin/organizations/create");
  }

  // Obtener datos del usuario para verificar si es admin
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!userProfile || userProfile.role !== "admin") {
    return redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Crear nueva organización
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link href="/admin/organizations">
            <Button variant="outline" size="sm">
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <OrganizationForm isAdmin={true} />
      </div>
    </div>
  );
}
