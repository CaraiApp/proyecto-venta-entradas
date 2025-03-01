// src/middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Verificar la sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rutas que requieren autenticación
  const authRoutes = [
    "/dashboard",
    "/checkout",
    "/perfil",
    "/tickets",
    "/orders",
  ];

  // Rutas de autenticación
  const authenticationRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
  ];

  const path = req.nextUrl.pathname;

  // Redirigir usuarios autenticados de rutas de login/registro
  if (session && authenticationRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirigir usuarios no autenticados de rutas protegidas
  if (!session && authRoutes.some((route) => path.startsWith(route))) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// Configurar qué rutas serán manejadas por el middleware
export const config = {
  matcher: [
    // Rutas protegidas
    "/dashboard/:path*",
    "/checkout/:path*",
    "/perfil/:path*",
    "/tickets/:path*",
    "/orders/:path*",

    // Rutas de autenticación
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
  ],
};
