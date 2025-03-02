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
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Crear nueva organización
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Link href="/admin/organizations">
            <Button variant="outline" size="sm">
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <OrganizationForm />
      </div>
    </div>
  );
}
