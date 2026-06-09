/**
 * pages/admin/dashboard.js — Panel de administración central
 */
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import KpiCard from "../../components/KpiCard";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

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

export default function AdminDashboard() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [metrics,     setMetrics]     = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [claims,      setClaims]      = useState({ pending: 0, open: 0 });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "ADMIN") { router.replace("/"); return; }
    loadAll();
  }, [isReady, user]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, docsRes, claimsRes] = await Promise.allSettled([
        apiRequest("/api/admin/metrics"),
        apiRequest("/api/admin/documents/pending"),
        apiRequest("/api/admin/claims?status=PENDING"),
      ]);

      if (metricsRes.status === "fulfilled" && metricsRes.value?.ok) {
        setMetrics(metricsRes.value.metrics || null);
      }
      if (docsRes.status === "fulfilled" && docsRes.value?.ok) {
        setPendingDocs((docsRes.value.pending || []).slice(0, 5));
      }
      if (claimsRes.status === "fulfilled" && claimsRes.value?.ok) {
        const cl = claimsRes.value.claims || [];
        setClaims({
          pending: cl.filter(c => c.status === "PENDING").length,
          open:    cl.filter(c => c.status === "OPEN").length,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const navItems = useMemo(() => [
    ...ADMIN_NAV.slice(0, 2),
    { ...ADMIN_NAV[2], badge: pendingDocs.length ? String(pendingDocs.length) : undefined },
    ...ADMIN_NAV.slice(3, 4),
    { ...ADMIN_NAV[4], badge: (claims.pending + claims.open) > 0 ? String(claims.pending + claims.open) : undefined },
    ...ADMIN_NAV.slice(5),
  ], [pendingDocs.length, claims]);

  const kpis = useMemo(() => {
    if (!metrics) return [];
    return [
      { title: "Prestadores verificados", value: metrics.providersVerified ?? "—", helper: `${metrics.providersTotal ?? 0} activos`, icon: "🛠️", color: "var(--primary)" },
      { title: "Urgencias activas",       value: metrics.urgentActive ?? 0,         helper: "SLA 2h",                                icon: "🚨", color: "var(--danger)" },
      { title: "Presupuestos aceptados",  value: metrics.quotesAccepted ?? 0,        helper: "Total histórico",                        icon: "📋", color: "var(--info)" },
      { title: "Reclamos pendientes",     value: claims.pending + claims.open,       helper: "Requieren atención",                    icon: "⚠️", color: "var(--warning)" },
      { title: "Docs pendientes",         value: metrics.documentsPending ?? 0,      helper: "KYC por revisar",                        icon: "🪪", color: "var(--gold)" },
      ...(metrics.averageRating != null ? [{ title: "Rating promedio", value: Number(metrics.averageRating).toFixed(1), helper: "Escala 1-5", icon: "⭐", color: "var(--warning)" }] : []),
    ];
  }, [metrics, claims]);

  const alerts = useMemo(() => {
    const list = [];
    if (!metrics) return list;
    if (metrics.urgentActive > 3) list.push({ id: "urgent", msg: `🚨 ${metrics.urgentActive} urgencias activas — revisar SLA`, sev: "critico" });
    if (metrics.documentsPending > 0) list.push({ id: "docs", msg: `🪪 ${metrics.documentsPending} documentos KYC pendientes de revisión`, sev: "warning" });
    if ((claims.pending + claims.open) > 5) list.push({ id: "claims", msg: `⚠️ ${claims.pending + claims.open} reclamos sin resolver — atender hoy`, sev: "critico" });
    return list;
  }, [metrics, claims]);

  if (!isReady || !user) return null;

  return (
    <>
      <Head><title>Panel Admin · OficiosYa</title></Head>
      <NavBar />
      <DashboardShell
        title="Panel de Administración"
        subtitle="Control integral de la plataforma — KPIs, documentación y gestión."
        navItems={navItems}
        active="/admin/dashboard"
        rightSlot={
          <button className="btn btn-ghost btn-sm" onClick={loadAll}>🔄</button>
        }
      >
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* KPIs */}
        <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {loading
            ? [1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)
            : kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)
          }
        </section>

        {/* Alertas */}
        {!loading && alerts.length > 0 && (
          <section>
            <h3 style={{ color: F, fontSize: 15, fontWeight: 800, marginBottom: 10 }}>⚡ Alertas activas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.map(a => (
                <div key={a.id} style={{
                  padding: "12px 16px", borderRadius: 12, fontWeight: 600, fontSize: 13,
                  background: a.sev === "critico" ? "#FEF2F2" : "#FFFBEB",
                  color:      a.sev === "critico" ? "#DC2626"  : "#92400E",
                  border:     `1px solid ${a.sev === "critico" ? "#FECACA" : "#FDE68A"}`,
                }}>
                  {a.msg}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accesos rápidos */}
        <section>
          <h3 style={{ color: F, fontSize: 15, fontWeight: 800, marginBottom: 14 }}>🔗 Accesos rápidos</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
            {[
              { label: "📝 Reclamos", href: "/admin/reclamos", accent: "#DC2626" },
              { label: "🪪 Verificar docs", href: "/admin/verificaciones", accent: "#D97706" },
              { label: "👤 Usuarios", href: "/admin/users", accent: V },
              { label: "💬 Chat/Mod", href: "/admin/chat-alerts", accent: "#7C3AED" },
              { label: "💰 Escrow", href: "/admin/escrow", accent: "#1D4ED8" },
              { label: "⭐ Ratings", href: "/admin/ratings", accent: "#92400E" },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#fff", border: "1.5px solid var(--border)", borderRadius: 14,
                  padding: "16px 14px", textAlign: "center", cursor: "pointer", transition: "all .15s",
                  borderLeft: `4px solid ${a.accent}`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F7F9F5"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ fontWeight: 700, color: F, fontSize: 13 }}>{a.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Documentación pendiente */}
        {!loading && (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ color: F, fontSize: 15, fontWeight: 800, margin: 0 }}>🪪 KYC — Documentación pendiente</h3>
              <Link href="/admin/verificaciones">
                <button className="btn btn-ghost btn-sm">Ver todos →</button>
              </Link>
            </div>
            <div className="card-flat">
              {pendingDocs.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>✅ Sin documentos pendientes de revisión</p>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Prestador</th>
                        <th>Documento</th>
                        <th>Estado</th>
                        <th>Última carga</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDocs.map(item => (
                        <tr key={`${item.providerId}-${item.type || "doc"}`}>
                          <td style={{ fontWeight: 600, color: F }}>{item.providerId?.slice(0, 10) || "—"}</td>
                          <td>{item.label || item.type || "—"}</td>
                          <td>
                            <span style={{ background: "#FFFBEB", color: "#92400E", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                            {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString("es-AR") : "—"}
                          </td>
                          <td>
                            <Link href={`/admin/verificaciones?providerId=${item.providerId}`}>
                              <button className="btn btn-ghost btn-sm">Revisar</button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

      </DashboardShell>
      <Footer />
    </>
  );
}
