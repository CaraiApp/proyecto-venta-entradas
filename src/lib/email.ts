// src/lib/email.ts
import { Resend } from "resend";

// Inicializar Resend con tu clave API
const resend = new Resend(process.env.RESEND_API_KEY);

// Tipos de emails
export interface OrganizationApprovalEmailProps {
  to: string;
  organizationName: string;
  status: "approved" | "rejected";
  reason?: string;
}

// Template para email de aprobación de organización
function OrganizationApprovalEmail({
  organizationName,
  status,
  reason,
}: Omit<OrganizationApprovalEmailProps, "to">) {
  const isApproved = status === "approved";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #f4f4f4; 
        }
        .status-approved { color: green; }
        .status-rejected { color: red; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Estado de tu Organización</h1>
        <p>Estimados representantes de ${organizationName},</p>
        
        ${
          isApproved
            ? `
          <h2 class="status-approved">¡Felicidades! Su organización ha sido aprobada</h2>
          <p>Ya puede comenzar a gestionar eventos en nuestra plataforma.</p>
        `
            : `
          <h2 class="status-rejected">Su solicitud de organización ha sido rechazada</h2>
          <p>Razón: ${reason || "No se proporcionó una razón específica"}</p>
        `
        }
        
        <p>Gracias por usar nuestra plataforma de venta de entradas.</p>
        <p>Atentamente,<br>Equipo de Soporte</p>
      </div>
    </body>
    </html>
  `;
}

// Función para enviar email de aprobación de organización
export async function sendOrganizationApprovalEmail({
  to,
  organizationName,
  status,
  reason,
}: OrganizationApprovalEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Soporte <soporte@tudominio.com>",
      to: to,
      subject:
        status === "approved"
          ? "Su organización ha sido aprobada"
          : "Solicitud de organización rechazada",
      html: OrganizationApprovalEmail({
        organizationName,
        status,
        reason,
      }),
    });

    if (error) {
      console.error("Error enviando email:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Excepción al enviar email:", err);
    return false;
  }
}

// Función para enviar email de registro de organización
export async function sendOrganizationRegistrationConfirmation(
  to: string,
  organizationName: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Soporte <soporte@tudominio.com>",
      to: to,
      subject: "Registro de Organización Recibido",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f4f4f4; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Registro Recibido</h1>
            <p>Estimados representantes de ${organizationName},</p>
            
            <p>Hemos recibido su solicitud de registro. Nuestro equipo revisará su solicitud y le notificará sobre su estado en breve.</p>
            
            <p>Gracias por usar nuestra plataforma de venta de entradas.</p>
            <p>Atentamente,<br>Equipo de Soporte</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error enviando email de confirmación:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Excepción al enviar email de confirmación:", err);
    return false;
  }
}
