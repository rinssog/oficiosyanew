/**
 * pages/politica-privacidad.jsx
 * Política de Privacidad — OficiosYa
 * Conforme: Ley 25.326 (Protección de Datos Personales), Decreto Reglamentario 1558/2001,
 * Resolución AAIP 4/2019 y estándares GDPR (referencia).
 */
import Head from "next/head";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const F = "#0D3B1F";
const V = "#16A34A";

const SECS = [
  {
    id: "1",
    title: "1. Responsable del Tratamiento",
    body: `OficiosYa, con domicilio en la Ciudad Autónoma de Buenos Aires (CABA), República Argentina, es el Responsable del Tratamiento de los datos personales recabados a través de la plataforma web y aplicaciones móviles.

La base de datos se encuentra registrada ante la Agencia de Acceso a la Información Pública (AAIP), conforme al art. 21 de la Ley 25.326.

Contacto del Responsable de Privacidad (DPO): privacidad@oficiosya.com.ar`,
  },
  {
    id: "2",
    title: "2. Datos que Recopilamos",
    body: `2.1 Datos que el usuario provee directamente:
• Nombre y apellido completo
• Número de DNI / CUIT / CUIL
• Fecha de nacimiento
• Domicilio (barrio, localidad, provincia)
• Teléfono celular (verificado por SMS)
• Correo electrónico verificado
• Contraseña (almacenada con hash bcrypt, nunca en texto plano)
• Fotografía de perfil (opcional)

2.2 Datos adicionales para Prestadores (KYC):
• Foto del DNI frente y dorso
• Selfie con DNI
• Matrícula o certificación profesional
• Certificado de antecedentes penales (Registro Nacional de Reincidencia)
• CBU / CVU para acreditación de pagos
• Número de CUIT activo ante AFIP

2.3 Datos generados por el uso de la plataforma:
• Historial de solicitudes, contratos y pagos
• Calificaciones y reseñas recibidas/emitidas
• Mensajes del chat interno (guardados con fines de moderación y resolución de disputas)
• Reclamos y su historial de resolución
• Registros de acceso (IP, timestamp, dispositivo, navegador / sistema operativo)
• Datos de geolocalización (solo con consentimiento expreso para búsqueda por zona)

2.4 Datos de pago: los datos de medios de pago (tarjetas, cuentas virtuales) son gestionados exclusivamente por MercadoPago bajo sus propias políticas. OficiosYa no almacena ni accede a datos de tarjetas de crédito o débito.`,
  },
  {
    id: "3",
    title: "3. Finalidades del Tratamiento",
    body: `Utilizamos tus datos para las siguientes finalidades:

(a) EJECUCIÓN DEL CONTRATO: gestión del registro, autenticación, facilitación del contacto entre partes, procesamiento de pagos y custodia (escrow), gestión de garantías y reclamos.

(b) CUMPLIMIENTO LEGAL: verificación de identidad (KYC), prevención del lavado de activos conforme a normativa UIF, facturación y cumplimiento tributario ante AFIP, atención de requerimientos judiciales o administrativos.

(c) INTERÉS LEGÍTIMO: prevención del fraude, seguridad de la plataforma, análisis estadístico anonimizado para mejora del servicio, detección de conductas prohibidas.

(d) CONSENTIMIENTO (revocable en cualquier momento): comunicaciones comerciales propias (novedades, promociones, nuevos servicios), notificaciones push, geolocalización para búsqueda de prestadores cercanos.`,
  },
  {
    id: "4",
    title: "4. Compartición de Datos con Terceros",
    body: `OficiosYa puede compartir datos personales con:

• MercadoPago (Mercado Libre S.R.L.): datos necesarios para procesamiento de pagos, conforme a https://www.mercadopago.com.ar/privacidad.
• Aseguradora habilitada (SSN): datos de Prestadores Pro y Premium para administración del seguro de responsabilidad civil.
• Proveedores de infraestructura tecnológica (hosting, email transaccional, SMS): bajo acuerdos de confidencialidad y procesamiento de datos que garantizan los mismos niveles de protección.
• Organismos públicos (Ministerio de Justicia/RNR, AFIP, UIF, Poder Judicial): ante requerimientos legales formales.

OficiosYa NO vende, cede ni comercializa datos personales a terceros con fines de marketing de terceros.`,
  },
  {
    id: "5",
    title: "5. Transferencias Internacionales",
    body: `Los datos pueden ser procesados en servidores ubicados en los Estados Unidos u otros países (por ejemplo, servicios de infraestructura en la nube). En todos los casos, OficiosYa garantiza que dichos proveedores cumplen con estándares de seguridad equivalentes a los exigidos por la Ley 25.326, mediante cláusulas contractuales tipo o mecanismos de certificación equivalentes.`,
  },
  {
    id: "6",
    title: "6. Tus Derechos (ARCO)",
    body: `Conforme al art. 14 y 16 de la Ley 25.326, tenés los siguientes derechos sobre tus datos personales:

• ACCESO: conocer qué datos tenemos sobre vos y de qué forma se usan.
• RECTIFICACIÓN: corregir datos inexactos o incompletos.
• CANCELACIÓN (SUPRESIÓN): solicitar la eliminación de tus datos cuando ya no sean necesarios para las finalidades que justificaron su tratamiento, salvo obligación legal de conservación.
• OPOSICIÓN: oponerte al tratamiento de tus datos para finalidades de marketing directo.
• PORTABILIDAD: recibir tus datos en formato estructurado y legible.

Para ejercer estos derechos, enviá un email a privacidad@oficiosya.com.ar con:
1. Asunto: "EJERCICIO DE DERECHOS ARCO — [Tu nombre]"
2. Copia de tu DNI (frente)
3. Descripción clara del derecho que querés ejercer

Plazos de respuesta: 5 días hábiles para acceso; 10 días hábiles para rectificación, cancelación u oposición.

La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA (AAIP) tiene la atribución de atender denuncias por incumplimiento de la normativa de protección de datos. Podés contactarlos en www.argentina.gob.ar/aaip.`,
  },
  {
    id: "7",
    title: "7. Seguridad de los Datos",
    body: `Implementamos las siguientes medidas técnicas y organizativas:

• Cifrado TLS 1.2/1.3 en todas las comunicaciones (HTTPS obligatorio)
• Contraseñas almacenadas con bcrypt (factor de costo 12)
• Autenticación mediante tokens JWT con expiración corta
• Control de acceso basado en roles (RBAC) — solo personal autorizado accede a datos sensibles
• Rate limiting y protección contra fuerza bruta en endpoints de autenticación
• Headers de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
• Auditorías periódicas de seguridad
• Copias de seguridad cifradas con rotación regular

En caso de una brecha de seguridad que implique riesgo para los derechos y libertades de los usuarios, OficiosYa notificará a los afectados y a la AAIP en los plazos que establezca la normativa vigente.`,
  },
  {
    id: "8",
    title: "8. Retención y Eliminación de Datos",
    body: `• Datos de cuenta activa: conservados durante la vigencia de la relación contractual.
• Historial de transacciones: mínimo 10 años conforme legislación comercial y fiscal argentina (art. 328 del Código Civil y Comercial; Res. General AFIP 4290/2018).
• Mensajes de chat: 3 años para fines de resolución de disputas.
• Registros de acceso (logs): 1 año.
• Documentación KYC: hasta 5 años post-cancelación de cuenta, por obligaciones legales anti-lavado (Ley 25.246).

Tras el vencimiento de los plazos de conservación, los datos se anonimizarán o eliminarán de forma segura.`,
  },
  {
    id: "9",
    title: "9. Cookies y Tecnologías de Rastreo",
    body: `OficiosYa utiliza:

• Cookies esenciales: necesarias para el funcionamiento de la plataforma (sesión, autenticación). No requieren consentimiento.
• Cookies analíticas (opcionales): usamos herramientas de análisis anonimizado para entender el uso de la plataforma. No identifican al usuario individualmente.

No utilizamos cookies de publicidad de terceros. Podés configurar tu navegador para rechazar cookies; algunas funcionalidades de la plataforma pueden verse afectadas.`,
  },
  {
    id: "10",
    title: "10. Menores de Edad",
    body: `La plataforma está exclusivamente dirigida a mayores de 18 años. OficiosYa no recopila intencionalmente datos de menores. Si detectamos que un menor ha proporcionado datos sin consentimiento parental, eliminaremos dicha información de forma inmediata. Si tenés conocimiento de que un menor ha registrado una cuenta, informanos a privacidad@oficiosya.com.ar.`,
  },
  {
    id: "11",
    title: "11. Notificaciones y Comunicaciones Comerciales",
    body: `Al registrarte, podés optar por recibir comunicaciones comerciales de OficiosYa (novedades, descuentos, servicios nuevos). Podés darte de baja en cualquier momento desde tu perfil o haciendo clic en el enlace de cancelación en cualquier email. La baja de comunicaciones comerciales no afecta las comunicaciones transaccionales necesarias (confirmación de pagos, alertas de seguridad, resolución de reclamos).`,
  },
  {
    id: "12",
    title: "12. Actualizaciones a esta Política",
    body: `OficiosYa puede actualizar esta Política de Privacidad. Las modificaciones sustanciales serán notificadas por email y mediante aviso en la plataforma con al menos 30 días de anticipación. La versión siempre actualizada estará disponible en oficiosya.com.ar/politica-privacidad.

Versión 1.0 — Vigente desde el 1 de enero de 2025.`,
  },
];

export default function PrivacidadPage() {
  return (
    <>
      <Head>
        <title>Política de Privacidad — OficiosYa</title>
        <meta name="description" content="Política de Privacidad de OficiosYa. Conforme a la Ley 25.326 de Protección de Datos Personales de Argentina." />
      </Head>
      <NavBar />

      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "32px 20px 60px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ background: `linear-gradient(135deg,${F},#1a5c35)`, borderRadius: 20, padding: "32px 32px 28px", marginBottom: 24, color: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#BBF7D0", marginBottom: 10 }}>DOCUMENTO LEGAL</div>
            <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 900, fontFamily: "Georgia,serif" }}>Política de Privacidad</h1>
            <p style={{ margin: "0 0 16px", color: "#BBF7D0", fontSize: 14, lineHeight: 1.6 }}>
              Conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina
              y su Decreto Reglamentario 1558/2001.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>Versión 1.0</span>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>Vigente desde 01/01/2025</span>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>AAIP Registrada</span>
            </div>
          </div>

          {/* Tus derechos — destacado */}
          <div style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 14 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 800, color: "#9A3412", marginBottom: 4, fontSize: 14 }}>Tus derechos ARCO están garantizados</div>
              <div style={{ fontSize: 13, color: "#7C3A00", lineHeight: 1.6 }}>
                Tenés derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos. Contacto: <strong>privacidad@oficiosya.com.ar</strong>. Más info: <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer" style={{ color: V }}>AAIP</a>.
              </div>
            </div>
          </div>

          {/* Index */}
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: F, marginBottom: 12, letterSpacing: 1 }}>ÍNDICE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "4px 16px" }}>
              {SECS.map(s => (
                <a key={s.id} href={`#pp-${s.id}`} style={{ color: V, fontSize: 13, textDecoration: "none", fontWeight: 500, padding: "2px 0" }}>
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {SECS.map(s => (
              <section
                key={s.id}
                id={`pp-${s.id}`}
                style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16, padding: "24px 28px", scrollMarginTop: 80 }}
              >
                <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800, color: F, borderBottom: `2px solid ${V}`, paddingBottom: 10 }}>
                  {s.title}
                </h2>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap" }}>
                  {s.body}
                </div>
              </section>
            ))}
          </div>

          {/* Footer */}
          <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 16, padding: "20px 24px", marginTop: 24, fontSize: 13, color: F, lineHeight: 1.7 }}>
            <strong>Responsable de Privacidad:</strong> privacidad@oficiosya.com.ar<br />
            <strong>Consultas y ejercicio de derechos:</strong> Respuesta en 5 días hábiles<br />
            <strong>AAIP:</strong> <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer" style={{ color: V }}>www.argentina.gob.ar/aaip</a> · (011) 4328-4000<br />
            <span style={{ color: "#6B7280", fontSize: 12, marginTop: 8, display: "block" }}>
              "La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales" (art. 29, Ley 25.326).
            </span>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
