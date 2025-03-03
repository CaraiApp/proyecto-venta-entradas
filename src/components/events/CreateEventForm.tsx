"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { supabaseClient } from "@/lib/supabaseClient";

interface CreateEventFormProps {
  organizationId: string;
  organizationName: string;
  seatingMaps?: Array<{ id: string; name: string }>;
}

interface EventFormData {
  name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  useSeatingMap: boolean;
  seatingMapId: string;
}

export function CreateEventForm({
  organizationId,
  organizationName,
  seatingMaps = [],
}: CreateEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    location: "",
    address: "",
    city: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    useSeatingMap: false,
    seatingMapId: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Manejar checkboxes
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validar formulario
      if (
        !formData.name ||
        !formData.location ||
        !formData.startDate ||
        !formData.startTime
      ) {
        throw new Error("Por favor, completa todos los campos obligatorios");
      }

      // Formatear fechas
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      let endDateTime = startDateTime;

      if (formData.endDate && formData.endTime) {
        endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      } else if (formData.endDate) {
        // Si solo tenemos fecha de fin, utilizamos la hora de inicio
        endDateTime = new Date(`${formData.endDate}T${formData.startTime}`);
      } else if (formData.endTime) {
        // Si solo tenemos hora de fin, utilizamos la fecha de inicio
        endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);
      }

      // Comprobar que la fecha de fin es posterior a la de inicio
      if (endDateTime < startDateTime) {
        throw new Error(
          "La fecha de finalización debe ser posterior a la fecha de inicio"
        );
      }

      // Preparar datos para la inserción en Supabase
      const eventData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        city: formData.city,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        organization_id: organizationId,
        status: "draft", // Los eventos comienzan como borradores
        seating_map_id: formData.useSeatingMap ? formData.seatingMapId : null,
      };

      // Insertar evento en la base de datos
      const { data: eventData, error: eventError } = await supabaseClient
        .from("events")
        .insert(eventData)
        .select("id")
        .single();

      if (eventError) throw eventError;

      setSuccess("¡Evento creado con éxito! Serás redirigido en breve...");

      // Esperar un breve momento y luego redirigir al usuario
      setTimeout(() => {
        router.push(`/dashboard/organizer/events/${eventData.id}/edit`);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Se produjo un error al crear el evento"
      );
      console.error("Error al crear evento:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Crear nuevo evento para {organizationName}
        </h3>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
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

        {success && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-5 space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900">
                Información básica
              </h4>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre del evento *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Descripción
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Describe brevemente el evento para los asistentes.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900">
                Ubicación y fecha
              </h4>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Lugar *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Ej: Teatro Principal"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Dirección
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Ej: Calle Principal 123"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ciudad
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Ej: Melilla"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fecha de inicio *
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Hora de inicio *
                  </label>
                  <div className="mt-1">
                    <input
                      type="time"
                      name="startTime"
                      id="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fecha de finalización
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Hora de finalización
                  </label>
                  <div className="mt-1">
                    <input
                      type="time"
                      name="endTime"
                      id="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {seatingMaps && seatingMaps.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  Mapa de asientos (opcional)
                </h4>
                <div className="mt-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="useSeatingMap"
                        name="useSeatingMap"
                        type="checkbox"
                        checked={formData.useSeatingMap}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="useSeatingMap"
                        className="font-medium text-gray-700"
                      >
                        Usar mapa de asientos
                      </label>
                      <p className="text-gray-500">
                        Si activas esta opción, los asistentes podrán
                        seleccionar asientos específicos.
                      </p>
                    </div>
                  </div>

                  {formData.useSeatingMap && (
                    <div className="mt-4 sm:col-span-4">
                      <label
                        htmlFor="seatingMapId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Selecciona un mapa de asientos
                      </label>
                      <div className="mt-1">
                        <select
                          id="seatingMapId"
                          name="seatingMapId"
                          value={formData.seatingMapId}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="">Selecciona un mapa</option>
                          {seatingMaps.map((map) => (
                            <option key={map.id} value={map.id}>
                              {map.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="mr-3"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Creando..." : "Crear evento"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
