import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227", GL = "#F0D875";

function Shield({ size = 52, style = {} }) {
  const id = `hero-sh`;
  return (
    <svg width={size} height={size * 1.18} viewBox="0 0 80 94" fill="none" style={style}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="40" y1="4" x2="40" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16A34A" /><stop offset="1" stopColor="#0D3B1F" />
        </linearGradient>
        <linearGradient id={`${id}-go`} x1="0" y1="0" x2="80" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FAF0B0" /><stop offset="25%" stopColor="#F0D875" />
          <stop offset="50%" stopColor="#C9A227" /><stop offset="75%" stopColor="#F0D875" />
          <stop offset="100%" stopColor="#FAF0B0" />
        </linearGradient>
        <linearGradient id={`${id}-gi`} x1="80" y1="0" x2="0" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FAF0B0" /><stop offset="40%" stopColor="#F0D875" />
          <stop offset="65%" stopColor="#C9A227" /><stop offset="100%" stopColor="#FAF0B0" />
        </linearGradient>
        <filter id={`${id}-shd`}><feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3" /></filter>
      </defs>
      <path d="M40 1 L78 15 L78 48 C78 70 62 85 40 93 C18 85 2 70 2 48 L2 15 Z" fill={`url(#${id}-go)`} filter={`url(#${id}-shd)`} />
      <path d="M40 5.5 L74.5 18 L74.5 48 C74.5 68 60 81 40 89 C20 81 5.5 68 5.5 48 L5.5 18 Z" fill="#0D3B1F" opacity="0.55" />
      <path d="M40 8 L72 20.5 L72 48 C72 66.5 58 79 40 86.5 C22 79 8 66.5 8 48 L8 20.5 Z" fill={`url(#${id}-gi)`} />
      <path d="M40 12 L68 23.5 L68 48 C68 64.5 55.5 76.5 40 83.5 C24.5 76.5 12 64.5 12 48 L12 23.5 Z" fill={`url(#${id}-fill)`} />
      <ellipse cx="28" cy="30" rx="9" ry="5" fill="rgba(255,255,255,0.20)" transform="rotate(-25 28 30)" />
      <text x="40" y="55" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="24" fontWeight="900"
        fontFamily="Georgia,'Times New Roman',serif" letterSpacing="-0.5">Ya</text>
      <path d="M33 83.5 Q40 89 47 83.5" stroke="#F0D875" strokeWidth="1.2" fill="none" opacity="0.6" />
    </svg>
  );
}

const FAQ = [
  { q: "¿Cómo sé que el prestador es de confianza?", a: "Todos los prestadores pasan por verificación de identidad (DNI validado por RENAPER), constancia de AFIP vigente y, para rubros regulados, matrícula habilitante. Solo aparecen en la plataforma los que aprobaron el proceso completo." },
  { q: "¿Qué pasa si no quedo conforme con el trabajo?", a: "Tenés 30 días de garantía obligatoria. Si el defecto es atribuible al prestador, debe corregirlo sin costo. Podés abrir un reclamo desde tu panel y OficiosYa interviene como mediador." },
  { q: "¿Es seguro pagar por la plataforma?", a: "Sí. Usamos pago protegido (escrow): el dinero se retiene hasta que confirmás que el trabajo está bien hecho. Si el prestador no se presenta, te devolvemos el 100%. Los pagos los procesa MercadoPago con encriptación bancaria." },
  { q: "¿Puedo cancelar una solicitud?", a: "Con más de 24 horas de anticipación, cancelás sin costo. Con menos de 24 horas, se aplica una retención operativa del 50% como compensación al prestador por el turno bloqueado. Esta retención NO es una seña." },
  { q: "¿OficiosYa garantiza los precios?", a: "Los precios los fija el prestador en su presupuesto. OficiosYa no interviene en la negociación, pero retiene los fondos para que el precio pagado sea exactamente el presupuestado, sin sorpresas." },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section style={{ padding: "56px 24px", background: "#F7F9F5" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 8px" }}>Preguntas frecuentes</h2>
        <p style={{ textAlign: "center", color: "#6B7C6E", fontSize: 15, margin: "0 0 32px" }}>Todo lo que necesitás saber antes de empezar</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ background: "#fff", border: `1.5px solid ${open === i ? V : "#D4E0D6"}`, borderRadius: 14, overflow: "hidden", transition: "border-color .2s" }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: F, flex: 1 }}>{item.q}</span>
                <span style={{ color: V, fontSize: 20, fontWeight: 300, flexShrink: 0, transform: open === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 18px", fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const RUBROS = [
  { name: "Electricista", icon: "⚡", href: "/client/buscar?category=Electricidad" },
  { name: "Plomero",      icon: "🔧", href: "/client/buscar?category=Plomeria" },
  { name: "Pintor",       icon: "🖌️", href: "/client/buscar?category=Pintura" },
  { name: "Gasista",      icon: "🔥", href: "/client/buscar?category=Gas" },
  { name: "Cerrajero",    icon: "🔑", href: "/client/buscar?category=Cerrajeria" },
  { name: "Albañil",      icon: "🏗️", href: "/client/buscar?category=Albanileria" },
  { name: "Carpintero",   icon: "🪚", href: "/client/buscar?category=Carpinteria" },
  { name: "Técnico AC",   icon: "❄️", href: "/client/buscar?category=Climatizacion" },
];

const TRUST = [
  { icon: "🪪", title: "Identidad verificada", sub: "DNI validado por OficiosYa" },
  { icon: "🛡️", title: "Pago protegido", sub: "Liberamos el dinero al confirmar" },
  { icon: "⭐", title: "Reseñas auténticas", sub: "Solo clientes reales califican" },
  { icon: "📋", title: "Garantía 30 días", sub: "Obligatoria para todos los prestadores" },
];

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/client/buscar?q=${encodeURIComponent(search)}`);
  };

  return (
    <>
      <Head>
        <title>OficiosYa — El profesional que necesitás, ya</title>
        <meta name="description" content="Plataforma argentina de servicios y oficios. Prestadores verificados, pago protegido, garantía 30 días." />
      </Head>
      <NavBar />
      <main>
        {/* HERO */}
        <section style={{ background: `linear-gradient(135deg, ${F} 0%, #1A5C35 55%, ${V} 100%)`, padding: "72px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.12)", borderRadius: 24, padding: "6px 16px", marginBottom: 24, border: "1px solid rgba(255,255,255,0.2)" }}>
              <Shield size={20} />
              <span style={{ color: "#BBF7D0", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>PLATAFORMA ARGENTINA · PRESTADORES VERIFICADOS</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: "clamp(32px,6vw,56px)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.1, fontFamily: "Georgia,'Times New Roman',serif" }}>
              El profesional que<br />necesitás, <span style={{ color: GL }}>ya.</span>
            </h1>
            <p style={{ color: "#BBF7D0", fontSize: 18, margin: "0 0 36px", lineHeight: 1.6 }}>
              Identidad verificada · Matrícula habilitante · Trabajo garantizado
            </p>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, background: "#fff", borderRadius: 16, padding: 6, maxWidth: 520, margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="¿Qué servicio necesitás? (ej: plomero Palermo)"
                style={{ flex: 1, border: "none", outline: "none", fontSize: 15, padding: "10px 14px", color: "#111", background: "transparent" }} />
              <button type="submit" style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>Buscar</button>
            </form>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              {["🪪 Identidad verificada", "🛡️ Pago protegido", "⭐ Reseñas reales"].map(t => (
                <span key={t} style={{ color: "#BBF7D0", fontSize: 13, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* URGENCIAS + FRANJAS */}
        <div style={{ background: "#dc2626", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>🚨 Urgencias 24/7</span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>07-19h: precio base &nbsp;·&nbsp; 19-23h: +20% nocturno &nbsp;·&nbsp; 23-07h: +50% urgencia</span>
          </div>
          <Link href="/client/urgencias">
            <button style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Ver urgencias →</button>
          </Link>
        </div>

        {/* RUBROS */}
        <section style={{ padding: "40px 24px", background: "#F7F9F5", borderBottom: "1px solid #D4E0D6" }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 24px" }}>¿Qué servicio necesitás?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
              {RUBROS.map(r => (
                <Link key={r.name} href={r.href} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "16px 12px", textAlign: "center", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.boxShadow = `0 6px 20px rgba(22,163,74,0.2)`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#D4E0D6"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: F }}>{r.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST SIGNALS */}
        <section style={{ padding: "48px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 8px" }}>Por qué elegir OficiosYa</h2>
            <p style={{ textAlign: "center", color: "#6B7C6E", fontSize: 15, margin: "0 0 32px" }}>Cada prestador pasa por un proceso de verificación antes de aparecer en la plataforma</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
              {TRUST.map(t => (
                <div key={t.title} style={{ background: "#F0FDF4", border: "1.5px solid rgba(22,163,74,0.3)", borderRadius: 16, padding: "22px 18px", textAlign: "center" }}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: F, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: "#4b5f55", lineHeight: 1.4 }}>{t.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUSCRIPCIÓN — sin precios públicos, requiere registro */}
        <section style={{ padding: "56px 24px", background: `linear-gradient(135deg,${F},#1a5c30)` }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 99, padding: "4px 16px", fontSize: 12, fontWeight: 700, color: "#BBF7D0", letterSpacing: 1, marginBottom: 14 }}>
              EL NETFLIX DE LOS SERVICIOS DEL HOGAR 🇦🇷
            </div>
            <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#fff", fontFamily: "Georgia,serif", margin: "0 0 12px" }}>
              Suscribite y no pagues<br />más mano de obra
            </h2>
            <p style={{ color: "#BBF7D0", fontSize: 16, margin: "0 0 28px", lineHeight: 1.6 }}>
              Planes para clientes y prestadores con mano de obra incluida, comisiones reducidas y acceso prioritario.<br />
              <strong style={{ color: GL }}>Registrate para ver precios y planes.</strong>
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/register?role=CLIENT">
                <button style={{ background: V, color: "#fff", border: "none", borderRadius: 24, padding: "14px 28px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  Ver planes de cliente →
                </button>
              </Link>
              <Link href="/auth/register?role=PROVIDER">
                <button style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 24, padding: "14px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  Planes de prestador
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* STATS — solo métricas de confianza, no de volumen falso */}
        <section style={{ background: F, padding: "40px 24px" }}>
          <div style={{ maxWidth: 840, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 20 }}>
            {[["100%","Prestadores verificados"],["30 días","Garantía obligatoria"],["24/7","Urgencias disponibles"],["Escrow","Pagos protegidos"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 34, color: GL }}>{v}</div>
                <div style={{ color: "#BBF7D0", fontSize: 13, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* COBERTURA */}
        <section style={{ padding: "48px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 8px" }}>Cobertura en todo el país</h2>
            <p style={{ textAlign: "center", color: "#6B7C6E", fontSize: 15, margin: "0 0 32px" }}>Prestadores verificados disponibles en las principales zonas de Argentina</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
              {[
                { zona: "CABA", detail: "46 barrios · urgencias 24/7", icon: "🏙️" },
                { zona: "GBA Norte", detail: "San Isidro, Vicente López, Tigre", icon: "🌿" },
                { zona: "GBA Oeste", detail: "Morón, Merlo, La Matanza", icon: "🏘️" },
                { zona: "GBA Sur", detail: "Quilmes, Avellaneda, Lanús", icon: "🏭" },
                { zona: "Córdoba", detail: "Capital y zona centro ·  próximo", icon: "🔜" },
                { zona: "Rosario", detail: "Santa Fe capital · próximo", icon: "🔜" },
              ].map(z => (
                <div key={z.zona} style={{ background: "#F7F9F5", border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{z.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: F }}>{z.zona}</div>
                  <div style={{ fontSize: 12, color: "#6B7C6E", marginTop: 3, lineHeight: 1.4 }}>{z.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection />

        {/* CTA PRESTADORES */}
        <section style={{ padding: "56px 24px", background: "#F7F9F5", textAlign: "center" }}>
          <Shield size={56} style={{ margin: "0 auto 20px", display: "block" }} />
          <h2 style={{ fontSize: 28, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 12px" }}>¿Sos prestador de servicios?</h2>
          <p style={{ color: "#6B7C6E", fontSize: 16, margin: "0 0 28px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Registrate, verificá tu identidad y empezá a recibir clientes en tu zona. Planes desde Plan Base hasta Premium.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/register?role=PROVIDER">
              <button style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 24, padding: "14px 28px", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: `0 6px 20px rgba(22,163,74,0.35)` }}>Postulá tu oficio →</button>
            </Link>
            <Link href="/planes">
              <button style={{ background: "#fff", color: F, border: `2px solid ${F}`, borderRadius: 24, padding: "14px 28px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Ver planes y precios</button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
