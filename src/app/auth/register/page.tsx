import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Registro | Plataforma de Venta de Entradas",
  description: "Crea una cuenta en la plataforma de venta de entradas",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}
