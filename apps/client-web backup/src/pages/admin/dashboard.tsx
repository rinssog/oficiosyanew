import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import KpiCard from "../../components/KpiCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricsRes, docsRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/metrics`).then((r) => r.json()),
          fetch(`${API_BASE}/api/admin/documents/pending`).then((r) => r.json()),
        ]);
        if (!active) return;
        if (metricsRes.ok === false) throw new Error(metricsRes.error || "No se pudieron cargar las metricas");
        if (docsRes.ok === false) throw new Error(docsRes.error || "No se pudo cargar la documentacion");
        setMetrics(metricsRes.metrics || null);
        setPendingDocs((docsRes.pending || []).slice(0, 5));
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const navItems = useMemo(
    () => [
      { href: "/admin/dashboard", label: "KPI generales" },
      { href: "/admin/documentacion", label: "Revision de docs", badge: pendingDocs.length ? String(pendingDocs.length) : undefined },
      { href: "/admin/paginas", label: "CMS y landing" },
      { href: "/admin/reportes", label: "Reportes y SLA" },
    ],
    [pendingDocs.length],
  );

  const kpis = useMemo(() => {
    if (!metrics) return [];
    const items = [
      { title: "Prestadores verificados", value: metrics.providersVerified, helper: `${metrics.providersTotal} activos` },
      { title: "Urgencias en curso", value: metrics.urgentActive, helper: "Revisar SLA" },
      { title: "Presupuestos aceptados", value: metrics.quotesAccepted, helper: "Actualizado hoy" },
      { title: "Docs pendientes", value: metrics.documentsPending, helper: "Backoffice" },
    ];
    if (metrics.averageRating !== null && metrics.averageRating !== undefined) {
      items.push({ title: "Rating promedio", value: metrics.averageRating, helper: "Escala 1-5" });
    }
    return items;
  }, [metrics]);

  const alerts = useMemo(() => {
    if (!metrics) return [];
    const list = [];
    if (metrics.urgentActive > 3) {
      list.push({ id: "alert-urgent", message: "Hay urgencias activas. Verificar SLA.", severity: "critico" });
    }
    if (metrics.documentsPending > 0) {
      list.push({ id: "alert-docs", message: `${metrics.documentsPending} documentos requieren revision.`, severity: "observacion" });
    }
    return list;
  }, [metrics]);

  return (
    <>
      <Head>
        <title>OficiosYa | Panel administrativo</title>
      </Head>
      <NavBar />
      <DashboardShell
        title="Administracion"
        subtitle="Control integral de documentacion, SLA y monetizacion."
        navItems={navItems}
        active="/admin/dashboard"
      >
        {error && <p style={{ color: "#c62828" }}>{error}</p>}
        {loading && <p style={{ color: "#555" }}>Cargando metricas...</p>}

        {!loading && metrics && (
          <>
            <section style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {kpis.map((kpi) => (
                <KpiCard key={kpi.title} {...kpi} />
              ))}
            </section>

            <section style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "grid", gap: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary-700)" }}>Documentacion pendiente</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--text-soft)" }}>
                    <th style={{ padding: "12px" }}>Prestador</th>
                    <th style={{ padding: "12px" }}>Documento</th>
                    <th style={{ padding: "12px" }}>Estado</th>
                    <th style={{ padding: "12px" }}>Ultima carga</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDocs.map((item) => (
                    <tr key={`${item.providerId}-${item.type || "doc"}`} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", color: "var(--primary-700)" }}>{item.providerId}</td>
                      <td style={{ padding: "12px" }}>{item.label}</td>
                      <td style={{ padding: "12px" }}>{item.status}</td>
                      <td style={{ padding: "12px" }}>{item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString("es-AR") : "-"}</td>
                    </tr>
                  ))}
                  {pendingDocs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "12px", color: "#777" }}>No hay documentos pendientes de revision.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {alerts.length > 0 && (
              <section style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "grid", gap: "12px" }}>
                <h2 style={{ margin: 0, fontSize: "1.3rem", color: "var(--primary-700)" }}>Alertas</h2>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {alerts.map((alert) => (
                    <li
                      key={alert.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "14px",
                        padding: "14px",
                        background: alert.severity === "critico" ? "rgba(246, 110, 91, 0.12)" : "rgba(22, 101, 52, 0.1)",
                        color: alert.severity === "critico" ? "var(--danger)" : "var(--primary-700)",
                        fontWeight: 600,
                      }}
                    >
                      {alert.message}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </DashboardShell>
      <Footer />
    </>
  );
}
