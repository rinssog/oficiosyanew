/**
 * pages/admin/users.jsx
 * Gestión de usuarios — lista, búsqueda, suspensión
 */
import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

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

const ROLE_COLORS = { ADMIN: "#7C3AED", PROVIDER: "#1D4ED8", CLIENT: "#16A34A" };
const ROLE_BG    = { ADMIN: "#F5F3FF", PROVIDER: "#EFF6FF", CLIENT: "#F0FDF4" };

export default function AdminUsers() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState("");
  const [roleFilter, setRole] = useState("");
  const [page, setPage]       = useState(1);
  const [busy, setBusy]       = useState({});
  const [msg, setMsg]         = useState(null);
  const [suspendHours, setSuspendHours] = useState(48);
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    loadUsers();
  }, [isReady, user, roleFilter, page]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      // Try Prisma-based endpoint first, fallback to JSON endpoint
      let data = await apiRequest(`/api/admin/users?${new URLSearchParams({ ...(roleFilter && { role: roleFilter }), ...(q && { q }), page: String(page) })}`).catch(() => null);
      if (!data?.ok) {
        data = await apiRequest("/api/admin/users-list").catch(() => null);
      }
      if (data?.ok) {
        let list = data.users || [];
        if (q) list = list.filter(u => u.name?.toLowerCase().includes(q.toLowerCase()) || u.email?.toLowerCase().includes(q.toLowerCase()));
        if (roleFilter) list = list.filter(u => u.role === roleFilter);
        setUsers(list);
        setTotal(data.total || list.length);
      }
    } catch {}
    setLoading(false);
  }, [roleFilter, q, page, apiRequest]);

  async function suspend(userId, hours, reason) {
    setBusy(b => ({ ...b, [userId]: true }));
    setMsg(null);
    try {
      const data = await apiRequest(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        body: JSON.stringify({ hours, reason }),
      });
      setMsg(data.ok ? `✅ ${data.message}` : `❌ ${data.error}`);
      loadUsers();
    } catch (e) { setMsg(`❌ ${e.message}`); }
    setBusy(b => ({ ...b, [userId]: false }));
  }

  async function unsuspend(userId) {
    setBusy(b => ({ ...b, [userId]: true }));
    setMsg(null);
    try {
      const data = await apiRequest(`/api/chat/moderation/${userId}/unsuspend`, { method: "POST" });
      setMsg(data.ok ? "✅ Suspensión levantada" : `❌ ${data.error}`);
      loadUsers();
    } catch (e) { setMsg(`❌ ${e.message}`); }
    setBusy(b => ({ ...b, [userId]: false }));
  }

  if (!isReady) return null;

  return (
    <>
      <Head><title>Admin · Usuarios — OficiosYa</title></Head>
      <NavBar />
      <DashboardShell title="Usuarios" subtitle={`${total} usuarios registrados en la plataforma`} navItems={ADMIN_NAV} active="/admin/users">

        {msg && <div style={{ background: msg.startsWith("✅") ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${msg.startsWith("✅") ? V : "#DC2626"}`, borderRadius: 10, padding: "10px 16px", fontSize: 14 }}>{msg}</div>}

        {/* Filtros */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: "16px 20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && loadUsers()}
            placeholder="Buscar por nombre o email..." style={{ flex: 2, minWidth: 200, padding: "8px 12px", border: "1.5px solid #D4E0D6", borderRadius: 8, fontSize: 14, outline: "none" }} />
          <select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: 140, padding: "8px 12px", border: "1.5px solid #D4E0D6", borderRadius: 8, fontSize: 14, outline: "none" }}>
            <option value="">Todos los roles</option>
            <option value="CLIENT">Cliente</option>
            <option value="PROVIDER">Prestador</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button onClick={loadUsers} style={{ background: F, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>Buscar</button>
        </div>

        {/* Suspend form */}
        <div style={{ background: "#FFFBEB", border: "1px solid rgba(201,162,39,0.4)", borderRadius: 14, padding: "14px 20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", fontSize: 13 }}>
          <span style={{ fontWeight: 700, color: F }}>⚙️ Suspender usuario ID:</span>
          <input value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Motivo de suspensión"
            style={{ flex: 2, minWidth: 180, padding: "6px 10px", border: "1.5px solid #D4E0D6", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <select value={suspendHours} onChange={e => setSuspendHours(Number(e.target.value))}
            style={{ padding: "6px 10px", border: "1.5px solid #D4E0D6", borderRadius: 8, fontSize: 13, outline: "none" }}>
            <option value={24}>24 horas</option>
            <option value={48}>48 horas</option>
            <option value={168}>7 días</option>
            <option value={720}>30 días</option>
          </select>
          <span style={{ color: "#6B7C6E" }}>→ Clic en "Suspender" en cada fila</span>
        </div>

        {/* Tabla */}
        <section style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24 }}>
          {loading ? <p style={{ color: "#6B7C6E" }}>Cargando usuarios...</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F7F9F5", color: "#6B7C6E", textAlign: "left" }}>
                    {["Nombre", "Email", "Rol", "Registrado", "Estado", "Acciones"].map(h =>
                      <th key={h} style={{ padding: "10px 12px", fontWeight: 700 }}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#9CA3AF" }}>No hay usuarios. (Conectá PostgreSQL para ver usuarios en tiempo real)</td></tr>
                  )}
                  {users.map(u => {
                    const isSuspended = u.suspended && new Date(u.suspended) > new Date();
                    return (
                      <tr key={u.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: F }}>{u.name || "—"}</td>
                        <td style={{ padding: "10px 12px", color: "#6B7C6E" }}>{u.email}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ background: ROLE_BG[u.role] || "#F3F4F6", color: ROLE_COLORS[u.role] || "#6B7280", borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 11 }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#9CA3AF" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-AR") : "—"}</td>
                        <td style={{ padding: "10px 12px" }}>
                          {isSuspended
                            ? <span style={{ color: "#DC2626", fontWeight: 700, fontSize: 11 }}>🔴 Suspendido hasta {new Date(u.suspended).toLocaleDateString("es-AR")}</span>
                            : <span style={{ color: V, fontSize: 11 }}>🟢 Activo</span>}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {isSuspended ? (
                              <button onClick={() => unsuspend(u.id)} disabled={busy[u.id]}
                                style={{ background: V, color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                Levantar
                              </button>
                            ) : (
                              <button onClick={() => suspend(u.id, suspendHours, suspendReason)} disabled={busy[u.id]}
                                style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                Suspender
                              </button>
                            )}
                          </div>
                        </td>
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
