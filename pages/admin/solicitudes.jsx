/**
 * pages/admin/solicitudes.jsx
 * Lista de solicitudes activas y completadas en la plataforma
 */
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const F = "#0D3B1F", V = "#16A34A";

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
  PENDING:       { label: "Pendiente",     color: "#6B7280",  bg: "#F9FAFB" },
  QUOTE_PENDING: { label: "En presupuesto",color: "#1D4ED8",  bg: "#EFF6FF" },
  ACCEPTED:      { label: "Aceptado",      color: "#16A34A",  bg: "#F0FDF4" },
  IN_PROGRESS:   { label: "En progreso",   color: "#D97706",  bg: "#FFFBEB" },
  DONE:          { label: "Completado",    color: "#166534",  bg: "#DCFCE7" },
  CANCELLED:     { label: "Cancelado",     color: "#DC2626",  bg: "#FEF2F2" },
};

export default function AdminSolicitudes() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatus] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    loadRequests();
  }, [isReady, user]);

  async function loadRequests() {
    setLoading(true);
    try {
      // Try Prisma endpoint first, fallback to JSON
      let data = await apiRequest("/api/admin/solicitudes").catch(() => null);
      if (!data?.ok) data = await apiRequest("/api/admin/requests").catch(() => null);
      if (data?.ok) {
        setRequests(data.requests || []);
        setTotal(data.total || (data.requests || []).length);
      }
    } catch {}
    setLoading(false);
  }

  const filtered = statusFilter ? requests.filter(r => r.status === statusFilter) : requests;
  const counts   = requests.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

  if (!isReady) return null;

  return (
    <>
      <Head><title>Admin · Solicitudes — OficiosYa</title></Head>
      <NavBar />
      <DashboardShell title="Solicitudes" subtitle={`${total} solicitudes en total`} navItems={ADMIN_NAV} active="/admin/solicitudes">

        {/* KPI pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <button key={k} onClick={() => setStatus(statusFilter === k ? "" : k)}
              style={{ background: statusFilter === k ? v.color : v.bg, color: statusFilter === k ? "#fff" : v.color, border: `1.5px solid ${v.color}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {v.label} {counts[k] ? `(${counts[k]})` : ""}
            </button>
          ))}
        </div>

        <section style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24 }}>
          {loading ? <p style={{ color: "#6B7C6E" }}>Cargando solicitudes...</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F7F9F5", color: "#6B7C6E", textAlign: "left" }}>
                    {["ID", "Cliente", "Prestador", "Estado", "Urgente", "Fecha"].map(h =>
                      <th key={h} style={{ padding: "10px 12px", fontWeight: 700 }}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#9CA3AF" }}>
                      {loading ? "Cargando..." : "Sin solicitudes. Las solicitudes aparecerán cuando se creen desde la plataforma."}
                    </td></tr>
                  )}
                  {filtered.map(r => {
                    const st = STATUS_MAP[r.status] || STATUS_MAP.PENDING;
                    return (
                      <tr key={r.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 12px", color: "#9CA3AF", fontFamily: "monospace", fontSize: 11 }}>{r.id?.slice(0, 12)}…</td>
                        <td style={{ padding: "10px 12px", color: F, fontSize: 12 }}>{r.clientId?.slice(0, 10)}…</td>
                        <td style={{ padding: "10px 12px", color: F, fontSize: 12 }}>{r.providerId ? `${r.providerId.slice(0, 10)}…` : "—"}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 11 }}>{st.label}</span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>{r.schedule?.urgent ? "🚨 Sí" : "—"}</td>
                        <td style={{ padding: "10px 12px", color: "#9CA3AF" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-AR") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </DashboardShell>
      <Footer />
    </>
  );
}
