/**
 * pages/client/contratos.js — Contratos y seguros del cliente
 */
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

const CLIENT_NAV = [
  { href: "/client/dashboard",  label: "Panel general" },
  { href: "/client/urgencias",  label: "Urgencias 24/7" },
  { href: "/client/contratos",  label: "Contratos" },
  { href: "/client/facturacion",label: "Pagos y facturas" },
  { href: "/client/reclamos",   label: "Reclamos" },
  { href: "/chat",              label: "Chat" },
];

export default function ClientContracts() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();

  const [templates,  setTemplates]  = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const currency = useMemo(() =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }), []);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    load();
  }, [isReady, user]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [tplRes, insRes] = await Promise.allSettled([
        apiRequest("/api/client/contracts"),
        apiRequest("/api/client/insurances"),
      ]);
      if (tplRes.status === "fulfilled" && tplRes.value?.ok !== false)
        setTemplates(tplRes.value?.templates || []);
      if (insRes.status === "fulfilled" && insRes.value?.ok !== false)
        setInsurances(insRes.value?.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isReady || !user) return null;

  return (
    <>
      <Head>
        <title>Contratos y Seguros · OficiosYa</title>
        <meta name="description" content="Consultá y descargá los contratos de servicio y pólizas de seguro asociadas a tus servicios." />
      </Head>
      <NavBar />
      <DashboardShell
        title="Contratos y Seguros"
        subtitle="Modelos editables, aceptaciones con hash y pólizas asociadas a cada servicio."
        navItems={CLIENT_NAV}
        active="/client/contratos"
        rightSlot={<button className="btn btn-ghost btn-sm" onClick={load}>🔄</button>}
      >
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
          </div>
        ) : (
          <>
            {/* Modelos de contrato */}
            <div className="card-flat">
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "var(--primary-700)" }}>
                📋 Modelos de contrato disponibles
              </h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Versión</th>
                      <th>Actualización</th>
                      <th>Alcance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>
                          No hay modelos disponibles por el momento.
                        </td>
                      </tr>
                    ) : templates.map(tpl => (
                      <tr key={tpl.id}>
                        <td style={{ fontWeight: 600, color: "var(--primary-700)" }}>{tpl.name}</td>
                        <td>{tpl.version}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                          {tpl.lastUpdated ? new Date(tpl.lastUpdated).toLocaleDateString("es-AR") : "—"}
                        </td>
                        <td style={{ fontSize: 13 }}>{tpl.scope}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pólizas de seguro */}
            <div className="card-flat">
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "var(--primary-700)" }}>
                🛡️ Pólizas de seguro
              </h3>
              {insurances.length === 0 ? (
                <p style={{ color: "var(--text-muted)", margin: 0, padding: "8px 0" }}>
                  No hay pólizas asignadas a tus servicios activos.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                  {insurances.map(item => {
                    const expiring = item.status === "EXPIRING";
                    return (
                      <div key={item.id} style={{
                        border: `1.5px solid ${expiring ? "#FCA5A5" : "#D4E0D6"}`,
                        borderRadius: 14,
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        background: expiring ? "#FFF5F5" : "#fff",
                      }}>
                        <div style={{ fontWeight: 700, color: "var(--primary-700)", fontSize: 15 }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          Cobertura: <strong style={{ color: "var(--primary-700)" }}>{currency.format(item.coverage || 0)}</strong>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Partner: {item.partner}</div>
                        {item.renewalDate && (
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            Renovación: {new Date(item.renewalDate).toLocaleDateString("es-AR")}
                          </div>
                        )}
                        <span style={{
                          alignSelf: "flex-start",
                          background: expiring ? "#FEF2F2" : "#F0FDF4",
                          color: expiring ? "#DC2626" : "#16A34A",
                          borderRadius: 20,
                          padding: "3px 10px",
                          fontWeight: 700,
                          fontSize: 11,
                        }}>
                          {expiring ? "⚠️ Vence pronto" : "✅ Activo"}
                        </span>
                        {item.notes && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="alert alert-info" style={{ fontSize: 13 }}>
              📌 Todos los contratos de servicio quedan aceptados con firma electrónica y hash SHA-256 al momento de confirmar el trabajo.
              Podés consultarlos en cualquier momento desde este panel. Ante dudas legales: <a href="mailto:legal@oficiosya.com.ar" style={{ color: "var(--primary)" }}>legal@oficiosya.com.ar</a>
            </div>
          </>
        )}
      </DashboardShell>
      <Footer />
    </>
  );
}
