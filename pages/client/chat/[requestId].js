/**
 * /client/chat/[requestId] — Chat del cliente con el prestador
 * Polling cada 5 segundos · Moderación integrada
 */
import { useEffect, useRef, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const F = "#0D3B1F", V = "#16A34A";

const CLIENT_NAV = [
  { href: "/client/dashboard",   label: "Panel general" },
  { href: "/client/urgencias",   label: "Urgencias 24/7", badge: "24/7" },
  { href: "/client/contratos",   label: "Contratos" },
  { href: "/client/facturacion", label: "Pagos" },
  { href: "/client/reclamos",    label: "Reclamos" },
];

/* ── Back arrow ──────────────────────────────────────────────── */
function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* ── Send icon ───────────────────────────────────────────────── */
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ClientChat() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const { requestId } = router.query;

  const [thread, setThread]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [request, setRequest]   = useState(null);
  const [pollActive, setPollActive] = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const pollRef   = useRef(null);

  /* ── Load thread ──────────────────────────────────────────── */
  const loadThread = useCallback(async () => {
    if (!requestId || !user) return;
    try {
      const data = await apiRequest(`/api/chat/threads/by-request/${requestId}`);
      if (data.ok) setThread(data.thread);
    } catch {}
  }, [requestId, user, apiRequest]);

  /* ── Load messages ────────────────────────────────────────── */
  const loadMessages = useCallback(async (silent = false) => {
    if (!thread?.id) return;
    if (!silent) setLoading(true);
    try {
      const data = await apiRequest(`/api/chat/threads/${thread.id}/messages`);
      if (data.ok) {
        setMessages(data.messages || []);
        // Mark as read
        apiRequest(`/api/chat/threads/${thread.id}/read`, { method: "POST" }).catch(() => {});
      }
    } catch {}
    if (!silent) setLoading(false);
  }, [thread?.id, apiRequest]);

  /* ── Load request info ────────────────────────────────────── */
  const loadRequest = useCallback(async () => {
    if (!requestId) return;
    try {
      const data = await apiRequest(`/api/requests/${requestId}`);
      if (data.ok || data.request) setRequest(data.request || data);
    } catch {}
  }, [requestId, apiRequest]);

  useEffect(() => {
    if (!isReady) return;
    if (!user)    { router.replace("/auth/login"); return; }
    if (user.role !== "CLIENT") { router.replace("/client/dashboard"); return; }
  }, [isReady, user]);

  useEffect(() => {
    if (requestId && user) {
      loadThread();
      loadRequest();
    }
  }, [requestId, user]);

  useEffect(() => {
    if (thread?.id) loadMessages();
  }, [thread?.id]);

  /* ── Auto-scroll ────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Polling ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!thread?.id || !pollActive) return;
    pollRef.current = setInterval(() => loadMessages(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [thread?.id, pollActive, loadMessages]);

  /* ── Send message ────────────────────────────────────────────── */
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !thread?.id || sending) return;
    setSending(true);
    setError(null);
    try {
      const data = await apiRequest(`/api/chat/threads/${thread.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: text.trim() }),
      });
      if (data.ok) {
        setText("");
        await loadMessages(true);
        inputRef.current?.focus();
      } else {
        setError(data.error || "No se pudo enviar");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isReady || !user) return null;

  const providerName = request?.provider?.name || request?.providerName || "Prestador";

  return (
    <>
      <Head><title>Chat · OficiosYa</title></Head>
      <NavBar />

      {/* Full-height layout */}
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", background: "var(--bg)" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          background: "#fff", borderBottom: "1px solid var(--border)",
          padding: "12px 20px", display: "flex", alignItems: "center", gap: 14,
          flexShrink: 0,
        }}>
          <Link href="/client/dashboard" style={{ display: "flex", color: F }}>
            <BackArrow />
          </Link>

          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${V},${F})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
            {providerName[0]?.toUpperCase() || "P"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: F, fontSize: 15, lineHeight: 1.2 }}>
              {providerName}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Solicitud: {requestId?.slice(0, 12)}…
              {request?.status && (
                <span style={{ marginLeft: 8, background: "var(--green-50)", color: V, borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                  {request.status}
                </span>
              )}
            </div>
          </div>

          {request && (
            <Link href={`/client/solicitud/${requestId}`}>
              <button style={{ background: "var(--green-50)", color: V, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Ver solicitud
              </button>
            </Link>
          )}
        </div>

        {/* ── Moderación aviso ────────────────────────────────── */}
        <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "8px 20px", fontSize: 11, color: "#92400E", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🛡️</span>
          <span>Los mensajes son monitoreados. Queda prohibido acordar pagos fuera de la plataforma.</span>
        </div>

        {/* ── Messages ─────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <p>Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p style={{ fontWeight: 600, color: F, fontSize: 16, marginBottom: 8 }}>¡Iniciá la conversación!</p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 300, margin: "0 auto" }}>
                Podés consultar detalles del trabajo, materiales necesarios y tiempos estimados.
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const mine = msg.senderId === user.id;
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", maxWidth: "100%" }}>
                  {!mine && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, fontWeight: 600, paddingLeft: 4 }}>
                      {msg.senderName}
                    </div>
                  )}
                  <div style={{
                    maxWidth: "72%",
                    padding: "10px 14px",
                    borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: mine ? `linear-gradient(135deg,${V},${F})` : "#fff",
                    color: mine ? "#fff" : "var(--text)",
                    border: mine ? "none" : "1px solid var(--border)",
                    fontSize: 14,
                    lineHeight: 1.55,
                    wordBreak: "break-word",
                    boxShadow: mine ? "0 2px 8px rgba(22,163,74,0.25)" : "var(--shadow-xs)",
                  }}>
                    {msg.body}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, paddingLeft: 4, paddingRight: 4, display: "flex", gap: 6, alignItems: "center" }}>
                    {formatTime(msg.createdAt)}
                    {mine && msg.read && <span style={{ color: V }}>✓✓</span>}
                    {mine && !msg.read && <span>✓</span>}
                    {msg.moderated && <span style={{ color: "#F59E0B" }}>⚠️ revisado</span>}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ─────────────────────────────────────────── */}
        <div style={{ background: "#fff", borderTop: "1px solid var(--border)", padding: "12px 16px", flexShrink: 0 }}>
          {error && (
            <div style={{ background: "var(--danger-soft)", color: "var(--danger-700)", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 8 }}>
              {error}
            </div>
          )}
          <form onSubmit={sendMessage} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu mensaje… (Enter para enviar)"
              rows={1}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--border)",
                fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5,
                maxHeight: 120, overflowY: "auto", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = V}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              style={{
                width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0,
                background: text.trim() ? `linear-gradient(135deg,${V},${F})` : "var(--gray-200)",
                color: text.trim() ? "#fff" : "var(--text-muted)",
                cursor: text.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              aria-label="Enviar"
            >
              <SendIcon />
            </button>
          </form>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <Link href={`/client/reclamos?requestId=${requestId}`} style={{ fontSize: 11, color: "var(--text-muted)" }}>
              ¿Problemas con este trabajo? Abrir reclamo →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
