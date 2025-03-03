// src/app/auth/register/page.tsx
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Registro | Plataforma de Venta de Entradas",
  description: "Crea una cuenta para comprar entradas y gestionar eventos",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear una cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Iniciar Sesión
            </a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
