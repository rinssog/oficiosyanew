/**
 * pages/soporte.js
 * Centro de Soporte — OficiosYa
 */
import Head from "next/head";
import { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const F = "#0D3B1F", V = "#16A34A";

const FAQS = [
  {
    q: "¿Cómo funciona el pago protegido?",
    a: "Tu pago queda en custodia hasta que confirmés el trabajo con fotos. Tenés 7 días desde que el prestador informa la finalización para revisar y confirmar. Si no hay objeción en ese plazo, el pago se libera automáticamente.",
  },
  {
    q: "¿Qué hago si el prestador no se presentó?",
    a: "Abrí un reclamo en la sección 'Reclamos' con la categoría 'No se presentó'. Los fondos en custodia permanecen retenidos hasta la resolución. El equipo de OficiosYa responde en 5 días hábiles.",
  },
  {
    q: "¿Cómo cancelo una solicitud?",
    a: "Podés cancelar sin costo hasta 2 horas antes del horario pactado desde la sección 'Mis solicitudes'. Cancelaciones tardías pueden tener cargo de hasta 20% según el prestador.",
  },
  {
    q: "¿Cuándo se libera el dinero al prestador?",
    a: "Cuando el cliente confirma el trabajo. Si el cliente no confirma ni objeta en 7 días hábiles desde la fecha de finalización, el pago se libera automáticamente.",
  },
  {
    q: "¿Qué cubre la garantía de 30 días?",
    a: "Cubre defectos en el trabajo realizado: corrección sin costo adicional, rehacer parcialmente el servicio, o reembolso parcial sujeto a evaluación. No cubre daños causados por el cliente o desgaste natural.",
  },
  {
    q: "¿Cómo verifico mi identidad como prestador?",
    a: "En tu panel de prestador, sección 'Documentación', podés cargar tu DNI (frente/dorso), selfie, matrícula y certificado de antecedentes. El proceso demora hasta 5 días hábiles.",
  },
  {
    q: "¿OficiosYa guarda mis datos de tarjeta?",
    a: "No. Los pagos son procesados exclusivamente por MercadoPago. OficiosYa nunca almacena datos de tarjetas de crédito o débito.",
  },
  {
    q: "¿Puedo acordar el pago fuera de la plataforma?",
    a: "No. Está expresamente prohibido y puede resultar en suspensión permanente de la cuenta. La plataforma protege a ambas partes solo cuando el pago se realiza a través de nuestro sistema de custodia.",
  },
];

export default function SoportePage() {
  const [open, setOpen] = useState(null);

  return (
    <>
      <Head>
        <title>Centro de Soporte — OficiosYa</title>
        <meta name="description" content="Centro de ayuda y soporte de OficiosYa. Preguntas frecuentes, contacto y seguimiento de reclamos." />
      </Head>
      <NavBar />

      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "32px 20px 60px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛟</div>
            <h1 style={{ color: F, fontSize: 28, fontWeight: 900, fontFamily: "Georgia,serif", margin: "0 0 10px" }}>
              Centro de Soporte
            </h1>
            <p style={{ color: "#6B7280", fontSize: 15, lineHeight: 1.6 }}>
              Encontrá respuestas rápidas o contactanos directamente.
            </p>
          </div>

          {/* Contact cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 36 }}>
            {[
              { icon: "📧", title: "Email", sub: "atencion@oficiosya.com.ar", href: "mailto:atencion@oficiosya.com.ar", btn: "Enviar email" },
              { icon: "📋", title: "Reclamos", sub: "Sistema de resolución de disputas", href: "/client/reclamos", btn: "Abrir reclamo" },
              { icon: "💬", title: "Chat en vivo", sub: "Lunes a viernes 9-18 hs", href: "mailto:atencion@oficiosya.com.ar", btn: "Iniciar chat" },
              { icon: "🛡️", title: "Defensa del Consumidor", sub: "consumidor.gob.ar · 0800-666-1518", href: "https://www.consumidor.gob.ar", btn: "Ir al sitio" },
            ].map(c => (
              <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16,
                  padding: "20px 18px", textAlign: "center", cursor: "pointer",
                  transition: "all .2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.boxShadow = "0 6px 20px rgba(22,163,74,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#D4E0D6"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontWeight: 800, color: F, fontSize: 14, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12, lineHeight: 1.5 }}>{c.sub}</div>
                  <span style={{ background: V, color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>
                    {c.btn}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: F }}>Preguntas frecuentes</h2>
            </div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid var(--border)" : "none" }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 16, padding: "18px 24px", background: "none", border: "none", cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 700, color: F, fontSize: 14, lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{
                    fontSize: 18, color: V, flexShrink: 0, fontWeight: 800,
                    transition: "transform 0.2s",
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}>+</span>
                </button>
                {open === i && (
                  <div style={{ padding: "0 24px 18px", fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legal links */}
          <div style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 13 }}>
            <a href="/terminos" style={{ color: V, fontWeight: 600 }}>Términos y Condiciones</a>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <a href="/politica-privacidad" style={{ color: V, fontWeight: 600 }}>Política de Privacidad</a>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <a href="https://www.consumidor.gob.ar" target="_blank" rel="noopener noreferrer" style={{ color: V, fontWeight: 600 }}>Defensa del Consumidor</a>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
