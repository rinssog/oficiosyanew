/**
 * pages/terminos.jsx — Términos y Condiciones completos OficiosYa
 * Versión 2.0 — Mayo 2026
 */
import Head from "next/head";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const SECTIONS = [
  {
    n: "1", t: "Naturaleza del Servicio e Intermediación",
    b: "OficiosYa es un servicio de intermediación digital que conecta a personas que requieren servicios domiciliarios o profesionales ('Clientes') con prestadores de servicios independientes verificados ('Prestadores'). La Plataforma actúa exclusivamente como intermediario tecnológico y NO es empleadora, contratista ni responsable solidaria por la ejecución de los servicios contratados entre Clientes y Prestadores.\n\nOficiosYa no presta servicios de albañilería, electricidad, plomería, ni ningún otro oficio. Los contratos de servicio se celebran directamente entre el Cliente y el Prestador. OficiosYa facilita la búsqueda, contacto, agendamiento y el pago seguro, sin ser parte del contrato de prestación de servicios."
  },
  {
    n: "2", t: "Aceptación de los Términos",
    b: "Al registrarse en la Plataforma, contratar o prestar servicios a través de ella, o simplemente navegar por sus páginas, el usuario declara haber leído, comprendido y aceptado la totalidad de estos Términos y Condiciones, así como la Política de Privacidad vigente. Si no está de acuerdo, debe abstenerse de usar la Plataforma.\n\nLa aceptación queda registrada con hash SHA-256 del documento, dirección IP, marca de tiempo y nombre del aceptante, con valor legal equivalente a firma electrónica conforme a la Ley 25.506 de Firma Digital de la República Argentina."
  },
  {
    n: "3", t: "Registro y Cuentas de Usuario",
    b: "Para operar en la Plataforma es obligatorio crear una cuenta con datos verídicos, actualizados y completos. El usuario es responsable de mantener la confidencialidad de sus credenciales y de toda actividad que ocurra bajo su cuenta.\n\nEstá prohibido crear cuentas falsas, múltiples cuentas para el mismo usuario o cuentas en nombre de terceros sin autorización expresa. OficiosYa puede suspender o eliminar cuentas que incumplan estos Términos, sin previo aviso y sin obligación de indemnización."
  },
  {
    n: "4", t: "Verificación de Prestadores",
    b: "Todos los Prestadores deben superar un proceso de verificación obligatorio antes de aparecer en los resultados de búsqueda:\n\na) Validación de identidad mediante DNI, procesado contra base RENAPER.\nb) Selfie con DNI en tiempo real para verificación facial.\nc) Constancia de inscripción en AFIP (Monotributo o autónomo activo).\nd) Seguro de responsabilidad civil vigente con OficiosYa como beneficiario adicional.\ne) Para rubros regulados (gas, electricidad, climatización, salud, fumigación): matrícula habilitante vigente emitida por el organismo competente (ENARGAS, CAP, colegio profesional).\n\nLa verificación otorga el badge 'Verificado' en el perfil. La verificación acredita identidad y habilitación formal pero NO garantiza la calidad de los trabajos. OficiosYa no es responsable por daños ocasionados por Prestadores verificados."
  },
  {
    n: "5", t: "Sistema de Pago Protegido (Escrow)",
    b: "Todos los pagos por servicios contratados a través de la Plataforma se procesan mediante el sistema de pago protegido (escrow). El Cliente abona el total del presupuesto aprobado al momento de confirmar la solicitud.\n\nLos fondos son retenidos por OficiosYa hasta la confirmación de finalización del servicio por parte del Cliente, o transcurridas 24 horas de la fecha de finalización acordada sin que el Cliente haya indicado disconformidad.\n\nLa liberación de fondos al Prestador se produce deduciendo la comisión correspondiente al plan activo:\n• Plan Base: 15% sobre el valor del servicio\n• Plan Profesional: 10% sobre el valor del servicio\n• Plan Empresas: 8% sobre el valor del servicio\n\nOficiosYa no almacena datos de tarjetas de crédito ni débito. Todos los datos de pago son tratados directamente por MercadoPago S.A. conforme a su política PCI DSS."
  },
  {
    n: "6", t: "Política de Cancelación y Retención Operativa",
    b: "CANCELACIÓN CON MÁS DE 24 HORAS DE ANTICIPACIÓN: Reintegro del 100% del monto pagado. Sin cargo para el Cliente.\n\nCANCELACIÓN CON MENOS DE 24 HORAS DE ANTICIPACIÓN: Se aplica una retención operativa del 50% del valor del servicio como compensación al Prestador por el turno bloqueado y la pérdida de oportunidad de trabajo. Esta retención NO constituye una seña ni depósito en garantía: es una compensación por lucro cesante causada por la cancelación tardía.\n\nNO PRESENTACIÓN DEL CLIENTE: Se aplica la misma retención operativa del 50%. El Prestador puede presentar evidencia fotográfica de su presencia en el domicilio.\n\nNO PRESENTACIÓN DEL PRESTADOR: Reintegro del 100% al Cliente. El Prestador queda sujeto a penalidades: suspensión temporal de 7 días, descenso en el ranking y reseña negativa del sistema.\n\nFUERZA MAYOR: En casos de enfermedad, accidente o fuerza mayor debidamente documentados, OficiosYa evaluará cada caso y podrá dispensar total o parcialmente la retención operativa. La decisión de OficiosYa es definitiva."
  },
  {
    n: "7", t: "Garantía Obligatoria de 30 Días",
    b: "Todo Prestador registrado en OficiosYa está obligado a ofrecer garantía de 30 días corridos sobre el trabajo realizado, contados desde la fecha de finalización confirmada.\n\nLa garantía cubre defectos en la ejecución del trabajo directamente atribuibles al Prestador. No cubre daños causados por uso inadecuado, terceros, fenómenos climáticos, ni modificaciones realizadas por el Cliente después del trabajo.\n\nPara activar la garantía, el Cliente debe reportar el defecto dentro del período de 30 días a través de la Plataforma. El Prestador tiene hasta 72 horas para responder y acordar la corrección. Si el Prestador no responde o no cumple, OficiosYa puede retener pagos pendientes y gestionar la corrección con otro Prestador, debitando el costo al Prestador original."
  },
  {
    n: "8", t: "Calificaciones y Reseñas",
    b: "Solo los Clientes que hayan contratado y confirmado la finalización de un servicio pueden calificar al Prestador correspondiente. Las calificaciones evalúan calidad, puntualidad y comunicación (escala 1–5).\n\nLas calificaciones son inapelables. Los Prestadores no pueden solicitar la eliminación de reseñas negativas salvo evidencia de falsedad documentada ante OficiosYa.\n\nOficiosYa puede eliminar reseñas que contengan insultos, información personal o que sean claramente falsas o fraudulentas. El sistema calcula el rating promedio ponderado de los últimos 24 meses."
  },
  {
    n: "9", t: "Planes de Suscripción para Prestadores",
    b: "Los Prestadores pueden suscribirse a planes pagos que otorgan beneficios como mayor visibilidad, menor comisión, acceso a urgencias 24/7 y soporte prioritario.\n\nLas suscripciones se renuevan automáticamente. El Prestador puede cancelar en cualquier momento desde su panel; la cancelación aplica al siguiente período de facturación. No se realizan reembolsos proporcionales por cancelación anticipada dentro de un período ya facturado.\n\nOficiosYa puede modificar los precios de los planes con 30 días de anticipación notificados por correo electrónico."
  },
  {
    n: "10", t: "Conducta Prohibida",
    b: "Está expresamente prohibido:\n\na) Eludir el sistema de pagos para cobrar o pagar directamente por servicios obtenidos a través de OficiosYa durante los 12 meses siguientes al primer contacto en la Plataforma.\nb) Acosar, amenazar o discriminar a otros usuarios de la Plataforma.\nc) Publicar información falsa, engañosa o fraudulenta en el perfil o en los servicios ofrecidos.\nd) Subir fotos o documentos de terceros sin su consentimiento.\ne) Utilizar la Plataforma para actividades ilegales o contrarias a la moral y buenas costumbres.\nf) Hacer spam o contactar a usuarios fuera de la Plataforma para fines comerciales.\n\nLa infracción puede resultar en suspensión inmediata de la cuenta, retención de fondos pendientes y, según la gravedad, en la presentación de denuncia penal."
  },
  {
    n: "11", t: "Responsabilidad de OficiosYa",
    b: "OficiosYa no garantiza la disponibilidad ininterrumpida de la Plataforma ni la ausencia de errores técnicos. El servicio se presta 'tal cual es' y 'según disponibilidad'.\n\nOficiosYa no es responsable por los daños causados por los Prestadores durante la ejecución de trabajos, ni por la calidad, seguridad o legalidad de los servicios prestados.\n\nLa responsabilidad máxima de OficiosYa ante cualquier reclamación está limitada al monto de la comisión cobrada en la transacción específica que dio origen al reclamo. OficiosYa no responde por pérdidas indirectas, lucro cesante, daño emergente o daño moral."
  },
  {
    n: "12", t: "Propiedad Intelectual",
    b: "Todos los contenidos de la Plataforma (logo, diseño, código, textos) son propiedad de OficiosYa y están protegidos por las leyes de propiedad intelectual vigentes en Argentina.\n\nAl subir fotos de trabajos realizados, el Prestador otorga a OficiosYa una licencia no exclusiva, gratuita y transferible para mostrar dichas imágenes en la Plataforma y en materiales de marketing, con o sin marca de agua. El Prestador garantiza que tiene derecho a compartir todas las imágenes que sube."
  },
  {
    n: "13", t: "Modificaciones de los Términos",
    b: "OficiosYa puede modificar estos Términos en cualquier momento. Los usuarios serán notificados por correo electrónico y mediante aviso en la Plataforma con al menos 15 días de anticipación. El uso continuado de la Plataforma después de la entrada en vigencia de las modificaciones implica aceptación tácita."
  },
  {
    n: "14", t: "Privacidad y Datos Personales",
    b: "El tratamiento de datos personales se rige por la Política de Privacidad de OficiosYa, disponible en /politica-privacidad, y por la Ley 25.326 de Protección de Datos Personales de la República Argentina. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA (AAIP) tiene la atribución de atender denuncias por incumplimiento de dicha normativa."
  },
  {
    n: "15", t: "Jurisdicción y Ley Aplicable",
    b: "Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Para cualquier controversia, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires, con renuncia expresa a cualquier otro fuero que pudiera corresponder.\n\nSin perjuicio de lo anterior, nada en estos Términos limita el derecho del usuario consumidor a acudir a la Defensa del Consumidor o instancias administrativas correspondientes (Ley 24.240).\n\nConsultas legales: legal@oficiosya.com.ar"
  },
];

export default function TerminosPage() {
  return (
    <>
      <Head>
        <title>Términos y Condiciones — OficiosYa</title>
        <meta name="description" content="Términos y condiciones de uso de OficiosYa, el marketplace de oficios y servicios profesionales de Argentina." />
      </Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "32px 20px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "36px 32px" }}>

            {/* Header */}
            <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: F, fontFamily: "Georgia,serif" }}>
              Términos y Condiciones de Uso
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: 13, margin: "0 0 8px" }}>
              Versión 2.0 · Vigente desde el 23 de mayo de 2026
            </p>
            <p style={{ color: "#9CA3AF", fontSize: 12, margin: "0 0 28px" }}>
              OficiosYa · Ciudad Autónoma de Buenos Aires, Argentina
            </p>

            {/* Aviso legal destacado */}
            <div style={{ background: "#FFFBEB", border: "1px solid rgba(201,162,39,0.4)", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#92400E", marginBottom: 28, lineHeight: 1.6 }}>
              ⚖️ <strong>Intermediación:</strong> OficiosYa actúa exclusivamente como plataforma de intermediación. No es empleadora ni contratista. Los contratos de servicio se celebran directamente entre Cliente y Prestador.
            </div>

            {/* Secciones */}
            {SECTIONS.map(s => (
              <div key={s.n} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid #F3F4F6" }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: F }}>
                  {s.n}. {s.t}
                </h2>
                {s.b.split("\n\n").map((par, i) => (
                  <p key={i} style={{ margin: "0 0 8px", fontSize: 14, color: "#374151", lineHeight: 1.75, whiteSpace: "pre-line" }}>
                    {par}
                  </p>
                ))}
              </div>
            ))}

            {/* Footer del documento */}
            <div style={{ marginTop: 8, background: "#F7F9F5", borderRadius: 12, padding: "16px 20px", fontSize: 13, color: "#6B7C6E", lineHeight: 1.6 }}>
              <strong style={{ color: F }}>OficiosYa</strong> — Plataforma argentina de intermediación de servicios y oficios.<br />
              Todos los derechos reservados · Buenos Aires, Argentina<br />
              Consultas: <a href="mailto:legal@oficiosya.com.ar" style={{ color: V }}>legal@oficiosya.com.ar</a> ·{" "}
              <a href="/politica-privacidad" style={{ color: V }}>Política de Privacidad</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
