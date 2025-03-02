// src/app/auth/register-organizer/page.tsx
import { OrganizerRegistrationForm } from "@/components/auth/OrganizerRegistrationForm";

export const metadata = {
  title: "Registro de Organizador | Plataforma de Venta de Entradas",
  description:
    "Regístrate como organizador de eventos y comienza a vender entradas",
};

export default function OrganizerRegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <OrganizerRegistrationForm />
        </div>
      </div>
    </div>
  );
}
