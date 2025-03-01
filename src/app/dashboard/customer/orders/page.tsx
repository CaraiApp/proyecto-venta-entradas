// src/app/dashboard/customer/orders/page.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { OrderCard } from "@/components/orders/OrderCard";
import Link from "next/link";

export const metadata = {
  title: "Historial de Compras | Plataforma de Venta de Entradas",
  description: "Revisa tu historial de compras de entradas",
};

export default async function OrdersPage() {
  const supabase = createServerSupabaseClient();

  // Verificar sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/dashboard/customer/orders");
  }

  // Obtener órdenes del usuario
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, status, total, created_at, 
      events(id, name, start_date),
      tickets(id)
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Historial de Compras
      </h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              id={order.id}
              orderNumber={order.order_number}
              eventName={order.events.name}
              date={order.created_at}
              total={order.total}
              status={order.status}
              ticketsCount={order.tickets.length}
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No tienes compras realizadas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Aún no has realizado ninguna compra de entradas.
            </p>
            <div className="mt-6">
              <Link
                href="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Explorar eventos
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
