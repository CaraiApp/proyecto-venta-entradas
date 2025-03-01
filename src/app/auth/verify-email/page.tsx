// src/app/auth/verify-email/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Verificar Correo Electrónico | Plataforma de Venta de Entradas",
  description: "Verifica tu correo electrónico para completar tu registro",
};

export default async function VerifyEmailPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifica tu correo electrónico
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hemos enviado un enlace de verificación a{" "}
            <span className="font-medium text-blue-600">{user.email}</span>
          </p>
        </div>
        <div className="mt-6">
          <div className="rounded-md shadow-sm space-y-4">
            <form
              action={async () => {
                "use server";
                const { error } = await supabase.auth.signInWithOtp({
                  email: user.email!,
                  options: {
                    shouldCreateUser: false,
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                  },
                });

                if (error) {
                  console.error("Error reenviando verificación:", error);
                }
              }}
            >
              <Button type="submit" variant="primary" className="w-full">
                Reenviar correo de verificación
              </Button>
            </form>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Ir al Dashboard (solo si ya has verificado)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
