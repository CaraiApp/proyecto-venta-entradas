// src/app/dashboard/admin/organizations/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { sendOrganizationApprovalEmail } from "@/lib/email";

export const metadata = {
  title: "Gestión de Organizaciones | Panel de Administración",
  description: "Administra y aprueba solicitudes de organizaciones",
};

export default async function AdminOrganizationsPage() {
  const supabase = createServerSupabaseClient();

  // Verificar que el usuario es admin
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.user_metadata.role !== "admin") {
    redirect("/auth/login");
  }

  // Obtener organizaciones pendientes
  const { data: pendingOrganizations, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("status", "pending");

  const handleApproveOrganization = async (formData: FormData) => {
    "use server";
    const organizationId = formData.get("organizationId") as string;
    const supabase = createServerSupabaseClient();

    // Obtener detalles de la organización
    const { data: orgData, error: fetchError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (fetchError || !orgData) {
      console.error(
        "Error al obtener detalles de la organización:",
        fetchError
      );
      return;
    }

    // Actualizar estado de la organización
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (updateError) {
      console.error("Error al aprobar organización:", updateError);
      return;
    }

    // Enviar email de aprobación
    await sendOrganizationApprovalEmail({
      to: orgData.contact_email,
      organizationName: orgData.name,
      status: "approved",
    });
  };

  const handleRejectOrganization = async (formData: FormData) => {
    "use server";
    const organizationId = formData.get("organizationId") as string;
    const reason = formData.get("reason") as string;
    const supabase = createServerSupabaseClient();

    // Obtener detalles de la organización
    const { data: orgData, error: fetchError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (fetchError || !orgData) {
      console.error(
        "Error al obtener detalles de la organización:",
        fetchError
      );
      return;
    }

    // Actualizar estado de la organización
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (updateError) {
      console.error("Error al rechazar organización:", updateError);
      return;
    }

    // Enviar email de rechazo
    await sendOrganizationApprovalEmail({
      to: orgData.contact_email,
      organizationName: orgData.name,
      status: "rejected",
      reason,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Solicitudes de Organizaciones Pendientes
      </h1>

      {pendingOrganizations && pendingOrganizations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {pendingOrganizations.map((org) => (
              <li key={org.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {org.name}
                    </p>
                    <p className="text-sm text-gray-500">{org.contact_email}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-4">
                    <form action={handleApproveOrganization}>
                      <input
                        type="hidden"
                        name="organizationId"
                        value={org.id}
                      />
                      <Button type="submit" variant="primary" size="sm">
                        Aprobar
                      </Button>
                    </form>
                    <form
                      action={handleRejectOrganization}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="hidden"
                        name="organizationId"
                        value={org.id}
                      />
                      <input
                        type="text"
                        name="reason"
                        placeholder="Razón del rechazo"
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                      <Button type="submit" variant="danger" size="sm">
                        Rechazar
                      </Button>
                    </form>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="font-medium">Detalles de Contacto:</p>
                    <p>
                      Dirección: {org.address}, {org.city}
                    </p>
                    <p>Teléfono: {org.contact_phone}</p>
                    {org.website && <p>Sitio web: {org.website}</p>}
                  </div>
                  <div>
                    <p className="font-medium">Descripción:</p>
                    <p>{org.description || "Sin descripción"}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No hay solicitudes pendientes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Actualmente no hay organizaciones esperando aprobación.
          </p>
        </div>
      )}

      {/* Sección de Organizaciones Existentes */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Organizaciones Registradas
        </h2>

        {/* Filtros y Búsqueda */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="suspended">Suspendidas</option>
              <option value="rejected">Rechazadas</option>
            </select>
            <input
              type="text"
              placeholder="Buscar organización"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
            />
          </div>
          <div>
            <Button variant="primary" size="sm">
              Exportar Lista
            </Button>
          </div>
        </div>

        {/* Tabla de Organizaciones */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email de Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eventos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Esta sección se poblaría con datos reales de la base de datos */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Entradas Melilla
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    info@entradasmelilla.com
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Activa
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  12 eventos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                    <Button variant="danger" size="sm">
                      Suspender
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
