import { useMemo, useState } from "react";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import KpiCard from "../../components/KpiCard";
import TermsModal from "../../components/TermsModal";

const navItems = [
  { href: "/client/dashboard", label: "Panel general" },
  { href: "/client/urgencias", label: "Urgencias 24/7", badge: "nuevo" },
  { href: "/client/contratos", label: "Contratos y seguros" },
  { href: "/client/facturacion", label: "Pagos y facturas" },
];

const kpis = [
  { title: "Servicios completados", value: "12", helper: "4 con garantia activa" },
  { title: "Urgencias resueltas", value: "3", helper: "Tiempo medio 27 min" },
  { title: "Prestadores favoritos", value: "6", helper: "Documentacion 100% verificada" },
];

const upcomingBookings = [
  {
    id: "req_demo_1",
    service: "Mantenimiento de caldera",
    provider: "Ramirez Calefaccion",
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
    badge: "Matricula al dia",
  },
  {
    id: "srv_demo_2",
    title: "Paisajismo semanal",
    provider: "GreenUp",
    badge: "Suscripcion preferencial",
  },
  {
    id: "srv_demo_3",
    title: "Consulta legal por UMA",
    provider: "Estudio Lopez",
    badge: "Incluye contrato editable",
  },
];

const timeline = [
  { time: "09:12", action: "OficiosYa notifico la aprobacion de terminos version 1.0.3" },
  { time: "10:04", action: "Lucia Pereyra subio evidencia final del trabajo y solicitaste liberacion de fondos" },
  { time: "11:20", action: "Nuevo presupuesto recibido para Pintura integral - pendiente de aprobacion" },
];

export default function ClientDashboard() {
  const [showTerms, setShowTerms] = useState(true);

  const rightSlot = useMemo(
    () => (
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          style={{
            background: "var(--primary-700)",
            color: "var(--primary-contrast)",
            border: "none",
            borderRadius: "12px",
            padding: "10px 16px",
            fontWeight: 600,
          }}
        >
          Solicitar nuevo servicio
        </button>
        <button
          type="button"
          style={{
            background: "rgba(22, 101, 52, 0.12)",
            color: "var(--primary-700)",
            border: "none",
            borderRadius: "12px",
            padding: "10px 16px",
            fontWeight: 600,
          }}
        >
          Revisar contratos
        </button>
      </div>
    ),
    [],
  );

  return (
    <>
      <Head>
        <title>OficiosYa | Panel del cliente</title>
      </Head>
      <NavBar />
      <DashboardShell
        title="Cliente"
        subtitle="Gestiona servicios, contratos, seguros y evidencias desde un unico panel."
        navItems={navItems}
        active="/client/dashboard"
        rightSlot={rightSlot}
      >
        <section style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </section>

        <section style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <div style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary-700)" }}>Agenda confirmada</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
              {upcomingBookings.map((item) => (
                <li key={item.id} style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <strong style={{ color: "var(--primary-700)" }}>{item.service}</strong>
                  <span style={{ color: "var(--text-soft)" }}>Prestador: {item.provider}</span>
                  <span style={{ color: "var(--text-soft)" }}>Cuando: {item.date}</span>
                  <span style={{ color: item.status === "Confirmado" ? "var(--primary-700)" : "var(--danger)" }}>{item.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary-700)" }}>Recomendado para vos</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {recommendedServices.map((item) => (
                <li key={item.id} style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <strong style={{ color: "var(--primary-700)" }}>{item.title}</strong>
                  <span style={{ color: "var(--text-soft)" }}>Prestador: {item.provider}</span>
                  <span style={{ background: "rgba(22, 101, 52, 0.12)", color: "var(--primary-700)", borderRadius: "12px", padding: "4px 8px", alignSelf: "flex-start", fontSize: "0.8rem", fontWeight: 600 }}>{item.badge}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "grid", gap: "18px" }}>
          <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary-700)" }}>Linea de tiempo</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {timeline.map((item, index) => (
              <li key={`${item.time}-${index}`} style={{ display: "flex", gap: "14px" }}>
                <span style={{ width: "70px", color: "var(--text-soft)", fontWeight: 600 }}>{item.time}</span>
                <span style={{ flex: 1, color: "var(--text)" }}>{item.action}</span>
              </li>
            ))}
          </ul>
        </section>
      </DashboardShell>
      <Footer />
      <TermsModal open={showTerms} onConfirm={() => setShowTerms(false)} />
    </>
  );
}

