import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type Plan = {
  name: string;
  price: string;
  summary: string;
  perks: string[];
  accent?: string;
  savings?: string;
  highlight?: boolean;
};

export default function Plans({ items }: { items: Plan[] }) {
  return (
    <section className="space-y-6 py-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Suscripciones para clientes</h2>
          <p className="text-sm text-gray-600">Elegí el plan que te permite delegar tareas y recibir soporte a medida.</p>
        </div>
        <Link href="/planes" className="text-sm font-medium text-emerald-700 hover:underline">
          Comparar planes
        </Link>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((plan) => (
          <Card key={plan.name} className={plan.highlight ? "border-emerald-300" : undefined}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                {plan.savings ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{plan.savings}</Badge>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold text-gray-900">
                {plan.price} <span className="text-sm font-normal text-gray-500">por mes</span>
              </p>
              <p className="text-sm text-gray-600">{plan.summary}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/planes">Solicitar información</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
