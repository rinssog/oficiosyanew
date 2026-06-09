/**
 * pages/admin/paginas.js — CMS y planes de suscripción
 * Migrado a useAuth + apiRequest (sin campo manual de token)
 */
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
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

export default function AdminCms() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();

  const [sections, setSections] = useState([]);
  const [plans,    setPlans]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [message,  setMessage]  = useState(null);
  const [saving,   setSaving]   = useState(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "ADMIN") { router.replace("/"); return; }
    load();
  }, [isReady, user]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [sectionsRes, plansRes] = await Promise.allSettled([
        apiRequest("/api/admin/cms/sections"),
        apiRequest("/api/admin/plans"),
      ]);
      if (sectionsRes.status === "fulfilled" && sectionsRes.value?.ok !== false)
        setSections(sectionsRes.value?.sections || []);
      if (plansRes.status === "fulfilled" && plansRes.value?.ok !== false)
        setPlans((plansRes.value?.plans || []).map(p => ({ ...p })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleField = (id, field, value) =>
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  async function savePlan(id) {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    setSaving(id);
    setMessage(null);
    setError(null);
    try {
      const data = await apiRequest(`/api/admin/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          priceMonthly: Number(plan.priceMonthly),
          commissionPct: Number(plan.commissionPct),
          leadFee: Number(plan.leadFee),
        }),
      });
      if (data.ok === false) throw new Error(data.error || "No se pudo actualizar");
      setMessage(`✅ Plan "${plan.name}" actualizado`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  if (!isReady || !user || user.role !== "ADMIN") return null;

  return (
    <>
      <Head><title>CMS y Planes · OficiosYa Admin</title></Head>
      <NavBar />
      <DashboardShell
        title="CMS y Planes"
        subtitle="Gestión de secciones de landing y precios de suscripción."
        navItems={ADMIN_NAV}
        active="/admin/paginas"
        rightSlot={<button className="btn btn-ghost btn-sm" onClick={load}>🔄 Recargar</button>}
      >
        {error   && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
          </div>
        ) : (
          <>
            {/* Secciones */}
            <div className="card-flat">
              <h3 style={{ margin: "0 0 16px", color: F, fontSize: 16, fontWeight: 800 }}>
                📄 Secciones de contenido ({sections.length})
              </h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Última edición</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: 16, color: "var(--text-muted)", textAlign: "center" }}>
                        Sin secciones configuradas.
                      </td></tr>
                    ) : sections.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, color: F }}>{s.name}</td>
                        <td>{s.status}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                          {s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString("es-AR") : "—"}
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{s.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Planes */}
            <div className="card-flat">
              <h3 style={{ margin: "0 0 4px", color: F, fontSize: 16, fontWeight: 800 }}>
                💳 Planes de suscripción
              </h3>
              <p style={{ margin: "0 0 20px", color: "var(--text-muted)", fontSize: 13 }}>
                Estos valores se muestran en la landing y en /planes. Ajustá comisiones según estrategia de pricing.
              </p>

              {plans.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No hay planes configurados en el sistema.</p>
              ) : (
                <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {plans.map(plan => (
                    <div key={plan.id} style={{ border: "1.5px solid #D4E0D6", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ fontWeight: 800, color: F, fontSize: 16 }}>{plan.name}</div>

                      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
                        Precio mensual (ARS)
                        <input
                          type="number"
                          value={plan.priceMonthly}
                          min={0}
                          onChange={e => handleField(plan.id, "priceMonthly", e.target.value)}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 14 }}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
                        Comisión (%)
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          max={100}
                          value={plan.commissionPct}
                          onChange={e => handleField(plan.id, "commissionPct", e.target.value)}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 14 }}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
                        Lead fee (ARS)
                        <input
                          type="number"
                          min={0}
                          value={plan.leadFee}
                          onChange={e => handleField(plan.id, "leadFee", e.target.value)}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 14 }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => savePlan(plan.id)}
                        disabled={saving === plan.id}
                        className="btn btn-primary btn-sm"
                        style={{ alignSelf: "flex-start", opacity: saving === plan.id ? 0.6 : 1 }}
                      >
                        {saving === plan.id ? "Guardando..." : "💾 Guardar"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="alert alert-info" style={{ fontSize: 13 }}>
              💡 Los cambios de precios se reflejan en <strong>/planes</strong> en tiempo real.
              El token administrativo se valida automáticamente vía tu sesión de ADMIN.
            </div>
          </>
        )}
      </DashboardShell>
      <Footer />
    </>
  );
}
