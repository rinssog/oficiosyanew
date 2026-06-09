/**
 * /client/reclamos — Sistema de reclamos del cliente
 * Crear reclamos · Ver estado · Historial de conversación con admin
 */
import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

const navItems = [
  { href: "/client/dashboard",   label: "Panel general" },
  { href: "/client/urgencias",   label: "Urgencias 24/7", badge: "24/7" },
  { href: "/client/contratos",   label: "Contratos" },
  { href: "/client/facturacion", label: "Pagos" },
  { href: "/client/reclamos",    label: "Reclamos" },
  { href: "/chat",               label: "Chat" },
];

const CATEGORIES = [
  { value: "CALIDAD_SERVICIO",          label: "Calidad del servicio",       icon: "⭐", desc: "El trabajo no cumplió lo acordado" },
  { value: "NO_SE_PRESENTO",            label: "No se presentó",             icon: "🚫", desc: "El prestador no apareció" },
  { value: "COBRO_INDEBIDO",            label: "Cobro excesivo / indebido",  icon: "💸", desc: "Se cobró más de lo acordado" },
  { value: "MATERIALES_FALTANTES",      label: "Materiales faltantes",       icon: "🔧", desc: "No incluyó los materiales prometidos" },
  { value: "ACUERDO_FUERA_PLATAFORMA",  label: "Pago fuera de plataforma",   icon: "⚠️", desc: "Intentó cobrar por fuera de OficiosYa" },
  { value: "PAGO_NO_LIBERADO",          label: "Pago no liberado",           icon: "🔒", desc: "El pago en custodia no fue liberado" },
  { value: "OTRO",                      label: "Otro motivo",                icon: "📋", desc: "Describí el problema en detalle" },
];

const STATUS_CONFIG = {
  PENDING:   { label: "Pendiente de revisión", color: "#92400E", bg: "#FFFBEB", icon: "⏳" },
  OPEN:      { label: "Abierto — en proceso",  color: "#1D4ED8", bg: "#EFF6FF", icon: "🔵" },
  IN_REVIEW: { label: "En revisión por admin", color: "#7C3AED", bg: "#F5F3FF", icon: "🔍" },
  RESOLVED:  { label: "Resuelto",              color: "#166534", bg: "#F0FDF4", icon: "✅" },
  REJECTED:  { label: "Rechazado",             color: "#DC2626", bg: "#FEF2F2", icon: "❌" },
  CLOSED:    { label: "Cerrado",               color: "#6B7280", bg: "#F9FAFB", icon: "🔒" },
};

const PRIORITY_CONFIG = {
  CRITICAL: { label: "Crítico",  color: "#DC2626", bg: "#FEF2F2" },
  HIGH:     { label: "Alto",     color: "#D97706", bg: "#FFFBEB" },
  MEDIUM:   { label: "Medio",    color: "#1D4ED8", bg: "#EFF6FF" },
  LOW:      { label: "Bajo",     color: "#6B7280", bg: "#F9FAFB" },
};

export default function ClientReclamos() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const { requestId: prefillRequestId } = router.query;

  const [claims, setClaims]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState(null); // claim detail view
  const [messages, setMessages]   = useState([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending]     = useState(false);
  const [msg, setMsg]             = useState(null);
  const [error, setError]         = useState(null);

  const [form, setForm] = useState({
    requestId:   "",
    category:    "",
    description: "",
  });

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "CLIENT") { router.replace("/client/dashboard"); return; }
    if (prefillRequestId) setForm(f => ({ ...f, requestId: prefillRequestId }));
    loadClaims();
  }, [isReady, user, prefillRequestId]);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/claims");
      if (data.ok) setClaims(data.claims || []);
    } catch {}
    setLoading(false);
  }, [apiRequest]);

  const loadClaimMessages = useCallback(async (claimId) => {
    try {
      const data = await apiRequest(`/api/claims/${claimId}/messages`);
      if (data.ok) setMessages(data.messages || []);
    } catch {}
  }, [apiRequest]);

  const selectClaim = (claim) => {
    setSelected(claim);
    loadClaimMessages(claim.id);
  };

  const submitClaim = async (e) => {
    e.preventDefault();
    if (!form.requestId || !form.category || !form.description) {
      setError("Completá todos los campos requeridos");
      return;
    }
    setSending(true); setError(null); setMsg(null);
    try {
      const data = await apiRequest("/api/claims", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (data.ok) {
        setMsg("✅ Reclamo enviado correctamente. Te avisamos cuando lo revisemos.");
        setShowForm(false);
        setForm({ requestId: "", category: "", description: "" });
        await loadClaims();
      } else {
        setError(data.error || "No se pudo enviar el reclamo");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const data = await apiRequest(`/api/claims/${selected.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: replyText.trim() }),
      });
      if (data.ok) {
        setReplyText("");
        await loadClaimMessages(selected.id);
      }
    } catch {}
    setSending(false);
  };

  if (!isReady || !user) return null;

  return (
    <>
      <Head><title>Reclamos · OficiosYa</title></Head>
      <NavBar />
      <DashboardShell
        title="Mis Reclamos"
        subtitle="Gestioná disputas y problemas con servicios."
        navItems={navItems}
        active="/client/reclamos"
        rightSlot={
          <button
            onClick={() => { setShowForm(s => !s); setSelected(null); setError(null); }}
            className="btn btn-primary"
          >
            {showForm ? "Cancelar" : "+ Nuevo reclamo"}
          </button>
        }
      >

        {/* ── Global messages ──────────────────────────────────── */}
        {msg   && <div className="alert alert-success">{msg}</div>}
        {error && !showForm && <div className="alert alert-error">{error}</div>}

        {/* ── NEW CLAIM FORM ───────────────────────────────────── */}
        {showForm && (
          <div className="card animate-slide-down">
            <h2 style={{ marginBottom: 20, color: F }}>📋 Nuevo reclamo</h2>

            <form onSubmit={submitClaim} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Request ID */}
              <div>
                <label style={{ fontWeight: 700, fontSize: 13, color: F, display: "block", marginBottom: 6 }}>
                  ID de solicitud <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  className="input"
                  value={form.requestId}
                  onChange={e => setForm(f => ({ ...f, requestId: e.target.value }))}
                  placeholder="req_xxxxxxxx (lo encontrás en Mis servicios)"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontWeight: 700, fontSize: 13, color: F, display: "block", marginBottom: 10 }}>
                  Motivo del reclamo <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                      style={{
                        background: form.category === cat.value ? "#F0FDF4" : "var(--gray-50)",
                        border: `2px solid ${form.category === cat.value ? V : "var(--border)"}`,
                        borderRadius: 12, padding: "10px 12px", cursor: "pointer",
                        textAlign: "left", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{cat.icon}</div>
                      <div style={{ fontWeight: 700, color: F, fontSize: 12 }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontWeight: 700, fontSize: 13, color: F, display: "block", marginBottom: 6 }}>
                  Descripción detallada <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <textarea
                  className="input"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describí el problema con el mayor detalle posible (mínimo 20 caracteres). ¿Qué pasó? ¿Cuándo? ¿Qué se acordó y qué no se cumplió?"
                  rows={5}
                  style={{ resize: "vertical", minHeight: 100 }}
                  required
                />
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  {form.description.length} / 2000 caracteres (mínimo 20)
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? "Enviando…" : "Enviar reclamo"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── CLAIM DETAIL ─────────────────────────────────────── */}
        {selected && !showForm && (
          <div className="card animate-slide-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, padding: 0, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}
                >
                  ← Volver a mis reclamos
                </button>
                <h2 style={{ color: F, marginBottom: 4 }}>
                  {CATEGORIES.find(c => c.value === selected.category)?.icon} {CATEGORIES.find(c => c.value === selected.category)?.label}
                </h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Solicitud: {selected.requestId?.slice(0, 20)} · {new Date(selected.createdAt).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STATUS_CONFIG[selected.status] && (
                  <span style={{ background: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                    {STATUS_CONFIG[selected.status].icon} {STATUS_CONFIG[selected.status].label}
                  </span>
                )}
                {PRIORITY_CONFIG[selected.priority] && (
                  <span style={{ background: PRIORITY_CONFIG[selected.priority].bg, color: PRIORITY_CONFIG[selected.priority].color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                    Prioridad: {PRIORITY_CONFIG[selected.priority].label}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: F, lineHeight: 1.6 }}>
              {selected.description}
            </div>

            {/* Admin note */}
            {selected.adminNote && (
              <div style={{ background: "var(--info-soft)", border: "1px solid #BFDBFE", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: "#1D4ED8", fontSize: 12, marginBottom: 4 }}>📝 Nota del equipo OficiosYa:</div>
                <div style={{ fontSize: 13, color: "#1E40AF" }}>{selected.adminNote}</div>
              </div>
            )}

            {/* Resolution */}
            {selected.resolution && (
              <div style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: V, fontSize: 12, marginBottom: 4 }}>✅ Resolución:</div>
                <div style={{ fontSize: 13, color: "#166534" }}>{selected.resolution}</div>
              </div>
            )}

            {/* Messages thread */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <h3 style={{ fontSize: 14, color: F, marginBottom: 12 }}>💬 Conversación con soporte</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto", marginBottom: 12 }}>
                {messages.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                    Aún sin mensajes. Podés agregar más detalles abajo.
                  </p>
                ) : messages.map(m => {
                  const mine = m.senderId === user.id;
                  return (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                      {!mine && <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{m.senderName} · {m.senderRole === "ADMIN" ? "⚙️ Soporte" : ""}</div>}
                      <div style={{
                        maxWidth: "75%", padding: "9px 14px",
                        borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: mine ? `linear-gradient(135deg,${V},${F})` : m.senderRole === "ADMIN" ? "var(--info-soft)" : "#fff",
                        color: mine ? "#fff" : "var(--text)",
                        border: mine ? "none" : `1px solid ${m.senderRole === "ADMIN" ? "#BFDBFE" : "var(--border)"}`,
                        fontSize: 13, lineHeight: 1.5,
                      }}>
                        {m.body}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                        {new Date(m.createdAt).toLocaleString("es-AR")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!["RESOLVED", "REJECTED", "CLOSED"].includes(selected.status) && (
                <form onSubmit={sendReply} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    className="input"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Agregá más información o consultá sobre el estado…"
                    rows={2}
                    style={{ flex: 1, resize: "vertical" }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={!replyText.trim() || sending}>
                    Enviar
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── CLAIMS LIST ───────────────────────────────────────── */}
        {!showForm && !selected && (
          <div className="card-flat">
            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div className="skeleton" style={{ width: "100%", height: 72, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: "100%", height: 72 }} />
              </div>
            ) : claims.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <h3 style={{ color: F, marginBottom: 8 }}>Sin reclamos activos</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: 14 }}>
                  Si tuviste algún problema con un servicio, podés abrir un reclamo aquí.
                </p>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  Abrir primer reclamo
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {claims.map(claim => {
                  const sc = STATUS_CONFIG[claim.status] || {};
                  const cat = CATEGORIES.find(c => c.value === claim.category);
                  return (
                    <div
                      key={claim.id}
                      onClick={() => selectClaim(claim)}
                      style={{
                        border: "1.5px solid var(--border)", borderRadius: 14, padding: "14px 16px",
                        cursor: "pointer", display: "flex", gap: 14, alignItems: "center",
                        transition: "all 0.15s", background: "#fff",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{cat?.icon || "📋"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: F, fontSize: 14 }}>{cat?.label || claim.category}</span>
                          <span style={{ background: sc.bg || "#F9FAFB", color: sc.color || "#6B7280", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                            {sc.icon} {sc.label || claim.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                          Solicitud: {claim.requestId?.slice(0, 16)}…
                        </div>
                        <div style={{ fontSize: 12, color: F, lineHeight: 1.4 }}>
                          {claim.description.slice(0, 80)}{claim.description.length > 80 ? "…" : ""}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                          {new Date(claim.createdAt).toLocaleDateString("es-AR")}
                        </div>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: 18, flexShrink: 0 }}>›</span>
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
