// src/app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

type TicketSelection = {
  ticketTypeId: string;
  quantity: number;
  price: number;
  name: string;
};

type EventDetails = {
  id: string;
  name: string;
  location: string;
  city: string;
  start_date: string;
  organizations: {
    name: string;
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthContext();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [ticketSelection, setTicketSelection] = useState<TicketSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [billingInfo, setBillingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    country: "España",
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Redirigir a login si no hay sesión
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const eventId = searchParams.get("event");
    const ticketsParam = searchParams.get("tickets");

    if (!eventId || !ticketsParam) {
      setError("Información de compra incompleta");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      try {
        // Obtener detalles del evento
        const { data: event, error: eventError } = await supabaseClient
          .from("events")
          .select(
            `
            id, name, location, city, start_date,
            organizations(name)
            `
          )
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;
        setEventDetails(event);

        // Parsear tickets seleccionados
        const selectedTickets = JSON.parse(decodeURIComponent(ticketsParam));
        if (!Array.isArray(selectedTickets) || selectedTickets.length === 0) {
          throw new Error("Selección de entradas inválida");
        }

        // Obtener detalles de los tipos de entradas
        const ticketTypeIds = selectedTickets.map((t) => t.id);
        const { data: ticketTypes, error: ticketsError } = await supabaseClient
          .from("ticket_types")
          .select("id, name, price")
          .in("id", ticketTypeIds);

        if (ticketsError) throw ticketsError;

        // Construir la selección completa
        const fullSelection = selectedTickets.map((selection) => {
          const ticketType = ticketTypes.find((tt) => tt.id === selection.id);
          if (!ticketType) throw new Error("Tipo de entrada no encontrado");

          return {
            ticketTypeId: ticketType.id,
            quantity: selection.quantity,
            price: ticketType.price,
            name: ticketType.name,
          };
        });

        setTicketSelection(fullSelection);

        // Pre-llenar información de facturación
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setBillingInfo((prev) => ({
            ...prev,
            name: `${profile.first_name} ${profile.last_name}`.trim(),
            email: user.email || "",
          }));
        }
      } catch (err) {
        console.error("Error cargando datos de checkout:", err);
        setError("Error al cargar los datos de la compra");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [authLoading, user, router, searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Calcular totales
  const subtotal = ticketSelection.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.21; // IVA 21%
  const total = subtotal + tax;

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    setError("");

    try {
      // Validaciones básicas
      if (!billingInfo.name || !billingInfo.email || !billingInfo.address) {
        throw new Error("Por favor, complete todos los campos obligatorios");
      }

      // Crear el número de orden
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

      // En un entorno real, aquí se integraría con Redsys o pasarela de pago
      // Para este ejemplo, simulamos un pago exitoso

      // Crear orden en la base de datos
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          user_id: user.id,
          event_id: eventDetails?.id,
          order_number: orderNumber,
          status: "completed", // En un entorno real, sería "pending" hasta confirmar el pago
          total: total,
          subtotal: subtotal,
          tax: tax,
          payment_method: paymentMethod,
          transaction_id: `TX-${Math.random().toString(36).substring(2, 10)}`,
          billing_name: billingInfo.name,
          billing_email: billingInfo.email,
          billing_address: billingInfo.address,
          billing_city: billingInfo.city,
          billing_postal_code: billingInfo.postal_code,
          billing_country: billingInfo.country,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear tickets para la orden
      const ticketsToInsert = [];

      for (const ticketType of ticketSelection) {
        for (let i = 0; i < ticketType.quantity; i++) {
          ticketsToInsert.push({
            order_id: order.id,
            ticket_type_id: ticketType.ticketTypeId,
            ticket_number: `T-${Math.random().toString(36).substring(2, 10)}`,
            status: "valid",
          });
        }
      }

      const { error: ticketsError } = await supabaseClient
        .from("tickets")
        .insert(ticketsToInsert);

      if (ticketsError) throw ticketsError;

      // Actualizar contadores de tickets vendidos
      for (const ticketType of ticketSelection) {
        await supabaseClient.rpc("increment_sold_tickets", {
          ticket_type_id: ticketType.ticketTypeId,
          quantity: ticketType.quantity,
        });
      }

      // Redirigir a la página de confirmación
      router.push(`/checkout/confirmation?order=${order.id}`);
    } catch (err) {
      console.error("Error procesando pago:", err);
      setError(
        err.message ||
          "Error procesando el pago. Por favor, inténtelo de nuevo."
      );
      setProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-red-500">
              Error
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>{error}</p>
            </div>
            <div className="mt-5">
              <Link href="/events">
                <Button variant="primary">Volver a eventos</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!eventDetails || ticketSelection.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              No se encontró información de compra
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                No se ha encontrado información sobre su selección de entradas.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/events">
                <Button variant="primary">Explorar eventos</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Resumen de compra */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Resumen de tu compra
                </h2>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Evento
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {eventDetails.name}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(eventDetails.start_date)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Ubicación
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {eventDetails.location}, {eventDetails.city}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Organizador
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {eventDetails.organizations?.name}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Entradas seleccionadas
                </h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tipo de entrada
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Precio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cantidad
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ticketSelection.map((ticket, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.price.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(ticket.price * ticket.quantity).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Resumen de pago
                </h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Subtotal
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {subtotal.toFixed(2)} €
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      IVA (21%)
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {tax.toFixed(2)} €
                    </dd>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <dt className="text-base font-bold text-gray-900">Total</dt>
                    <dd className="text-base font-bold text-gray-900">
                      {total.toFixed(2)} €
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Información de pago
                </h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleCheckout}>
                  {/* Información de facturación */}
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nombre completo*
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={billingInfo.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email*
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={billingInfo.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Dirección*
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={billingInfo.address}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Ciudad*
                        </label>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={billingInfo.city}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="postal_code"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Código postal*
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          id="postal_code"
                          value={billingInfo.postal_code}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700"
                      >
                        País
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={billingInfo.country}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option>España</option>
                        <option>Francia</option>
                        <option>Portugal</option>
                        <option>Italia</option>
                        <option>Alemania</option>
                      </select>
                    </div>

                    {/* Método de pago */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Método de pago
                      </h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center">
                          <input
                            id="card"
                            name="paymentMethod"
                            type="radio"
                            checked={paymentMethod === "card"}
                            onChange={() => setPaymentMethod("card")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor="card"
                            className="ml-3 block text-sm font-medium text-gray-700"
                          >
                            Tarjeta de crédito/débito
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="paypal"
                            name="paymentMethod"
                            type="radio"
                            checked={paymentMethod === "paypal"}
                            onChange={() => setPaymentMethod("paypal")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor="paypal"
                            className="ml-3 block text-sm font-medium text-gray-700"
                          >
                            PayPal
                          </label>
                        </div>
                      </div>

                      {/* Aquí irían los campos para la tarjeta en un entorno real */}
                      {paymentMethod === "card" && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-500">
                            En un entorno de producción, aquí aparecería el
                            formulario para los datos de la tarjeta integrado
                            con Redsys.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Procesando pago...
                          </span>
                        ) : (
                          <span>Pagar {total.toFixed(2)} €</span>
                        )}
                      </Button>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-500 text-center">
                        Al completar tu pedido, aceptas nuestros{" "}
                        <a
                          href="/terms"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          Términos y condiciones
                        </a>{" "}
                        y{" "}
                        <a
                          href="/privacy"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          Política de privacidad
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
