/**
 * pages/politica-privacidad.jsx
 */
import Head from "next/head";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const F = "#0D3B1F";

const SECS = [
  { t:"Responsable del Tratamiento", b:"OficiosYa (entidad constituida en Argentina, datos societarios a confirmar al lanzamiento), con domicilio en la Ciudad Autónoma de Buenos Aires, es responsable de la base de datos conforme a la Ley 25.326. Contacto: privacidad@oficiosya.com.ar" },
  { t:"Datos que recopilamos", b:"Recopilamos: nombre y apellido / razón social, DNI/CUIT/CUIL, fecha de nacimiento, domicilio, teléfono celular verificado, correo electrónico, datos de pago (gestionados por MercadoPago — OficiosYa no almacena datos de tarjetas), historial de solicitudes y pagos, calificaciones y reseñas, mensajes del chat interno, datos de dispositivo e IP, geolocalización (solo con consentimiento expreso). Para Prestadores: DNI frente y dorso, matrícula, certificado de antecedentes penales, CUIT/CUIL y CBU." },
  { t:"Finalidad del tratamiento", b:"Usamos tus datos para: gestión del registro y autenticación, facilitación del contacto entre Clientes y Prestadores, procesamiento de pagos y Escrow, validación de identidad y verificación, notificaciones de solicitudes y pagos, prevención del fraude, mejora de la plataforma (datos anonimizados), y comunicaciones comerciales propias (podés darte de baja en cualquier momento)." },
  { t:"Compartición de datos", b:"Compartimos datos con: MercadoPago (pagos), aseguradora habilitada SSN (Seguro RC para Prestadores Pro/Premium), proveedores tecnológicos de infraestructura bajo acuerdos de confidencialidad, y organismos públicos ante requerimientos judiciales o administrativos. No vendemos datos personales a terceros." },
  { t:"Tus derechos", b:"Conforme a la Ley 25.326, tenés derecho a acceder, rectificar, actualizar y suprimir tus datos enviando un email a privacidad@oficiosya.com.ar con copia de tu DNI. Plazo de respuesta: 5 días hábiles para acceso, 10 días para rectificación o supresión. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA (AAIP) tiene la atribución de atender denuncias por incumplimiento de esta normativa." },
  { t:"Seguridad", b:"Implementamos cifrado TLS/SSL en tránsito, control de acceso por roles y auditorías periódicas. En caso de brecha de seguridad, notificaremos a los afectados y a la AAIP en los plazos normativos." },
  { t:"Retención", b:"Los datos se conservan durante la vigencia de la Cuenta y el período necesario para cumplir obligaciones legales y fiscales (mínimo 10 años para transacciones, conforme legislación comercial argentina)." },
  { t:"Ley aplicable", b:"Esta Política se rige por la Ley 25.326, la Resolución 4/2019 de la AAIP, y la Ley 25.506 de Firma Digital. Jurisdicción: Tribunales Ordinarios de CABA." },
];

export default function PrivacidadPage() {
  return (
    <>
      <Head><title>Política de Privacidad — OficiosYa</title></Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "32px 20px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "36px 32px" }}>
            <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: F, fontFamily: "Georgia,serif" }}>Política de Privacidad</h1>
            <p style={{ color: "#9CA3AF", fontSize: 13, margin: "0 0 28px" }}>Conforme a la Ley 25.326 de Protección de Datos Personales — República Argentina</p>
            <div style={{ background: "#F0FDF4", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#166534", marginBottom: 28 }}>
              🔒 Tus datos personales son tratados con confidencialidad y nunca son vendidos a terceros.
            </div>
            {SECS.map((s, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: F }}>{i+1}. {s.t}</h2>
                <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
