"use client";

import { useState } from "react";
import {
  CalendarDays,
  Users,
  Bolt,
  Clock,
  FileText,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const kpis = [
  {
    title: "Servicios completados",
    value: "12",
    helper: "4 con garantía activa",
  },
  { title: "Urgencias resueltas", value: "3", helper: "Tiempo medio 27 min" },
  {
    title: "Prestadores favoritos",
    value: "6",
    helper: "Documentación 100% verificada",
  },
];

const upcomingBookings = [
  {
    id: "req_demo_1",
    service: "Mantenimiento de caldera",
    provider: "Ramirez Calefacción",
    date: "Viernes 26/09 - 09:30",
    status: "Confirmado",
  },
  {
    id: "req_demo_2",
    service: "Limpieza profunda Hogar",
    provider: "CleanPro Team",
    date: "Lunes 29/09 - 14:00",
    status: "Pendiente evidencia",
  },
];

const recommendedServices = [
  {
    id: "srv_demo_1",
    title: "Electricista para tablero IRAM",
    provider: "Lucia Pereyra",
    badge: "Matrícula al día",
  },
  {
    id: "srv_demo_2",
    title: "Paisajismo semanal",
    provider: "GreenUp",
    badge: "Suscripción preferencial",
  },
  {
    id: "srv_demo_3",
    title: "Consulta legal por UMA",
    provider: "Estudio Lopez",
    badge: "Incluye contrato editable",
  },
];

const timeline = [
  {
    time: "09:12",
    action: "OficiosYa notificó la aprobación de términos versión 1.0.3",
  },
  {
    time: "10:04",
    action:
      "Lucia Pereyra subió evidencia final y solicitaste liberación de fondos",
  },
  {
    time: "11:20",
    action:
      "Nuevo presupuesto recibido para Pintura integral - pendiente de aprobación",
  },
];

export default function Page() {
  const [tab, setTab] = useState("1");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList>
        <TabsTrigger value="1">Opción 1</TabsTrigger>
        <TabsTrigger value="2">Opción 2</TabsTrigger>
        <TabsTrigger value="3">Opción 3</TabsTrigger>
        <TabsTrigger value="4">Opción 4</TabsTrigger>
      </TabsList>

      <TabsContent value="1">
        <header className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-semibold">Cliente</h1>
            <p className="text-muted-foreground text-sm">
              Gestiona servicios, contratos, seguros y evidencias desde un único
              panel.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-xl">Solicitar nuevo servicio</Button>
            <Button variant="outline" className="rounded-xl">
              Revisar contratos
            </Button>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="rounded-2xl">
              <CardContent className="py-5">
                <div className="text-muted-foreground text-xs tracking-wide uppercase">
                  {kpi.title}
                </div>
                <div className="text-foreground mt-1 text-3xl font-semibold">
                  {kpi.value}
                </div>
                {kpi.helper ? (
                  <div className="text-muted-foreground mt-1 text-sm">
                    {kpi.helper}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Agenda confirmada</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex list-none flex-col gap-3">
                {upcomingBookings.map((item) => (
                  <li key={item.id} className="rounded-xl border p-3">
                    <strong className="text-foreground">{item.service}</strong>
                    <div className="text-muted-foreground">
                      Prestador: {item.provider}
                    </div>
                    <div className="text-muted-foreground">
                      Cuando: {item.date}
                    </div>
                    <div
                      className={
                        item.status === "Confirmado"
                          ? "text-primary"
                          : "text-destructive"
                      }
                    >
                      {item.status}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Recomendado para vos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex list-none flex-col gap-3">
                {recommendedServices.map((item) => (
                  <li key={item.id} className="rounded-xl border p-3">
                    <strong className="text-foreground">{item.title}</strong>
                    <div className="text-muted-foreground">
                      Prestador: {item.provider}
                    </div>
                    <Badge variant="secondary" className="mt-1 w-max">
                      {item.badge}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mt-5">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Línea de tiempo</CardTitle>
              <CardDescription>Eventos recientes en tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex list-none flex-col gap-3">
                {timeline.map((item, idx) => (
                  <li
                    key={`${item.time}-${idx}`}
                    className="flex items-start gap-4"
                  >
                    <span className="text-muted-foreground w-16 shrink-0 font-semibold">
                      {item.time}
                    </span>
                    <span className="text-foreground flex-1">
                      {item.action}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </TabsContent>

      {/* Design 2: KPIs row + two panels (agenda/reco) + compact timeline */}
      <TabsContent value="2">
        <header className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Cliente · Diseño 2</h1>
            <p className="text-muted-foreground text-sm">
              Versión con KPIs en fila, paneles equilibrados y timeline
              compacto.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl">
              Nuevo servicio
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl">
              Contratos
            </Button>
          </div>
        </header>

        {/* KPIs in a responsive row */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis
            .concat([
              {
                title: "Satisfacción",
                value: "4.8/5",
                helper: "Últimos 30 días",
              },
            ])
            .map((kpi) => (
              <Card key={`d2-${kpi.title}`} className="rounded-xl">
                <CardContent className="py-4">
                  <div className="text-muted-foreground text-[11px] tracking-wide uppercase">
                    {kpi.title}
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
                  {kpi.helper ? (
                    <div className="text-muted-foreground mt-0.5 text-xs">
                      {kpi.helper}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Agenda */}
          <Card className="rounded-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-base">
                <CalendarDays className="size-4" /> Agenda confirmada
              </CardTitle>
              <CardDescription>Lo próximo en tu calendario</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex list-none flex-col gap-3">
                {upcomingBookings.map((item) => (
                  <li key={`d2-${item.id}`} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-foreground">
                        {item.service}
                      </strong>
                      <Badge
                        variant={
                          item.status === "Confirmado" ? "secondary" : "default"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1 text-sm">
                      Prestador: {item.provider}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Cuando: {item.date}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recomendado */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-base">
                <Sparkles className="size-4" /> Recomendado para vos
              </CardTitle>
              <CardDescription>Sugerencias según tu actividad</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex list-none flex-col gap-3">
                {recommendedServices.map((item) => (
                  <li key={`d2-${item.id}`} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <strong className="inline-flex items-center gap-2">
                        <Star className="size-4 text-amber-500" />
                        {item.title}
                      </strong>
                      <Badge className="w-max" variant="secondary">
                        {item.badge}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1 text-sm">
                      Prestador: {item.provider}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Timeline compact */}
        <Card className="mt-5 rounded-xl">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <Clock className="size-4" /> Línea de tiempo
            </CardTitle>
            <CardDescription>Actualizaciones recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-none flex-col gap-2">
              {timeline.map((item, i) => (
                <li key={`d2-${i}`} className="flex items-start gap-3">
                  <span className="text-muted-foreground w-14 shrink-0 text-xs font-semibold">
                    {item.time}
                  </span>
                  <span className="flex-1 text-sm">{item.action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Design 3: Sidebar stats column, stacked main content with emphasized headers */}
      <TabsContent value="3">
        <header className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Cliente · Diseño 3</h1>
            <p className="text-muted-foreground text-sm">
              Versión con columna lateral de KPIs y secciones apiladas.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl">
              Nuevo servicio
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl">
              Contratos
            </Button>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr]">
          {/* Sidebar KPIs */}
          <div className="flex flex-col gap-3">
            {kpis.map((kpi, idx) => (
              <Card key={`d3-${kpi.title}`} className="rounded-xl">
                <CardContent className="py-4">
                  <div className="text-muted-foreground inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
                    {idx === 0 && <FileText className="size-3.5" />}
                    {idx === 1 && <Bolt className="size-3.5" />}
                    {idx === 2 && <Users className="size-3.5" />}
                    {kpi.title}
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
                  {kpi.helper ? (
                    <div className="text-muted-foreground mt-0.5 text-xs">
                      {kpi.helper}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content stacked */}
          <div className="flex flex-col gap-4">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-lg">
                  <CalendarDays className="size-4" /> Agenda confirmada
                </CardTitle>
                <CardDescription>Próximas visitas y trabajos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {upcomingBookings.map((item) => (
                    <div
                      key={`d3-${item.id}`}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <strong>{item.service}</strong>
                        <span
                          className={
                            item.status === "Confirmado"
                              ? "text-primary text-sm"
                              : "text-destructive text-sm"
                          }
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        {item.provider}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {item.date}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-lg">
                  <Sparkles className="size-4" /> Recomendado para vos
                </CardTitle>
                <CardDescription>Servicios destacados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendedServices.map((item) => (
                    <div
                      key={`d3-${item.id}`}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <strong>{item.title}</strong>
                        <Badge variant="secondary">{item.badge}</Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        Prestador: {item.provider}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-lg">
                  <Clock className="size-4" /> Línea de tiempo
                </CardTitle>
                <CardDescription>Actividad reciente</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="before:bg-border relative ml-2 flex list-none flex-col gap-4 before:absolute before:top-0 before:left-0 before:h-full before:w-px">
                  {timeline.map((item, idx) => (
                    <li key={`d3-${idx}`} className="relative pl-4">
                      <span className="bg-primary absolute top-1.5 -left-1 size-2 rounded-full" />
                      <div className="text-muted-foreground text-xs font-semibold">
                        {item.time}
                      </div>
                      <div className="text-sm">{item.action}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Design 4: Focused cards with prominent actions */}
      <TabsContent value="4">
        <header className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Cliente · Diseño 4</h1>
            <p className="text-muted-foreground text-sm">
              Versión compacta orientada a acciones rápidas.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="inline-flex items-center gap-1.5 rounded-xl"
            >
              <Bolt className="size-4" /> Solicitar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-xl"
            >
              <FileText className="size-4" /> Pagos
            </Button>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Resumen</CardTitle>
              <CardDescription>Indicadores clave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {kpis.map((kpi) => (
                  <div
                    key={`d4-${kpi.title}`}
                    className="rounded-lg border p-3"
                  >
                    <div className="text-muted-foreground text-[11px] tracking-wide uppercase">
                      {kpi.title}
                    </div>
                    <div className="mt-1 text-xl font-semibold">
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                Agenda y recomendaciones
              </CardTitle>
              <CardDescription>Lo urgente y lo sugerido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-medium">Agenda</div>
                  <ul className="flex list-none flex-col gap-3">
                    {upcomingBookings.map((item) => (
                      <li
                        key={`d4-${item.id}`}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between">
                          <strong>{item.service}</strong>
                          <Badge
                            variant={
                              item.status === "Confirmado"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          {item.provider}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {item.date}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium">Recomendado</div>
                  <ul className="flex list-none flex-col gap-3">
                    {recommendedServices.map((item) => (
                      <li
                        key={`d4-${item.id}`}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between">
                          <strong>{item.title}</strong>
                          <Badge>{item.badge}</Badge>
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          Prestador: {item.provider}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Línea de tiempo</CardTitle>
              <CardDescription>Movimientos recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {timeline.map((item, idx) => (
                  <div key={`d4-${idx}`} className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs font-semibold">
                      {item.time}
                    </div>
                    <div className="text-sm">{item.action}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
