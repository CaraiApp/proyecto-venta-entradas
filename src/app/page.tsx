// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Nota: En producción, estos datos vendrían de la base de datos
const featuredEvents = [
  {
    id: "1",
    name: "Concierto de Rock",
    location: "Estadio Municipal",
    date: "15 de diciembre, 2023",
    imageUrl: "/images/placeholder-event.jpg",
  },
  {
    id: "2",
    name: "Festival de Jazz",
    location: "Parque Central",
    date: "20 de enero, 2024",
    imageUrl: "/images/placeholder-event.jpg",
  },
  {
    id: "3",
    name: "Obra de Teatro: Romeo y Julieta",
    location: "Teatro Nacional",
    date: "5 de febrero, 2024",
    imageUrl: "/images/placeholder-event.jpg",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Encuentra los mejores eventos
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Compra entradas para los eventos más populares de tu ciudad.
              Conciertos, teatro, deportes y mucho más.
            </p>
            <div className="mt-10">
              <Link href="/events">
                <Button
                  size="lg"
                  variant="primary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Ver todos los eventos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured events section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Eventos Destacados
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg"
            >
              <div className="h-48 bg-gray-200">
                {/* Replace with actual image when available */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Imagen del evento
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {event.name}
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>{event.location}</p>
                  <p>{event.date}</p>
                </div>
                <div className="mt-4">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline" className="w-full">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/events">
            <Button variant="secondary">Ver todos los eventos</Button>
          </Link>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Cómo funciona
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
                1
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Encuentra tu evento
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Explora nuestra selección de eventos y encuentra el que más te
                guste.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
                2
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Compra tus entradas
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Selecciona tus asientos y realiza el pago de forma segura.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
                3
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Disfruta del evento
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Recibe tus entradas en tu móvil y preséntate el día del evento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
