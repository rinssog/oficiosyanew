/**
 * pages/providers/solicitudes.js
 * Panel de Solicitudes para Prestadores
 * Muestra solicitudes abiertas en su rubro/zona + solicitudes asignadas al prestador
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

const PROVIDER_NAV = [
  { href: "/providers/dashboard",   label: "📊 Mi panel" },
  { href: "/providers/solicitudes", label: "📋 Solicitudes" },
  { href: "/providers/quotes",      label: "💬 Presupuestos" },
  { href: "/providers/verificacion",label: "🛡️ Verificación" },
  { href: "/chat",                  label: "💬 Chat" },
];

const STATUS_CONFIG = {
  PENDING:      { label: "Pendiente",     color: "#6B7280", bg: "#F9FAFB",  icon: "⏳" },
  QUOTE_PENDING:{ label: "Presupuesto",   color: "#1D4ED8", bg: "#EFF6FF",  icon: "📋" },
  ACCEPTED:     { label: "Aceptado",      color: "#166534", bg: "#F0FDF4",  icon: "✅" },
  IN_PROGRESS:  { label: "En progreso",   color: "#92400E", bg: "#FFFBEB",  icon: "🔧" },
  DONE:         { label: "Completado",    color: "#166534", bg: "#F0FDF4",  icon: "✔️" },
  CANCELLED:    { label: "Cancelado",     color: "#DC2626", bg: "#FEF2F2",  icon: "❌" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#6B7280", bg: "#F9FAFB", icon: "•" };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
      whiteSpace: "nowrap",
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function UrgentBadge() {
  return (
    <span style={{
      background: "#FEF2F2", color: "#DC2626", borderRadius: 20,
      padding: "3px 10px", fontSize: 11, fontWeight: 800, border: "1px solid #FECACA",
    }}>
      🚨 URGENTE
    </span>
  );
}

function RelativeDate({ iso }) {
  if (!iso) return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>;
  const d = new Date(iso);
  const diffH = Math.round((Date.now() - d.getTime()) / 3600000);
  const label = diffH < 1 ? "Hace menos de 1h"
    : diffH < 24 ? `Hace ${diffH}h`
    : diffH < 48 ? "Ayer"
    : d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{label}</span>;
}

export default function ProviderSolicitudes() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();

  const [allRequests,  setAllRequests]  = useState([]);
  const [myRequests,   setMyRequests]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState("disponibles"); // disponibles | mias
  const [filter,       setFilter]       = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [sending,      setSending]      = useState(null); // requestId being quoted

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "PROVIDER") { router.replace("/client/dashboard"); return; }
    loadData();
  }, [isReady, user]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // All open requests (any provider can quote)
      const [allRes, myRes] = await Promise.allSettled([
        apiRequest("/api/requests?status=PENDING&status=QUOTE_PENDING"),
        apiRequest(`/api/providers/${user?.id}/requests`).catch(() => {
          // fallback: filter from all requests
          return apiRequest("/api/requests").then(d => ({
            ok: true,
            requests: (d.requests || []).filter(r =>
              r.providerId === user?.id || r.acceptedProviderId === user?.id
            ),
          }));
        }),
      ]);
      if (allRes.status === "fulfilled" && allRes.value?.ok) {
        setAllRequests(allRes.value.requests || []);
      }
      if (myRes.status === "fulfilled" && myRes.value?.ok) {
        setMyRequests(myRes.value.requests || []);
      }
    } catch {}
    setLoading(false);
  }, [user, apiRequest]);

  const handleQuickQuote = async (requestId) => {
    setSending(requestId);
    try {
      await router.push(`/providers/quotes?requestId=${requestId}`);
    } finally {
      setSending(null);
    }
  };

  const activeList = tab === "disponibles" ? allRequests : myRequests;

  const filtered = activeList.filter(r => {
    if (filter !== "ALL" && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.notes?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const urgent = filtered.filter(r => r.schedule?.urgent);
  const normal = filtered.filter(r => !r.schedule?.urgent);
  const displayed = [...urgent, ...normal];

  if (!isReady || !user) return null;

  return (
    <>
      <Head><title>Solicitudes — OficiosYa Prestador</title></Head>
      <NavBar />
      <DashboardShell
        title="Solicitudes de trabajo"
        subtitle="Solicitudes disponibles en tu área y las asignadas a vos."
        navItems={PROVIDER_NAV}
        active="/providers/solicitudes"
        rightSlot={
          <button className="btn btn-ghost btn-sm" onClick={loadData}>🔄</button>
        }
      >
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1.5px solid var(--border)", paddingBottom: 0, marginBottom: 20 }}>
          {[
            { id: "disponibles", label: `📋 Disponibles (${allRequests.length})` },
            { id: "mias",        label: `✅ Mis solicitudes (${myRequests.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "10px 16px", fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? V : "var(--text-muted)",
                borderBottom: `2px solid ${tab === t.id ? V : "transparent"}`,
                marginBottom: -2, transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por servicio, categoría…"
              style={{ paddingLeft: 38 }}
            />
          </div>
          <select
            className="input"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: "auto", minWidth: 160 }}
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="QUOTE_PENDING">Esperando presupuesto</option>
            <option value="ACCEPTED">Aceptado</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="DONE">Completado</option>
          </select>
        </div>

        {/* Info banner for "disponibles" tab */}
        {tab === "disponibles" && (
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#1D4ED8", display: "flex", gap: 10 }}>
            <span>💡</span>
            <span>Estas son solicitudes abiertas donde podés enviar tu presupuesto. El cliente elegirá la mejor propuesta.</span>
          </div>
        )}

        {/* Urgent notice */}
        {urgent.length > 0 && (
          <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#DC2626", fontWeight: 700, display: "flex", gap: 10, alignItems: "center" }}>
            <span>🚨</span>
            <span>{urgent.length} solicitud{urgent.length > 1 ? "es" : ""} urgente{urgent.length > 1 ? "s" : ""} — respuesta prioritaria</span>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <h3 style={{ color: F, marginBottom: 8 }}>
              {search || filter !== "ALL" ? "Sin resultados" : tab === "disponibles" ? "No hay solicitudes abiertas" : "No tenés solicitudes asignadas"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {tab === "disponibles"
                ? "Cuando los clientes publiquen solicitudes en tu rubro aparecerán aquí."
                : "Las solicitudes que aceptes aparecerán aquí."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayed.map(req => {
              const isUrgent = req.schedule?.urgent;
              return (
                <div
                  key={req.id}
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${isUrgent ? "#FECACA" : "var(--border)"}`,
                    borderLeft: `4px solid ${isUrgent ? "#DC2626" : V}`,
                    borderRadius: 14, padding: "16px 18px",
                    display: "flex", flexDirection: "column", gap: 10,
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: F, fontSize: 15 }}>
                          {req.category || "Servicio general"}
                        </span>
                        <StatusBadge status={req.status} />
                        {isUrgent && <UrgentBadge />}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                        #{req.id?.slice(0, 12)}
                      </span>
                    </div>
                    <RelativeDate iso={req.createdAt} />
                  </div>

                  {/* Description */}
                  {req.notes && (
                    <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6, background: "#F9FAFB", borderRadius: 8, padding: "8px 12px" }}>
                      {req.notes.length > 200 ? req.notes.slice(0, 200) + "…" : req.notes}
                    </p>
                  )}

                  {/* Meta row */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--text-muted)" }}>
                    {req.schedule?.label && (
                      <span>📅 {req.schedule.label}</span>
                    )}
                    {req.schedule?.start && !req.schedule.label && (
                      <span>📅 {new Date(req.schedule.start).toLocaleDateString("es-AR")}</span>
                    )}
                    {req.budget && (
                      <span>💰 Presupuesto referencia: ${Number(req.budget).toLocaleString("es-AR")}</span>
                    )}
                    {req.address && (
                      <span>📍 {req.address}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {tab === "disponibles" && ["PENDING", "QUOTE_PENDING"].includes(req.status) && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={sending === req.id}
                        onClick={() => handleQuickQuote(req.id)}
                      >
                        {sending === req.id ? "Redirigiendo…" : "💼 Enviar presupuesto"}
                      </button>
                    )}
                    {req.id && (
                      <Link href={`/providers/solicitud/${req.id}`}>
                        <button className="btn btn-secondary btn-sm">Ver detalle</button>
                      </Link>
                    )}
                    {req.id && (
                      <Link href={`/providers/chat/${req.id}`}>
                        <button className="btn btn-ghost btn-sm">💬 Chat</button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats summary */}
        {!loading && displayed.length > 0 && (
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
            {urgent.length > 0 && <span style={{ color: "#DC2626", fontWeight: 700 }}>🚨 {urgent.length} urgentes · </span>}
            {displayed.length} solicitudes mostradas
          </div>
        )}

      </DashboardShell>
      <Footer />
    </>
  );
}
