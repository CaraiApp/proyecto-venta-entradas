// src/app/admin/organizations/[id]/page.tsx
import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrganizationActions } from "@/components/admin/OrganizationActions";
import { Button } from "@/components/ui/Button";

// Definir interfaces de tipado
interface PageParams {
  params: {
    id: string;
  };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface OrganizationMember {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "staff";
  profiles: Profile;
}

interface Event {
  id: string;
  name: string;
  start_date: string;
  status: string;
  location: string;
}

interface Organization {
  id: string;
  name: string;
  created_at: string;
  status: string;
  description?: string;
  website?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  organization_members: OrganizationMember[];
}

// Usamos la interfaz para evitar warnings de unused variable
const _organizationTypeReference: Organization | null = null;

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
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
    title: `${organization.name} | Administración de Organizaciones`,
  };
}

export default async function OrganizationDetailPage({ params }: PageParams) {
  const supabase = createServerSupabaseClient();

  // Obtener detalles de la organización
  const { data: organization, error } = await supabase
    .from("organizations")
    .select(
      `
      *,
      organization_members(
        id,
        user_id,
        role,
        profiles(
          id, 
          first_name, 
          last_name, 
          email, 
          phone
        )
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !organization) {
    return notFound();
  }

  // Obtener eventos asociados con esta organización
  const { data: events } = await supabase
    .from("events")
    .select("id, name, start_date, status, location")
    .eq("organization_id", params.id)
    .order("start_date", { ascending: false })
    .limit(5);

  // Funciones de formato
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
        return "Pendiente de aprobación";
      case "rejected":
        return "Rechazada";
      case "suspended":
        return "Suspendida";
      default:
        return status;
    }
  };

  // Encontrar al propietario de la organización
  const owner = organization.organization_members.find(
    (member: OrganizationMember) => member.role === "owner"
  );

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Detalles de Organización
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Link href="/admin/organizations">
            <Button variant="outline" size="sm">
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {organization.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Creada el {formatDate(organization.created_at)}
            </p>
          </div>
          <div>
            <span
              className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(
                organization.status
              )}`}
            >
              {getStatusText(organization.status)}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Nombre de la organización
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization.name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Descripción</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization.description || "Sin descripción"}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Sitio web</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization.website ? (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                ) : (
                  "No especificado"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Número fiscal / CIF
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization.tax_id || "No especificado"}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dirección</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization.address || "No especificada"}
                {organization.city && `, ${organization.city}`}
                {organization.postal_code && `, ${organization.postal_code}`}
                {organization.country && `, ${organization.country}`}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {owner && (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Información de contacto
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Datos del propietario de la organización
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Nombre completo
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {owner.profiles.first_name} {owner.profiles.last_name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Correo electrónico
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {owner.profiles.email}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {owner.profiles.phone || "No especificado"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Eventos recientes
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {events?.map((event: Event) => (
                <li key={event.id}>
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {event.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              event.status === "approved" ||
                              event.status === "on_sale"
                                ? "bg-green-100 text-green-800"
                                : event.status === "pending_approval"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {event.status === "approved"
                              ? "Aprobado"
                              : event.status === "on_sale"
                              ? "En venta"
                              : event.status === "pending_approval"
                              ? "Pendiente"
                              : event.status === "draft"
                              ? "Borrador"
                              : event.status}
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
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {event.location}
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
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p>
                            <time dateTime={event.start_date}>
                              {formatDate(event.start_date)}
                            </time>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Miembros de la organización
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Correo electrónico
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rol
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organization.organization_members.map(
                  (member: OrganizationMember) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.profiles.first_name} {member.profiles.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.profiles.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.role === "owner"
                          ? "Propietario"
                          : member.role === "admin"
                          ? "Administrador"
                          : member.role === "staff"
                          ? "Personal"
                          : member.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/users/${member.user_id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-10">
        <OrganizationActions organization={organization} />
      </div>
    </div>
  );
}
