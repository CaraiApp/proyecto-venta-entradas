// src/app/admin/organizations/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Gestión de Organizaciones | Panel de Administración",
  description:
    "Administrar organizaciones en la plataforma de venta de entradas",
};

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerSupabaseClient();

  // Obtener el filtro de estado de la URL
  const statusFilter = searchParams.status as string | undefined;

  // Construir la consulta base
  let query = supabase
    .from("organizations")
    .select(
      `
      id,
      name,
      description,
      logo_url,
      website,
      status,
      created_at,
      organization_members!inner(
        user_id,
        role,
        profiles(
          first_name,
          last_name,
          email
        )
      )
    `
    )
    .eq("organization_members.role", "owner");

  // Aplicar filtro si existe
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  // Ordenar por fecha de creación, más reciente primero
  const { data: organizations, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error al cargar organizaciones:", error.message);
    // Manejar el error apropiadamente
  }

  // Funciones para formatear fechas y estados
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazada";
      case "suspended":
        return "Suspendida";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Organizaciones
        </h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <div className="flex space-x-2">
            <Link href="/admin/organizations">
              <Button variant={!statusFilter ? "primary" : "outline"} size="sm">
                Todas
              </Button>
            </Link>
            <Link href="/admin/organizations?status=pending">
              <Button
                variant={statusFilter === "pending" ? "primary" : "outline"}
                size="sm"
              >
                Pendientes
              </Button>
            </Link>
            <Link href="/admin/organizations?status=active">
              <Button
                variant={statusFilter === "active" ? "primary" : "outline"}
                size="sm"
              >
                Activas
              </Button>
            </Link>
            <Link href="/admin/organizations?status=suspended">
              <Button
                variant={statusFilter === "suspended" ? "primary" : "outline"}
                size="sm"
              >
                Suspendidas
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {organizations && organizations.length > 0 ? (
            organizations.map((org) => (
              <li key={org.id}>
                <Link
                  href={`/admin/organizations/${org.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {org.logo_url ? (
                            <img
                              className="h-12 w-12 rounded-full"
                              src={org.logo_url}
                              alt={org.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {org.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {org.organization_members[0].profiles.first_name}{" "}
                            {org.organization_members[0].profiles.last_name}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(
                            org.status
                          )}`}
                        >
                          {getStatusText(org.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Creada el {formatDate(org.created_at)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Ver detalles</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-900">
                No hay organizaciones{" "}
                {statusFilter
                  ? `con estado "${getStatusText(statusFilter)}"`
                  : ""}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {statusFilter === "pending"
                  ? "No hay solicitudes pendientes de aprobación."
                  : "No se encontraron organizaciones que coincidan con los filtros."}
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
