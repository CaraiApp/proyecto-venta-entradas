// src/app/layout.tsx
import "./globals.css";
import { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Definir metadatos para SEO
export const metadata: Metadata = {
  title: {
    template: "%s | Plataforma de Venta de Entradas",
    default: "Plataforma de Venta de Entradas",
  },
  description:
    "Compra entradas para tus eventos favoritos de forma segura y rápida",
  keywords: [
    "entradas",
    "eventos",
    "conciertos",
    "teatro",
    "tickets",
    "venta online",
  ],
  authors: [{ name: "VentaEntradas" }],
  creator: "VentaEntradas",
  publisher: "VentaEntradas",
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
