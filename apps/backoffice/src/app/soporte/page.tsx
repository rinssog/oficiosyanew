import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { HydrateClient } from "@/trpc/server";

export const metadata = {
  title: "Soporte · OficiosYa",
};

export default function SoportePage() {
  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Centro de ayuda
          </h1>
          <p className="text-sm text-gray-700">
            Muy pronto verás aquí nuestro centro de soporte con preguntas
            frecuentes, chat humano y seguimiento de reclamos.
          </p>
          <p className="mt-3 text-sm text-gray-700">
            Si necesitás asistencia inmediata, envíanos un correo a{" "}
            <a
              href="mailto:atencion.oficiosya@gmail.com"
              className="text-emerald-700 underline hover:text-emerald-800"
            >
              atencion.oficiosya@gmail.com
            </a>
            .
          </p>
        </main>
        <Footer />
      </div>
    </HydrateClient>
  );
}
