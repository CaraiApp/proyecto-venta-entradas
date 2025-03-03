// src/app/page.tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { Button } from "@/components/ui/Button";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  // Obtener los próximos eventos destacados
  const { data: featuredEvents } = await supabase
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
      organizations(name, logo_url)
    `
    )
    .in("status", ["approved", "on_sale"])
    .order("start_date", { ascending: true })
    .limit(6);

  // Obtener categorías de eventos
  const { data: eventCategories } = await supabase
    .from("event_categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-blue-600">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Encuentra eventos increíbles
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl">
            Compra entradas para los mejores conciertos, obras de teatro,
            eventos deportivos y mucho más. ¡Vive experiencias únicas!
          </p>
          <div className="mt-10 max-w-sm sm:flex sm:max-w-none">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <Link href="/events">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-white text-blue-600 hover:bg-blue-50"
                >
                  Ver eventos
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-white text-white hover:bg-blue-700"
                >
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Próximos eventos destacados
          </h2>
          <Link
            href="/events"
            className="hidden text-sm font-semibold text-blue-600 hover:text-blue-500 sm:block"
          >
            Ver todos los eventos<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
          {featuredEvents?.map((event) => (
            <div
              key={event.id}
              className="group relative bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 w-full object-cover">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
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
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {(!featuredEvents || featuredEvents.length === 0) && (
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
                Vuelve pronto para ver los nuevos eventos que estamos
                preparando.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/events"
            className="text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            Ver todos los eventos<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Explora por categorías
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {eventCategories?.map((category) => (
              <Link
                key={category.id}
                href={`/events/categories/${category.slug}`}
                className="group relative bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300 p-4 text-center"
              >
                <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center sm:text-3xl">
          Cómo funciona
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-y-12 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              1. Encuentra tu evento
            </h3>
            <p className="mt-2 text-base text-gray-500">
              Busca entre miles de eventos o explora por categorías para
              encontrar lo que más te interesa.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              2. Reserva tus entradas
            </h3>
            <p className="mt-2 text-base text-gray-500">
              Selecciona asientos, elige la cantidad de entradas y completa tu
              compra segura.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              3. Disfruta del evento
            </h3>
            <p className="mt-2 text-base text-gray-500">
              Recibe tus entradas digitales, accede al evento con tu código QR y
              disfruta.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">¿Listo para vender entradas?</span>
            <span className="block text-blue-200">
              Comienza como organizador hoy mismo.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/register/organizer"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Regístrate como organizador
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/about/organizers"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800"
              >
                Saber más
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
