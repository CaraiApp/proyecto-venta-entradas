// src/components/auth/OrganizerRegistrationForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { supabaseClient } from "@/lib/supabaseClient";
import { sendOrganizationRegistrationConfirmation } from "@/lib/email";

export function OrganizerRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    logo_url: "",
    address: "",
    city: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      // 1. Registrar usuario en Supabase Auth
      const { data: authData, error: authError } =
        await supabaseClient.auth.signUp({
          email: formData.contact_email,
          password: formData.password,
          options: {
            data: {
              role: "organizer",
            },
          },
        });

      if (authError) throw authError;

      // 2. Crear registro en tabla de organizaciones
      const { data: orgData, error: orgError } = await supabaseClient
        .from("organizations")
        .insert({
          name: formData.name,
          description: formData.description,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          website: formData.website,
          logo_url: formData.logo_url,
          address: formData.address,
          city: formData.city,
          created_by: authData.user?.id,
          updated_by: authData.user?.id,
          status: "pending",
        });

      if (orgError) throw orgError;

      // 3. Enviar email de confirmación de registro
      const emailSent = await sendOrganizationRegistrationConfirmation(
        formData.contact_email,
        formData.name
      );

      if (!emailSent) {
        console.warn("No se pudo enviar el email de confirmación");
      }

      // Redirigir a página de verificación
      router.push("/auth/register-organizer/verification");
    } catch (error) {
      console.error("Error en registro de organizador:", error);
      setError(error.message || "Error al registrar la organización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        Registro de Organización
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Resto del formulario (igual que el anterior) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (campos del formulario previo) ... */}

        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar Organización"}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
