import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Trust() {
  return (
    <section id="validacion" className="grid gap-6 py-10 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Verificación documental y seguridad legal</h2>
        <p className="text-sm text-gray-600">
          El equipo de OficiosYa valida cada credencial antes de habilitar un perfil. Todas las aceptaciones de términos generan hash, IP y
          timestamp para auditoría, cumpliendo con la Ley de Defensa del Consumidor.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>DNI frente y dorso + antecedentes penales GEDO</li>
          <li>Matrículas y seguros obligatorios por rubro</li>
          <li>Retención operativa del 50% para urgencias (no seña)</li>
        </ul>
        <Button asChild variant="outline" className="w-fit rounded-full">
          <Link href="/soporte#validacion-identidad">Checklist completo de verificación</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">Backoffice dedicado</h3>
          <p className="text-sm text-gray-600">Operamos lunes a viernes de 9 a 19 hs y atendemos urgencias críticas fuera de horario.</p>
        </article>
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">Agenda auditada</h3>
          <p className="text-sm text-gray-600">Cancelaciones y reprogramaciones quedan registradas con trazabilidad y notificación automática.</p>
        </article>
        <article className="rounded-lg border bg-white p-4 shadow-sm sm:col-span-2">
          <h3 className="font-semibold text-gray-900">Denuncias y soporte</h3>
          <p className="text-sm text-gray-600">Canal exclusivo para reportar irregularidades y suspender cuentas de forma preventiva.</p>
        </article>
      </div>
    </section>
  );
}
