// src/middleware/adminMiddleware.ts
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function adminMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Si no hay sesión, redirigir al login
    const redirectUrl = new URL("/auth/login", req.url);
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Obtener el perfil del usuario para verificar si es admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // Si no es admin, redirigir al dashboard normal
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}
