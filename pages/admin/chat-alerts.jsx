/**
 * pages/admin/chat-alerts.jsx
 * Logs de moderación de chat — alertas, suspensiones, bypasseo de plataforma
 */
import { useEffect, useState } from "react";
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

const SEV_MAP = {
  WARN:    { color: "#D97706", bg: "#FFFBEB", icon: "⚠️" },
  FLAG:    { color: "#DC2626", bg: "#FEF2F2", icon: "🚩" },
  SUSPEND: { color: "#7C3AED", bg: "#F5F3FF", icon: "🔴" },
};

export default function AdminChatAlerts() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState({});
  const [msg, setMsg]           = useState(null);
  const [sevFilter, setSevFilter] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    loadLogs();
  }, [isReady, user]);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/chat/moderation/logs").catch(() => null);
      if (data?.ok) setLogs(data.logs || []);
    } catch {}
    setLoading(false);
  }

  async function unsuspend(userId) {
    setBusy(b => ({ ...b, [userId]: true }));
    setMsg(null);
    try {
      const data = await apiRequest(`/api/chat/moderation/${userId}/unsuspend`, { method: "POST" });
      setMsg(data.ok ? "✅ Suspensión levantada" : `❌ ${data.error}`);
      if (data.ok) loadLogs();
    } catch (e) { setMsg(`❌ ${e.message}`); }
    setBusy(b => ({ ...b, [userId]: false }));
  }

  const filtered = sevFilter ? logs.filter(l => l.severity === sevFilter) : logs;
  const counts   = logs.reduce((a, l) => { a[l.severity] = (a[l.severity] || 0) + 1; return a; }, {});

  if (!isReady) return null;

  return (
    <>
      <Head><title>Admin · Chat Alerts — OficiosYa</title></Head>
      <NavBar />
      <DashboardShell
        title="Alertas de Chat"
        subtitle={`${logs.length} eventos de moderación`}
        navItems={ADMIN_NAV}
        active="/admin/chat-alerts"
      >
        {msg && <div style={{ background: msg.startsWith("✅") ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${msg.startsWith("✅") ? V : "#DC2626"}`, borderRadius: 10, padding: "10px 16px", fontSize: 14 }}>{msg}</div>}

        {/* Severity filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setSevFilter("")}
            style={{ background: !sevFilter ? F : "#F3F4F6", color: !sevFilter ? "#fff" : "#374151", border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Todos ({logs.length})
          </button>
          {Object.entries(SEV_MAP).map(([k, v]) => (
            <button key={k} onClick={() => setSevFilter(sevFilter === k ? "" : k)}
              style={{ background: sevFilter === k ? v.color : v.bg, color: sevFilter === k ? "#fff" : v.color, border: `1.5px solid ${v.color}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {v.icon} {k} ({counts[k] || 0})
            </button>
          ))}
        </div>

        <section style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24 }}>
          {loading ? <p style={{ color: "#6B7C6E" }}>Cargando logs...</p> : (
            filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
                <div style={{ color: "#9CA3AF" }}>Sin alertas de moderación. {logs.length === 0 && "(Requiere PostgreSQL conectado)"}</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(log => {
                  const sev = SEV_MAP[log.severity] || SEV_MAP.WARN;
                  const rules = (() => { try { return JSON.parse(log.triggeredRules || "[]"); } catch { return []; } })();
                  const reasons = (() => { try { return JSON.parse(log.reasons || "[]"); } catch { return []; } })();
                  return (
                    <div key={log.id} style={{ border: `1.5px solid ${sev.color}40`, borderLeft: `4px solid ${sev.color}`, borderRadius: 10, padding: "14px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                            <span style={{ background: sev.bg, color: sev.color, borderRadius: 6, padding: "2px 8px", fontWeight: 800, fontSize: 11 }}>{sev.icon} {log.severity}</span>
                            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{log.createdAt ? new Date(log.createdAt).toLocaleString("es-AR") : ""}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#6B7C6E", marginBottom: 4 }}>
                            <strong>Usuario:</strong> {log.userId || log.user?.email || "—"}
                            {log.user?.name && ` (${log.user.name})`}
                            {" · "}
                            <strong>Solicitud:</strong> {log.requestId?.slice(0, 12) || "—"}
                          </div>
                          {log.messageBody && (
                            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#374151", marginBottom: 6, fontStyle: "italic" }}>
                              "{log.messageBody.slice(0, 200)}"
                            </div>
                          )}
                          {reasons.length > 0 && (
                            <div style={{ fontSize: 11, color: sev.color }}>
                              🔍 {reasons.slice(0, 2).join(" · ")}
                            </div>
                          )}
                          {rules.length > 0 && (
                            <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {rules.map(r => <span key={r} style={{ background: "#F3F4F6", color: "#374151", borderRadius: 4, padding: "1px 6px", fontSize: 10 }}>{r}</span>)}
                            </div>
                          )}
                        </div>
                        {log.severity === "SUSPEND" && (
                          <button onClick={() => unsuspend(log.userId)} disabled={busy[log.userId]}
                            style={{ background: V, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                            Levantar suspensión
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </section>

      </DashboardShell>
      <Footer />
    </>
  );
}
