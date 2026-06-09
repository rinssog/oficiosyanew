import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import KpiCard from "../../components/KpiCard";
import ProviderAvailability from "../../components/ProviderAvailability";
import ProviderNotifications from "../../components/ProviderNotifications";
import RequireRole from "../../components/RequireRole";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const F = "#0D3B1F", V = "#16A34A";

const PROVIDER_NAV = [
  { href: "/providers/dashboard",   label: "📊 Mi panel" },
  { href: "/providers/solicitudes", label: "📋 Solicitudes" },
  { href: "/providers/quotes",      label: "💬 Presupuestos" },
  { href: "/providers/verificacion",label: "🛡️ Verificación" },
  { href: "/chat",                  label: "💬 Chat" },
];

const STATUS_COLORS = {
  PENDING: "#6B7280", QUOTE_PENDING: "#1D4ED8", ACCEPTED: "#16A34A",
  IN_PROGRESS: "#D97706", DONE: "#166534", CANCELLED: "#DC2626",
};
const STATUS_LABELS = {
  PENDING: "⏳ Pendiente", QUOTE_PENDING: "📋 Presupuesto",
  ACCEPTED: "✅ Aceptado", IN_PROGRESS: "🔧 En progreso",
  DONE: "✔️ Completado", CANCELLED: "❌ Cancelado",
};

const statusColors = {
  PENDING: "#fbbf24", SUBMITTED: "#3b82f6", APPROVED: "#16a34a", REJECTED: "#f87171",
};

async function fetchCatalog(apiBase) {
  const res = await fetch(apiBase + '/api/catalog');
  const data = await res.json();
  return data.catalog || [];
}

export default function ProviderDashboard() {
  const router = useRouter();
  const { user, provider, refreshProvider, apiRequest, isReady } = useAuth();
  const providerId = provider?.id;

  const [catalog, setCatalog]     = useState([]);
  const [services, setServices]   = useState([]);
  const [profile, setProfile]     = useState(null);
  const [barrios, setBarrios]     = useState([]);
  const [areasDraft, setAreasDraft] = useState([]);
  const [areasSaving, setAreasSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [form, setForm] = useState({ catalogId: "", pricingType: "FIXED", price: "", notes: "" });
  const [message, setMessage] = useState(null);
  const [error, setError]     = useState(null);
  const [docMessage, setDocMessage] = useState(null);
  const [docError, setDocError]     = useState(null);

  const [cancellationForm, setCancellationForm] = useState({ requestId: "", action: "RESCHEDULE", reason: "", proposedDate: "", proposedStart: "", proposedEnd: "" });
  const [cancellationMessage, setCancellationMessage] = useState(null);
  const [cancellationError, setCancellationError]     = useState(null);

  // Recent requests (for dashboard overview)
  const [requests, setRequests]  = useState([]);
  const [reqLoading, setReqLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    if (!user)                         { router.replace("/auth/login"); return; }
    if (user.role !== "PROVIDER")      { router.replace("/"); return; }
    if (!providerId) refreshProvider(user.id);
  }, [isReady, user, providerId]);

  useEffect(() => {
    if (!providerId || !isReady) return;
    const load = async () => {
      try {
        const [catalogItems, servicesRes, profileRes, barriosRes] = await Promise.all([
          fetchCatalog(API_BASE),
          apiRequest('/api/providers/' + providerId + '/services'),
          apiRequest('/api/providers/' + providerId + '/profile'),
          fetch(API_BASE + '/api/reference/barrios').then(r => r.json()),
        ]);
        setCatalog(catalogItems);
        setServices(servicesRes.services || []);
        const profileData = profileRes.profile || null;
        setProfile(profileData);
        setAreasDraft(profileData?.areas || []);
        setDocuments(profileData?.documents || []);
        setBarrios(barriosRes.barrios || []);
        if (!form.catalogId && catalogItems.length) {
          setForm(p => ({ ...p, catalogId: catalogItems[0].id }));
        }
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [providerId, isReady]);

  // Load recent requests for this provider
  useEffect(() => {
    if (!providerId || !isReady) return;
    setReqLoading(true);
    apiRequest(`/api/providers/${providerId}/requests`).then(d => {
      setRequests(d.requests || []);
    }).catch(() => {
      // Fallback: filter from all requests
      apiRequest('/api/requests').then(d => {
        const all = d.requests || d || [];
        setRequests(Array.isArray(all) ? all.filter(r => r.providerId === providerId).slice(0, 5) : []);
      }).catch(() => setRequests([]));
    }).finally(() => setReqLoading(false));
  }, [providerId, isReady]);

  const priceFormatter = useMemo(() => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }), []);
  const selectedCatalog = useMemo(() => catalog.find(item => item.id === form.catalogId) || null, [catalog, form.catalogId]);

  const toggleArea = (barrio) => setAreasDraft(p => p.includes(barrio) ? p.filter(i => i !== barrio) : [...p, barrio]);

  const handleSaveAreas = async () => {
    if (!providerId) return;
    setAreasSaving(true);
    try {
      const res = await apiRequest('/api/providers/' + providerId + '/areas', { method: "PUT", body: JSON.stringify({ areas: areasDraft }) });
      setProfile(res.profile || res);
      setDocMessage("Zonas actualizadas");
    } catch (err) { setDocError(err.message); }
    finally { setAreasSaving(false); }
  };

  const handleDocUpload = async (type, file) => {
    if (!providerId || !file) return;
    setDocMessage(null); setDocError(null);
    try {
      const formData = new FormData();
      formData.append("type", type); formData.append("file", file);
      await apiRequest('/api/providers/' + providerId + '/documents', { method: "POST", body: formData });
      const refreshed = await apiRequest('/api/providers/' + providerId + '/profile');
      setDocuments(refreshed.profile?.documents || []);
      setDocMessage("Documento enviado");
    } catch (err) { setDocError(err.message); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage(null); setError(null);
    if (!providerId) return;
    try {
      if (!form.catalogId) throw new Error("Seleccioná un rubro.");
      if (!form.price || isNaN(Number(form.price))) throw new Error("Indicá un precio válido.");
      await apiRequest('/api/providers/' + providerId + '/services', {
        method: "POST",
        body: JSON.stringify({ catalogId: form.catalogId, pricingType: form.pricingType, price: Number(form.price) * 100, notes: form.notes }),
      });
      const refreshed = await apiRequest('/api/providers/' + providerId + '/services');
      setServices(refreshed.services || []);
      setForm({ catalogId: form.catalogId, pricingType: "FIXED", price: "", notes: "" });
      setMessage("Servicio publicado");
    } catch (err) { setError(err.message); }
  };

  const handleDeleteService = async (serviceId) => {
    if (!providerId) return;
    try {
      await apiRequest('/api/providers/' + providerId + '/services/' + serviceId, { method: "DELETE" });
      const refreshed = await apiRequest('/api/providers/' + providerId + '/services');
      setServices(refreshed.services || []);
      setMessage("Servicio eliminado");
    } catch (err) { setError(err.message); }
  };

  const handleCancellationSubmit = async (e) => {
    e.preventDefault();
    setCancellationError(null); setCancellationMessage(null);
    try {
      const payload = { action: cancellationForm.action, reason: cancellationForm.reason };
      if (cancellationForm.action === "RESCHEDULE" && cancellationForm.proposedDate) {
        payload.proposedSlot = { date: cancellationForm.proposedDate, start: cancellationForm.proposedStart, end: cancellationForm.proposedEnd };
      }
      await apiRequest('/api/requests/' + cancellationForm.requestId + '/cancel', { method: "POST", body: JSON.stringify(payload) });
      setCancellationMessage("Aviso enviado al cliente");
      setCancellationForm({ requestId: "", action: "RESCHEDULE", reason: "", proposedDate: "", proposedStart: "", proposedEnd: "" });
    } catch (err) { setCancellationError(err.message); }
  };

  const verificationScore = useMemo(() => {
    if (!documents.length) return 0;
    const approved = documents.filter(d => d.status === "APPROVED").length;
    return Math.round((approved / documents.length) * 100);
  }, [documents]);

  if (!isReady || !user) return null;

  const TABS = [
    { id: "overview",   label: "📊 Resumen" },
    { id: "services",   label: "🔧 Servicios" },
    { id: "zones",      label: "📍 Zonas" },
    { id: "documents",  label: "📄 Documentos" },
    { id: "cancel",     label: "🚫 Cancelaciones" },
  ];

  return (
    <div>
      <Head><title>OficiosYa | Panel del Prestador</title></Head>
      <NavBar />
      <RequireRole role="PROVIDER">
        <DashboardShell
          title={`Hola, ${user.name?.split(" ")[0] || "prestador"} 🔧`}
          subtitle="Gestioná tus servicios, zonas, agenda y conversaciones."
          navItems={PROVIDER_NAV}
          active="/providers/dashboard"
          rightSlot={
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/chat">
                <button className="btn btn-secondary btn-sm">💬 Chat</button>
              </Link>
              <Link href="/providers/verificacion">
                <button className="btn btn-primary btn-sm">
                  {verificationScore < 100 ? `✅ Verificación ${verificationScore}%` : "✅ Verificado"}
                </button>
              </Link>
            </div>
          }
        >

          {/* Tab navigation */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: 6 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: activeTab === t.id ? `linear-gradient(135deg,${V},${F})` : "transparent",
                  color: activeTab === t.id ? "#fff" : "var(--text-soft)",
                  border: "none", borderRadius: 10, padding: "8px 16px",
                  fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500,
                  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                  minHeight: 40,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: OVERVIEW ──────────────────────────────────── */}
          {activeTab === "overview" && (
            <>
              {/* KPIs */}
              <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                <KpiCard title="Servicios activos" value={services.length}                                   icon="🔧" />
                <KpiCard title="Zonas de cobertura" value={profile?.areas?.length || 0}                     icon="📍" />
                <KpiCard title="Verificación"       value={`${verificationScore}%`}                         icon="🛡️" color={verificationScore === 100 ? "var(--primary)" : "var(--warning)"} />
                <KpiCard title="Solicitudes activas" value={requests.filter(r => r.status === "IN_PROGRESS").length} icon="📋" />
              </section>

              {/* Recent requests */}
              <div className="card-flat">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ color: F, fontSize: "1.1rem" }}>📋 Solicitudes recientes</h2>
                  <Link href="/providers/solicitudes" style={{ fontSize: 13, color: V, fontWeight: 700 }}>Ver todas →</Link>
                </div>
                {reqLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
                  </div>
                ) : requests.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                    <p>Aún sin solicitudes asignadas.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {requests.slice(0, 5).map(req => (
                      <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, gap: 10, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: F, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {req.notes || `Solicitud ${req.id?.slice(0,10)}`}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString("es-AR") : ""}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                          <span style={{ background: `${STATUS_COLORS[req.status] || "#6B7280"}20`, color: STATUS_COLORS[req.status] || "#6B7280", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                            {STATUS_LABELS[req.status] || req.status}
                          </span>
                          <Link href={`/providers/solicitud/${req.id}`}>
                            <button className="btn btn-ghost btn-sm">Ver</button>
                          </Link>
                          <Link href={`/providers/chat/${req.id}`}>
                            <button className="btn btn-secondary btn-sm">💬</button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability & Notifications */}
              <ProviderAvailability providerId={providerId} apiRequest={apiRequest} />
              <ProviderNotifications providerId={providerId} apiRequest={apiRequest} />
            </>
          )}

          {/* ── TAB: SERVICES ──────────────────────────────────── */}
          {activeTab === "services" && (
            <div className="card-flat" style={{ display: "grid", gap: 20 }}>
              <h2 style={{ color: F }}>🔧 Servicios publicados</h2>

              {/* Add new service */}
              <form onSubmit={handleCreate} style={{ border: "1.5px solid var(--border)", borderRadius: 14, padding: 18, display: "grid", gap: 12, background: "var(--gray-50)" }}>
                <h3 style={{ color: F, fontSize: "0.95rem" }}>+ Agregar nuevo servicio</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Rubro del catálogo</label>
                    <select className="input" value={form.catalogId} onChange={e => setForm(p => ({ ...p, catalogId: e.target.value }))}>
                      {catalog.map(item => <option key={item.id} value={item.id}>{item.rubro} - {item.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Tipo de tarifa</label>
                    <select className="input" value={form.pricingType} onChange={e => setForm(p => ({ ...p, pricingType: e.target.value }))}>
                      <option value="FIXED">Precio fijo</option>
                      <option value="HOURLY">Por hora</option>
                      <option value="PER_UNIT">Por unidad</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Precio en ARS</label>
                    <input className="input" type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Ej: 18000" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Notas del servicio</label>
                  <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Descripción, alcance, materiales incluidos…" style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button type="submit" className="btn btn-primary btn-sm">Publicar servicio</button>
                  {message && <span style={{ color: V, fontSize: 13 }}>✅ {message}</span>}
                  {error   && <span style={{ color: "var(--danger-700)", fontSize: 13 }}>❌ {error}</span>}
                </div>
              </form>

              {/* Services list */}
              {services.length === 0 ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>Sin servicios publicados aún.</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {services.map(srv => (
                    <div key={srv.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 16, background: "#fff", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: F, marginBottom: 4 }}>{srv.catalog?.nombre || "Servicio"}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{srv.catalog?.rubro}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: V, marginTop: 4 }}>{priceFormatter.format((srv.price || 0) / 100)}</div>
                      </div>
                      <button onClick={() => handleDeleteService(srv.id)} className="btn btn-danger btn-sm">Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: ZONES ─────────────────────────────────────── */}
          {activeTab === "zones" && (
            <div className="card-flat" style={{ display: "grid", gap: 16 }}>
              <h2 style={{ color: F }}>📍 Zonas de trabajo</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Seleccioná los barrios donde querés operar.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {barrios.map(barrio => (
                  <label key={barrio} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                    border: `1.5px solid ${areasDraft.includes(barrio) ? V : "var(--border)"}`,
                    borderRadius: 10, cursor: "pointer",
                    background: areasDraft.includes(barrio) ? "var(--green-50)" : "var(--gray-50)",
                    fontSize: 13, transition: "all 0.15s",
                  }}>
                    <input type="checkbox" checked={areasDraft.includes(barrio)} onChange={() => toggleArea(barrio)} style={{ accentColor: V }} />
                    {barrio}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button className="btn btn-primary" onClick={handleSaveAreas} disabled={areasSaving}>
                  {areasSaving ? "Guardando…" : "Guardar zonas"}
                </button>
                {docMessage && <span style={{ color: V, fontSize: 13 }}>✅ {docMessage}</span>}
                {docError   && <span style={{ color: "var(--danger-700)", fontSize: 13 }}>❌ {docError}</span>}
              </div>
            </div>
          )}

          {/* ── TAB: DOCUMENTS ─────────────────────────────────── */}
          {activeTab === "documents" && (
            <div className="card-flat" style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ color: F }}>📄 Documentación obligatoria</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 120, height: 6, background: "var(--gray-200)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${verificationScore}%`, height: "100%", background: verificationScore === 100 ? V : "#F59E0B", borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: verificationScore === 100 ? V : "#92400E" }}>{verificationScore}%</span>
                </div>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Los documentos se revisan en 24-48h hábiles.</p>
              {documents.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No hay documentos requeridos en este momento.</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {documents.map(doc => {
                    const docUrl = doc.url && (doc.url.startsWith("http") ? doc.url : API_BASE + doc.url);
                    return (
                      <div key={doc.type} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "#f9fafb", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: F, marginBottom: 2 }}>{doc.label}</div>
                          <span style={{ background: `${statusColors[doc.status] || "#6B7280"}20`, color: statusColors[doc.status] || "#6B7280", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                            {doc.status}
                          </span>
                          {doc.notes && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{doc.notes}</div>}
                        </div>
                        {docUrl ? (
                          <a href={docUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Ver archivo</a>
                        ) : (
                          <UploadField onUpload={file => handleDocUpload(doc.type, file)} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: CANCELLATIONS ─────────────────────────────── */}
          {activeTab === "cancel" && (
            <div className="card-flat" style={{ display: "grid", gap: 16 }}>
              <h2 style={{ color: F }}>🚫 Cancelar / Reprogramar</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                Notificá al cliente cuando no podés asistir. Recordá: cancelaciones injustificadas afectan tu ranking.
              </p>
              <form onSubmit={handleCancellationSubmit} style={{ display: "grid", gap: 12, border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>ID de solicitud</label>
                  <input className="input" value={cancellationForm.requestId} onChange={e => setCancellationForm(p => ({ ...p, requestId: e.target.value }))} placeholder="req_xxx" required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Acción</label>
                  <select className="input" value={cancellationForm.action} onChange={e => setCancellationForm(p => ({ ...p, action: e.target.value }))}>
                    <option value="RESCHEDULE">Proponer reprogramación</option>
                    <option value="CANCEL">Cancelar definitivamente</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Motivo</label>
                  <textarea className="input" rows={3} value={cancellationForm.reason} onChange={e => setCancellationForm(p => ({ ...p, reason: e.target.value }))} placeholder="Describí el motivo brevemente" style={{ resize: "vertical" }} />
                </div>
                {cancellationForm.action === "RESCHEDULE" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Fecha propuesta</label>
                      <input type="date" className="input" value={cancellationForm.proposedDate} onChange={e => setCancellationForm(p => ({ ...p, proposedDate: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Desde</label>
                      <input type="time" className="input" value={cancellationForm.proposedStart} onChange={e => setCancellationForm(p => ({ ...p, proposedStart: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: F, display: "block", marginBottom: 4 }}>Hasta</label>
                      <input type="time" className="input" value={cancellationForm.proposedEnd} onChange={e => setCancellationForm(p => ({ ...p, proposedEnd: e.target.value }))} />
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button type="submit" className="btn btn-primary btn-sm">Enviar aviso</button>
                  {cancellationMessage && <span style={{ color: V, fontSize: 13 }}>✅ {cancellationMessage}</span>}
                  {cancellationError   && <span style={{ color: "var(--danger-700)", fontSize: 13 }}>❌ {cancellationError}</span>}
                </div>
              </form>
            </div>
          )}

        </DashboardShell>
      </RequireRole>
      <Footer />
    </div>
  );
}

function UploadField({ onUpload }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <span className="btn btn-secondary btn-sm">📤 Subir archivo</span>
      <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
    </label>
  );
}
