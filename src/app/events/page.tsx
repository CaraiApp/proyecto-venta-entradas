// src/app/events/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function EventsPage() {
  const supabase = createServerSupabaseClient();

  // Obtener todos los eventos activos
  const { data: events } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      description,
      location,
      city,
      start_date,
      image_url,
      organizations(name)
    `
    )
    .in("status", ["approved", "on_sale"])
    .order("start_date", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Eventos
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Explora los eventos disponibles y compra tus entradas
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {events?.map((event) => (
          <div
            key={event.id}
            className="group relative bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="h-48 bg-gray-200 w-full object-cover">
              {/* En un futuro, aquí iría la imagen del evento */}
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Imagen del evento
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">
                <Link href={`/events/${event.id}`}>
                  <span aria-hidden="true" className="absolute inset-0" />
                  {event.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {event.organizations?.name}
              </p>
              <div className="mt-2 flex items-center">
                <svg
                  className="h-5 w-5 text-gray-400"
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
                <p className="ml-1 text-sm text-gray-500">
                  {event.location}, {event.city}
                </p>
              </div>
              <div className="mt-2 flex items-center">
                <svg
                  className="h-5 w-5 text-gray-400"
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
                <p className="ml-1 text-sm text-gray-500">
                  {new Date(event.start_date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="mt-4">
                <Link href={`/events/${event.id}`}>
                  <Button variant="primary" className="w-full">
                    Ver detalles
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {(!events || events.length === 0) && (
          <div className="col-span-full text-center py-12">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No hay eventos disponibles
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Vuelve a consultar más tarde para ver los nuevos eventos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
