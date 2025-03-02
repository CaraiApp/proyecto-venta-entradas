// src/app/admin/users/[id]/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import AssignAdminButton from "@/components/admin/AssignAdminButton";

export async function generateMetadata({ params }) {
  const supabase = createServerSupabaseClient();
  const { data: user } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", params.id)
    .single();

  if (!user) {
    return {
      title: "Usuario no encontrado | Panel de Administración",
    };
  }

  return {
    title: `${user.first_name} ${user.last_name} | Panel de Administración`,
    description: "Detalles del usuario",
  };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();

  // Verificar si el usuario tiene permisos de administrador
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/admin/users/" + params.id);
  }

  // Obtener el perfil del administrador actual
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!adminProfile || adminProfile.role !== "admin") {
    redirect("/dashboard");
  }

  // Obtener detalles del usuario
  const { data: user } = await supabase
    .from("profiles")
    .select(`
      id, 
      first_name, 
      last_name, 
      email,
      phone,
      role, 
      created_at,
      updated_at,
      avatar_url
    `)
    .eq("id", params.id)
    .single();

  if (!user) {
    return notFound();
  }

  // Obtener órdenes del usuario
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total,
      created_at,
      events(name)
    `)
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Obtener entradas del usuario
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      status,
      orders(id),
      events(id, name, start_date)
    `)
    .eq("orders.user_id", params.id)
    .order("events.start_date", { ascending: true })
    .limit(5);

  // Si el usuario es organizador, obtener su organización
  let organization = null;
  if (user.role === "organizer") {
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select(`
        role,
        organizations(id, name, status)
      `)
      .eq("user_id", params.id)
      .single();

    organization = orgMember?.organizations || null;
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Detalles del Usuario
        </h1>
        <div>
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              Volver a la lista
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Perfil del usuario */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Información del perfil
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Detalles personales
                </p>
              </div>
              <div className="flex-shrink-0 h-16 w-16">
                {user.avatar_url ? (
                  <img
                    className="h-16 w-16 rounded-full"
                    src={user.avatar_url}
                    alt={`${user.first_name} ${user.last_name}`}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-500">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Nombre completo
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.first_name} {user.last_name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Correo electrónico
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Teléfono
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.phone || "No especificado"}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Rol</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "organizer"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      } mr-2`}
                    >
                      {user.role === "admin"
                        ? "Administrador"
                        : user.role === "organizer"
                        ? "Organizador"
                        : "Cliente"}
                    </span>
                    {user.role !== "admin" && (
                      <AssignAdminButton userId={user.id} />
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Fecha de registro
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(user.created_at).toLocaleDateString()} {new Date(user.created_at).toLocaleTimeString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Última actualización
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.updated_at
                      ? `${new Date(user.updated_at).toLocaleDateString()} ${new Date(
                          user.updated_at
                        ).toLocaleTimeString()}`
                      : "No disponible"}
                  </dd>
                </div>
                {organization && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Organización
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <Link
                        href={`/admin/organizations/${organization.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {organization.name}
                      </Link>
                      <span
                        className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          organization.status === "active"
                            ? "bg-green-100 text-green-800"
                            : organization.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {organization.status === "active"
                          ? "Activa"
                          : organization.status === "pending"
                          ? "Pendiente"
                          : "Suspendida"}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Actividad del usuario */}
        <div className="lg:col-span-2">
          {/* Pedidos recientes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Pedidos recientes
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Últimos 5 pedidos realizados por el usuario
              </p>
            </div>
            <div className="border-t border-gray-200">
              {orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nº Pedido
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Evento
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Fecha
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estado
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.events.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.total.toFixed(2)} €
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-4 text