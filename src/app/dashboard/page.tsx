// src/app/dashboard/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  // Obtenemos el cliente de Supabase para el servidor
  const supabase = createServerSupabaseClient();

  // Verificamos la sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Si no hay sesión, redirigimos al login
    redirect("/auth/login");
  }

  // Obtenemos el perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  // Determinamos qué mostrar según el rol del usuario
  let roleSpecificContent;
  const userRole = profile?.role || "customer";

  if (userRole === "admin") {
    // Contenido específico para administradores
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, name, status")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: users } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, role")
      .order("created_at", { ascending: false })
      .limit(5);

    roleSpecificContent = (
      <div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                      {users?.length || 0}
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
                      {organizations?.length || 0}
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
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Solicitudes Pendientes
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {organizations?.filter((org) => org.status === "pending")
                        .length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/dashboard/admin/organizations?status=pending"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
              >
                Ver solicitudes
              </Link>
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-medium leading-6 text-gray-900">
          Últimas Organizaciones
        </h2>
        <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {organizations?.map((org) => (
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
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            org.status === "active"
                              ? "bg-green-100 text-green-800"
                              : org.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {org.status === "active"
                            ? "Activa"
                            : org.status === "pending"
                            ? "Pendiente"
                            : "Suspendida"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } else if (userRole === "organizer") {
    // Primero necesitamos obtener la organización del usuario
    const { data: memberData } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", session.user.id)
      .single();

    if (memberData) {
      // Obtener eventos de la organización
      const { data: events } = await supabase
        .from("events")
        .select("id, name, start_date, status")
        .eq("organization_id", memberData.organization_id)
        .order("start_date", { ascending: true })
        .limit(5);

      // Obtener estadísticas de ventas
      const { data: ticketStats } = await supabase
        .from("ticket_types")
        .select("quantity, sold")
        .in("event_id", events?.map((e) => e.id) || []);

      const totalTickets =
        ticketStats?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      const soldTickets =
        ticketStats?.reduce((acc, item) => acc + item.sold, 0) || 0;
      const salePercentage =
        totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;

      roleSpecificContent = (
        <div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                        {events?.length || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link
                  href="/dashboard/organizer/events"
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
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Entradas Vendidas
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {soldTickets} / {totalTickets}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  {salePercentage}% de ocupación
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Próximo Evento
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {events && events.length > 0
                          ? new Date(events[0].start_date).toLocaleDateString()
                          : "No hay eventos"}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                {events && events.length > 0 ? (
                  <Link
                    href={`/dashboard/organizer/events/${events[0].id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    Ver detalles
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/organizer/events/create"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    Crear evento
                  </Link>
                )}
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-lg font-medium leading-6 text-gray-900">
            Próximos Eventos
          </h2>
          <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {events?.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/dashboard/organizer/events/${event.id}`}
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
                                {new Date(
                                  event.start_date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              event.status === "approved" ||
                              event.status === "on_sale"
                                ? "bg-green-100 text-green-800"
                                : event.status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : event.status === "pending_approval"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {event.status === "approved"
                              ? "Aprobado"
                              : event.status === "on_sale"
                              ? "En venta"
                              : event.status === "draft"
                              ? "Borrador"
                              : event.status === "pending_approval"
                              ? "Pendiente"
                              : event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {(!events || events.length === 0) && (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No hay eventos próximos.{" "}
                  <Link
                    href="/dashboard/organizer/events/create"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Crear un evento
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      );
    } else {
      // Si el usuario no tiene una organización, mostramos un mensaje
      roleSpecificContent = (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              No estás asociado a ninguna organización
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Para crear eventos, debes estar asociado a una organización.
                Contacta con el administrador para solicitar acceso.
              </p>
            </div>
            <div className="mt-5">
              <Link
                href="/dashboard/organizer/request-organization"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Solicitar organización
              </Link>
            </div>
          </div>
        </div>
      );
    }
  } else {
    // Contenido específico para clientes (compradores)
    const { data: orders } = await supabase
      .from("orders")
      .select(
        "id, event_id, order_number, status, total, created_at, events(name, start_date)"
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: tickets } = await supabase
      .from("tickets")
      .select(
        `
        id, status, 
        orders(id, user_id), 
        events(id, name, start_date, location)
      `
      )
      .eq("orders.user_id", session.user.id)
      .eq("status", "valid")
      .order("events.start_date", { ascending: true })
      .limit(5);

    roleSpecificContent = (
      <div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Entradas Activas
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {tickets?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/dashboard/customer/tickets"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
              >
                Ver todas
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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Compras Realizadas
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {orders?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/dashboard/customer/orders"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
              >
                Ver historial
              </Link>
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-medium leading-6 text-gray-900">
          Tus Próximas Entradas
        </h2>
        <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tickets?.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/dashboard/customer/tickets/${ticket.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="flex">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {ticket.events.name}
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
                            <p>
                              {new Date(
                                ticket.events.start_date
                              ).toLocaleDateString()}
                            </p>
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
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p>{ticket.events.location}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Válida
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {(!tickets || tickets.length === 0) && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No tienes entradas próximas.{" "}
                <Link
                  href="/events"
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Explorar eventos
                </Link>
              </li>
            )}
          </ul>
        </div>

        <h2 className="mt-8 text-lg font-medium leading-6 text-gray-900">
          Historial de Compras
        </h2>
        <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders?.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/dashboard/customer/orders/${order.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="flex">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {order.events.name}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500 mr-4">
                            <p className="font-medium">
                              Orden: {order.order_number}
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <p>
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="ml-2 flex">
                          <p className="text-sm font-medium text-gray-900">
                            {order.total.toFixed(2)} €
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
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
                              ? "Completada"
                              : order.status === "pending"
                              ? "Pendiente"
                              : order.status === "cancelled"
                              ? "Cancelada"
                              : "Reembolsada"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {(!orders || orders.length === 0) && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No has realizado ninguna compra aún.{" "}
                <Link
                  href="/events"
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Explorar eventos
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Bienvenido a tu panel de control, {profile?.first_name || "Usuario"}
        </p>
      </div>

      <div className="mt-6">{roleSpecificContent}</div>
    </div>
  );
}
