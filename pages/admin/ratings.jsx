/**
 * pages/admin/ratings.jsx
 * Moderación de reseñas — lista global + eliminación por fraude
 */
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const ADMIN_NAV = [
  { href: "/admin/dashboard",      label: "📊 Dashboard" },
  { href: "/admin/verificaciones", label: "🛡️ Verificaciones" },
  { href: "/admin/users",          label: "👥 Usuarios" },
  { href: "/admin/solicitudes",    label: "📋 Solicitudes" },
  { href: "/admin/escrow",         label: "💳 Escrow" },
  { href: "/admin/ratings",        label: "⭐ Reseñas" },
  { href: "/admin/reclamos",       label: "📝 Reclamos" },
  { href: "/admin/chat-alerts",    label: "🚨 Chat Alerts" },
  { href: "/admin/documentacion",  label: "📄 Docs" },
];

function Stars({ value }) {
  return (
    <span style={{ color: G, fontWeight: 700 }}>
      {"★".repeat(Math.round(value))}{"☆".repeat(5 - Math.round(value))} {Number(value).toFixed(1)}
    </span>
  );
}

export default function AdminRatings() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState({});
  const [msg, setMsg]         = useState(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    loadRatings();
  }, [isReady, user]);

  async function loadRatings() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/admin/ratings").catch(() => null);
      if (data?.ok) setRatings(data.ratings || []);
    } catch {}
    setLoading(false);
  }

  async function deleteRating(ratingId) {
    if (!confirm("¿Eliminar esta reseña por fraude? Esta acción no se puede deshacer.")) return;
    setBusy(b => ({ ...b, [ratingId]: true }));
    setMsg(null);
    try {
      const data = await apiRequest(`/api/ratings/${ratingId}`, { method: "DELETE" });
      setMsg(data.ok ? "✅ Reseña eliminada" : `❌ ${data.error}`);
      if (data.ok) setRatings(r => r.filter(x => x.id !== ratingId));
    } catch (e) { setMsg(`❌ ${e.message}`); }
    setBusy(b => ({ ...b, [ratingId]: false }));
  }

  const avg = ratings.length ? (ratings.reduce((s, r) => s + (r.average || 0), 0) / ratings.length).toFixed(2) : "—";

  if (!isReady) return null;

  return (
    <>
      <Head><title>Admin · Reseñas — OficiosYa</title></Head>
      <NavBar />
      <DashboardShell title="Reseñas" subtitle={`${ratings.length} reseñas · Promedio general: ${avg}★`} navItems={ADMIN_NAV} active="/admin/ratings">

        {msg && <div style={{ background: msg.startsWith("✅") ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${msg.startsWith("✅") ? V : "#DC2626"}`, borderRadius: 10, padding: "10px 16px", fontSize: 14 }}>{msg}</div>}

        <section style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24 }}>
          {loading ? <p style={{ color: "#6B7C6E" }}>Cargando reseñas...</p> : (
            ratings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <div style={{ color: "#9CA3AF", fontSize: 15 }}>Sin reseñas todavía.</div>
                <div style={{ color: "#9CA3AF", fontSize: 13, marginTop: 8 }}>Las reseñas aparecerán cuando los clientes califiquen trabajos completados. (Requiere PostgreSQL conectado)</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ratings.map(r => (
                  <div key={r.id} style={{ border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
                          <Stars value={r.average || r.quality || 0} />
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-AR") : ""}</span>
                        </div>
                        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6B7C6E", marginBottom: 6 }}>
                          <span>Calidad: <strong>{r.quality}</strong></span>
                          <span>Puntualidad: <strong>{r.punctuality}</strong></span>
                          <span>Comunicación: <strong>{r.communication}</strong></span>
                        </div>
                        {r.comment && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.5 }}>"{r.comment}"</p>}
                        {r.response && (
                          <div style={{ marginTop: 10, background: "#F0FDF4", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#166534", borderLeft: `3px solid ${V}` }}>
                            <strong>Respuesta del prestador:</strong> {r.response}
                          </div>
                        )}
                        <div style={{ marginTop: 8, fontSize: 11, color: "#9CA3AF" }}>
                          Cliente: {r.clientId?.slice(0, 12) || "—"} · Prestador: {r.providerId?.slice(0, 12) || "—"}
                        </div>
                      </div>
                      <button onClick={() => deleteRating(r.id)} disabled={busy[r.id]}
                        style={{ background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #DC2626", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </section>

      </DashboardShell>
      <Footer />
    </>
  );
}
