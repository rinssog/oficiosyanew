/**
 * server-node/src/services/emailService.ts
 * Servicio de notificaciones por email (SMTP via nodemailer)
 *
 * Variables de entorno requeridas en .env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Instalar: cd server-node && npm install nodemailer @types/nodemailer
 */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM = process.env.SMTP_FROM || "OficiosYa <noreply@oficiosya.com.ar>";
const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://oficiosya.com.ar";

async function send(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL SKIP] To: ${to} | ${subject}`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
}

// ─── Templates ────────────────────────────────────────────────────────────────
const wrap = (title: string, body: string) => `
<!DOCTYPE html><html lang="es"><body style="font-family:system-ui,sans-serif;background:#F7F9F5;padding:20px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #D4E0D6">
  <div style="background:linear-gradient(135deg,#0D3B1F,#16A34A);padding:24px;text-align:center">
    <div style="color:#C9A227;font-size:28px;font-weight:900;font-family:Georgia,serif">OficiosYa</div>
    <div style="color:#BBF7D0;font-size:13px;margin-top:4px">Plataforma Argentina de Servicios y Oficios</div>
  </div>
  <div style="padding:28px 24px">
    <h2 style="color:#0D3B1F;margin:0 0 16px;font-size:20px">${title}</h2>
    ${body}
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #F3F4F6;font-size:11px;color:#9CA3AF;text-align:center">
      OficiosYa · Ciudad Autónoma de Buenos Aires<br>
      <a href="${BASE}/terminos" style="color:#16A34A">Términos y Condiciones</a> ·
      <a href="${BASE}/politica-privacidad" style="color:#16A34A">Privacidad</a>
    </div>
  </div>
</div></body></html>`;

const btn = (text: string, url: string) =>
  `<div style="text-align:center;margin:20px 0"><a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#16A34A,#0D3B1F);color:#fff;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:700;font-size:14px">${text}</a></div>`;

// ─── Funciones de notificación ────────────────────────────────────────────────
export const emailService = {

  // Bienvenida al registrarse
  async welcome(to: string, name: string, role: "CLIENT" | "PROVIDER") {
    const isProvider = role === "PROVIDER";
    await send(to, "Bienvenido a OficiosYa", wrap(
      `Hola, ${name}!`,
      `<p style="color:#374151;line-height:1.6">Tu cuenta fue creada exitosamente en OficiosYa, la plataforma argentina de servicios y oficios.</p>
       ${isProvider
         ? `<p style="color:#374151;line-height:1.6">Como prestador, el próximo paso es completar tu perfil y subir tu documentación de verificación para empezar a recibir clientes.</p>${btn("Completar mi perfil", `${BASE}/providers/verificacion`)}`
         : `<p style="color:#374151;line-height:1.6">Ya podés buscar y contratar prestadores verificados en tu zona.</p>${btn("Buscar prestadores", `${BASE}/client/buscar`)}`
       }`
    ));
  },

  // Nueva solicitud recibida (para el prestador)
  async newRequest(to: string, providerName: string, rubro: string, requestId: string) {
    await send(to, `Nueva solicitud de servicio — ${rubro}`, wrap(
      `Tenés una nueva solicitud`,
      `<p style="color:#374151;line-height:1.6">Hola ${providerName}, recibiste una nueva solicitud de servicio de <strong>${rubro}</strong>.</p>
       <p style="color:#374151;line-height:1.6">Respondela dentro de las 24 horas para no perder el cliente.</p>
       ${btn("Ver solicitud", `${BASE}/providers/solicitud/${requestId}`)}`
    ));
  },

  // Presupuesto aceptado (para el prestador)
  async requestConfirmed(to: string, providerName: string, rubro: string, requestId: string) {
    await send(to, `Trabajo confirmado — ${rubro}`, wrap(
      `¡Tu presupuesto fue aceptado!`,
      `<p style="color:#374151;line-height:1.6">Hola ${providerName}, el cliente aceptó tu presupuesto para <strong>${rubro}</strong>. El pago está retenido en Escrow y será liberado cuando completes el trabajo.</p>
       ${btn("Ver detalles", `${BASE}/providers/solicitud/${requestId}`)}`
    ));
  },

  // Pago liberado al prestador
  async paymentReleased(to: string, providerName: string, amount: number, requestId: string) {
    await send(to, `Pago liberado — $${amount.toLocaleString("es-AR")}`, wrap(
      `Tu pago fue liberado`,
      `<p style="color:#374151;line-height:1.6">Hola ${providerName}, el cliente confirmó la finalización del trabajo. <strong>$${amount.toLocaleString("es-AR")}</strong> fueron liberados a tu cuenta (menos comisión de OficiosYa).</p>
       <p style="color:#374151;line-height:1.6">La acreditación puede demorar hasta 2 días hábiles según MercadoPago.</p>
       ${btn("Ver trabajo", `${BASE}/providers/solicitud/${requestId}`)}`
    ));
  },

  // Notificación al cliente que su solicitud tiene respuesta
  async quoteReceived(to: string, clientName: string, rubro: string, requestId: string) {
    await send(to, `Recibiste un presupuesto — ${rubro}`, wrap(
      `Tu solicitud tiene respuesta`,
      `<p style="color:#374151;line-height:1.6">Hola ${clientName}, el prestador respondió tu solicitud de <strong>${rubro}</strong> con un presupuesto.</p>
       <p style="color:#374151;line-height:1.6">Revisalo y aceptalo para confirmar el trabajo. El pago queda protegido en Escrow hasta que todo esté listo.</p>
       ${btn("Ver presupuesto", `${BASE}/client/solicitud/${requestId}`)}`
    ));
  },

  // Alerta de chat bloqueado (moderación HIGH/CRITICAL)
  async chatAlert(to: string, userName: string, riskLevel: string, triggers: string[]) {
    await send(to, `[ALERTA] Intento de desvío detectado — ${riskLevel}`, wrap(
      `Alerta de moderación`,
      `<p style="color:#374151;line-height:1.6">El usuario <strong>${userName}</strong> fue detectado intentando desviar una transacción fuera de la plataforma.</p>
       <p style="color:#374151"><strong>Nivel:</strong> ${riskLevel}</p>
       <p style="color:#374151"><strong>Triggers:</strong> ${triggers.join(", ")}</p>
       ${btn("Ver en panel admin", `${BASE}/admin/chat-alerts`)}`
    ));
  },

  // Verificación aprobada (para el prestador)
  async verificationApproved(to: string, name: string, level: string) {
    await send(to, `Tu verificación fue aprobada — Nivel ${level}`, wrap(
      `¡Verificación aprobada!`,
      `<p style="color:#374151;line-height:1.6">Hola ${name}, tu cuenta fue verificada al nivel <strong>${level}</strong>. Ahora aparecés con mayor visibilidad en los resultados de búsqueda.</p>
       ${btn("Ver mi perfil", `${BASE}/providers/dashboard`)}`
    ));
  },
};

export default emailService;
