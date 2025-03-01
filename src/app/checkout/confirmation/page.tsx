// src/app/checkout/confirmation/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

type OrderDetails = {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  event: {
    id: string;
    name: string;
    start_date: string;
    location: string;
    city: string;
  };
  tickets: {
    id: string;
    ticket_number: string;
    ticket_type: {
      name: string;
    };
  }[];
};

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthContext();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const orderId = searchParams.get("order");
    if (!orderId) {
      setError("No se ha encontrado la información del pedido");
      setIsLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const { data: order, error: orderError } = await supabaseClient
          .from("orders")
          .select(
            `
            id, 
            order_number, 
            total, 
            created_at,
            events (
              id, 
              name, 
              start_date, 
              location,
              city
            )
          `
          )
          .eq("id", orderId)
          .eq("user_id", user.id)
          .single();

        if (orderError) throw orderError;
        if (!order) throw new Error("Pedido no encontrado");

        // Obtener tickets de la orden
        const { data: tickets, error: ticketsError } = await supabaseClient
          .from("tickets")
          .select(
            `
            id, 
            ticket_number,
            ticket_types (
              name
            )
          `
          )
          .eq("order_id", order.id);

        if (ticketsError) throw ticketsError;

        // Construir el objeto de detalles de la orden
        setOrderDetails({
          id: order.id,
          order_number: order.order_number,
          created_at: order.created_at,
          total: order.total,
          event: {
            id: order.events.id,
            name: order.events.name,
            start_date: order.events.start_date,
            location: order.events.location,
            city: order.events.city,
          },
          tickets: tickets,
        });
      } catch (err) {
        console.error("Error al cargar la información del pedido:", err);
        setError("No se pudo cargar la información del pedido");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [authLoading, user, router, searchParams]);

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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-500">
            Cargando información del pedido...
          </p>
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

  if (!orderDetails) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              No se encontró información del pedido
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>No se ha encontrado información sobre tu pedido.</p>
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          {/* Cabecera y mensaje de éxito */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
              ¡Gracias por tu compra!
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Tu pedido se ha completado con éxito.
            </p>
          </div>

          {/* Detalles del pedido */}
          <div className="mt-12">
            <h2 className="sr-only">Detalles del pedido</h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Pedido #{orderDetails.order_number}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Realizado el {formatDate(orderDetails.created_at)}
                </p>
              </div>

              {/* Información del evento */}
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Evento
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <Link
                        href={`/events/${orderDetails.event.id}`}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        {orderDetails.event.name}
                      </Link>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Fecha del evento
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(orderDetails.event.start_date)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Ubicación
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {orderDetails.event.location}, {orderDetails.event.city}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Entradas */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Entradas
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Hemos enviado las entradas a tu correo electrónico.
                </p>
              </div>

              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {orderDetails.tickets.map((ticket) => (
                        <li key={ticket.id} className="py-4">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {ticket.ticket_type.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Nº de entrada: {ticket.ticket_number}
                              </p>
                            </div>
                            <div className="ml-auto">
                              <Link
                                href={`/dashboard/customer/tickets/${ticket.id}`}
                              >
                                <Button variant="outline" size="sm">
                                  Ver entrada
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Resumen de pago */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-between text-sm font-medium">
                  <p className="text-gray-900">Total pagado</p>
                  <p className="text-gray-900">
                    {orderDetails.total.toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <Link
              href="/dashboard/customer/orders"
              className="w-full sm:w-auto"
            >
              <Button variant="primary" className="w-full">
                Ver mis pedidos
              </Button>
            </Link>
            <Link href="/events" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Explorar más eventos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
