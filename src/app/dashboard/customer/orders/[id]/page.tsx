// src/app/dashboard/customer/orders/[id]/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({ params }) {
  return {
    title: `Pedido #${params.id} | Plataforma de Venta de Entradas`,
    description: "Detalles de tu pedido de entradas",
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();

  // Verificar sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/dashboard/customer/orders/" + params.id);
  }

  // Obtener detalles de la orden
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, status, total, subtotal, tax, created_at, 
      payment_method, transaction_id,
      events(id, name, start_date, location, city),
      tickets(id, ticket_number, status, seat_number, ticket_types(name, price))
    `
    )
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single();

  if (!order) {
    return notFound();
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mapeo de estado a texto y clases
  const statusMap = {
    pending: {
      text: "Pendiente",
      classes: "bg-yellow-100 text-yellow-800",
    },
    completed: {
      text: "Completada",
      classes: "bg-green-100 text-green-800",
    },
    cancelled: {
      text: "Cancelada",
      classes: "bg-red-100 text-red-800",
    },
    refunded: {
      text: "Reembolsada",
      classes: "bg-gray-100 text-gray-800",
    },
  };

  const statusInfo = statusMap[order.status] || {
    text: order.status,
    classes: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Pedido #{order.order_number}
        </h1>
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.classes}`}
        >
          {statusInfo.text}
        </span>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información del evento
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Evento</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link
                  href={`/events/${order.events.id}`}
                  className="text-blue-600 hover:text-blue-500"
                >
                  {order.events.name}
                </Link>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fecha</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(order.events.start_date)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.events.location}, {order.events.city}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Detalles del pedido
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Fecha de compra
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(order.created_at)}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Método de pago
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.payment_method || "Tarjeta de crédito"}
              </dd>
            </div>
            {order.transaction_id && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  ID de transacción
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.transaction_id}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Entradas
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nº Entrada
                  </th>
                  {order.tickets.some((ticket) => ticket.seat_number) && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Asiento
                    </th>
                  )}
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
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.ticket_types.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.ticket_number}
                    </td>
                    {order.tickets.some((t) => t.seat_number) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.seat_number || "-"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.ticket_types.price.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.status === "valid"
                            ? "bg-green-100 text-green-800"
                            : ticket.status === "used"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ticket.status === "valid"
                          ? "Válida"
                          : ticket.status === "used"
                          ? "Utilizada"
                          : "Cancelada"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/customer/tickets/${ticket.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Resumen de pago
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.subtotal
                  ? order.subtotal.toFixed(2)
                  : order.total.toFixed(2)}{" "}
                €
              </dd>
            </div>
            {order.tax !== null && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">IVA (21%)</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.tax.toFixed(2)} €
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Total</dt>
              <dd className="mt-1 text-sm font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                {order.total.toFixed(2)} €
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Link href="/dashboard/customer/orders">
          <Button variant="outline" size="sm" className="mr-3">
            Volver a pedidos
          </Button>
        </Link>
        {order.status === "completed" && (
          <Link href={`/dashboard/customer/orders/${order.id}/invoice`}>
            <Button variant="secondary" size="sm">
              Descargar factura
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
