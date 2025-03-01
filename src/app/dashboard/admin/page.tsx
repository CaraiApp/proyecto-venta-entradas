// src/app/dashboard/admin/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Panel de Administración | Plataforma de Venta de Entradas",
  description: "Panel de control para administradores de la plataforma",
};

export default async function AdminDashboardPage() {
  const supabase = createServerSupabaseClient();

  // Verificar la sesión y el rol del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/dashboard/admin");
  }

  // Obtener el perfil del usuario para verificar el rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  // Si el usuario no es administrador, redirigir al dashboard general
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  // Obtener estadísticas para el panel de administración
  const { data: organizationsCount } = await supabase
    .from("organizations")
    .select("id", { count: "exact", head: true });

  const { data: usersCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { data: eventsCount } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true });

  const { data: pendingOrganizations } = await supabase
    .from("organizations")
    .select("id, name, created_at, status")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingEvents } = await supabase
    .from("events")
    .select("id, name, start_date, status, organizations(id, name)")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Obtener estadísticas de ventas
  const { data: salesData } = await supabase
    .from("orders")
    .select("id, total, status")
    .eq("status", "completed");

  const totalSales =
    salesData?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalOrders = salesData?.length || 0;

  // Formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Panel de Administración
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Gestiona la plataforma, usuarios, organizaciones y eventos
        </p>
      </div>

      {/* Estadísticas generales */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ventas Totales
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {totalSales.toFixed(2)} €
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/dashboard/admin/reports"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              Ver informes
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Usuarios
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {usersCount?.count || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/dashboard/admin/users"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              Ver todos
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Organizaciones
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {organizationsCount?.count || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/dashboard/admin/organizations"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              Ver todas
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Eventos
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {eventsCount?.count || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/dashboard/admin/events"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              Ver todos
            </Link>
          </div>
        </div>
      </div>

      {/* Solicitudes pendientes */}
      <div className="mt-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          Solicitudes pendientes
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Organizaciones pendientes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Organizaciones pendientes de aprobación
              </h3>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {pendingOrganizations?.length || 0} pendientes
              </span>
            </div>
            <ul className="divide-y divide-gray-200">
              {pendingOrganizations && pendingOrganizations.length > 0 ? (
                pendingOrganizations.map((org) => (
                  <li key={org.id}>
                    <Link
                      href={`/dashboard/admin/organizations/${org.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="flex">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {org.name}
                              </p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500">
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
                                  Solicitada el: {formatDate(org.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pendiente
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6 text-center text-sm text-gray-500">
                  No hay organizaciones pendientes de aprobación
                </li>
              )}
            </ul>
            {pendingOrganizations && pendingOrganizations.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 flex justify-end">
                <Link href="/dashboard/admin/organizations?status=pending">
                  <Button variant="outline" size="sm">
                    Ver todas las solicitudes
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Eventos pendientes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Eventos pendientes de aprobación
              </h3>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {pendingEvents?.length || 0} pendientes
              </span>
            </div>
            <ul className="divide-y divide-gray-200">
              {pendingEvents && pendingEvents.length > 0 ? (
                pendingEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/dashboard/admin/events/${event.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="flex">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {event.name}
                              </p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500 mr-4">
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
                                <p>{formatDate(event.start_date)}</p>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2H4v-1h16v1h-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <p>{event.organizations.name}</p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pendiente
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6 text-center text-sm text-gray-500">
                  No hay eventos pendientes de aprobación
                </li>
              )}
            </ul>
            {pendingEvents && pendingEvents.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 flex justify-end">
                <Link href="/dashboard/admin/events?status=pending_approval">
                  <Button variant="outline" size="sm">
                    Ver todos los eventos pendientes
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usuarios recientes */}
      <div className="mt-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          Usuarios recientes
        </h2>
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rol
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha de registro
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers && recentUsers.length > 0 ? (
                      recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "organizer"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role === "admin"
                                ? "Administrador"
                                : user.role === "organizer"
                                ? "Organizador"
                                : "Cliente"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/dashboard/admin/users/${user.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Ver detalles
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                        >
                          No hay usuarios recientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Link href="/dashboard/admin/users">
            <Button variant="outline">Ver todos los usuarios</Button>
          </Link>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mt-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          Acciones rápidas
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Crear usuario
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Crea un nuevo usuario administrador o personal.</p>
              </div>
              <div className="mt-5">
                <Link href="/dashboard/admin/users/create">
                  <Button variant="primary" size="sm">
                    Crear usuario
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Gestionar organizaciones
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Crea, edita o desactiva organizaciones.</p>
              </div>
              <div className="mt-5">
                <Link href="/dashboard/admin/organizations">
                  <Button variant="primary" size="sm">
                    Gestionar organizaciones
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Ver informes
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Accede a los informes de ventas y asistencia.</p>
              </div>
              <div className="mt-5">
                <Link href="/dashboard/admin/reports">
                  <Button variant="primary" size="sm">
                    Ver informes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
