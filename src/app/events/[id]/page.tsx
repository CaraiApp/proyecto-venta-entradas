// src/app/events/[id]/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();

  // Obtener detalles del evento
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      description,
      location,
      address,
      city,
      start_date,
      end_date,
      image_url,
      organizations(id, name, logo_url)
    `
    )
    .eq("id", params.id)
    .in("status", ["approved", "on_sale"])
    .single();

  if (!event) {
    return notFound();
  }

  // Obtener tipos de entradas disponibles
  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", event.id)
    .order("price", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <div>
              <Link href="/" className="text-gray-400 hover:text-gray-500">
                Inicio
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <Link
                href="/events"
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                Eventos
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <span className="ml-4 text-gray-500" aria-current="page">
                {event.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        {/* Imagen del evento */}
        <div className="aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 overflow-hidden">
          {/* En un futuro, aquí iría la imagen real del evento */}
          <div className="w-full h-64 flex items-center justify-center text-gray-500">
            Imagen del evento
          </div>
        </div>

        {/* Información del evento */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {event.name}
          </h1>

          <div className="mt-3">
            <h2 className="sr-only">Información del evento</h2>
            <div className="flex items-center">
              <p className="text-lg text-gray-900 flex items-center">
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
                {new Date(event.start_date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="mt-2 flex items-center">
              <p className="text-lg text-gray-900 flex items-center">
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
                {event.location}, {event.city}
              </p>
            </div>
            <div className="mt-2 flex items-center">
              <p className="text-lg text-gray-900 flex items-center">
                <svg
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                Organizado por: {event.organizations.name}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Descripción</h3>
            <div className="mt-2 prose prose-indigo text-gray-500">
              <p>{event.description || "No hay descripción disponible."}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Entradas</h3>

            {ticketTypes && ticketTypes.length > 0 ? (
              <div className="mt-4 space-y-4">
                {ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {ticket.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {ticket.description}
                      </p>
                      <div className="mt-1 flex items-center">
                        <p className="text-sm text-gray-500">
                          Disponibles: {ticket.quantity - ticket.sold} de{" "}
                          {ticket.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {ticket.price.toFixed(2)} €
                      </p>
                      <div className="mt-2">
                        <Link
                          href={`/events/${event.id}/tickets?type=${ticket.id}`}
                        >
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={ticket.quantity - ticket.sold <= 0}
                          >
                            Comprar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      No hay entradas disponibles
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Las entradas para este evento aún no están a la venta o
                        se han agotado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
