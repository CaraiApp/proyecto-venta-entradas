"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { supabaseClient } from "@/lib/supabaseClient";

interface OrganizationFormProps {
  isAdmin?: boolean;
  initialData?: {
    name?: string;
    description?: string;
    website?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    tax_id?: string;
  };
}

export function OrganizationForm({
  isAdmin = false,
  initialData = {},
}: OrganizationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Datos de la organización
  const [organizationData, setOrganizationData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    website: initialData.website || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    city: initialData.city || "",
    postal_code: initialData.postal_code || "",
    country: initialData.country || "España",
    tax_id: initialData.tax_id || "",
  });

  // Datos del usuario administrador de la organización (solo para registro)
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleOrganizationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOrganizationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let newOrgId: string | null = null;
      let newUserId: string | null = null;

      // Si es el admin creando una organización
      if (isAdmin) {
        // 1. Crear la organización
        const { data: orgData, error: orgError } = await supabaseClient
          .from("organizations")
          .insert({
            name: organizationData.name,
            description: organizationData.description,
            website: organizationData.website,
            phone: organizationData.phone,
            address: organizationData.address,
            city: organizationData.city,
            postal_code: organizationData.postal_code,
            country: organizationData.country,
            tax_id: organizationData.tax_id,
            status: "active", // El admin activa directamente
          })
          .select("id")
          .single();

        if (orgError) throw orgError;
        newOrgId = orgData.id;

        setSuccess(
          "Organización creada con éxito. Ahora puedes agregar miembros."
        );

        // Redirigir al admin a la página de detalles de la organización
        setTimeout(() => {
          router.push(`/admin/organizations/${newOrgId}`);
        }, 2000);
      }
      // Si es un registro de organización por parte de un usuario
      else {
        // Validar contraseña
        if (userData.password !== userData.confirmPassword) {
          setError("Las contraseñas no coinciden");
          setLoading(false);
          return;
        }

        if (userData.password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres");
          setLoading(false);
          return;
        }

        // 1. Crear la organización con estado pendiente
        const { data: orgData, error: orgError } = await supabaseClient
          .from("organizations")
          .insert({
            name: organizationData.name,
            description: organizationData.description,
            website: organizationData.website,
            phone: organizationData.phone,
            address: organizationData.address,
            city: organizationData.city,
            postal_code: organizationData.postal_code,
            country: organizationData.country,
            tax_id: organizationData.tax_id,
            status: "pending", // Requiere aprobación del admin
          })
          .select("id")
          .single();

        if (orgError) throw orgError;
        newOrgId = orgData.id;

        // 2. Registrar al usuario administrador de la organización
        const { data: authData, error: authError } =
          await supabaseClient.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                role: "organizer", // Rol de organizador
              },
            },
          });

        if (authError) throw authError;
        newUserId = authData.user?.id;

        if (newUserId) {
          // 3. Crear el perfil del usuario
          await supabaseClient.from("profiles").insert({
            id: newUserId,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            role: "organizer",
          });

          // 4. Vincular el usuario a la organización como administrador
          await supabaseClient.from("organization_members").insert({
            organization_id: newOrgId,
            user_id: newUserId,
            role: "admin", // Administrador de la organización
            status: "active",
          });
        }

        setSuccess(
          "Solicitud de registro enviada con éxito. Un administrador revisará tu solicitud y te contactará pronto."
        );

        // Redirigir al usuario a la página de login después de un breve retraso
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error al crear organización:", error);
      setError(
        error.message ||
          "Ha ocurrido un error al procesar la solicitud. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información de la organización
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre de la organización *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={organizationData.name}
                onChange={handleOrganizationChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={organizationData.description}
                onChange={handleOrganizationChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700"
              >
                Sitio web
              </label>
              <input
                type="url"
                name="website"
                id="website"
                value={organizationData.website}
                onChange={handleOrganizationChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Teléfono *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={organizationData.phone}
                onChange={handleOrganizationChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Dirección *
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={organizationData.address}
                onChange={handleOrganizationChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                Ciudad *
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={organizationData.city}
                onChange={handleOrganizationChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="postal_code"
                className="block text-sm font-medium text-gray-700"
              >
                Código postal *
              </label>
              <input
                type="text"
                name="postal_code"
                id="postal_code"
                value={organizationData.postal_code}
                onChange={handleOrganizationChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                País *
              </label>
              <input
                type="text"
                name="country"
                id="country"
                value={organizationData.country}
                onChange={handleOrganizationChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="tax_id"
                className="block text-sm font-medium text-gray-700"
              >
                CIF/NIF *
              </label>
              <input
                type="text"
                name="tax_id"
                id="tax_id"
                value={organizationData.tax_id}
                onChange={handleOrganizationChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Formulario de usuario solo para registro (no para admin) */}
        {!isAdmin && (
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información del usuario administrador
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre *
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  value={userData.first_name}
                  onChange={handleUserChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  value={userData.last_name}
                  onChange={handleUserChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={userData.email}
                  onChange={handleUserChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="user_phone"
                  value={userData.phone}
                  onChange={handleUserChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={userData.password}
                  onChange={handleUserChange}
                  required
                  minLength={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar contraseña *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleUserChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="ml-3"
          >
            {loading
              ? "Procesando..."
              : isAdmin
              ? "Crear organización"
              : "Enviar solicitud"}
          </Button>
        </div>
      </form>
    </div>
  );
}
