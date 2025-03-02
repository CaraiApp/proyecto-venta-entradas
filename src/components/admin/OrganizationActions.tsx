"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { supabaseClient } from "@/lib/supabaseClient";

interface OrganizationActionsProps {
  organization: {
    id: string;
    status: string;
    name: string;
  };
}

export function OrganizationActions({
  organization,
}: OrganizationActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabaseClient
        .from("organizations")
        .update({ status: newStatus })
        .eq("id", organization.id);

      if (error) throw error;

      // Refrescar la página para mostrar los cambios
      router.refresh();
    } catch (err) {
      console.error("Error actualizando estado:", err);
      setError(
        "Ha ocurrido un error al actualizar el estado de la organización."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Acciones para esta organización
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Cambiar el estado de la organización o realizar otras acciones
            administrativas.
          </p>
        </div>

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

        <div className="mt-5 space-y-4">
          {organization.status === "pending" && (
            <div className="flex space-x-4">
              <Button
                variant="primary"
                onClick={() => handleStatusChange("active")}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Aprobar organización"}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleStatusChange("rejected")}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Rechazar organización"}
              </Button>
            </div>
          )}

          {organization.status === "active" && (
            <div className="flex space-x-4">
              <Button
                variant="danger"
                onClick={() => handleStatusChange("suspended")}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Suspender organización"}
              </Button>
            </div>
          )}

          {organization.status === "suspended" && (
            <div className="flex space-x-4">
              <Button
                variant="primary"
                onClick={() => handleStatusChange("active")}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Reactivar organización"}
              </Button>
            </div>
          )}

          {organization.status === "rejected" && (
            <div className="flex space-x-4">
              <Button
                variant="primary"
                onClick={() => handleStatusChange("active")}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Aprobar organización"}
              </Button>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin/organizations/${organization.id}/edit`)
              }
            >
              Editar organización
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
