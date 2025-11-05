import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Category = {
  name: string;
  description: string;
  href: string;
  badge?: string;
};

export default function Catalog({ items }: { items: Category[] }) {
  return (
    <section className="space-y-6 py-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Buscá por rubro</h2>
          <p className="text-sm text-gray-600">
            Elegí el servicio que necesitás y recibí presupuestos de prestadores verificados.
          </p>
        </div>
        <Link href="/client/buscar" className="text-sm font-medium text-emerald-700 hover:underline">
          Ver buscador completo
        </Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.name} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {item.badge ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{item.badge}</Badge>
                ) : null}
                <span>{item.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{item.description}</p>
            </CardContent>
            <CardFooter>
              <Link className="text-sm font-medium text-emerald-700 hover:underline" href={item.href}>
                Explorar rubro
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
