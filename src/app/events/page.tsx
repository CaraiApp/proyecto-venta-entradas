// src/app/events/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { EventCard } from "@/components/events/EventCard";

export const metadata = {
  title: "Eventos | Plataforma de Venta de Entradas",
  description: "Explora todos los eventos disponibles y compra tus entradas",
};

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
          <EventCard
            key={event.id}
            id={event.id}
            name={event.name}
            date={event.start_date}
            location={`${event.location}, ${event.city}`}
            organizerName={event.organizations?.name || ""}
            imageUrl={event.image_url}
          />
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
                d="M9.172 16.172a4 4 0 115.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
