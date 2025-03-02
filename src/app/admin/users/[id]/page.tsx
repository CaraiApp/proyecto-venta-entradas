// src/app/admin/users/[id]/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Definimos la interfaz para los parámetros
interface PageParams {
  id: string;
}

export default async function UserDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const supabase = createServerSupabaseClient();

  // Verificar si el usuario tiene permisos de administrador
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/admin/users/" + params.id);
  }

  // Obtener el perfil del usuario para verificar si es admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!adminProfile || adminProfile.role !== "admin") {
    redirect("/dashboard"); // Redirigir si no es admin
  }

  // Obtener detalles del usuario
  const { data: user } = await supabase.auth.admin.getUserById(params.id);

  if (!user || !user.user) {
    return notFound();
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!profile) {
    return notFound();
  }

  // Obtener organizaciones a las que pertenece el usuario (si es organizador)
  const { data: userOrganizations } = await supabase
    .from("organization_members")
    .select(
      `
      organization_id,
      role,
      organizations (
        id,
        name,
        status
      )
    `
    )
    .eq("user_id", params.id);

  // Obtener órdenes del usuario (si es cliente)
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      total,
      created_at,
      events (
        name
      )
    `
    )
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Formatear fecha para la vista
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Define tipos para las organizaciones
  type Organization = {
    id: string;
    name: string;
    status: string;
  };

  // Define un tipo específico para los elementos de userOrganizations
  type UserOrganization = {
    organization_id: string;
    role: string;
    organizations: Organization;
  };

  // Asegúrate de que userOrganizations sea un array o un valor por defecto
  const organizations: UserOrganization[] = userOrganizations || [];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Detalles del Usuario
        </h1>
        <div className="flex space-x-3">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              Volver a Usuarios
            </Button>
          </Link>
          <Link href={`/admin/users/${params.id}/edit`}>
            <Button variant="primary" size="sm">
              Editar Usuario
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información Personal
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Datos personales y detalles de contacto
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Nombre completo
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.first_name} {profile.last_name}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Correo electrónico
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.user.email}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.phone || "No especificado"}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Rol</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    profile.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : profile.role === "organizer"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {profile.role === "admin"
                    ? "Administrador"
                    : profile.role === "organizer"
                    ? "Organizador"
                    : "Cliente"}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Fecha de registro
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.created_at
                  ? formatDate(profile.created_at)
                  : "No disponible"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Si es organizador, mostrar sus organizaciones */}
      {profile.role === "organizer" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Organizaciones
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Organizaciones a las que pertenece el usuario
            </p>
          </div>
          <div className="border-t border-gray-200">
            {organizations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {organizations.map((org) => (
                  <li key={org.organization_id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {org.organizations.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rol:{" "}
                          {org.role === "owner" ? "Propietario" : "Miembro"}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            org.organizations.status === "active"
                              ? "bg-green-100 text-green-800"
                              : org.organizations.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {org.organizations.status === "active"
                            ? "Activa"
                            : org.organizations.status === "pending"
                            ? "Pendiente"
                            : "Suspendida"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Link
                        href={`/admin/organizations/${org.organization_id}`}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        Ver detalles de la organización
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-sm text-gray-500 text-center">
                Este usuario no pertenece a ninguna organización.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Si es cliente, mostrar sus pedidos recientes */}
      {profile.role === "customer" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pedidos Recientes
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Últimos pedidos realizados por el usuario
            </p>
          </div>
          <div className="border-t border-gray-200">
            {orders && orders.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <li key={order.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Pedido #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.events.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Fecha: {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status === "completed"
                            ? "Completado"
                            : order.status === "pending"
                            ? "Pendiente"
                            : "Cancelado"}
                        </span>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {order.total.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        Ver detalles del pedido
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-sm text-gray-500 text-center">
                Este usuario no ha realizado ningún pedido.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
