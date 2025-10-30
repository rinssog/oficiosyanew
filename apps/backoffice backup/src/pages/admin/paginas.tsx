import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const STORAGE_KEY = "oficiosya_admin_token";

export default function AdminCms() {
  const [sections, setSections] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [savingPlan, setSavingPlan] = useState(null);
  const [adminToken, setAdminToken] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAdminToken(stored);
      }
    } catch (err) {
      console.warn("admin token storage read failed", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (adminToken) {
        window.localStorage.setItem(STORAGE_KEY, adminToken);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn("admin token storage write failed", err);
    }
  }, [adminToken]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sectionsRes, plansRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/cms/sections`).then((r) => r.json()),
          fetch(`${API_BASE}/api/admin/plans`).then((r) => r.json()),
        ]);
        if (!active) return;
        if (sectionsRes.ok === false) throw new Error(sectionsRes.error || "No se pudo cargar el CMS");
        if (plansRes.ok === false) throw new Error(plansRes.error || "No se pudieron cargar los planes");
        setSections(sectionsRes.sections || []);
        setPlans((plansRes.plans || []).map((plan) => ({ ...plan })));
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
      { href: "/admin/documentacion", label: "Revision de docs" },
      { href: "/admin/paginas", label: "CMS y landing" },
      { href: "/admin/reportes", label: "Reportes y SLA" },
    ],
    [],
  );

  const handlePlanChange = (planId, field, value) => {
    setPlans((prev) => prev.map((plan) => (plan.id === planId ? { ...plan, [field]: value } : plan)));
  };

  const handlePlanSave = async (planId) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    if (!adminToken) {
      setError("Ingresa el token administrativo antes de guardar cambios.");
      return;
    }

    setSavingPlan(planId);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/plans/${planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          priceMonthly: Number(plan.priceMonthly),
          commissionPct: Number(plan.commissionPct),
          leadFee: Number(plan.leadFee),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || "No se pudo actualizar el plan");
      setMessage("Plan actualizado");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPlan(null);
    }
  };

  return (
    <>
      <Head>
        <title>OficiosYa | CMS y landing</title>
      </Head>
      <NavBar />
      <DashboardShell
        title="CMS y contenido"
        subtitle="Gestiona versiones de landing, FAQ y recursos visuales."
        navItems={navItems}
        active="/admin/paginas"
      >
        {error && <p style={{ color: "#c62828" }}>{error}</p>}
        {message && <p style={{ color: "#0f6a3b" }}>{message}</p>}
        {loading && <p style={{ color: "#555" }}>Cargando secciones y planes...</p>}

        <section style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: 16, display: "grid", gap: 12, marginBottom: 24 }}>
          <strong>Token administrativo</strong>
          <p style={{ margin: 0, color: "#555" }}>
            Para modificar planes desde el panel administrativo necesitas el mismo token configurado en el backend (variable <code>ADMIN_TOKEN</code>). Escribilo manualmente: nunca lo publiques en el frontend.
          </p>
          <input
            type="text"
            placeholder="Token administrativo"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </section>

        {!loading && (
          <>
            <section style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "grid", gap: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary-700)" }}>Secciones</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--text-soft)" }}>
                    <th style={{ padding: "12px" }}>Nombre</th>
                    <th style={{ padding: "12px" }}>Estado</th>
                    <th style={{ padding: "12px" }}>ltima edicin</th>
                    <th style={{ padding: "12px" }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <tr key={section.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", color: "var(--primary-700)" }}>{section.name}</td>
                      <td style={{ padding: "12px" }}>{section.status}</td>
                      <td style={{ padding: "12px" }}>{section.lastUpdated ? new Date(section.lastUpdated).toLocaleDateString("es-AR") : "-"}</td>
                      <td style={{ padding: "12px" }}>{section.notes || "-"}</td>
                    </tr>
                  ))}
                  {sections.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "12px", color: "#777" }}>No hay secciones configuradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section style={{ background: "#fff", borderRadius: "22px", border: "1px solid var(--border)", padding: "24px", display: "grid", gap: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary-700)" }}>Planes de suscripcin</h2>
              <p style={{ margin: 0, color: "#555" }}>Estos planes se muestran en la landing y en /planes. Ajusta valores y comisiones segn estrategia.</p>
              <div style={{ display: "grid", gap: "18px" }}>
                {plans.map((plan) => (
                  <div key={plan.id} style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "16px", display: "grid", gap: "12px" }}>
                    <strong style={{ fontSize: "1.1rem", color: "var(--primary-700)" }}>{plan.name}</strong>
                    <label style={{ display: "grid", gap: 4 }}>
                      Precio mensual (ARS)
                      <input
                        type="number"
                        value={plan.priceMonthly}
                        min={0}
                        onChange={(e) => handlePlanChange(plan.id, "priceMonthly", e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: 4 }}>
                      Comisin (%)
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={plan.commissionPct}
                        onChange={(e) => handlePlanChange(plan.id, "commissionPct", e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: 4 }}>
                      Lead fee (ARS)
                      <input
                        type="number"
                        min={0}
                        value={plan.leadFee}
                        onChange={(e) => handlePlanChange(plan.id, "leadFee", e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePlanSave(plan.id)}
                      disabled={savingPlan === plan.id}
                      style={{
                        alignSelf: "flex-start",
                        background: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 16px",
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: savingPlan === plan.id ? 0.6 : 1,
                      }}
                    >
                      {savingPlan === plan.id ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                ))}
                {plans.length === 0 && <p style={{ color: "#777" }}>No hay planes configurados.</p>}
              </div>
            </section>
          </>
        )}
      </DashboardShell>
      <Footer />
    </>
  );
}
