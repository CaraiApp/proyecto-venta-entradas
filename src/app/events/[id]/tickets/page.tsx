// src/app/events/[id]/tickets/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({ params }) {
  const supabase = createServerSupabaseClient();
  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", params.id)
    .single();

  return {
    title: event
      ? `Entradas: ${event.name} | Plataforma de Venta de Entradas`
      : "Selección de entradas",
    description: "Selecciona y compra tus entradas para este evento",
  };
}

export default async function TicketsSelectionPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { type?: string; quantity?: string };
}) {
  const supabase = createServerSupabaseClient();

  // Verificar que el evento existe y está disponible
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

  // Obtener información de la sesión para saber si el usuario está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Verificar si hay un tipo de entrada específico seleccionado
  const selectedTicketTypeId = searchParams.type;
  const initialQuantity = parseInt(searchParams.quantity || "1", 10);

  // Obtener tipos de entradas disponibles para este evento
  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", params.id)
    .order("price", { ascending: true });

  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            No hay entradas disponibles
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Lo sentimos, no hay entradas disponibles para este evento.
          </p>
          <div className="mt-6">
            <Link href={`/events/${params.id}`}>
              <Button variant="primary">Volver al evento</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si hay un tipo de entrada seleccionado, verificar que exista
  const selectedTicketType = selectedTicketTypeId
    ? ticketTypes.find((ticket) => ticket.id === selectedTicketTypeId)
    : null;

  // Si se especificó un tipo de entrada pero no se encontró, redireccionar
  if (selectedTicketTypeId && !selectedTicketType) {
    redirect(`/events/${params.id}/tickets`);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
              <Link
                href={`/events/${event.id}`}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                {event.name}
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
                Selección de entradas
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="lg:grid lg:grid-cols-3 lg:gap-x-8">
        {/* Información del evento */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Resumen del evento
              </h3>
              <div className="mt-5 border-t border-gray-200 pt-5">
                <h4 className="text-lg font-bold text-gray-900">
                  {event.name}
                </h4>
                <p className="mt-2 flex items-center text-sm text-gray-700">
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
                  {formatDate(event.start_date)}
                </p>
                <p className="mt-2 flex items-center text-sm text-gray-700">
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
                <p className="mt-2 flex items-center text-sm text-gray-700">
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
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                ¿Cómo funciona?
              </h3>
              <div className="mt-5 space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                      1
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Selecciona tus entradas
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Elige el tipo y cantidad de entradas que deseas comprar.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                      2
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Regístrate o inicia sesión
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {session
                        ? "Ya has iniciado sesión."
                        : "Necesitas una cuenta para completar la compra."}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                      3
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Completa el pago
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Realiza el pago de forma segura con tarjeta de crédito.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                      4
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Recibe tus entradas
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Accede a tus entradas digitales en tu perfil o correo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selección de entradas */}
        <div className="mt-10 lg:mt-0 lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Selecciona tus entradas
              </h3>

              <div className="mt-6">
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="eventId" value={event.id} />

                  <div className="space-y-4">
                    {selectedTicketType ? (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">
                              {selectedTicketType.name}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {selectedTicketType.description}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Disponibles:{" "}
                              {selectedTicketType.quantity -
                                selectedTicketType.sold}{" "}
                              de {selectedTicketType.quantity}
                            </p>
                          </div>
                          <p className="text-md font-medium text-gray-900">
                            {selectedTicketType.price.toFixed(2)} €
                          </p>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="quantity"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Cantidad
                          </label>
                          <select
                            id="quantity"
                            name="quantity"
                            defaultValue={initialQuantity}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            {Array.from(
                              {
                                length: Math.min(
                                  10,
                                  selectedTicketType.quantity -
                                    selectedTicketType.sold
                                ),
                              },
                              (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <input
                          type="hidden"
                          name="ticketTypeId"
                          value={selectedTicketType.id}
                        />

                        <div className="mt-6 flex items-center justify-between">
                          <Link href={`/events/${event.id}`}>
                            <Button variant="outline" type="button">
                              Cancelar
                            </Button>
                          </Link>

                          {session ? (
                            <Button variant="primary" type="submit">
                              Continuar al pago
                            </Button>
                          ) : (
                            <Link
                              href={`/auth/login?redirect=/events/${event.id}/tickets?type=${selectedTicketType.id}`}
                            >
                              <Button variant="primary">
                                Iniciar sesión para comprar
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">
                          Tipos de entradas disponibles:
                        </h4>
                        {ticketTypes.map((ticketType) => (
                          <div
                            key={ticketType.id}
                            className="border border-gray-200 rounded-lg p-4 mb-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-md font-medium text-gray-900">
                                  {ticketType.name}
                                </h4>
                                <p className="mt-1 text-sm text-gray-500">
                                  {ticketType.description}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Disponibles:{" "}
                                  {ticketType.quantity - ticketType.sold} de{" "}
                                  {ticketType.quantity}
                                </p>
                              </div>
                              <p className="text-md font-medium text-gray-900">
                                {ticketType.price.toFixed(2)} €
                              </p>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Link
                                href={`/events/${event.id}/tickets?type=${ticketType.id}`}
                              >
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={
                                    ticketType.quantity - ticketType.sold <= 0
                                  }
                                >
                                  Seleccionar
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Información importante
              </h3>
              <div className="mt-4 text-sm text-gray-500">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Las entradas son nominativas y no podrán transferirse.
                  </li>
                  <li>
                    Una vez realizada la compra, recibirás tus entradas por
                    correo electrónico.
                  </li>
                  <li>
                    Podrás acceder a tus entradas en cualquier momento desde tu
                    perfil de usuario.
                  </li>
                  <li>
                    Las devoluciones solo serán posibles en caso de cancelación
                    del evento.
                  </li>
                  <li>
                    Será necesario presentar la entrada (impresa o en móvil) y
                    un documento de identidad para acceder al evento.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
