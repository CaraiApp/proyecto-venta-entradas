// src/app/dashboard/customer/tickets/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { TicketCard } from "@/components/tickets/TicketCard";

export const metadata = {
  title: "Mis Entradas | Plataforma de Venta de Entradas",
  description: "Gestiona tus entradas para eventos",
};

export default async function TicketsPage() {
  const supabase = createServerSupabaseClient();

  // Verificar sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/dashboard/customer/tickets");
  }

  // Obtener tickets del usuario
  const { data: tickets } = await supabase
    .from("tickets")
    .select(
      `
      id, ticket_number, status, ticket_types(name),
      orders(id, user_id), 
      events(id, name, start_date, location)
    `
    )
    .eq("orders.user_id", session.user.id)
    .order("events.start_date", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Entradas</h1>

      {tickets && tickets.length > 0 ? (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              id={ticket.id}
              eventName={ticket.events.name}
              eventDate={ticket.events.start_date}
              eventLocation={ticket.events.location}
              ticketType={ticket.ticket_types.name}
              ticketNumber={ticket.ticket_number}
              status={ticket.status as "valid" | "used" | "cancelled"}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
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
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No tienes entradas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Aún no has comprado entradas para ningún evento.
            </p>
            <div className="mt-6">
              <a
                href="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Explorar eventos
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
