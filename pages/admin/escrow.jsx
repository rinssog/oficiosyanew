/**
 * pages/admin/escrow.jsx
 * Gestión de pagos retenidos en escrow
 */
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const ADMIN_NAV = [
  { href: "/admin/dashboard",      label: "📊 Dashboard" },
  { href: "/admin/verificaciones", label: "🛡️ Verificaciones" },
  { href: "/admin/users",          label: "👥 Usuarios" },
  { href: "/admin/solicitudes",    label: "📋 Solicitudes" },
  { href: "/admin/escrow",         label: "💳 Escrow" },
  { href: "/admin/ratings",        label: "⭐ Reseñas" },
  { href: "/admin/reclamos",       label: "📝 Reclamos" },
  { href: "/admin/chat-alerts",    label: "🚨 Chat/Alertas" },
  { href: "/admin/documentacion",  label: "📄 Docs KYC" },
  { href: "/admin/reportes",       label: "📈 Reportes" },
];

const STATUS_MAP = {
  HELD:      { label: "Retenido",  color: "#D97706", bg: "#FFFBEB" },
  RELEASED:  { label: "Liberado",  color: "#16A34A", bg: "#F0FDF4" },
  REFUNDED:  { label: "Reembolso", color: "#7C3AED", bg: "#F5F3FF" },
  CANCELLED: { label: "Cancelado", color: "#DC2626", bg: "#FEF2F2" },
};

export default function AdminEscrow() {
  const { user, token, isReady } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    loadEscrow();
  }, [isReady, user]);

  async function loadEscrow() {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/admin/escrow`, { headers });
      const data = await res.json();
      if (data.ok) setRecords(data.records || []);
    } catch {}
    setLoading(false);
  }

  const held     = records.filter(r => r.status === "HELD");
  const released = records.filter(r => r.status === "RELEASED");
  const totalHeld    = held.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalReleased = released.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  if (!isReady) return null;

  return (
    <>
      <Head><title>Admin · Escrow — OficiosYa</title></Head>
      <NavBar />
      <DashboardShell title="Escrow" subtitle="Pagos retenidos en custodia por la plataforma" navItems={ADMIN_NAV} active="/admin/escrow">

        {msg && <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "10px 16px", fontSize: 14 }}>{msg}</div>}

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {[
            { label: "💰 En custodia", value: `$${totalHeld.toLocaleString("es-AR")}`, color: G, bg: "#FFFBEB" },
            { label: "✅ Liberado",    value: `$${totalReleased.toLocaleString("es-AR")}`, color: V, bg: "#F0FDF4" },
            { label: "📋 Registros",  value: records.length, color: F, bg: "#F7F9F5" },
            { label: "⏳ Retenidos",  value: held.length, color: "#D97706", bg: "#FFFBEB" },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, borderRadius: 16, padding: "18px 20px", textAlign: "center", border: `1.5px solid ${k.color}20` }}>
              <div style={{ fontSize: 13, color: "#6B7C6E", marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: k.color, fontFamily: "Georgia,serif" }}>{k.value}</div>
            </div>
          ))}
        </div>

        <section style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", color: F, fontSize: "1.3rem" }}>Registros de escrow</h2>
          {loading ? <p style={{ color: "#6B7C6E" }}>Cargando...</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F7F9F5", color: "#6B7C6E", textAlign: "left" }}>
                    {["ID", "Solicitud", "Monto", "Comisión", "Estado", "Creado"].map(h =>
                      <th key={h} style={{ padding: "10px 12px", fontWeight: 700 }}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#9CA3AF" }}>
                      Sin registros de escrow. Se crearán cuando se procesen pagos reales por MercadoPago.
                    </td></tr>
                  )}
                  {records.map(r => {
                    const st = STATUS_MAP[r.status] || { label: r.status, color: "#6B7280", bg: "#F9FAFB" };
                    return (
                      <tr key={r.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 12px", color: "#9CA3AF", fontFamily: "monospace", fontSize: 11 }}>{r.id?.slice(0, 12)}…</td>
                        <td style={{ padding: "10px 12px", color: F, fontSize: 12 }}>{r.requestId?.slice(0, 12) || "—"}…</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: F }}>${Number(r.amount || 0).toLocaleString("es-AR")}</td>
                        <td style={{ padding: "10px 12px", color: "#DC2626" }}>${Number(r.commission || 0).toLocaleString("es-AR")}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 11 }}>{st.label}</span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#9CA3AF" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-AR") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div style={{ background: "#FFFBEB", border: "1.5px solid rgba(201,162,39,0.4)", borderRadius: 16, padding: "16px 20px", fontSize: 13, color: "#92400E" }}>
          <strong>⚠️ Liberación manual de pagos:</strong> Para liberar un pago retenido en disputa, usá la API de MercadoPago o contactá al equipo técnico para procesar la liquidación manualmente.
          La liberación automática ocurre cuando el cliente confirma el trabajo desde su panel.
        </div>

      </DashboardShell>
      <Footer />
    </>
  );
}
