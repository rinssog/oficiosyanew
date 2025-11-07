import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HydrateClient } from "@/trpc/server";

export const metadata = {
  title: "Planes OficiosYa | Suscripciones para clientes y prestadores",
};

const CLIENT_PLANS = [
  {
    name: "Plan Esencial",
    price: "$0",
    summary: "Solicita prestadores verificados cuando lo necesites.",
    perks: ["Agenda compartida", "Evaluaciones y resenas", "Soporte por chat"],
  },
  {
    name: "Plan Plus",
    price: "$3.200",
    summary: "Pensado para hogares y oficinas con prioridad de atencion.",
    perks: [
      "Visita preventiva anual",
      "Garantia extendida",
      "Linea de ayuda 7x24",
    ],
    highlight: true,
  },
  {
    name: "Plan Premium",
    price: "$6.900",
    summary: "Ideal para consorcios y empresas con multiples locaciones.",
    perks: [
      "Gestor asignado",
      "Reportes mensuales",
      "Cobertura multi-propiedad",
    ],
  },
];

const PROVIDER_BENEFITS = [
  {
    tier: "Basico",
    color: "#9ca3af",
    perks: [
      "Publicacion de servicios",
      "Agenda manual",
      "Cobranza a traves de la plataforma",
    ],
  },
  {
    tier: "Plus",
    color: "#b4c2ff",
    perks: [
      "Prioridad en resultados",
      "Estadisticas de desempeno",
      "Asesoria para licitaciones",
    ],
  },
  {
    tier: "Elite",
    color: "#d4af37",
    perks: [
      "Cuenta ejecutiva",
      "Campanas promocionadas",
      "Mesa de soporte dedicada",
    ],
  },
];

export default async function PlansPage() {
  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto max-w-7xl flex-1 px-4 py-10 md:px-8 md:py-14">
          <section className="py-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Suscripciones flexibles para clientes y prestadores
              </h1>
              <p className="max-w-prose text-sm text-gray-600 md:text-base">
                Desde tu cuenta master podes activar, pausar o personalizar cada
                plan. Ajusta beneficios, limites y precios segun tu estrategia
                comercial.
              </p>
            </div>
          </section>

          <section className="space-y-6 py-6">
            <header>
              <h2 className="text-2xl font-semibold text-gray-900">
                Planes para clientes
              </h2>
              <p className="text-sm text-gray-600">
                Elegi como queres delegar la gestion de oficios, mantenimiento y
                urgencias.
              </p>
            </header>
            <div className="grid gap-4 md:grid-cols-3">
              {CLIENT_PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={plan.highlight ? "border-emerald-300" : undefined}
                >
                  <CardHeader>
                    <CardTitle className="space-y-1">
                      <span className="block text-lg font-semibold text-gray-900">
                        {plan.name}
                      </span>
                      <span className="block text-2xl font-bold text-gray-900">
                        {plan.price}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          por mes
                        </span>
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm text-gray-600">{plan.summary}</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                      {plan.perks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-6 py-6">
            <header>
              <h2 className="text-2xl font-semibold text-gray-900">
                Beneficios para prestadores
              </h2>
              <p className="text-sm text-gray-600">
                Configura desde la cuenta master que incluye cada nivel y como
                se acreditan los pagos.
              </p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROVIDER_BENEFITS.map((plan) => (
                <div
                  key={plan.tier}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                  style={{ borderTopColor: plan.color, borderTopWidth: 3 }}
                >
                  <strong className="text-emerald-800">{plan.tier}</strong>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                    {plan.perks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 py-6">
            <header>
              <h2 className="text-2xl font-semibold text-gray-900">
                Como editar los planes?
              </h2>
            </header>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
              <li>
                Ingresa con tu cuenta master y abre el panel de administracion.
              </li>
              <li>
                Desde &quot;Planes y beneficios&quot; podes modificar precios,
                perks y cupos.
              </li>
              <li>
                Los cambios impactan de inmediato en la landing y en los paneles
                de clientes y prestadores.
              </li>
            </ol>
          </section>
        </main>
        <Footer />
      </div>
    </HydrateClient>
  );
}
