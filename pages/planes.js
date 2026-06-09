/**
 * pages/planes.js — Planes OficiosYa
 * Suscripciones para CLIENTES (mano de obra gratis) + Planes PRESTADORES
 * Modelo: 20% comisión on-demand / 15% suscriptores
 */
import Head from "next/head";
import Link from "next/link";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

/* ── Planes para CLIENTES ──────────────────────────────────────────── */
const CLIENT_PLANS = [
  {
    id: "eventual",
    badge: null,
    icon: "🔧",
    name: "Eventual",
    price: "Gratis",
    priceDetail: "Sin suscripción mensual",
    pitch: "Contratá prestadores cuando lo necesitás. Pagás solo cuando usás.",
    commission: "20% comisión sobre el trabajo",
    includes: [
      "Búsqueda de prestadores verificados",
      "Pago protegido (escrow)",
      "Garantía 30 días obligatoria",
      "Urgencias 24/7 con recargo",
      "Calificaciones y reseñas",
    ],
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#D4E0D6",
    cta: "Registrarme gratis",
    href: "/auth/register?role=CLIENT",
  },
  {
    id: "familiar",
    badge: "⭐ MÁS POPULAR",
    icon: "🏠",
    name: "Plan Familiar",
    price: "$9.900",
    priceDetail: "por mes · cancel. anytime",
    pitch: "La mano de obra de tus servicios incluida. Ideal para el hogar.",
    commission: "15% comisión (vs 20% eventual)",
    includes: [
      "2 trabajos de mano de obra incluidos/mes",
      "Se acumulan hasta 3 si no usás el mes anterior",
      "1 urgencia 24/7 bonificada por mes",
      "Prioridad en asignación de prestadores",
      "Soporte preferente por WhatsApp",
      "Garantía 30 días obligatoria",
    ],
    color: V,
    bg: "#F0FDF4",
    border: V,
    cta: "Elegir Plan Familiar",
    href: "/auth/register?role=CLIENT&plan=familiar",
    highlight: true,
  },
  {
    id: "premium",
    badge: "💎 PREMIUM",
    icon: "🏆",
    name: "Plan Premium",
    price: "$22.900",
    priceDetail: "por mes · cancel. anytime",
    pitch: "Mano de obra ilimitada. Urgencias incluidas. Cero sorpresas.",
    commission: "15% comisión (vs 20% eventual)",
    includes: [
      "Trabajos ilimitados (máx. 1/día)",
      "Urgencias 24/7 sin recargo adicional",
      "Acceso prioritario a prestadores Gold",
      "Presupuestos de materiales con factura",
      "Gestor asignado para reclamos",
      "Informes mensuales de servicios",
    ],
    color: G,
    bg: "#FFFBEB",
    border: G,
    cta: "Elegir Plan Premium",
    href: "/auth/register?role=CLIENT&plan=premium",
  },
];

/* ── Planes para PRESTADORES ───────────────────────────────────────── */
const PROVIDER_PLANS = [
  {
    id: "base",
    icon: "📋",
    name: "Plan Base",
    price: "Gratis",
    priceDetail: "siempre",
    commission: "20% comisión por trabajo",
    perks: [
      "Perfil público en el marketplace",
      "Recibís solicitudes de clientes",
      "Cobro protegido por escrow",
      "Hasta 3 servicios publicados",
      "Reseñas y calificaciones",
    ],
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#D4E0D6",
    cta: "Registrarme",
    href: "/auth/register?role=PROVIDER",
  },
  {
    id: "profesional",
    icon: "📈",
    name: "Plan Plus",
    price: "$11.900",
    priceDetail: "por mes",
    commission: "10% comisión (ahorrás 10%)",
    perks: [
      "Badge VERIFICADO PLUS en tu perfil",
      "Prioridad en resultados de búsqueda",
      "Agenda digital con recordatorios",
      "Presupuestos ilimitados con PDF",
      "Servicios ilimitados publicados",
      "Dashboard KPI: ingresos, rating, churn",
      "Soporte prioritario",
    ],
    color: V,
    bg: "#F0FDF4",
    border: V,
    cta: "Elegir Plan Plus",
    href: "/auth/register?role=PROVIDER&plan=plus",
    highlight: true,
    badge: "⭐ RECOMENDADO",
  },
  {
    id: "empresas",
    icon: "🏢",
    name: "Plan Pro",
    price: "$34.900",
    priceDetail: "por mes",
    commission: "8% comisión (mínimo del mercado)",
    perks: [
      "Todo lo del Plan Plus",
      "Seguro de Responsabilidad Civil incluido",
      "Badge VERIFICADO PRO (escudo dorado)",
      "Acceso a clientes corporativos",
      "Múltiples operarios bajo tu cuenta",
      "Reportes contables con AFIP: bruto/comisión/neto",
      "Account manager dedicado",
    ],
    color: G,
    bg: "#FFFBEB",
    border: G,
    cta: "Elegir Plan Pro",
    href: "/auth/register?role=PROVIDER&plan=pro",
    badge: "💎 PARA EMPRESAS",
  },
];

/* ── Comparación de comisiones ──────────────────────────────────────── */
const COMMISSION_EXAMPLE = [
  { plan: "Eventual (sin suscripción)", commission: "20%", onJob5000: "$1.000", net: "$4.000" },
  { plan: "Plan Plus / Familiar", commission: "10%", onJob5000: "$500", net: "$4.500" },
  { plan: "Plan Pro", commission: "8%", onJob5000: "$400", net: "$4.600" },
];

/* ── FAQ planes ──────────────────────────────────────────────────────── */
const FAQ = [
  { q: "¿Cuándo se cobra la comisión?", a: "La comisión se descuenta solo sobre la mano de obra, no sobre materiales. Se deduce automáticamente al liberar el pago al prestador, luego de que el cliente confirma el trabajo con foto y reseña." },
  { q: "¿Qué pasa si cancelo en menos de 24 hs?", a: "Se aplica una retención operativa del 50% del valor del servicio como compensación al prestador por el turno bloqueado. Esta retención NO es una seña: es compensación por lucro cesante." },
  { q: "¿El Plan Familiar cubre TODOS los servicios?", a: "Cubre 2 trabajos de mano de obra por mes (acumulables hasta 3). Los materiales siempre se pagan aparte con factura o comprobante verificado por OficiosYa." },
  { q: "¿Puedo cambiar de plan en cualquier momento?", a: "Sí. Podés hacer upgrade inmediato o downgrade al final del período facturado. No hay penalidades por cancelar." },
  { q: "¿El seguro RC del Plan Pro cubre daños a terceros?", a: "Sí, el seguro de Responsabilidad Civil cubre daños accidentales a terceros durante la ejecución del trabajo. El monto y condiciones se informan al activar el plan." },
];

export default function PlanesPage() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Planes y Precios · OficiosYa</title>
        <meta name="description" content="Planes de suscripción para clientes y prestadores. Mano de obra incluida. Comisiones desde 8%." />
      </Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "0 0 80px" }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{ background: `linear-gradient(135deg,${F},#1a5c30)`, color: "#fff", padding: "56px 20px 48px", textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 99, padding: "4px 16px", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
              EL NETFLIX DE LOS SERVICIOS DEL HOGAR
            </div>
            <h1 style={{ fontSize: "clamp(28px,5vw,40px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: "0 0 16px", lineHeight: 1.2 }}>
              Suscribite y no pagues<br />más mano de obra 🛠️
            </h1>
            <p style={{ fontSize: 17, opacity: 0.9, margin: "0 0 32px", lineHeight: 1.6 }}>
              Con tu plan Familiar o Premium, la mano de obra de tus servicios está incluida.<br />
              Electricistas, plomeros, gasistas, pintores y más — verificados y garantizados.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/register?role=CLIENT">
                <button style={{ background: V, color: "#fff", border: "none", borderRadius: 24, padding: "14px 28px", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
                  Empezar como Cliente →
                </button>
              </Link>
              <Link href="/auth/register?role=PROVIDER">
                <button style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 24, padding: "14px 28px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
                  Registrarme como Prestador
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── PLANES PARA CLIENTES ─────────────────────────────────── */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 20px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 8px" }}>Planes para Clientes</h2>
            <p style={{ color: "#6B7C6E", fontSize: 15, margin: 0 }}>Elegí cómo querés gestionar los servicios de tu hogar u oficina.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {CLIENT_PLANS.map(plan => (
              <div key={plan.id} style={{ background: plan.highlight ? plan.bg : "#fff", border: `2px solid ${plan.highlight ? plan.border : "#D4E0D6"}`, borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16, position: "relative", boxShadow: plan.highlight ? "0 8px 32px rgba(22,163,74,0.15)" : "none" }}>
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", borderRadius: 99, padding: "4px 14px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontSize: 32 }}>{plan.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7C6E", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: F }}>{plan.price}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{plan.priceDetail}</div>
                </div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, margin: 0 }}>{plan.pitch}</p>
                <div style={{ background: plan.bg || "#F9FAFB", border: `1px solid ${plan.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: plan.color, fontWeight: 700 }}>
                  {plan.commission}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.includes.map(item => (
                    <li key={item} style={{ display: "flex", gap: 8, fontSize: 13, color: "#374151" }}>
                      <span style={{ color: plan.color, fontWeight: 900, flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{ marginTop: "auto" }}>
                  <button style={{ width: "100%", background: plan.highlight ? `linear-gradient(135deg,${plan.color},${F})` : "#F3F4F6", color: plan.highlight ? "#fff" : F, border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── PLANES PARA PRESTADORES ──────────────────────────────── */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 20px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🛠️</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 8px" }}>Planes para Prestadores</h2>
            <p style={{ color: "#6B7C6E", fontSize: 15, margin: 0 }}>
              Empezá gratis y escalá según tu volumen de trabajo.{" "}
              <strong style={{ color: V }}>Comisiones desde 8%.</strong>
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {PROVIDER_PLANS.map(plan => (
              <div key={plan.id} style={{ background: plan.highlight ? plan.bg : "#fff", border: `2px solid ${plan.highlight ? plan.border : "#D4E0D6"}`, borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16, position: "relative", boxShadow: plan.highlight ? "0 8px 32px rgba(22,163,74,0.15)" : "none" }}>
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", borderRadius: 99, padding: "4px 14px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontSize: 32 }}>{plan.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7C6E", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: F }}>{plan.price}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{plan.priceDetail}</div>
                </div>
                <div style={{ background: plan.bg || "#F9FAFB", border: `1px solid ${plan.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: plan.color, fontWeight: 700 }}>
                  💰 {plan.commission}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.perks.map(item => (
                    <li key={item} style={{ display: "flex", gap: 8, fontSize: 13, color: "#374151" }}>
                      <span style={{ color: plan.color, fontWeight: 900, flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{ marginTop: "auto" }}>
                  <button style={{ width: "100%", background: plan.highlight ? `linear-gradient(135deg,${plan.color},${F})` : plan.id === "empresas" ? `linear-gradient(135deg,${G},#92400E)` : "#F3F4F6", color: (plan.highlight || plan.id === "empresas") ? "#fff" : F, border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── TABLA COMPARATIVA DE COMISIONES ──────────────────────── */}
        <section style={{ maxWidth: 700, margin: "48px auto 0", padding: "0 20px" }}>
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "28px 24px" }}>
            <h3 style={{ fontFamily: "Georgia,serif", color: F, margin: "0 0 20px", fontSize: 18, fontWeight: 900 }}>
              💡 ¿Cuánto ahorrás con suscripción?
            </h3>
            <p style={{ fontSize: 13, color: "#6B7C6E", margin: "0 0 20px" }}>
              Ejemplo: trabajo de $5.000 (solo mano de obra). La comisión se descuenta SOLO sobre mano de obra, nunca sobre materiales.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F7F9F5" }}>
                    {["Plan", "Comisión", "Descuento", "Neto prestador"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: F, fontWeight: 700, borderBottom: "1.5px solid #D4E0D6" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_EXAMPLE.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F7F9F5" }}>
                      <td style={{ padding: "10px 12px", color: "#374151", borderBottom: "1px solid #F3F4F6" }}>{row.plan}</td>
                      <td style={{ padding: "10px 12px", color: "#DC2626", fontWeight: 700, borderBottom: "1px solid #F3F4F6" }}>{row.commission}</td>
                      <td style={{ padding: "10px 12px", color: "#DC2626", borderBottom: "1px solid #F3F4F6" }}>-{row.onJob5000}</td>
                      <td style={{ padding: "10px 12px", color: "#166534", fontWeight: 700, borderBottom: "1px solid #F3F4F6" }}>{row.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FLUJO DE PAGO (seña + escrow) ────────────────────────── */}
        <section style={{ maxWidth: 700, margin: "40px auto 0", padding: "0 20px" }}>
          <div style={{ background: "#FFFBEB", border: "1.5px solid rgba(201,162,39,0.4)", borderRadius: 20, padding: "24px" }}>
            <h3 style={{ fontFamily: "Georgia,serif", color: F, margin: "0 0 16px", fontSize: 17, fontWeight: 900 }}>
              🔐 ¿Cómo funciona el pago protegido (Escrow)?
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
              {[
                { icon: "1️⃣", title: "Seña 50%", desc: "Al confirmar la solicitud, se autoriza el 50% (no se cobra hasta que el trabajo inicia)." },
                { icon: "2️⃣", title: "Trabajo ejecutado", desc: "El prestador carga fotos antes/después. El cliente confirma desde la app." },
                { icon: "3️⃣", title: "Liberación del pago", desc: "Confirmado el trabajo, se libera el 100% al prestador menos la comisión del plan." },
              ].map(step => (
                <div key={step.title} style={{ background: "#fff", borderRadius: 12, padding: "14px" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{step.icon}</div>
                  <div style={{ fontWeight: 800, color: F, fontSize: 13, marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: "#6B7C6E", lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 700, margin: "40px auto 0", padding: "0 20px" }}>
          <h2 style={{ fontFamily: "Georgia,serif", color: F, fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 24 }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQ.map(item => (
              <div key={item.q} style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "16px 20px" }}>
                <div style={{ fontWeight: 800, color: F, fontSize: 14, marginBottom: 8 }}>❓ {item.q}</div>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA final ────────────────────────────────────────────── */}
        <section style={{ maxWidth: 700, margin: "48px auto 0", padding: "0 20px", textAlign: "center" }}>
          <div style={{ background: `linear-gradient(135deg,${F},#1a5c30)`, borderRadius: 24, padding: "40px 28px", color: "#fff" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 900, margin: "0 0 12px" }}>
              Empezá hoy, sin compromisos
            </h2>
            <p style={{ fontSize: 15, opacity: 0.9, margin: "0 0 28px", lineHeight: 1.6 }}>
              El plan Eventual es gratuito para siempre. Upgrade cuando quieras.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/register?role=CLIENT">
                <button style={{ background: V, color: "#fff", border: "none", borderRadius: 24, padding: "14px 28px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  Soy Cliente →
                </button>
              </Link>
              <Link href="/auth/register?role=PROVIDER">
                <button style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 24, padding: "14px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  Soy Prestador →
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
