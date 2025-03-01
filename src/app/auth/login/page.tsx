// src/app/auth/login/page.tsx
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Iniciar Sesión | Plataforma de Venta de Entradas",
  description: "Inicia sesión en la plataforma de venta de entradas",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
