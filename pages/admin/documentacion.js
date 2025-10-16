import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function AdminDocs() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/admin/documents/pending`);
        const data = await res.json();
        if (!active) return;
        if (data.ok === false) throw new Error(data.error || "No se pudo obtener la cola");
        setQueue(data.pending || []);
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

  const navItems = useMemo(() => [
    { href: "/admin/dashboard", label: "KPI generales" },
    { href: "/admin/documentacion", label: "Revision de docs", badge: queue.length ? String(queue.length) : undefined },
    { href: "/admin/paginas", label: "CMS y landing" },
    { href: "/admin/reportes", label: "Reportes y SLA" },
  ], [queue.length]);

  return (
    <>
      <Head>
        <title>OficiosYa | Revision documentacion</title>
      </Head>
      <NavBar />
      <DashboardShell
        title="Revision de documentacion"
        subtitle="Backoffice para aprobar, rechazar u observar archivos cargados por prestadores."
        navItems={navItems}
        active="/admin/documentacion"
      >
        {error && <p style={{ color: "#c62828" }}>{error}</p>}
        {loading && <p style={{ color: "#555" }}>Cargando cola de revision...</p>}

        {!loading && (
          <section style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "grid", gap: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary-700)" }}>Cola de revision</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-soft)" }}>
                  <th style={{ padding: "12px" }}>Prestador</th>
                  <th style={{ padding: "12px" }}>Documento</th>
                  <th style={{ padding: "12px" }}>Estado</th>
                  <th style={{ padding: "12px" }}>Enviado</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={`${item.providerId}-${item.type || "doc"}`} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px", color: "var(--primary-700)" }}>{item.providerId}</td>
                    <td style={{ padding: "12px" }}>{item.label}</td>
                    <td style={{ padding: "12px" }}>{item.status}</td>
                    <td style={{ padding: "12px" }}>{item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString("es-AR") : "-"}</td>
                  </tr>
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "12px", color: "#777" }}>No hay documentos pendientes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </DashboardShell>
      <Footer />
    </>
  );
}
