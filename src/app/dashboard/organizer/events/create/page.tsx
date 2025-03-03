// src/app/dashboard/organizer/events/create/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { CreateEventForm } from "@/components/events/CreateEventForm";

export const metadata = {
  title: "Crear Evento | Plataforma de Venta de Entradas",
  description: "Crea un nuevo evento para tu organización",
};

export default async function CreateEventPage() {
  const supabase = createServerSupabaseClient();

  // Verificar sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/dashboard/organizer/events/create");
  }

  // Verificar que el usuario es organizador
  if (session.user.user_metadata?.role !== "organizer") {
    redirect("/dashboard");
  }

  // Obtener la organización del usuario
  const { data: memberData } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", session.user.id)
    .single();

  if (!memberData) {
    // Si no tiene una organización, redirigir a solicitar organización
    redirect("/dashboard/organizer/request-organization");
  }

  // Obtener detalles de la organización
  const { data: organizationData } = await supabase
    .from("organizations")
    .select("id, name, status")
    .eq("id", memberData.organization_id)
    .single();

  if (!organizationData) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Organización no encontrada
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>No se ha encontrado la organización asociada a tu cuenta.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si la organización está activa
  if (organizationData.status !== "active") {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Organización pendiente de aprobación
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Tu organización está pendiente de aprobación por parte del
                  administrador. Una vez aprobada, podrás crear eventos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Obtener mapas de asientos de la organización
  const { data: seatingMaps } = await supabase
    .from("seating_maps")
    .select("id, name")
    .eq("organization_id", organizationData.id)
    .eq("status", "approved");

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <CreateEventForm
          organizationId={organizationData.id}
          organizationName={organizationData.name}
          seatingMaps={seatingMaps || []}
        />
      </div>
    </div>
  );
}
