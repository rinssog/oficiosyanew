import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";

const navItems = [
  { href: "/client/dashboard", label: "Panel general" },
  { href: "/client/urgencias", label: "Urgencias 24/7" },
  { href: "/client/contratos", label: "Contratos y seguros" },
  { href: "/client/facturacion", label: "Pagos y facturas" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function ClientContracts() {
  const [templates, setTemplates] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currency = useMemo(() => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }), []);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tplRes, insRes] = await Promise.all([
          fetch(`${API_BASE}/api/client/contracts`).then((r) => r.json()),
          fetch(`${API_BASE}/api/client/insurances`).then((r) => r.json()),
        ]);
        if (active) {
          if (tplRes.ok === false) throw new Error(tplRes.error || "No se pudieron cargar los contratos");
          if (insRes.ok === false) throw new Error(insRes.error || "No se pudieron cargar los seguros");
          setTemplates(tplRes.templates || []);
          setInsurances(insRes.products || []);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>OficiosYa | Contratos y seguros</title>
      </Head>
      <NavBar />
      <DashboardShell
        title="Contratos y seguros"
        subtitle="Consulta modelos editables, aceptaciones con hash y polizas asociadas a cada servicio."
        navItems={navItems}
        active="/client/contratos"
      >
        {error && <p style={{ color: "#c62828" }}>{error}</p>}
        {loading && <p style={{ color: "#555" }}>Cargando informacion de contratos y seguros...</p>}

        {!loading && (
          <>
            <section style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "grid", gap: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary-700)" }}>Modelos disponibles</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--text-soft)" }}>
                    <th style={{ padding: "12px" }}>Nombre</th>
                    <th style={{ padding: "12px" }}>Version</th>
                    <th style={{ padding: "12px" }}>Actualizacion</th>
                    <th style={{ padding: "12px" }}>Alcance</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl) => (
                    <tr key={tpl.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", color: "var(--primary-700)" }}>{tpl.name}</td>
                      <td style={{ padding: "12px" }}>{tpl.version}</td>
                      <td style={{ padding: "12px" }}>{new Date(tpl.lastUpdated).toLocaleDateString("es-AR")}</td>
                      <td style={{ padding: "12px" }}>{tpl.scope}</td>
                    </tr>
                  ))}
                  {templates.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "12px", color: "#777" }}>
                        No hay modelos disponibles por el momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {insurances.map((item) => (
                <div
                  key={item.id}
                  style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "22px", display: "flex", flexDirection: "column", gap: "8px" }}
                >
                  <strong style={{ color: "var(--primary-700)" }}>{item.name}</strong>
                  <span style={{ color: "var(--text-soft)" }}>Cobertura: {currency.format(item.coverage || 0)}</span>
                  <span style={{ color: "var(--text-soft)" }}>Partner: {item.partner}</span>
                  {item.renewalDate && (
                    <span style={{ color: "#666", fontSize: 13 }}>Renueva: {new Date(item.renewalDate).toLocaleDateString("es-AR")}</span>
                  )}
                  <span
                    style={{
                      background: item.status === "EXPIRING" ? "rgba(246, 110, 91, 0.16)" : "rgba(22, 101, 52, 0.12)",
                      color: item.status === "EXPIRING" ? "var(--danger)" : "var(--primary-700)",
                      borderRadius: "12px",
                      padding: "4px 8px",
                      fontWeight: 600,
                      alignSelf: "flex-start",
                    }}
                  >
                    {item.status === "EXPIRING" ? "Vence pronto" : "Activo"}
                  </span>
                  {item.notes && <span style={{ color: "#666", fontSize: 13 }}>{item.notes}</span>}
                </div>
              ))}
              {insurances.length === 0 && !loading && (
                <div style={{ color: "#777" }}>No hay polizas asignadas.</div>
              )}
            </section>
          </>
        )}
      </DashboardShell>
      <Footer />
    </>
  );
}
