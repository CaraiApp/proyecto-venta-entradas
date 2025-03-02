// src/app/api/admin/assign/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar que el solicitante sea administrador
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar si el usuario actual es administrador
    const { data: requestingUser } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!requestingUser || requestingUser.role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    // Obtener el ID del usuario a convertir en administrador del cuerpo de la solicitud
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario no proporcionado" },
        { status: 400 }
      );
    }

    // Actualizar el rol del usuario en la tabla 'profiles'
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId);

    if (updateError) {
      console.error("Error al actualizar el perfil:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar el rol del usuario" },
        { status: 500 }
      );
    }

    // Actualizar los metadatos del usuario en Auth
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role: "admin" } }
    );

    if (authUpdateError) {
      console.error("Error al actualizar metadatos:", authUpdateError);
      return NextResponse.json(
        { error: "Error al actualizar los metadatos del usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario actualizado a administrador correctamente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
