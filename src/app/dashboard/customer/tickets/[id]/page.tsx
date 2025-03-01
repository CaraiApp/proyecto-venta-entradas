"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode.react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

export default function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push(
        `/auth/login?redirect=/dashboard/customer/tickets/${params.id}`
      );
      return;
    }

    async function fetchTicket() {
      try {
        setLoading(true);
        setError("");

        const { data, error: ticketError } = await supabaseClient
          .from("tickets")
          .select(
            `
            *,
            ticket_types(id, name, price, description),
            orders(id, order_number, created_at, user_id),
            events(id, name, start_date, end_date, location, city, image_url, organizations(id, name))
          `
          )
          .eq("id", params.id)
          .single();

        if (ticketError) throw ticketError;

        if (!data) {
          throw new Error("Ticket no encontrado");
        }

        // Verificar que el ticket pertenece al usuario
        if (data.orders.user_id !== user.id) {
          throw new Error("No tienes permiso para ver este ticket");
        }

        setTicket(data);
      } catch (err) {
        console.error("Error al cargar el ticket:", err);
        setError(
          err.message ||
            "Ha ocurrido un error al cargar la información del ticket"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTicket();
  }, [params.id, user, router]);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "valid":
        return "Válida";
      case "used":
        return "Utilizada";
      case "cancelled":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "used":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-500">
            Cargando información de la entrada...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-red-500">
              Error
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>{error}</p>
            </div>
            <div className="mt-5">
              <Link href="/dashboard/customer/tickets">
                <Button variant="primary">Volver a mis entradas</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Entrada no encontrada
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                La entrada que estás buscando no existe o ha sido eliminada.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/dashboard/customer/tickets">
                <Button variant="primary">Volver a mis entradas</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrada</h1>
          <p className="mt-1 text-sm text-gray-500">
            Detalles de tu entrada para el evento
          </p>
        </div>
        <span
          className={`mt-2 md:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            ticket.status
          )}`}
        >
          {getStatusLabel(ticket.status)}
        </span>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6 bg-blue-50">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            {ticket.events.name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Organizado por {ticket.events.organizations.name}
          </p>
        </div>

        {/* Información del evento */}
        <div className="border-b border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Fecha y hora
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(ticket.events.start_date)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.events.location}, {ticket.events.city}
              </dd>
            </div>
          </dl>
        </div>

        {/* Información de la entrada */}
        <div className="border-b border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Tipo de entrada
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.ticket_types.name}
                {ticket.ticket_types.description && (
                  <p className="mt-1 text-xs text-gray-500">
                    {ticket.ticket_types.description}
                  </p>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Número de entrada
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.ticket_number}
              </dd>
            </div>
            {ticket.seat_number && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Asiento</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {ticket.seat_number}
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Precio</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.ticket_types.price.toFixed(2)} €
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Número de pedido
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link
                  href={`/dashboard/customer/orders/${ticket.orders.id}`}
                  className="text-blue-600 hover:text-blue-500"
                >
                  {ticket.orders.order_number}
                </Link>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Fecha de compra
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(ticket.orders.created_at)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Código QR */}
        {ticket.status === "valid" && (
          <div className="px-4 py-5 sm:p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Código QR
            </h3>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <QRCode value={`ticket:${ticket.id}`} size={200} />
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center max-w-md">
              Presenta este código QR en la entrada del evento para validar tu
              entrada. También puedes descargar la entrada para tenerla
              disponible sin conexión.
            </p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0 sm:space-x-3">
        <Link href="/dashboard/customer/tickets">
          <Button variant="outline" className="w-full sm:w-auto">
            Volver a mis entradas
          </Button>
        </Link>

        {ticket.status === "valid" && (
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => window.print()}
            >
              Imprimir entrada
            </Button>
            <Link href={`/dashboard/customer/tickets/${ticket.id}/download`}>
              <Button variant="primary" className="w-full sm:w-auto">
                Descargar entrada
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Información adicional */}
      {ticket.status === "valid" && (
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900">
            Información importante
          </h3>
          <ul className="mt-2 list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Esta entrada es personal e intransferible.</li>
            <li>
              Es necesario presentar un documento de identidad junto con la
              entrada.
            </li>
            <li>
              Te recomendamos llegar con al menos 30 minutos de antelación al
              evento.
            </li>
            <li>
              Para cualquier duda o problema con tu entrada, contacta con el
              organizador.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
