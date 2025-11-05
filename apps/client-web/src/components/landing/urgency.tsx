import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Urgency() {
  return (
    <section className="py-10">
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <span className="text-2xl">🚨</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Asistencia rápida cuando la necesitás</h3>
          <p className="text-sm text-gray-600">
            Prestadores con habilitaciones vigentes listos para resolver urgencias domiciliarias, asegurar instalaciones y dejar registro del
            trabajo.
          </p>
        </div>
        <Button asChild className="rounded-full bg-emerald-600 px-4">
          <Link href="/client/urgencias">Conocer el servicio</Link>
        </Button>
      </div>
    </section>
  );
}
