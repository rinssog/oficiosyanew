/**
 * pages/terminos.jsx — Términos y Condiciones
 */
import Head from "next/head";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const F = "#0D3B1F", V = "#16A34A";

const SECTIONS = [
  { n:"1", t:"General", b:"Los presentes Términos y Condiciones regulan la relación entre OficiosYa y toda persona que acceda al Portal a través del sitio web www.oficiosya.com.ar y/o de la aplicación móvil. La mera utilización del Portal implica la aceptación plena, expresa e inequívoca de los presentes Términos." },
  { n:"2", t:"Rol de OficiosYa como intermediario", b:"OficiosYa es exclusivamente una plataforma de intermediación digital. No presta directamente Servicios de oficios o mantenimiento, no es empleadora de los Prestadores, y no asume responsabilidad por la calidad, oportunidad o resultado de los Servicios contratados. La relación contractual principal por el Servicio se establece directamente entre el Cliente y el Prestador." },
  { n:"3", t:"Medios de pago y sistema Escrow", b:"Los pagos se procesan exclusivamente a través de MercadoPago. Al confirmar la contratación, el Cliente abona el precio total, el cual es retenido por OficiosYa en modo Escrow (retención de fondos). El Prestador recibe el pago (menos comisión) dentro de las 48 horas siguientes a que el Cliente confirme la correcta ejecución del Servicio. Si el Cliente no confirma en 24 horas, el pago se libera automáticamente, salvo disputa abierta." },
  { n:"4", t:"Garantía mínima de 30 días", b:"Todo Prestador activo en el Portal asume una garantía mínima de 30 días sobre la calidad del Servicio ejecutado. Durante los 30 días posteriores a la finalización, si el Cliente detecta defectos atribuibles al Prestador, puede iniciar un reclamo a través del Portal." },
  { n:"5", t:"Sistema de verificación", b:"OficiosYa implementa un sistema de verificación de identidad: Básico (email y teléfono), Verificado (DNI + matrícula + antecedentes), y Gold (automático al superar 50 reseñas con ≥4.8★). La verificación es un proceso de control documental; no constituye certificación profesional ni garantía de calidad." },
  { n:"6", t:"Suscripciones para Prestadores", b:"Los Prestadores pueden suscribirse a Plan Base ($10.000/mes, 20% comisión), Plan Pro ($20.000/mes, 15% comisión) o Plan Premium ($30.000/mes, 12-13% comisión). Las suscripciones se renuevan automáticamente. Para no renovar, el Prestador debe cancelar con al menos 48 horas de anticipación." },
  { n:"7", t:"Chat interno y prohibición de desvío", b:"Todo contacto entre Clientes y Prestadores debe realizarse exclusivamente a través del chat interno de OficiosYa. Queda expresamente prohibido compartir datos de contacto (teléfono, email, redes sociales) o derivar transacciones fuera de la plataforma. Las violaciones resultan en suspensión de cuenta." },
  { n:"8", t:"Resolución de disputas", b:"El Cliente debe presentar reclamos dentro de las 48 horas siguientes a la finalización acordada. OficiosYa analiza las evidencias disponibles y emite resolución en máximo 5 días hábiles. Sin perjuicio del derecho a acudir a Defensa del Consumidor y demás instancias externas." },
  { n:"9", t:"Ley aplicable", b:"Los presentes Términos se rigen por las leyes de la República Argentina. Jurisdicción: Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires. Para consultas: contacto@oficiosya.com.ar" },
];

export default function TerminosPage() {
  return (
    <>
      <Head><title>Términos y Condiciones — OficiosYa</title></Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "32px 20px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "36px 32px" }}>
            <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: F, fontFamily: "Georgia,serif" }}>Términos y Condiciones</h1>
            <p style={{ color: "#9CA3AF", fontSize: 13, margin: "0 0 28px" }}>Versión 1.0 · Vigente desde el lanzamiento · OficiosYa — CABA, Argentina</p>
            <div style={{ background: "#FFFBEB", border: "1px solid rgba(201,162,39,0.4)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400E", marginBottom: 28 }}>
              ⚖️ Al usar OficiosYa aceptás íntegramente estos Términos. Si no estás de acuerdo, debés abstenerte de utilizar el Portal.
            </div>
            {SECTIONS.map(s => (
              <div key={s.n} style={{ marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: F }}>
                  {s.n}. {s.t}
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{s.b}</p>
              </div>
            ))}
            <div style={{ marginTop: 28, borderTop: "1px solid #F3F4F6", paddingTop: 20, fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>
              Texto completo disponible en versión extendida. Para el documento legal completo con todas las secciones (22 artículos), política de privacidad y anexos, contactar a contacto@oficiosya.com.ar
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
