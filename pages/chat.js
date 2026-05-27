/**
 * /chat — Hub de conversaciones unificado
 * Muestra todos los hilos del usuario (cliente o prestador)
 * con acceso directo a cada conversación
 */
import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

function formatRelative(iso) {
  if (!iso) return "";
  const now   = new Date();
  const date  = new Date(iso);
  const diffMs = now - date;
  const diffM  = Math.floor(diffMs / 60000);
  if (diffM < 1)   return "Justo ahora";
  if (diffM < 60)  return `Hace ${diffM} min`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24)  return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7)   return `Hace ${diffD}d`;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export default function ChatHub() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();

  const [threads, setThreads]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [search,  setSearch]   = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    loadThreads();
  }, [isReady, user]);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/chat/threads");
      if (data.ok) setThreads(data.threads || []);
    } catch {}
    setLoading(false);
  }, [apiRequest]);

  // Poll every 15 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => loadThreads(), 15000);
    return () => clearInterval(interval);
  }, [user, loadThreads]);

  const getThreadLink = (thread) => {
    if (user?.role === "PROVIDER") return `/providers/chat/${thread.requestId}`;
    return `/client/chat/${thread.requestId}`;
  };

  const getUnread = (thread) => {
    if (!user) return 0;
    return user.role === "PROVIDER" ? thread.unreadProvider : thread.unreadClient;
  };

  const filtered = threads.filter(t =>
    !search ||
    t.requestId?.toLowerCase().includes(search.toLowerCase()) ||
    t.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isReady || !user) return null;

  return (
    <>
      <Head><title>Chat · OficiosYa</title></Head>
      <NavBar />

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ color: F, marginBottom: 4 }}>💬 Mensajes</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {threads.length} conversaciones · {threads.reduce((s,t) => s + getUnread(t), 0)} sin leer
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadThreads}>🔄</button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 16 }}>🔍</span>
          <input
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar conversación…"
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Threads list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 76, borderRadius: 14 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <h3 style={{ color: F, marginBottom: 8 }}>
              {search ? "Sin resultados" : "Sin conversaciones aún"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
              {search
                ? "Intentá con otros términos"
                : user.role === "CLIENT"
                  ? "Las conversaciones aparecen cuando solicitás un servicio."
                  : "Las conversaciones aparecen cuando un cliente te contacta."
              }
            </p>
            {!search && user.role === "CLIENT" && (
              <Link href="/client/buscar">
                <button className="btn btn-primary">Buscar prestadores →</button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(thread => {
              const unread  = getUnread(thread);
              const href    = getThreadLink(thread);
              return (
                <Link key={thread.id} href={href} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#fff", border: "1.5px solid var(--border)",
                    borderRadius: 16, padding: "14px 16px",
                    display: "flex", gap: 14, alignItems: "center",
                    transition: "all 0.15s",
                    borderLeft: unread > 0 ? `4px solid ${V}` : "1.5px solid var(--border)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.borderColor = V; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = unread > 0 ? V : "var(--border)"; }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg,${V},${F})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 800, fontSize: 18, position: "relative",
                    }}>
                      💬
                      {unread > 0 && (
                        <span style={{
                          position: "absolute", top: -2, right: -2,
                          background: "var(--danger)", color: "#fff",
                          width: 18, height: 18, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 800, border: "2px solid #fff",
                        }}>
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: unread > 0 ? 800 : 600, color: F, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Solicitud {thread.requestId?.slice(0, 12)}…
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, fontWeight: unread > 0 ? 700 : 400 }}>
                          {formatRelative(thread.lastMessageAt || thread.updatedAt)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 13, color: unread > 0 ? F : "var(--text-muted)",
                        fontWeight: unread > 0 ? 600 : 400,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {thread.lastMessage || "Sin mensajes aún — iniciá la conversación"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Moderación notice */}
        <div style={{ marginTop: 24, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#92400E", display: "flex", gap: 8 }}>
          <span>🛡️</span>
          <span>Los mensajes son monitoreados automáticamente. Acordar pagos fuera de la plataforma viola los términos y puede resultar en suspensión.</span>
        </div>
      </main>

      <Footer />
    </>
  );
}
