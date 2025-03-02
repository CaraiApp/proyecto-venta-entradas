import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verifica que solo un admin pueda hacer esta solicitud
  // (implementar middleware de autenticación)

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { email, password, firstName, lastName, phone, role } =
      await request.json();

    // Crear usuario con servicio admin
    const { data, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
        },
      });

    if (authError) throw authError;

    // Insertar perfil
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: data.user!.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando usuario:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 400 }
    );
  }
}
