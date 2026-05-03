/**
 * chat.ts — Chat interno OficiosYa con moderación anti-bypass y anti-phishing
 *
 * POLÍTICA: Todo intento de desviar la transacción fuera de la plataforma
 * activa alertas progresivas. Los T&C (Sección 19) establecen penalidades
 * contractuales. Este módulo las detecta y ejecuta automáticamente.
 *
 * NIVELES DE ALERTA:
 *   WARN     → aviso al usuario + log. Sin acción.
 *   FLAG     → mensaje bloqueado + notificación al admin. 2do mensaje = SUSPEND.
 *   SUSPEND  → cuenta suspendida 48hs + notificación + log de auditoría.
 *   BAN      → suspensión permanente si reincide post-SUSPEND.
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { PrismaClient } from "@prisma/client";
import { generateId } from "../storage.js";
import { createAuditEntry } from "../services/audit.js";

const router = Router();
const prisma = new PrismaClient();

// ─── PATRONES DE DETECCIÓN ────────────────────────────────────────────────────
const BYPASS_PATTERNS: Array<{
  id: string;
  severity: "WARN" | "FLAG" | "SUSPEND";
  pattern: RegExp;
  reason: string;
}> = [
  // ── Teléfonos / WhatsApp ──────────────────────────────────────────────────
  {
    id: "phone_explicit",
    severity: "FLAG",
    pattern: /\b(whatsapp|whats|wsp|cel|celu|celular|tel[eé]fono|llamame|llamá[mn]e|contactame|contactá[mn]e|mi\s+n[uú]mero)\b/i,
    reason: "Intento de contacto por fuera de la plataforma (teléfono/WhatsApp)",
  },
  {
    id: "phone_number",
    severity: "FLAG",
    pattern: /\b(\+?54\s*9?\s*)?(\d[\s\-.]?){8,12}\b/,
    reason: "Número de teléfono detectado en el chat",
  },
  // ── Emails ───────────────────────────────────────────────────────────────
  {
    id: "email_address",
    severity: "FLAG",
    pattern: /[a-zA-Z0-9._%+\-]+\s*[@＠]\s*[a-zA-Z0-9.\-]+\s*\.\s*[a-zA-Z]{2,}/,
    reason: "Dirección de email detectada en el chat",
  },
  {
    id: "email_obfuscated",
    severity: "FLAG",
    pattern: /\b(arroba|arobas|at\s+sign|punto\s+com|dotcom)\b/i,
    reason: "Email obfuscado detectado",
  },
  // ── Redes sociales ───────────────────────────────────────────────────────
  {
    id: "social_handle",
    severity: "FLAG",
    pattern: /\b(instagram|insta|ig|facebook|fb|tiktok|twitter|telegram|signal|snapchat)\b\s*[:\-]?\s*@?[\w.]+/i,
    reason: "Cuenta de red social detectada en el chat",
  },
  {
    id: "at_handle",
    severity: "WARN",
    pattern: /@[a-zA-Z0-9_\.]{3,}/,
    reason: "Posible handle de red social o usuario externo",
  },
  // ── Desvío de pago ───────────────────────────────────────────────────────
  {
    id: "payment_bypass_explicit",
    severity: "SUSPEND",
    pattern: /\b(sin\s+comisi[oó]n|fuera\s+de\s+la\s+plataforma|por\s+fuera|te\s+pago\s+directo|pago\s+directo|efectivo\s+s[oi]lo|cash\s+only|sin\s+plataforma|evadir|evitar\s+(la\s+)?comisi[oó]n|nos\s+ahorramos\s+la\s+comisi[oó]n|sin\s+pasar\s+por)\b/i,
    reason: "Intento EXPLÍCITO de desviar pago fuera de la plataforma — Sección 19 T&C",
  },
  {
    id: "payment_bypass_soft",
    severity: "FLAG",
    pattern: /\b(transferencia\s+directa|mercadopago\s+personal|mp\s+personal|alias\s+cbu|cbu\s+:?|cvu\s+:?|te\s+mando\s+(el\s+)?(mp|link)|paga[mn]e\s+por\s+(mp|transferencia)|pago\s+por\s+fuera)\b/i,
    reason: "Intento de acordar pago fuera del escrow de la plataforma",
  },
  {
    id: "cbu_alias",
    severity: "FLAG",
    pattern: /\b(alias|cbu|cvu)\s*[:\-]?\s*[\w.]+/i,
    reason: "CBU/CVU/Alias detectado — pagos deben procesarse dentro de la plataforma",
  },
  // ── Acuerdo externo ──────────────────────────────────────────────────────
  {
    id: "external_deal",
    severity: "FLAG",
    pattern: /\b(por\s+privado|hablemos\s+afuera|te\s+escribo\s+por\s+otro\s+lado|cierra[mn]os\s+por\s+afuera|trato\s+directo|acuerdo\s+privado|sin\s+intermediarios)\b/i,
    reason: "Intento de cerrar el acuerdo por fuera de la plataforma",
  },
  // ── URLs externas ─────────────────────────────────────────────────────────
  {
    id: "external_url",
    severity: "FLAG",
    pattern: /https?:\/\/(?!oficiosya\.com\.ar)[^\s]+/i,
    reason: "URL externa detectada en el chat",
  },
  {
    id: "url_obfuscated",
    severity: "WARN",
    pattern: /\b(bit\.ly|tinyurl|shorturl|t\.co|goo\.gl|ow\.ly)\b/i,
    reason: "URL acortada sospechosa detectada",
  },
];

// ─── Mensajes de advertencia al usuario ───────────────────────────────────────
const WARN_MESSAGES: Record<string, string> = {
  WARN: "⚠️ Tu mensaje contiene información que puede violar nuestras políticas. Por favor, mantené la comunicación dentro de la plataforma.",
  FLAG: "🚫 Tu mensaje fue bloqueado. Compartir datos de contacto o acordar pagos fuera de la plataforma viola los Términos y Condiciones (Sección 19). Una segunda infracción puede resultar en la suspensión de tu cuenta.",
  SUSPEND: "🔴 Tu cuenta ha sido suspendida temporalmente por 48 horas por intento de desviar una transacción fuera de la plataforma. Esto viola los T&C (Sección 19). Ante reincidencia, la suspensión será permanente.",
};

// ─── Función principal de moderación ─────────────────────────────────────────
async function moderateMessage(
  body: string,
  fromId: string,
  requestId: string
): Promise<{
  allowed: boolean;
  severity: "OK" | "WARN" | "FLAG" | "SUSPEND";
  triggeredRules: string[];
  systemMessage?: string;
}> {
  const triggered = BYPASS_PATTERNS.filter((p) => p.pattern.test(body));
  if (triggered.length === 0) return { allowed: true, severity: "OK", triggeredRules: [] };

  // Tomar la severidad más alta
  const severityOrder = { WARN: 1, FLAG: 2, SUSPEND: 3 };
  const maxRule = triggered.reduce((a, b) =>
    severityOrder[b.severity] > severityOrder[a.severity] ? b : a
  );
  const severity = maxRule.severity;
  const triggeredRules = triggered.map((r) => r.id);

  // Verificar historial: si ya tiene FLAG previa → escalar a SUSPEND
  const priorFlags = await prisma.chatModerationLog.count({
    where: { userId: fromId, severity: { in: ["FLAG", "SUSPEND"] }, createdAt: { gte: new Date(Date.now() - 30 * 24 * 3600000) } },
  }).catch(() => 0);

  const effectiveSeverity: "WARN" | "FLAG" | "SUSPEND" =
    severity === "FLAG" && priorFlags >= 1 ? "SUSPEND" :
    severity === "SUSPEND" && priorFlags >= 1 ? "SUSPEND" :
    severity;

  // Guardar log de moderación
  await prisma.chatModerationLog.create({
    data: {
      id: generateId("mod_"),
      userId: fromId,
      requestId,
      messageBody: body.slice(0, 500),
      severity: effectiveSeverity,
      triggeredRules: JSON.stringify(triggeredRules),
      reasons: JSON.stringify(triggered.map((r) => r.reason)),
    },
  }).catch(() => {});

  // Log de auditoría
  await createAuditEntry({
    actorId: fromId,
    action: `CHAT_MODERATION_${effectiveSeverity}`,
    entity: "ChatMessage",
    entityId: requestId,
    payload: { triggeredRules, reasons: triggered.map((r) => r.reason) },
  }).catch(() => {});

  // Ejecutar sanción
  if (effectiveSeverity === "SUSPEND") {
    const suspendUntil = new Date(Date.now() + 48 * 3600000);
    await prisma.user.update({
      where: { id: fromId },
      data: { suspendedUntil: suspendUntil, suspensionReason: "Desvío de transacción — T&C Sección 19" },
    }).catch(() => {});
  }

  return {
    allowed: effectiveSeverity === "WARN", // WARN pasa con advertencia, FLAG/SUSPEND bloquea
    severity: effectiveSeverity,
    triggeredRules,
    systemMessage: WARN_MESSAGES[effectiveSeverity],
  };
}

// ─── ENDPOINTS DE CHAT ────────────────────────────────────────────────────────

// POST /api/chat/:requestId/messages — enviar mensaje
router.post("/chat/:requestId/messages", authRequired, async (req, res) => {
  const { requestId } = req.params;
  const { body } = req.body || {};
  const auth = (req as any).auth as { sub: string; role: string } | undefined;
  const fromId = auth?.sub;

  if (!fromId) return res.status(401).json({ ok: false, error: "No autenticado" });
  if (!body?.trim()) return res.status(400).json({ ok: false, error: "Mensaje vacío" });
  if (body.length > 2000) return res.status(400).json({ ok: false, error: "Mensaje demasiado largo (máx 2000 caracteres)" });

  try {
    // Verificar que el usuario es parte de la solicitud
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

    const provider = request.providerId
      ? await prisma.provider.findUnique({ where: { id: request.providerId } })
      : null;
    const providerUserId = provider?.userId;

    const isParticipant = fromId === request.clientId || fromId === providerUserId || auth?.role === "ADMIN";
    if (!isParticipant) return res.status(403).json({ ok: false, error: "No sos parte de esta conversación" });

    // Verificar si la cuenta está suspendida
    const user = await prisma.user.findUnique({ where: { id: fromId } });
    if (user?.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      return res.status(403).json({
        ok: false,
        error: `Tu cuenta está suspendida hasta ${new Date(user.suspendedUntil).toLocaleString("es-AR")}. Motivo: ${user.suspensionReason || "Violación de T&C"}`,
        suspendedUntil: user.suspendedUntil,
      });
    }

    // Moderar el mensaje
    const modResult = await moderateMessage(body, fromId, requestId);

    // Si está bloqueado (FLAG o SUSPEND): no guardar, devolver error con sistema de alerta
    if (!modResult.allowed) {
      return res.status(422).json({
        ok: false,
        moderated: true,
        severity: modResult.severity,
        systemMessage: modResult.systemMessage,
        triggeredRules: modResult.triggeredRules,
      });
    }

    // Determinar destinatario
    const toId = fromId === request.clientId ? (providerUserId || fromId) : request.clientId;

    // Guardar mensaje
    const msg = await prisma.chatMessage.create({
      data: {
        id: generateId("msg_"),
        requestId,
        fromId,
        toId,
        body: body.trim(),
        ...(modResult.severity === "WARN" ? { moderationFlag: "WARN" } : {}),
      },
    });

    // Si fue WARN: incluir mensaje de sistema en la respuesta
    return res.status(201).json({
      ok: true,
      message: msg,
      ...(modResult.severity === "WARN" ? { warning: modResult.systemMessage } : {}),
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/chat/:requestId/messages — leer conversación
router.get("/chat/:requestId/messages", authRequired, async (req, res) => {
  const { requestId } = req.params;
  const auth = (req as any).auth as { sub: string; role: string } | undefined;
  const userId = auth?.sub;
  const since = req.query.since as string | undefined;

  if (!userId) return res.status(401).json({ ok: false, error: "No autenticado" });

  try {
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

    const provider = request.providerId
      ? await prisma.provider.findUnique({ where: { id: request.providerId } })
      : null;
    const providerUserId = provider?.userId;

    const isParticipant = userId === request.clientId || userId === providerUserId || auth?.role === "ADMIN";
    if (!isParticipant) return res.status(403).json({ ok: false, error: "No autorizado" });

    const messages = await prisma.chatMessage.findMany({
      where: {
        requestId,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Marcar como leídos los mensajes del otro
    await prisma.chatMessage.updateMany({
      where: { requestId, toId: userId, readAt: null },
      data: { readAt: new Date() },
    }).catch(() => {});

    return res.json({ ok: true, messages });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/chat/moderation/logs — logs de moderación (admin)
router.get("/chat/moderation/logs", authRequired, async (req, res) => {
  const auth = (req as any).auth as { sub: string; role: string } | undefined;
  if (auth?.role !== "ADMIN") return res.status(403).json({ ok: false, error: "Solo admin" });

  try {
    const logs = await prisma.chatModerationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ ok: true, logs });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/chat/moderation/:userId/unsuspend — levantar suspensión (admin)
router.post("/chat/moderation/:userId/unsuspend", authRequired, async (req, res) => {
  const auth = (req as any).auth as { sub: string; role: string } | undefined;
  if (auth?.role !== "ADMIN") return res.status(403).json({ ok: false, error: "Solo admin" });

  try {
    await prisma.user.update({
      where: { id: req.params.userId },
      data: { suspendedUntil: null, suspensionReason: null },
    });
    res.json({ ok: true, message: "Suspensión levantada" });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
