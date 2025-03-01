"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface OrderCardProps {
  id: string;
  orderNumber: string;
  eventName: string;
  date: string;
  total: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  ticketsCount: number;
}

export function OrderCard({
  id,
  orderNumber,
  eventName,
  date,
  total,
  status,
  ticketsCount,
}: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  const statusText = {
    pending: "Pendiente",
    completed: "Completada",
    cancelled: "Cancelada",
    refunded: "Reembolsada",
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {eventName}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Pedido #{orderNumber}
          </p>
        </div>
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}
        >
          {statusText[status]}
        </span>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Fecha de compra
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(date)}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Entradas</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {ticketsCount}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total pagado</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
              {total.toFixed(2)} €
            </dd>
          </div>
        </dl>
      </div>
      <div className="bg-gray-50 px-4 py-4 flex justify-end sm:px-6">
        <Link href={`/dashboard/customer/orders/${id}`}>
          <Button variant="primary" size="sm">
            Ver detalles
          </Button>
        </Link>
      </div>
    </div>
  );
}
