"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import QRCode from "qrcode.react";

interface TicketCardProps {
  id: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  ticketNumber: string;
  status: "valid" | "used" | "cancelled";
}

export function TicketCard({
  id,
  eventName,
  eventDate,
  eventLocation,
  ticketType,
  ticketNumber,
  status,
}: TicketCardProps) {
  const [showQR, setShowQR] = useState(false);

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
    valid: "bg-green-100 text-green-800",
    used: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusText = {
    valid: "Válida",
    used: "Utilizada",
    cancelled: "Cancelada",
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {eventName}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {formatDate(eventDate)}
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
            <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {eventLocation}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Tipo de entrada
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {ticketType}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Número de entrada
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {ticketNumber}
            </dd>
          </div>
          {showQR && (
            <div className="bg-white px-4 py-5 flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <QRCode value={`ticket:${id}`} size={200} />
                <p className="mt-2 text-xs text-center text-gray-500">
                  Presenta este código QR en la entrada del evento
                </p>
              </div>
            </div>
          )}
        </dl>
      </div>
      <div className="bg-gray-50 px-4 py-4 flex justify-end space-x-3 sm:px-6">
        <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
          {showQR ? "Ocultar QR" : "Mostrar QR"}
        </Button>
        <Link href={`/dashboard/customer/tickets/${id}`}>
          <Button variant="primary" size="sm">
            Ver detalles
          </Button>
        </Link>
      </div>
    </div>
  );
}
