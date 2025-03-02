// src/middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rutas que requieren autenticación
  const protectedRoutes = ["/dashboard", "/profile", "/checkout"];

  if (
    protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route)) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/checkout/:path*"],
};
