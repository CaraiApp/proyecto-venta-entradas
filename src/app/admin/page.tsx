// src/app/admin/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Panel de Administración | Plataforma de Venta de Entradas",
  description:
    "Panel de administración para gestionar la plataforma de venta de entradas",
};

export default async function AdminDashboardPage() {
  const supabase = createServerSupabaseClient();

  // Verificar si el usuario tiene permisos de administrador
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/admin");
  }

  // Obtener el perfil del usuario para verificar si es admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard"); // Redirigir si no es admin
  }

  // Obtener estadísticas
  const { data: pendingOrgs } = await supabase
    .from("organizations")
    .select("id")
    .eq("status", "pending");

  const { data: totalUsers } = await supabase.from("profiles").select("id");

  const { data: pendingEvents } = await supabase
    .from("events")
    .select("id")
    .eq("status", "pending_approval");

  const { data: totalOrders } = await supabase
    .from("orders")
    .select("id, total");

  // Calcular ingresos totales
  const totalRevenue = totalOrders
    ? totalOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    : 0;

  // Tarjetas con estadísticas
  const stats = [
    {
      name: "Organizaciones Pendientes",
      value: pendingOrgs?.length || 0,
      href: "/admin/organizations?status=pending",
      color: "bg-yellow-500",
    },
    {
      name: "Usuarios Totales",
      value: totalUsers?.length || 0,
      href: "/admin/users",
      color: "bg-blue-500",
    },
    {
      name: "Eventos Pendientes",
      value: pendingEvents?.length || 0,
      href: "/admin/events?status=pending_approval",
      color: "bg-purple-500",
    },
    {
      name: "Ingresos Totales",
      value: `${totalRevenue.toFixed(2)} €`,
      href: "/admin/reports",
      color: "bg-green-500",
    },
  ];

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Panel de Administración
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Bienvenido al panel de administración de la plataforma de venta de
          entradas.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className={`${stat.color} h-2`}></div>
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </dd>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Acciones rápidas */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Acciones Rápidas
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <Link
              href="/admin/organizations?status=pending"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Aprobar Organizaciones
                  </h4>
                  <p className="text-sm text-gray-500">
                    Revisar y aprobar solicitudes de organizaciones
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/events?status=pending_approval"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Revisar Eventos
                  </h4>
                  <p className="text-sm text-gray-500">
                    Aprobar eventos pendientes de revisión
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/seating-maps"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Mapas de Asientos
                  </h4>
                  <p className="text-sm text-gray-500">
                    Gestionar mapas de asientos de los eventos
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Solicitudes recientes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Solicitudes Recientes
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {pendingOrgs && pendingOrgs.length > 0 ? (
                  pendingOrgs.slice(0, 5).map((org) => (
                    <li key={org.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                            <span className="text-sm font-medium leading-none text-yellow-600">
                              O
                            </span>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Solicitud de organización
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Pendiente de aprobación
                          </p>
                        </div>
                        <div>
                          <Link
                            href={`/admin/organizations/${org.id}`}
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Ver
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-4 text-center text-sm text-gray-500">
                    No hay solicitudes pendientes
                  </li>
                )}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                href="/admin/organizations?status=pending"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Ver todas las solicitudes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
