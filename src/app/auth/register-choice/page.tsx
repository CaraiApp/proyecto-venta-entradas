// src/app/auth/register-choice/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Registro | Plataforma de Venta de Entradas",
  description: "Elige el tipo de cuenta que deseas crear",
};

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear una cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Elige el tipo de cuenta que deseas crear
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Cuenta de Cliente
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Para comprar entradas a eventos y gestionar tus compras.
            </p>
            <Link href="/auth/register">
              <Button variant="primary" className="w-full">
                Registro de Cliente
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Cuenta de Organizador
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Para crear y gestionar eventos, vender entradas y controlar
              accesos.
            </p>
            <Link href="/auth/register-organizer">
              <Button variant="secondary" className="w-full">
                Registro de Organizador
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
