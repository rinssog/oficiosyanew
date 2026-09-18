/**
 * pages/admin/dashboard.js — Backoffice OficiosYa
 * Dashboard por rol de staff, con KPIs, registros fechados y accesos rápidos.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import { navForRole, normalizeStaffRole, STAFF_ROLE_LABELS } from "../../lib/adminRbac";

const C = {
  verdeOscuro: "#0D3B1F", verde: "#16A34A", dorado: "#C9A227",
  panel: "#FFFFFF", borde: "#D4E0D6", textoSec: "#6B7C6E", ink: "#12261A",
  fondoSuave: "#F7F9F5", rojo: "#DC2626", ambar: "#D97706", azul: "#1D4ED8",
};

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(typeof v === "number" ? v : Date.parse(v));
  if (isNaN(d)) return "—";
  return d.toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const CLAIM_STATUS = {
  PENDING:   { label: "Pendiente", color: "#92400E", bg: "#FFFBEB" },
  OPEN:      { label: "Abierto",   color: "#1D4ED8", bg: "#EFF6FF" },
  IN_REVIEW: { label: "En revisión", color: "#7C3AED", bg: "#F5F3FF" },
  RESOLVED:  { label: "Resuelto",  color: "#166534", bg: "#F0FDF4" },
  REJECTED:  { label: "Rechazado", color: "#DC2626", bg: "#FEF2F2" },
  CLOSED:    { label: "Cerrado",   color: "#6B7280", bg: "#F9FAFB" },
};

export default function AdminDashboard() {
  const { user, apiRequest, isReady } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const staffRole = normalizeStaffRole(user?.staffRole);

  useEffect(() => {
    if (!isReady || !user || user.role !== "ADMIN") return;
    (async () => {
      setLoading(true); setError(null);
      try {
        const [m, d, c] = await Promise.allSettled([
          apiRequest("/api/admin/metrics"),
          apiRequest("/api/admin/documents/pending"),
          apiRequest("/api/admin/claims"),
        ]);
        if (m.status === "fulfilled" && m.value?.ok) setMetrics(m.value.metrics || null);
        if (d.status === "fulfilled" && d.value?.ok) setPendingDocs(d.value.pending || []);
        if (c.status === "fulfilled" && c.value?.ok) setRecentClaims(c.value.claims || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [isReady, user, apiRequest]);

  const openClaims = useMemo(
    () => recentClaims.filter((c) => ["PENDING", "OPEN", "IN_REVIEW"].includes(c.status)),
    [recentClaims]
  );

  const badges = {
    verificaciones: pendingDocs.length || undefined,
    documentacion: pendingDocs.length || undefined,
    reclamos: openClaims.length || undefined,
  };

  const kpis = [
    { label: "Prestadores verificados", value: metrics?.providersVerified ?? "—", helper: `${metrics?.providersTotal ?? 0} en total`, color: C.verde },
    { label: "Urgencias activas", value: metrics?.urgentActive ?? 0, helper: "SLA 2 h", color: C.rojo },
    { label: "Presupuestos aceptados", value: metrics?.quotesAccepted ?? 0, helper: "histórico", color: C.azul },
    { label: "Reclamos abiertos", value: openClaims.length, helper: "requieren atención", color: C.ambar },
    { label: "Docs KYC pendientes", value: pendingDocs.length, helper: "por revisar", color: C.dorado },
  ];

  const quickAccess = useMemo(
    () => navForRole(staffRole).flatMap((g) => g.items).filter((it) => it.section !== "dashboard"),
    [staffRole]
  );

  return (
    <AdminLayout active="dashboard" title="Dashboard" subtitle={`Vista de ${STAFF_ROLE_LABELS[staffRole] || "staff"} · ${new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}`} badges={badges}>
      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: C.rojo, padding: "10px 14px", borderRadius: 10, marginBottom: 16 }}>
          No se pudieron cargar algunos datos: {error}
        </div>
      )}

      {/* KPIs */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: 12, marginBottom: 22 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: C.panel, border: `1px solid ${C.borde}`, borderRadius: 14, padding: "16px 16px", boxShadow: "0 1px 2px rgba(13,59,31,.05)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: k.color }} />
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: C.ink, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{loading ? "…" : k.value}</div>
            <div style={{ fontSize: ".82rem", fontWeight: 700, color: C.ink, marginTop: 8 }}>{k.label}</div>
            <div style={{ fontSize: ".72rem", color: C.textoSec, marginTop: 2 }}>{k.helper}</div>
          </div>
        ))}
      </section>

      {/* Dos columnas: KYC pendiente + Reclamos recientes */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16, marginBottom: 22 }}>
        {/* KYC pendiente */}
        <div style={{ background: C.panel, border: `1px solid ${C.borde}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${C.borde}` }}>
            <strong style={{ color: C.verdeOscuro }}>Documentos KYC pendientes</strong>
            <Link href="/admin/verificaciones" style={{ fontSize: ".8rem", color: C.verde, fontWeight: 700, textDecoration: "none" }}>Ver todos →</Link>
          </div>
          {loading ? <Empty text="Cargando…" /> : pendingDocs.length === 0 ? <Empty text="✅ Sin documentos pendientes" /> : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {pendingDocs.slice(0, 6).map((doc, i) => (
                <li key={doc.id || i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "11px 16px", borderTop: i ? `1px solid ${C.fondoSuave}` : "none" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: ".88rem", color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.type || doc.docType || "Documento"} — {doc.providerName || doc.userName || doc.providerId || "—"}</div>
                    <div style={{ fontSize: ".72rem", color: C.textoSec }}>Enviado: {fmtDate(doc.createdAt || doc.submittedAt || doc.uploadedAt)}</div>
                  </div>
                  <span style={{ alignSelf: "center", background: "#FFFBEB", color: "#92400E", borderRadius: 999, padding: "2px 9px", fontSize: ".7rem", fontWeight: 700, whiteSpace: "nowrap" }}>Pendiente</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reclamos recientes */}
        <div style={{ background: C.panel, border: `1px solid ${C.borde}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${C.borde}` }}>
            <strong style={{ color: C.verdeOscuro }}>Reclamos recientes</strong>
            <Link href="/admin/reclamos" style={{ fontSize: ".8rem", color: C.verde, fontWeight: 700, textDecoration: "none" }}>Ver todos →</Link>
          </div>
          {loading ? <Empty text="Cargando…" /> : recentClaims.length === 0 ? <Empty text="✅ Sin reclamos" /> : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {recentClaims.slice(0, 6).map((c, i) => {
                const st = CLAIM_STATUS[c.status] || CLAIM_STATUS.PENDING;
                return (
                  <li key={c.id || i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "11px 16px", borderTop: i ? `1px solid ${C.fondoSuave}` : "none" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: ".88rem", color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(c.category || "Reclamo").replace(/_/g, " ")}</div>
                      <div style={{ fontSize: ".72rem", color: C.textoSec }}>{fmtDate(c.createdAt)}</div>
                    </div>
                    <span style={{ alignSelf: "center", background: st.bg, color: st.color, borderRadius: 999, padding: "2px 9px", fontSize: ".7rem", fontWeight: 700, whiteSpace: "nowrap" }}>{st.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Accesos rápidos (según rol) */}
      <section>
        <div style={{ fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase", color: C.textoSec, fontWeight: 700, marginBottom: 10 }}>Accesos rápidos</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 10 }}>
          {quickAccess.map((it) => (
            <Link key={it.href} href={it.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "14px 15px", background: C.panel,
              border: `1px solid ${C.borde}`, borderRadius: 12, textDecoration: "none", color: C.verdeOscuro, fontWeight: 600, fontSize: ".9rem",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.verde }} />
              {it.label}
              {badges[it.section] ? <span style={{ marginLeft: "auto", background: C.dorado, color: C.verdeOscuro, borderRadius: 999, padding: "1px 8px", fontSize: ".7rem", fontWeight: 800 }}>{badges[it.section]}</span> : null}
            </Link>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}

function Empty({ text }) {
  return <div style={{ padding: "26px 16px", textAlign: "center", color: "#6B7C6E", fontSize: ".88rem" }}>{text}</div>;
}
