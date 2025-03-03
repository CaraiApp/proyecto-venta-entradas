// src/app/auth/register-organizer/page.tsx
import { RegisterOrganizerForm } from "@/components/auth/RegisterOrganizerForm";

export const metadata = {
  title: "Registro de Organizador | Plataforma de Venta de Entradas",
  description:
    "Crea una cuenta de organizador en nuestra plataforma de venta de entradas",
};

export default function RegisterOrganizerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterOrganizerForm />
    </div>
  );
}
