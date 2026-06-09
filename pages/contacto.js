/**
 * pages/contacto.js — Contacto comercial y partnerships
 */
import Head from "next/head";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const F = "#0D3B1F", V = "#16A34A";

const CHANNELS = [
  {
    icon: "🏢",
    title: "Empresas & Consorcios",
    desc: "Administradores de consorcios, empresas de facilities, gestores de propiedades. Planes corporativos con descuentos por volumen.",
    contact: "comercial@oficiosya.com.ar",
    cta: "Escribir a comercial",
  },
  {
    icon: "🤝",
    title: "Partnerships & Integraciones",
    desc: "Plataformas inmobiliarias, fintech, seguros. Integramos vía API. Modelo de revenue share disponible.",
    contact: "tech@oficiosya.com.ar",
    cta: "Escribir a tech",
  },
  {
    icon: "📰",
    title: "Prensa & Medios",
    desc: "Periodistas, blogs, medios digitales. Material de prensa, datos de plataforma y portavoz disponibles.",
    contact: "prensa@oficiosya.com.ar",
    cta: "Escribir a prensa",
  },
  {
    icon: "⚖️",
    title: "Legal & Compliance",
    desc: "Notificaciones judiciales, requerimientos de datos, AAIP, AFIP, UIF. Respuesta en 48h hábiles.",
    contact: "legal@oficiosya.com.ar",
    cta: "Escribir a legal",
  },
];

export default function ContactoPage() {
  return (
    <>
      <Head>
        <title>Contacto Comercial — OficiosYa</title>
        <meta name="description" content="Contacto para empresas, partnerships, prensa y legal. OficiosYa — plataforma argentina de servicios del hogar." />
      </Head>
      <NavBar />

      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "40px 20px 60px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ color: F, fontSize: 28, fontWeight: 900, fontFamily: "Georgia,serif", margin: "0 0 10px" }}>Contacto</h1>
            <p style={{ color: "#6B7280", fontSize: 15, lineHeight: 1.6 }}>
              Para soporte de usuarios, visitá el <a href="/soporte" style={{ color: V, fontWeight: 700 }}>Centro de Soporte</a>.
              Esta sección es para consultas comerciales, legales y de prensa.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {CHANNELS.map(ch => (
              <div key={ch.title} style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 18, padding: "24px 22px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{ch.icon}</div>
                <div style={{ fontWeight: 800, color: F, fontSize: 16, marginBottom: 8 }}>{ch.title}</div>
                <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{ch.desc}</p>
                <a
                  href={`mailto:${ch.contact}`}
                  style={{
                    display: "inline-block",
                    background: `linear-gradient(135deg,${V},${F})`,
                    color: "#fff",
                    borderRadius: 24,
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  📧 {ch.cta}
                </a>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>{ch.contact}</div>
              </div>
            ))}
          </div>

          {/* Dirección */}
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16, padding: "20px 24px", marginTop: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>📍</span>
            <div>
              <div style={{ fontWeight: 800, color: F, marginBottom: 4 }}>OficiosYa</div>
              <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
                Ciudad Autónoma de Buenos Aires, Argentina<br />
                Atención: lunes a viernes de 9:00 a 18:00 hs (Argentina GMT-3)<br />
                <strong>Soporte urgente 24/7:</strong> <a href="mailto:atencion@oficiosya.com.ar" style={{ color: V }}>atencion@oficiosya.com.ar</a>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
