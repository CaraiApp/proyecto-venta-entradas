// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        // Handle potential authentication errors
        return NextResponse.redirect(
          new URL(
            `/auth/login?error=${encodeURIComponent(error.message)}`,
            request.url
          )
        );
      }

      // Redirect to dashboard or intended destination
      return NextResponse.redirect(
        new URL(
          requestUrl.searchParams.get("redirect") || "/dashboard",
          request.url
        )
      );
    } catch (err) {
      // Handle any unexpected errors
      return NextResponse.redirect(
        new URL(`/auth/login?error=unexpected_error`, request.url)
      );
    }
  }

  // If no code is present, redirect to login
  return NextResponse.redirect(new URL("/auth/login", request.url));
}
