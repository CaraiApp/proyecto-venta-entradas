// src/components/admin/AssignAdminButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface AssignAdminButtonProps {
  userId: string;
}

export default function AssignAdminButton({ userId }: AssignAdminButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAssignAdmin = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas convertir a este usuario en administrador? Esta acción otorga permisos completos sobre la plataforma."
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Actualizar el rol en la tabla de perfiles
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Actualizar los metadatos del usuario en Auth
      const { error: authError } =
        await supabaseClient.auth.admin.updateUserById(userId, {
          user_metadata: { role: "admin" },
        });

      if (authError) throw authError;

      // Refrescar la página para mostrar los cambios
      router.refresh();
    } catch (err) {
      console.error("Error al asignar rol de administrador:", err);
      setError("No se pudo asignar el rol de administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="xs"
        onClick={handleAssignAdmin}
        disabled={loading}
      >
        {loading ? "Actualizando..." : "Hacer administrador"}
      </Button>
      {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
    </>
  );
}
