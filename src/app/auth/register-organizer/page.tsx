// src/app/auth/register-organizer/page.tsx
import { OrganizerRegistrationForm } from "@/components/auth/OrganizerRegistrationForm";

export const metadata = {
  title: "Registro de Organizadores | Plataforma de Venta de Entradas",
  description:
    "Regístrate como organizador de eventos y comienza a vender tus entradas",
};

export default function OrganizerRegistrationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <OrganizerRegistrationForm />
    </div>
  );
}
