import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="grid gap-8 py-10 md:grid-cols-2 md:items-center md:py-16">
      <div className="space-y-6">
        <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
          Plataforma integral de oficios y servicios
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Registrate y gestioná todos tus prestadores desde un solo lugar
        </h1>
        <p className="max-w-prose text-base text-gray-600 md:text-lg">
          Ingresá como cliente para solicitar trabajos, coordinar agenda, seguir evidencias y calificar a profesionales con documentación
          validada por nuestro backoffice.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="rounded-full bg-emerald-600 px-6">
            <a href="/auth/register">Crear cuenta</a>
          </Button>
          <Button asChild variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
            <a href="/auth/login?role=provider">Soy prestador verificado</a>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <a href="/soporte#validacion-identidad">Ver cómo verificamos prestadores</a>
          </Button>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>Documentación y matrículas validadas por humanos</li>
          <li>Retención operativa del 50% — sin señas ni letra chica</li>
          <li>Urgencias 24/7 con tiempos controlados y trazabilidad</li>
        </ul>
        <div className="text-sm text-emerald-800">
          Backoffice 9–19 hs · Evidencias digitales · Cumplimiento Defensa del Consumidor
        </div>
      </div>
      <div className="flex justify-center md:justify-end">
        <img className="max-w-full" src="/assets/hero-illustration.svg" alt="Panel OficiosYa" />
      </div>
    </section>
  );
}
