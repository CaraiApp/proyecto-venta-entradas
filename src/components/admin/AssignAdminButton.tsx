"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AssignAdminButtonProps {
  userId: string;
}

export default function AssignAdminButton({ userId }: AssignAdminButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAssignAdmin = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas asignar permisos de administrador a este usuario?"
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Error al asignar permisos de administrador"
        );
      }

      setSuccess(true);

      // Recargar la página después de un breve retraso para mostrar los cambios actualizados
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {success ? (
        <span className="text-sm text-green-600">¡Asignado!</span>
      ) : (
        <button
          onClick={handleAssignAdmin}
          disabled={loading}
          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Asignando..." : "Hacer admin"}
        </button>
      )}
      {error && (
        <div className="absolute mt-2 text-sm text-red-600 bg-red-50 p-2 rounded shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}
