/**
 * pages/admin/reportes.js — Reportes y SLA
 */
import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import KpiCard from "../../components/KpiCard";
import { useAuth } from "../../contexts/AuthContext";

const ADMIN_NAV = [
  { href: "/admin/dashboard",      label: "KPI generales" },
  { href: "/admin/users",          label: "Usuarios" },
  { href: "/admin/verificaciones", label: "Verificaciones" },
  { href: "/admin/solicitudes",    label: "Solicitudes" },
  { href: "/admin/reclamos",       label: "📝 Reclamos" },
  { href: "/admin/escrow",         label: "Escrow" },
  { href: "/admin/ratings",        label: "Calificaciones" },
  { href: "/admin/chat-alerts",    label: "Chat/Alertas" },
  { href: "/admin/documentacion",  label: "CMS Docs" },
  { href: "/admin/reportes",       label: "Reportes" },
];

const slaMetrics = [
  { title: "SLA urgencias",      value: "—",  helper: "Objetivo 25 min",  icon: "🚨", color: "var(--danger)" },
  { title: "SLA documentos",     value: "—",  helper: "Objetivo 12 h",    icon: "🪪", color: "var(--warning)" },
  { title: "Fuga off-platform",  value: "—",  helper: "Objetivo < 8%",    icon: "⚠️", color: "var(--info)" },
  { title: "Reclamos resueltos", value: "—",  helper: "Últimos 30 días",  icon: "✅", color: "var(--primary)" },
];

export default function AdminReports() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "ADMIN") { router.replace("/"); return; }
  }, [isReady, user]);

  if (!isReady || !user || user.role !== "ADMIN") return null;

  return (
    <>
      <Head><title>Reportes y SLA · OficiosYa Admin</title></Head>
      <NavBar />
      <DashboardShell
        title="Reportes y SLA"
        subtitle="Monitoreo de tiempos de respuesta, cumplimiento de SLA y métricas operativas."
        navItems={ADMIN_NAV}
        active="/admin/reportes"
      >
        <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {slaMetrics.map(m => <KpiCard key={m.title} {...m} />)}
        </section>

        <div className="card-flat">
          <h3 style={{ margin: "0 0 12px", color: "var(--primary-700)", fontSize: 16, fontWeight: 800 }}>📋 Estado de implementación</h3>
          <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8 }}>
            <div>✅ Chat moderación automática activa</div>
            <div>✅ Rate limiting en endpoints de autenticación</div>
            <div>✅ HSTS + CSP habilitados en producción</div>
            <div>✅ Sistema de reclamos con prioridad automática</div>
            <div>✅ Escrow / pago en custodia operativo</div>
            <div>🔜 Dashboard de SLA en tiempo real (próximo sprint)</div>
            <div>🔜 Exportación CSV de reportes</div>
            <div>🔜 Alertas por email a admins (próximo sprint)</div>
          </div>
        </div>

        <div className="alert alert-info" style={{ fontSize: 13 }}>
          💡 Los reportes en tiempo real se integrarán con el motor de reglas y auditoría en el siguiente sprint.
          Exportación a CSV y envío programado por email disponibles para la versión 1.1.
        </div>
      </DashboardShell>
      <Footer />
    </>
  );
}
