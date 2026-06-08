/**
 * pages/terminos.js
 * Términos y Condiciones Generales de Uso — OficiosYa
 * Versión 1.0 — 2025
 * Estándares: Ley 24.240 (Defensa del Consumidor), Ley 25.326 (Datos Personales),
 * Ley 26.994 (Código Civil y Comercial), Res. UIF y normativa AFIP vigente.
 */
import Head from "next/head";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const F = "#0D3B1F";
const V = "#16A34A";

const SECS = [
  {
    id: "1",
    title: "1. Identificación del Responsable",
    body: `OficiosYa es una plataforma digital operada por una sociedad constituida bajo las leyes de la República Argentina, con domicilio en la Ciudad Autónoma de Buenos Aires (CABA). CUIT/CUIL: a confirmar ante AFIP al momento del lanzamiento comercial. Email de contacto: legal@oficiosya.com.ar — Teléfono: a publicar al momento del lanzamiento.

Inscripta ante la Dirección General de Defensa y Protección al Consumidor de la CABA conforme la Ley 24.240 y sus modificatorias. La plataforma actúa como intermediaria tecnológica entre Clientes (usuarios que contratan servicios) y Prestadores (personas físicas o jurídicas que ofrecen servicios), sin ser empleadora, contratante directa ni responsable solidaria de la ejecución material del servicio.`,
  },
  {
    id: "2",
    title: "2. Objeto del Servicio",
    body: `OficiosYa ofrece una plataforma digital que permite: (a) a los Clientes publicar solicitudes de servicios del hogar y oficios varios, comparar presupuestos y contratar prestadores verificados; (b) a los Prestadores acceder a solicitudes de trabajo, gestionar su agenda y cobrar de forma segura; (c) a ambas partes comunicarse a través del chat interno, resolver conflictos mediante el sistema de reclamos, y acceder a un sistema de pagos en custodia (escrow).

La plataforma NO provee los servicios de oficio directamente. Los contratos de locación de servicios se celebran directamente entre Clientes y Prestadores. OficiosYa facilita el contacto, la negociación y el pago seguro.`,
  },
  {
    id: "3",
    title: "3. Registro y Requisitos",
    body: `3.1 Edad mínima: 18 años. Al registrarse, el usuario declara tener capacidad legal para contratar conforme al art. 1001 y ss. del Código Civil y Comercial.

3.2 Clientes: deben proveer nombre y apellido, DNI, email verificado y teléfono celular. Pueden requerir verificación adicional para habilitar funcionalidades de pago.

3.3 Prestadores: además del registro básico, deben superar el proceso de verificación KYC (Know Your Customer) que incluye: (i) foto del DNI (frente y dorso), (ii) selfie con DNI, (iii) documentación de matrícula habilitante o certificación de oficio (según rubro), (iv) certificado de antecedentes penales (Registro Nacional de Reincidencia), y (v) CUIT/CUIL activo ante AFIP. El proceso de verificación puede demorar hasta 5 días hábiles. La plataforma podrá rechazar o revocar perfiles sin expresión de causa cuando existan fundamentos objetivos.

3.4 Veracidad: el usuario garantiza que toda la información suministrada es veraz, completa y actualizada. La falsedad de los datos habilita a OficiosYa a suspender la cuenta y retener fondos en custodia hasta resolución, sin perjuicio de las acciones legales correspondientes.`,
  },
  {
    id: "4",
    title: "4. Sistema de Custodia de Pagos (Escrow)",
    body: `4.1 Para proteger a ambas partes, los pagos se procesan a través del sistema de custodia de OficiosYa en alianza con MercadoPago (Mercado Libre S.R.L., CUIT 30-70308853-4).

4.2 Funcionamiento: el Cliente realiza el pago al momento de contratar. Los fondos quedan retenidos en custodia. Una vez confirmada la finalización del servicio (con fotos de antes/después y confirmación del Cliente), los fondos se liberan al Prestador descontando la comisión de OficiosYa.

4.3 Liberación automática: si el Cliente no confirma ni objeta en el plazo de 7 (siete) días hábiles desde la fecha de finalización informada por el Prestador, los fondos se liberan automáticamente.

4.4 Disputa: si el Cliente abre un reclamo antes de la liberación, los fondos permanecen retenidos hasta la resolución del mismo.

4.5 OficiosYa no almacena datos de tarjetas de crédito/débito. El procesamiento es íntegramente gestionado por MercadoPago bajo sus propios términos y condiciones (https://www.mercadopago.com.ar/ayuda).`,
  },
  {
    id: "5",
    title: "5. Comisiones y Precios",
    body: `5.1 El acceso a la plataforma como Cliente es gratuito.

5.2 Los Prestadores abonan una comisión por servicio completado y/o una suscripción mensual según el plan contratado. Los porcentajes vigentes se informan en la sección "Planes" de la plataforma antes del inicio de cada operación.

5.3 Las tarifas de los servicios son pactadas libremente entre Clientes y Prestadores. OficiosYa no fija precios de los servicios de oficio, aunque publica tarifas de referencia orientativas.

5.4 Franjas horarias: los servicios de urgencia tienen recargos publicados: horario nocturno (19:00–23:00 hs) +20%; horario noche/madrugada (23:00–07:00 hs) +50%. El Prestador debe informar expresamente estos recargos al Cliente antes de confirmar el presupuesto.

5.5 Modificación de precios: OficiosYa puede modificar las comisiones con 30 días de preaviso mediante notificación en la plataforma y email registrado.`,
  },
  {
    id: "6",
    title: "6. Garantía de 30 Días",
    body: `6.1 Todo servicio contratado a través de OficiosYa incluye obligatoriamente una garantía de 30 (treinta) días corridos desde la fecha de finalización del trabajo.

6.2 Durante este período, el Cliente puede exigir sin costo adicional: (a) corrección de defectos del trabajo realizado, (b) rehacer parcialmente el servicio si el resultado no cumple lo pactado, o (c) reembolso parcial sujeto a evaluación del reclamo.

6.3 La garantía no cubre: (a) daños causados por el propio Cliente o terceros ajenos al Prestador, (b) uso inadecuado de las instalaciones, (c) desgaste natural, ni (d) servicios adicionales no incluidos en el presupuesto original.

6.4 Para ejercer la garantía, el Cliente debe abrir un reclamo en la plataforma dentro del plazo, con descripción detallada y fotografías del problema.`,
  },
  {
    id: "7",
    title: "7. Cancelaciones y Reembolsos",
    body: `7.1 El Cliente puede cancelar una solicitud sin costo hasta 2 horas antes del horario pactado.

7.2 Cancelación tardía (menos de 2 horas): puede aplicarse un cargo de hasta el 20% del presupuesto como compensación al Prestador por tiempo y traslado. El monto exacto es fijado por el Prestador y comunicado antes de la confirmación.

7.3 El Prestador que no se presente sin aviso previo puede ser suspendido y deberá reembolsar al Cliente el 100% del monto si ya fue cobrado.

7.4 Reembolsos: se procesan dentro de los 10 días hábiles a través del mismo medio de pago utilizado. El plazo depende de la entidad financiera del usuario.

7.5 Derecho de Arrepentimiento: conforme al art. 34 de la Ley 24.240, el Cliente tiene derecho a revocar la contratación dentro de los 10 días corridos desde la celebración sin costo ni necesidad de expresar causa, excepto cuando el servicio ya haya sido ejecutado con consentimiento previo.`,
  },
  {
    id: "8",
    title: "8. Sistema de Reclamos y Disputas",
    body: `8.1 Ante cualquier conflicto, las partes deben intentar resolverlo directamente a través del chat interno en un plazo de 48 horas.

8.2 Si no se llega a un acuerdo, cualquiera de las partes puede abrir un reclamo formal en la sección "Reclamos" de la plataforma, con descripción detallada, evidencia fotográfica y el monto en disputa.

8.3 El equipo de OficiosYa analizará el caso en un plazo de 5 días hábiles y emitirá una resolución vinculante para ambas partes en lo referido a los fondos en custodia.

8.4 Categorías de reclamo disponibles: calidad del servicio, no se presentó, cobro indebido, materiales faltantes, datos falsos, acuerdo fuera de la plataforma, pago no liberado, y otros.

8.5 Los reclamos por acuerdo fuera de la plataforma pueden resultar en suspensión permanente de la cuenta y retención de fondos.

8.6 La resolución de OficiosYa no sustituye la vía judicial. Las partes conservan todos sus derechos ante la Justicia ordinaria y ante la Dirección de Defensa al Consumidor.`,
  },
  {
    id: "9",
    title: "9. Conductas Prohibidas",
    body: `Quedan expresamente prohibidas las siguientes conductas, bajo pena de suspensión o inhabilitación permanente:

(a) Acordar pagos fuera de la plataforma para evadir comisiones (bypass de escrow).
(b) Ofrecer servicios sin cumplir los requisitos de verificación.
(c) Publicar datos falsos, fotografías de terceros o documentos adulterados.
(d) Realizar acoso, discriminación o amenazas a usuarios o personal de OficiosYa.
(e) Utilizar la plataforma para actividades ilícitas, incluyendo lavado de activos.
(f) Crear múltiples cuentas para eludir sanciones.
(g) Publicar reseñas falsas o sobornar a usuarios para obtener calificaciones.
(h) Compartir datos personales de otros usuarios fuera del contexto del servicio contratado.
(i) Utilizar herramientas automatizadas, scrapers o bots.
(j) Intentar vulnerar la seguridad de la plataforma.`,
  },
  {
    id: "10",
    title: "10. Responsabilidad de la Plataforma",
    body: `10.1 OficiosYa es un intermediario tecnológico. No garantiza la calidad, idoneidad, seguridad ni puntualidad de los Prestadores, aunque implementa un proceso de verificación de identidad y antecedentes.

10.2 OficiosYa no se responsabiliza por: (a) daños a la propiedad o personas causados por Prestadores (cubiertos por el seguro de responsabilidad civil del Prestador, obligatorio en planes Pro y Premium); (b) falsedad de datos provistos por usuarios; (c) interrupciones del servicio por fuerza mayor, fallos de infraestructura de terceros o ataques informáticos.

10.3 En los casos donde OficiosYa tenga responsabilidad directa, su indemnización máxima se limita al monto de la transacción involucrada, salvo dolo o culpa grave.

10.4 OficiosYa colaborará plenamente con autoridades judiciales y administrativas ante denuncias formales.`,
  },
  {
    id: "11",
    title: "11. Propiedad Intelectual",
    body: `Todos los derechos de propiedad intelectual sobre la plataforma, su diseño, logotipos, código fuente, base de datos de prestadores, algoritmos de búsqueda, sistema de evaluación y contenido editorial pertenecen exclusivamente a OficiosYa o a sus licenciantes.

Se otorga al usuario una licencia personal, intransferible, no exclusiva y revocable para el uso de la plataforma conforme a estos Términos. Está prohibida la reproducción, modificación, distribución o uso comercial no autorizado de cualquier elemento de la plataforma.`,
  },
  {
    id: "12",
    title: "12. Protección de Datos Personales",
    body: `El tratamiento de datos personales se rige por la Política de Privacidad de OficiosYa, disponible en oficiosya.com.ar/politica-privacidad, conforme a la Ley 25.326 de Protección de Datos Personales y sus decretos reglamentarios. La base de datos se encuentra inscripta ante la Agencia de Acceso a la Información Pública (AAIP).

Al registrarse, el usuario presta consentimiento informado para el tratamiento de sus datos conforme a las finalidades descriptas en dicha Política.`,
  },
  {
    id: "13",
    title: "13. Modificaciones a los Términos",
    body: `OficiosYa puede modificar estos Términos en cualquier momento. Las modificaciones sustanciales serán notificadas con al menos 30 días de anticipación por email y mediante un aviso prominente en la plataforma. El uso continuado de la plataforma tras la entrada en vigor de los nuevos términos implica su aceptación. Si el usuario no acepta los nuevos términos, debe discontinuar el uso de la plataforma y solicitar la baja de su cuenta.`,
  },
  {
    id: "14",
    title: "14. Defensa del Consumidor",
    body: `En cumplimiento de la Ley 24.240 de Defensa del Consumidor y sus modificatorias (Leyes 26.361 y 27.250):

• El Usuario-consumidor tiene derecho a recibir información clara, veraz, detallada, suficiente y oportuna.
• Los precios deben informarse de forma completa antes de la confirmación de la contratación.
• El Usuario puede comunicarse con OficiosYa en legal@oficiosya.com.ar ante cualquier consulta o reclamo.
• En caso de no obtener respuesta satisfactoria, puede acudir a la Dirección de Defensa al Consumidor de su jurisdicción o ingresar su reclamo en www.consumidor.gob.ar.
• Número de inscripción como proveedor ante el RNIC: a confirmar al lanzamiento.`,
  },
  {
    id: "15",
    title: "15. Ley Aplicable y Jurisdicción",
    body: `Estos Términos se rigen por las leyes de la República Argentina. Para cualquier controversia derivada de la interpretación, validez o ejecución de estos Términos, las partes se someten voluntariamente a la jurisdicción de los Tribunales Ordinarios en lo Comercial de la Ciudad Autónoma de Buenos Aires, renunciando expresamente a cualquier otro fuero o jurisdicción que pudiere corresponderles.

Vigencia: estos Términos y Condiciones están en vigor desde el 1 de enero de 2025. Versión 1.0.`,
  },
];

export default function TerminosPage() {
  return (
    <>
      <Head>
        <title>Términos y Condiciones — OficiosYa</title>
        <meta name="description" content="Términos y Condiciones Generales de Uso de OficiosYa. Plataforma argentina de servicios del hogar." />
      </Head>
      <NavBar />

      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "32px 20px 60px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ background: `linear-gradient(135deg,${F},#1a5c35)`, borderRadius: 20, padding: "32px 32px 28px", marginBottom: 24, color: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#BBF7D0", marginBottom: 10 }}>DOCUMENTO LEGAL</div>
            <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 900, fontFamily: "Georgia,serif" }}>Términos y Condiciones</h1>
            <p style={{ margin: "0 0 16px", color: "#BBF7D0", fontSize: 14, lineHeight: 1.6 }}>
              Estos Términos rigen el uso de la plataforma OficiosYa conforme a la legislación argentina vigente,
              incluyendo la Ley 24.240 (Defensa del Consumidor), Ley 25.326 (Datos Personales) y Código Civil y Comercial.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>Versión 1.0</span>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>Vigente desde 01/01/2025</span>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>Jurisdicción: CABA, Argentina</span>
            </div>
          </div>

          {/* Index */}
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: F, marginBottom: 12, letterSpacing: 1 }}>ÍNDICE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "4px 16px" }}>
              {SECS.map(s => (
                <a key={s.id} href={`#sec-${s.id}`} style={{ color: V, fontSize: 13, textDecoration: "none", fontWeight: 500, padding: "2px 0" }}>
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
                id={`sec-${s.id}`}
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

          {/* Footer legal */}
          <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 16, padding: "20px 24px", marginTop: 24, fontSize: 13, color: F, lineHeight: 1.7 }}>
            <strong>Consultas legales:</strong> legal@oficiosya.com.ar<br />
            <strong>Protección de datos:</strong> privacidad@oficiosya.com.ar<br />
            <strong>Defensa del Consumidor:</strong> <a href="https://www.consumidor.gob.ar" target="_blank" rel="noopener noreferrer" style={{ color: V }}>www.consumidor.gob.ar</a> · 0800-666-1518<br />
            <strong>AAIP:</strong> <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer" style={{ color: V }}>www.argentina.gob.ar/aaip</a><br />
            <span style={{ color: "#6B7280", fontSize: 12, marginTop: 8, display: "block" }}>
              Al utilizar OficiosYa aceptás estos Términos. Si no estás de acuerdo, discontinuá el uso inmediatamente.
            </span>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
