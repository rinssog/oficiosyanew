/**
 * pages/admin/reclamos.jsx
 * Gestión completa de reclamos — Admin
 */
import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import KpiCard from "../../components/KpiCard";
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

const STATUS_CONFIG = {
  PENDING:   { label: "Pendiente",   color: "#92400E", bg: "#FFFBEB", icon: "⏳" },
  OPEN:      { label: "Abierto",     color: "#1D4ED8", bg: "#EFF6FF", icon: "🔵" },
  IN_REVIEW: { label: "En revisión", color: "#7C3AED", bg: "#F5F3FF", icon: "🔍" },
  RESOLVED:  { label: "Resuelto",    color: "#166534", bg: "#F0FDF4", icon: "✅" },
  REJECTED:  { label: "Rechazado",   color: "#DC2626", bg: "#FEF2F2", icon: "❌" },
  CLOSED:    { label: "Cerrado",     color: "#6B7280", bg: "#F9FAFB", icon: "🔒" },
};

const PRIORITY_CONFIG = {
  CRITICAL: { label: "Crítico",  color: "#DC2626", bg: "#FEF2F2" },
  HIGH:     { label: "Alto",     color: "#D97706", bg: "#FFFBEB" },
  MEDIUM:   { label: "Medio",    color: "#1D4ED8", bg: "#EFF6FF" },
  LOW:      { label: "Bajo",     color: "#6B7280", bg: "#F9FAFB" },
};

const CAT_LABELS = {
  CALIDAD_SERVICIO:         "Calidad del servicio",
  NO_SE_PRESENTO:           "No se presentó",
  COBRO_INDEBIDO:           "Cobro indebido",
  MATERIALES_FALTANTES:     "Materiales faltantes",
  DATOS_FALSOS:             "Datos falsos",
  ACUERDO_FUERA_PLATAFORMA: "Pago fuera de plataforma",
  PAGO_NO_LIBERADO:         "Pago no liberado",
  OTRO:                     "Otro",
};

export default function AdminReclamos() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();

  const [claims, setClaims]     = useState([]);
  const [counts, setCounts]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [actionForm, setActionForm] = useState({ status: "", adminNote: "", resolution: "" });
  const [actionMsg, setActionMsg]   = useState(null);
  const [actionErr, setActionErr]   = useState(null);
  const [replyText, setReplyText]   = useState("");
  const [busy, setBusy]             = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    loadClaims();
  }, [isReady, user]);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter)   params.set("status",   statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      const data = await apiRequest(`/api/admin/claims?${params}`);
      if (data.ok) {
        setClaims(data.claims || []);
        setCounts(data.counts || {});
      }
    } catch {}
    setLoading(false);
  }, [apiRequest, statusFilter, priorityFilter]);

  useEffect(() => { loadClaims(); }, [statusFilter, priorityFilter]);

  const selectClaim = async (claim) => {
    setSelected(claim);
    setActionForm({ status: claim.status, adminNote: claim.adminNote || "", resolution: claim.resolution || "" });
    setActionMsg(null); setActionErr(null);
    try {
      const data = await apiRequest(`/api/claims/${claim.id}/messages`);
      if (data.ok) setMessages(data.messages || []);
    } catch {}
  };

  const updateClaim = async () => {
    if (!selected) return;
    setBusy(true); setActionMsg(null); setActionErr(null);
    try {
      const data = await apiRequest(`/api/claims/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify(actionForm),
      });
      if (data.ok) {
        setActionMsg("✅ Reclamo actualizado");
        setSelected(data.claim);
        await loadClaims();
      } else {
        setActionErr(data.error || "Error al actualizar");
      }
    } catch (e) {
      setActionErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selected) return;
    setBusy(true);
    try {
      const data = await apiRequest(`/api/claims/${selected.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: replyText.trim() }),
      });
      if (data.ok) {
        setReplyText("");
        const msgs = await apiRequest(`/api/claims/${selected.id}/messages`);
        if (msgs.ok) setMessages(msgs.messages || []);
        await loadClaims();
      }
    } catch {}
    setBusy(false);
  };

  if (!isReady) return null;

  return (
    <>
      <Head><title>Admin · Reclamos — OficiosYa</title></Head>
      <NavBar />
      <DashboardShell
        title="Reclamos"
        subtitle={`${counts.total || 0} total · ${counts.pending || 0} pendientes`}
        navItems={ADMIN_NAV}
        active="/admin/reclamos"
      >

        {/* KPIs */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
          <KpiCard title="Pendientes"  value={counts.pending  || 0} icon="⏳" color="var(--warning)" />
          <KpiCard title="Abiertos"    value={counts.open     || 0} icon="🔵" color="var(--info)" />
          <KpiCard title="En revisión" value={counts.inReview || 0} icon="🔍" color="#7C3AED" />
          <KpiCard title="Resueltos"   value={counts.resolved || 0} icon="✅" color="var(--primary)" />
          <KpiCard title="Rechazados"  value={counts.rejected || 0} icon="❌" color="var(--danger)" />
        </section>

        {/* Detail panel */}
        {selected && (
          <div className="card animate-slide-down" style={{ border: `2px solid ${PRIORITY_CONFIG[selected.priority]?.color || "var(--border)"}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: 0, marginBottom: 8 }}
                >
                  ← Volver a la lista
                </button>
                <h2 style={{ color: F, marginBottom: 4, fontSize: "1.15rem" }}>
                  {CAT_LABELS[selected.category] || selected.category}
                </h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>📅 {new Date(selected.createdAt).toLocaleString("es-AR")}</span>
                  <span>🔗 Solicitud: {selected.requestId?.slice(0, 16)}</span>
                  {selected.resolvedAt && <span>✅ Resuelto: {new Date(selected.resolvedAt).toLocaleString("es-AR")}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRIORITY_CONFIG[selected.priority] && (
                  <span style={{ background: PRIORITY_CONFIG[selected.priority].bg, color: PRIORITY_CONFIG[selected.priority].color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                    🎯 {PRIORITY_CONFIG[selected.priority].label}
                  </span>
                )}
                {STATUS_CONFIG[selected.status] && (
                  <span style={{ background: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                    {STATUS_CONFIG[selected.status].icon} {STATUS_CONFIG[selected.status].label}
                  </span>
                )}
              </div>
            </div>

            {/* Parties */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>RECLAMANTE</div>
                <div style={{ fontWeight: 700, color: F }}>{selected.reporter?.name || "—"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.reporter?.email}</div>
                <div style={{ fontSize: 11, color: V, fontWeight: 700, marginTop: 4 }}>{selected.reporterRole}</div>
              </div>
              <div style={{ background: "#FEF2F2", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>ACUSADO</div>
                <div style={{ fontWeight: 700, color: F }}>{selected.accused?.name || "—"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.accused?.email}</div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 13, lineHeight: 1.6, color: F }}>
              {selected.description}
            </div>

            {/* Admin action form */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, color: F, marginBottom: 12 }}>⚙️ Acciones de administrador</h3>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Estado</label>
                  <select
                    className="input"
                    value={actionForm.status}
                    onChange={e => setActionForm(f => ({ ...f, status: e.target.value }))}
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Nota interna (visible para el usuario)</label>
                  <textarea
                    className="input"
                    value={actionForm.adminNote}
                    onChange={e => setActionForm(f => ({ ...f, adminNote: e.target.value }))}
                    rows={2}
                    placeholder="Ej: Estamos investigando el reclamo, contactamos al prestador..."
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Resolución final</label>
                  <textarea
                    className="input"
                    value={actionForm.resolution}
                    onChange={e => setActionForm(f => ({ ...f, resolution: e.target.value }))}
                    rows={2}
                    placeholder="Descripción de cómo se resolvió el caso..."
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-primary btn-sm" onClick={updateClaim} disabled={busy}>
                    {busy ? "Guardando…" : "Guardar cambios"}
                  </button>
                  {actionMsg && <span style={{ color: V, fontSize: 13 }}>{actionMsg}</span>}
                  {actionErr && <span style={{ color: "var(--danger-700)", fontSize: 13 }}>{actionErr}</span>}
                </div>
              </div>
            </div>

            {/* Messages thread */}
            <div>
              <h3 style={{ fontSize: 14, color: F, marginBottom: 10 }}>💬 Conversación con usuario</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", padding: "4px 0", marginBottom: 12 }}>
                {messages.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>Sin mensajes aún</p>
                ) : messages.map(m => {
                  const isAdmin = m.senderRole === "ADMIN";
                  return (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2, fontWeight: 600 }}>
                        {m.senderName} {isAdmin ? "(Admin)" : ""}
                      </div>
                      <div style={{
                        maxWidth: "75%", padding: "8px 12px", fontSize: 13, lineHeight: 1.5,
                        borderRadius: isAdmin ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                        background: isAdmin ? `linear-gradient(135deg,${V},${F})` : "#fff",
                        color: isAdmin ? "#fff" : "var(--text)",
                        border: isAdmin ? "none" : "1px solid var(--border)",
                      }}>
                        {m.body}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                        {new Date(m.createdAt).toLocaleString("es-AR")}
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={sendReply} style={{ display: "flex", gap: 10 }}>
                <input
                  className="input"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Responder al usuario (visible para el reclamante)…"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={!replyText.trim() || busy}>
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Filters + list */}
        {!selected && (
          <div className="card-flat">
            {/* Filters */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <select
                className="input"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: "auto", minWidth: 160 }}
              >
                <option value="">Todos los estados</option>
                {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
              <select
                className="input"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                style={{ width: "auto", minWidth: 160 }}
              >
                <option value="">Todas las prioridades</option>
                {Object.entries(PRIORITY_CONFIG).map(([k,v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <button className="btn btn-ghost btn-sm" onClick={loadClaims}>
                🔄 Actualizar
              </button>
            </div>

            {loading ? (
              <div style={{ padding: "32px 0" }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 10 }} />)}
              </div>
            ) : claims.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ color: "var(--text-muted)" }}>Sin reclamos {statusFilter ? `con estado "${STATUS_CONFIG[statusFilter]?.label}"` : "registrados"}.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {claims.map(claim => {
                  const sc = STATUS_CONFIG[claim.status] || {};
                  const pc = PRIORITY_CONFIG[claim.priority] || {};
                  return (
                    <div
                      key={claim.id}
                      onClick={() => selectClaim(claim)}
                      style={{
                        border: `1.5px solid ${pc.color || "var(--border)"}30`,
                        borderLeft: `4px solid ${pc.color || "var(--border)"}`,
                        borderRadius: 12, padding: "12px 16px", cursor: "pointer",
                        background: "#fff", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: F, fontSize: 13 }}>{CAT_LABELS[claim.category] || claim.category}</span>
                            <span style={{ background: pc.bg || "#F9FAFB", color: pc.color || "#6B7280", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>
                              {pc.label}
                            </span>
                            <span style={{ background: sc.bg || "#F9FAFB", color: sc.color || "#6B7280", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>
                              {sc.icon} {sc.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                            👤 {claim.reporter?.name || claim.reporterId?.slice(0, 12)} ({claim.reporterRole})
                            {" · "}
                            🔗 {claim.requestId?.slice(0, 14)}
                          </div>
                          <div style={{ fontSize: 12, color: F, lineHeight: 1.4 }}>
                            {claim.description?.slice(0, 100)}{claim.description?.length > 100 ? "…" : ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                          {new Date(claim.createdAt).toLocaleDateString("es-AR")}
                          <br />
                          <span style={{ color: "var(--text-muted)" }}>›</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </DashboardShell>
      <Footer />
    </>
  );
}
