import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import KpiCard from "../../components/KpiCard";
import TermsModal from "../../components/TermsModal";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

const navItems = [
  { href: "/client/dashboard",  label: "Panel general" },
  { href: "/client/urgencias",  label: "Urgencias 24/7", badge: "24/7" },
  { href: "/client/contratos",  label: "Contratos y seguros" },
  { href: "/client/facturacion",label: "Pagos y facturas" },
];

const STATUS_LABELS = {
  PENDING:       "⏳ Pendiente",
  QUOTE_PENDING: "📋 En presupuesto",
  ACCEPTED:      "✅ Aceptado",
  IN_PROGRESS:   "🔧 En progreso",
  DONE:          "✔️ Completado",
  CANCELLED:     "❌ Cancelado",
};
const STATUS_COLORS = {
  PENDING: "#6B7280", QUOTE_PENDING: "#1D4ED8", ACCEPTED: "#16A34A",
  IN_PROGRESS: "#D97706", DONE: "#166534", CANCELLED: "#DC2626",
};

export default function ClientDashboard() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    // Mostrar terms modal solo si es la primera vez (no hay flag en localStorage)
    const seen = typeof window !== "undefined" && localStorage.getItem("terms_accepted");
    if (!seen) setShowTerms(true);
    loadSummary();
  }, [isReady, user]);

  async function loadSummary() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/client/summary");
      if (data.ok) setSummary(data.summary);
    } catch {}
    setLoading(false);
  }

  function acceptTerms() {
    if (typeof window !== "undefined") localStorage.setItem("terms_accepted", "1");
    setShowTerms(false);
  }

  if (!isReady || !user) return null;

  const kpis = [
    {
      title: "Servicios activos",
      value: loading ? "…" : String(summary?.activeRequests ?? 0),
      helper: loading ? "" : `${summary?.completedJobs ?? 0} completados en total`,
    },
    {
      title: "Presupuestos pendientes",
      value: loading ? "…" : String(summary?.pendingQuotes ?? 0),
      helper: "Esperando tu aprobación",
    },
    {
      title: "Total de solicitudes",
      value: loading ? "…" : String(summary?.totalRequests ?? 0),
      helper: "Histórico de tu cuenta",
    },
  ];

  return (
    <>
      <Head><title>OficiosYa | Panel del cliente</title></Head>
      <NavBar />
      <DashboardShell
        title={`Hola, ${user.name?.split(" ")[0] || "cliente"} 👋`}
        subtitle="Gestioná tus servicios, contratos y pagos desde un único panel."
        navItems={navItems}
        active="/client/dashboard"
        rightSlot={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/client/buscar">
              <button style={{ background: F, color: "#fff", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}>
                + Solicitar servicio
              </button>
            </Link>
            <Link href="/client/contratos">
              <button style={{ background: "rgba(22,101,52,0.12)", color: F, border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 600, cursor: "pointer" }}>
                Contratos
              </button>
            </Link>
          </div>
        }
      >
        {/* KPIs reales */}
        <section style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {kpis.map(k => <KpiCard key={k.title} {...k} />)}
        </section>

        {/* Próximas citas */}
        <section style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: "1.4rem", color: F }}>📅 Próximas citas</h2>
            {loading ? (
              <p style={{ color: "#9CA3AF" }}>Cargando...</p>
            ) : !summary?.upcoming?.length ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <p style={{ fontSize: 14, margin: 0 }}>No tenés servicios programados.</p>
                <Link href="/client/buscar">
                  <button style={{ marginTop: 12, background: V, color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                    Buscar prestador →
                  </button>
                </Link>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {summary.upcoming.map(r => (
                  <li key={r.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: F, fontSize: 14 }}>{r.notes || "Servicio programado"}</span>
                      <span style={{ background: "#F0FDF4", color: STATUS_COLORS[r.status] || "#6B7280", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </div>
                    {r.date && <span style={{ color: "#6B7C6E", fontSize: 12 }}>🗓️ {r.date}</span>}
                    {r.urgent && <span style={{ color: "#DC2626", fontSize: 12, fontWeight: 700 }}>🚨 Urgente</span>}
                    <Link href={`/client/solicitud/${r.id}`} style={{ color: V, fontSize: 12, fontWeight: 700 }}>Ver detalles →</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actividad reciente */}
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: "1.4rem", color: F }}>🕐 Actividad reciente</h2>
            {loading ? (
              <p style={{ color: "#9CA3AF" }}>Cargando...</p>
            ) : !summary?.recent?.length ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <p style={{ fontSize: 14, margin: 0 }}>Sin actividad reciente.</p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {summary.recent.map(r => (
                  <li key={r.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>
                      {r.status === "DONE" ? "✅" : r.status === "CANCELLED" ? "❌" : r.status === "IN_PROGRESS" ? "🔧" : "📋"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: F, fontSize: 13 }}>{r.notes || `Solicitud ${r.id.slice(0, 8)}`}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                        {STATUS_LABELS[r.status] || r.status}
                        {r.updatedAt && ` · ${new Date(r.updatedAt).toLocaleDateString("es-AR")}`}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Accesos rápidos */}
        <section style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "1.3rem", color: F }}>⚡ Accesos rápidos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
            {[
              { icon: "🚨", label: "Urgencias 24/7",  href: "/client/urgencias" },
              { icon: "🔍", label: "Buscar prestador", href: "/client/buscar" },
              { icon: "📄", label: "Contratos",        href: "/client/contratos" },
              { icon: "💳", label: "Pagos y facturas", href: "/client/facturacion" },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{ background: "#F7F9F5", border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "16px 12px", textAlign: "center", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.background = "#F0FDF4"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#D4E0D6"; e.currentTarget.style.background = "#F7F9F5"; }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: F }}>{item.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </DashboardShell>
      <Footer />
      <TermsModal open={showTerms} onConfirm={acceptTerms} />
    </>
  );
}
