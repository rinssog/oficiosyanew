/**
 * pages/admin/verificaciones.jsx
 * Panel de verificación KYC — documentos pendientes + aprobación de prestadores
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
  { href: "/admin/chat-alerts",    label: "🚨 Chat Alerts" },
  { href: "/admin/documentacion",  label: "📄 Docs" },
];

const STATUS_LABELS = { PENDING: "⏳ Pendiente", SUBMITTED: "📬 Enviado", APPROVED: "✅ Aprobado", REJECTED: "❌ Rechazado" };
const STATUS_COLORS = { PENDING: "#6B7280", SUBMITTED: "#1D4ED8", APPROVED: "#16A34A", REJECTED: "#DC2626" };

export default function AdminVerificaciones() {
  const { user, token, isReady } = useAuth();
  const router = useRouter();
  const [docs, setDocs]       = useState([]);
  const [kyc, setKyc]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState({});
  const [msg, setMsg]         = useState(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    loadData();
  }, [isReady, user]);

  async function loadData() {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [docsRes, kycRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/admin/documents/pending`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/admin/verificaciones`,    { headers }).then(r => r.json()),
      ]);
      if (docsRes.status === "fulfilled" && docsRes.value.ok) setDocs(docsRes.value.pending || []);
      if (kycRes.status  === "fulfilled" && kycRes.value.ok)  setKyc(kycRes.value.items || []);
    } catch {}
    setLoading(false);
  }

  async function updateDocStatus(docId, status) {
    setBusy(b => ({ ...b, [docId]: true }));
    setMsg(null);
    try {
      const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const res = await fetch(`${API_BASE}/api/admin/documents/${docId}/status`, {
        method: "POST", headers, body: JSON.stringify({ status }),
      });
      const data = await res.json();
      setMsg(data.ok ? `✅ Documento ${status.toLowerCase()}` : `❌ ${data.error}`);
      if (data.ok) loadData();
    } catch (e) { setMsg(`❌ Error: ${e.message}`); }
    setBusy(b => ({ ...b, [docId]: false }));
  }

  async function approveKyc(logId, approved) {
    setBusy(b => ({ ...b, [logId]: true }));
    setMsg(null);
    try {
      const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const res = await fetch(`${API_BASE}/api/admin/verificaciones/${logId}/approve`, {
        method: "POST", headers, body: JSON.stringify({ approved }),
      });
      const data = await res.json();
      setMsg(data.ok ? (approved ? "✅ Prestador verificado" : "❌ Verificación rechazada") : `❌ ${data.error}`);
      if (data.ok) loadData();
    } catch (e) { setMsg(`❌ Error: ${e.message}`); }
    setBusy(b => ({ ...b, [logId]: false }));
  }

  if (!isReady || loading) return <div style={{ padding: 60, textAlign: "center", color: F }}>Cargando...</div>;

  return (
    <>
      <Head><title>Admin · Verificaciones — OficiosYa</title></Head>
      <NavBar />
      <DashboardShell title="Verificaciones KYC" subtitle="Documentos enviados por prestadores para verificación de identidad." navItems={ADMIN_NAV} active="/admin/verificaciones">

        {msg && <div style={{ background: msg.startsWith("✅") ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${msg.startsWith("✅") ? V : "#DC2626"}`, borderRadius: 10, padding: "10px 16px", fontSize: 14, marginBottom: 8 }}>{msg}</div>}

        {/* ── Documentos pendientes (JSON storage) ── */}
        <section style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", color: F, fontSize: "1.3rem" }}>
            📄 Cola de documentos ({docs.length})
          </h2>
          {docs.length === 0 ? (
            <p style={{ color: "#6B7C6E" }}>No hay documentos pendientes de revisión.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F7F9F5", color: "#6B7C6E", textAlign: "left" }}>
                    {["Prestador ID", "Documento", "Estado", "Enviado", "Acciones"].map(h =>
                      <th key={h} style={{ padding: "10px 12px", fontWeight: 700 }}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc, i) => {
                    const docKey = `${doc.providerId}-${doc.type || i}`;
                    return (
                      <tr key={docKey} style={{ borderTop: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 12px", color: F, fontWeight: 600, fontSize: 12 }}>{doc.providerId}</td>
                        <td style={{ padding: "10px 12px" }}>{doc.label || doc.type}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ background: "#F0FDF4", color: STATUS_COLORS[doc.status] || "#6B7280", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                            {STATUS_LABELS[doc.status] || doc.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#9CA3AF" }}>
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("es-AR") : "—"}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => updateDocStatus(docKey, "APPROVED")} disabled={busy[docKey]}
                              style={{ background: V, color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              Aprobar
                            </button>
                            <button onClick={() => updateDocStatus(docKey, "REJECTED")} disabled={busy[docKey]}
                              style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              Rechazar
                            </button>
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

        {/* ── KYC submissions (Prisma/auditLog) ── */}
        <section style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--border)", padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", color: F, fontSize: "1.3rem" }}>
            🛡️ Solicitudes de verificación ({kyc.length})
          </h2>
          {kyc.length === 0 ? (
            <p style={{ color: "#6B7C6E" }}>No hay solicitudes de verificación activas. {!kyc.length && "(Requiere base de datos PostgreSQL activa)"}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {kyc.map(item => (
                <div key={item.id} style={{ border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: F, fontSize: 14 }}>{item.entityId}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{new Date(item.createdAt).toLocaleString("es-AR")}</div>
                    {item.payload && <div style={{ fontSize: 12, color: "#6B7C6E", marginTop: 4 }}>{JSON.stringify(item.payload).slice(0, 80)}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => approveKyc(item.id, true)} disabled={busy[item.id]}
                      style={{ background: V, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      ✅ Aprobar
                    </button>
                    <button onClick={() => approveKyc(item.id, false)} disabled={busy[item.id]}
                      style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      ❌ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </DashboardShell>
      <Footer />
    </>
  );
}
