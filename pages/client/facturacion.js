/**
 * /client/facturacion — Pagos y facturas
 * Conectado a la API real de escrow / payments
 */
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import KpiCard from "../../components/KpiCard";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

const navItems = [
  { href: "/client/dashboard",   label: "Panel general" },
  { href: "/client/urgencias",   label: "Urgencias 24/7", badge: "24/7" },
  { href: "/client/contratos",   label: "Contratos" },
  { href: "/client/facturacion", label: "Pagos" },
  { href: "/client/reclamos",    label: "Reclamos" },
];

const STATUS_CONFIG = {
  HELD:      { label: "En custodia", color: "#92400E", bg: "#FFFBEB",  icon: "🔒" },
  PENDING:   { label: "Pendiente",   color: "#1D4ED8", bg: "#EFF6FF",  icon: "⏳" },
  RELEASED:  { label: "Liberado",    color: "#166534", bg: "#F0FDF4",  icon: "✅" },
  REFUNDED:  { label: "Reembolsado", color: "#7C3AED", bg: "#F5F3FF",  icon: "↩️" },
  DISPUTED:  { label: "En disputa",  color: "#DC2626", bg: "#FEF2F2",  icon: "⚠️" },
  CANCELLED: { label: "Cancelado",   color: "#6B7280", bg: "#F9FAFB",  icon: "❌" },
  // Payment statuses
  COMPLETED: { label: "Pagado",      color: "#166534", bg: "#F0FDF4",  icon: "✅" },
  FAILED:    { label: "Fallido",     color: "#DC2626", bg: "#FEF2F2",  icon: "❌" },
  CREATED:   { label: "Iniciado",    color: "#1D4ED8", bg: "#EFF6FF",  icon: "🔵" },
};

function fmt(amount) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount || 0);
}

export default function ClientBilling() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();

  const [escrow,   setEscrow]   = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab, setTab]           = useState("movimientos");

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    loadData();
  }, [isReady, user]);

  async function loadData() {
    setLoading(true);
    try {
      // Try to get escrow records for this user
      const [escrowRes, paymentsRes] = await Promise.allSettled([
        apiRequest(`/api/client/escrow`).catch(() => ({ escrow: [] })),
        apiRequest(`/api/payments/history`).catch(() => ({ payments: [] })),
      ]);
      if (escrowRes.status === "fulfilled") setEscrow(escrowRes.value?.escrow || []);
      if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value?.payments || []);
    } catch {}
    setLoading(false);
  }

  // Merge and sort all movements
  const movements = [
    ...escrow.map(e => ({
      id:        e.id,
      type:      "escrow",
      concept:   e.notes || e.requestId ? `Servicio en custodia (${e.requestId?.slice(0,8)})` : "Custodia de pago",
      amount:    e.amount || 0,
      status:    e.status,
      date:      e.createdAt,
      requestId: e.requestId,
    })),
    ...payments.map(p => ({
      id:        p.id,
      type:      "payment",
      concept:   p.description || `Pago #${p.id?.slice(0,8)}`,
      amount:    p.amount || 0,
      status:    p.status,
      date:      p.createdAt,
      requestId: p.requestId,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // KPIs
  const totalPaid     = movements.filter(m => ["RELEASED","COMPLETED"].includes(m.status)).reduce((s, m) => s + m.amount, 0);
  const totalHeld     = movements.filter(m => m.status === "HELD").reduce((s, m) => s + m.amount, 0);
  const totalPending  = movements.filter(m => ["PENDING","CREATED"].includes(m.status)).reduce((s, m) => s + m.amount, 0);
  const disputed      = movements.filter(m => m.status === "DISPUTED").length;

  if (!isReady || !user) return null;

  return (
    <>
      <Head><title>Pagos y Facturas · OficiosYa</title></Head>
      <NavBar />
      <DashboardShell
        title="Pagos y Facturas"
        subtitle="Custodia, pagos liberados y estado financiero de tus servicios."
        navItems={navItems}
        active="/client/facturacion"
        rightSlot={
          <button className="btn btn-ghost btn-sm" onClick={loadData}>
            🔄 Actualizar
          </button>
        }
      >

        {/* KPIs */}
        <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
          <KpiCard title="Total pagado"   value={fmt(totalPaid)}    icon="💰" color="var(--primary)" />
          <KpiCard title="En custodia"    value={fmt(totalHeld)}    icon="🔒" color="var(--warning)" />
          <KpiCard title="Pendiente"      value={fmt(totalPending)} icon="⏳" color="var(--info)" />
          <KpiCard title="En disputa"     value={disputed}          icon="⚠️" color="var(--danger)" />
        </section>

        {/* Escrow explanation */}
        <div style={{ background: "linear-gradient(135deg,#F0FDF4,#E8F5E9)", border: "1px solid var(--green-200)", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 700, color: F, marginBottom: 4, fontSize: 14 }}>Sistema de custodia OficiosYa</div>
            <div style={{ fontSize: 13, color: F, lineHeight: 1.6 }}>
              Tu pago queda retenido hasta que confirmés el trabajo con fotos. Tenés <strong>30 días de garantía</strong>. Si hay problemas, abrí un reclamo y te asistimos.
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-flat">
          <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {[
              { id: "movimientos", label: "📋 Movimientos" },
              { id: "custodia",    label: "🔒 En custodia" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "10px 16px", fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                  color: tab === t.id ? V : "var(--text-muted)",
                  borderBottom: `2px solid ${tab === t.id ? V : "transparent"}`,
                  marginBottom: -1,
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
            </div>
          ) : (
            <>
              {tab === "movimientos" && (
                <div>
                  {movements.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
                      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sin movimientos registrados aún.</p>
                      <Link href="/client/buscar">
                        <button className="btn btn-primary" style={{ marginTop: 16 }}>
                          Buscar un servicio →
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <th>Concepto</th>
                            <th>Importe</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {movements.map(mov => {
                            const sc = STATUS_CONFIG[mov.status] || { label: mov.status, color: "#6B7280", bg: "#F9FAFB", icon: "•" };
                            return (
                              <tr key={mov.id}>
                                <td style={{ fontWeight: 600, color: F }}>
                                  {mov.type === "escrow" && <span style={{ marginRight: 6 }}>🔒</span>}
                                  {mov.concept}
                                </td>
                                <td style={{ fontWeight: 700 }}>{fmt(mov.amount)}</td>
                                <td>
                                  <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                                    {sc.icon} {sc.label}
                                  </span>
                                </td>
                                <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                  {mov.date ? new Date(mov.date).toLocaleDateString("es-AR") : "—"}
                                </td>
                                <td>
                                  {mov.status === "DISPUTED" && (
                                    <Link href={`/client/reclamos?requestId=${mov.requestId}`} style={{ fontSize: 12, color: "var(--danger-700)", fontWeight: 600 }}>
                                      Ver reclamo →
                                    </Link>
                                  )}
                                  {mov.requestId && mov.status !== "DISPUTED" && (
                                    <Link href={`/client/solicitud/${mov.requestId}`} style={{ fontSize: 12, color: V, fontWeight: 600 }}>
                                      Ver →
                                    </Link>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === "custodia" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {escrow.filter(e => e.status === "HELD").length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sin pagos en custodia actualmente.</p>
                    </div>
                  ) : (
                    escrow.filter(e => e.status === "HELD").map(e => (
                      <div key={e.id} style={{ border: "1.5px solid var(--warning-soft)", borderRadius: 14, padding: "14px 16px", background: "#FFFBEB" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 700, color: F, marginBottom: 4 }}>
                              🔒 {e.notes || `Solicitud ${e.requestId?.slice(0,12)}`}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              Retenido desde: {e.createdAt ? new Date(e.createdAt).toLocaleDateString("es-AR") : "—"}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#92400E" }}>{fmt(e.amount)}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>En custodia</div>
                          </div>
                        </div>
                        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {e.requestId && (
                            <Link href={`/client/solicitud/${e.requestId}`}>
                              <button className="btn btn-secondary btn-sm">Ver solicitud</button>
                            </Link>
                          )}
                          <Link href={`/client/reclamos?requestId=${e.requestId}`}>
                            <button className="btn btn-ghost btn-sm">Abrir reclamo</button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}

                  <div style={{ background: "var(--info-soft)", border: "1px solid #BFDBFE", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#1D4ED8", lineHeight: 1.6 }}>
                    💡 Los pagos en custodia se liberan automáticamente cuando confirmás el trabajo. Si hay un problema, abrí un reclamo antes de los 30 días.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </DashboardShell>
      <Footer />
    </>
  );
}
