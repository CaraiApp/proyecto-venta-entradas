// src/app/admin/organizations/[id]/edit/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { notFound, redirect } from "next/navigation";
import { OrganizationForm } from "@/components/admin/OrganizationForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({ params }) {
  const supabase = createServerSupabaseClient();
  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", params.id)
    .single();

  if (!organization) {
    return {
      title: "Organización no encontrada",
    };
  }

  return {
    title: `Editar ${organization.name} | Administración de Organizaciones`,
  };
}

export default async function EditOrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();

  // Verificar permisos - solo admin puede editar organizaciones
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect(
      `/auth/login?redirect=/admin/organizations/${params.id}/edit`
    );
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

  // Obtener detalles de la organización
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !organization) {
    return notFound();
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Editar organización: {organization.name}
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Link href={`/admin/organizations/${params.id}`}>
            <Button variant="outline" size="sm">
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <OrganizationForm organization={organization} isEditing={true} />
      </div>
    </div>
  );
}
