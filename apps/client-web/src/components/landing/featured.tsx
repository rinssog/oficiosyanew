import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type Provider = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviews: number;
  services: string[];
  verified?: boolean;
  response?: string;
};

export default function Featured({ items }: { items: Provider[] }) {
  return (
    <section className="space-y-6 py-6">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900">Prestadores destacados</h2>
        <p className="text-sm text-gray-600">Perfiles con documentación completa, agenda activa y métricas de respuesta controladas.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((provider) => (
          <Card key={provider.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src={provider.avatar} alt={provider.name} />
                <AvatarFallback>{provider.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-gray-900">{provider.name}</strong>
                  {provider.verified ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Verificado</Badge>
                  ) : null}
                </div>
                <span className="block text-sm text-gray-600">{provider.role}</span>
                <span className="block text-xs text-gray-500">Rating {provider.rating.toFixed(1)} ({provider.reviews})</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                {provider.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{provider.response}</span>
                <span>Agenda digital</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button asChild className="px-4">
                <Link href={`/providers/${provider.id}`}>Ver perfil</Link>
              </Button>
              <Button asChild variant="secondary" className="px-4">
                <Link href={`/providers/${provider.id}?tab=evidencias`}>Evidencias</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
