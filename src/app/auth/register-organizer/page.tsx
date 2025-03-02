// src/app/auth/register-organizer/page.tsx
import { OrganizerRegistrationForm } from "@/components/auth/OrganizerRegistrationForm";

export const metadata = {
  title: "Registro de Organizador | Plataforma de Venta de Entradas",
  description:
    "Crea una cuenta de organizador para gestionar eventos y vender entradas",
};

export default function RegisterOrganizerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <OrganizerRegistrationForm />
    </div>
  );
}
