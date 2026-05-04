/**
 * server-node/src/routes/pushNotifications.ts
 * Push notifications via Web Push (VAPID)
 *
 * Setup:
 *   npm install web-push
 *   npx web-push generate-vapid-keys  → copiar a .env
 *
 * .env:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_EMAIL=mailto:contacto@oficiosya.com.ar
 *
 * Endpoints:
 *   POST /api/push/subscribe    → registrar suscripción del dispositivo
 *   DELETE /api/push/subscribe  → eliminar suscripción
 *   POST /api/push/send/:userId → enviar notificación (admin/sistema)
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { requireRole } from "../security/roles.js";
import { PrismaClient } from "@prisma/client";

const router = Router();
function getAuth(req: any) { return (req.auth ?? req.user ?? {}) as { sub?: string; role?: string }; }

// Lazy import de web-push para no crashear si no está instalado
async function getWebPush() {
  try { return (await import("web-push" as any)).default; }
  catch { console.warn("[Push] web-push no instalado. Corré: cd server-node && npm install web-push"); return null; }
}

let webPushConfigured = false;
async function ensureVapid() {
  if (webPushConfigured) return true;
  const wp = await getWebPush();
  if (!wp) return false;
  const pub  = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const mail = process.env.VAPID_EMAIL || "mailto:contacto@oficiosya.com.ar";
  if (!pub || !priv) { console.warn("[Push] VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY no configurados en .env"); return false; }
  wp.setVapidDetails(mail, pub, priv);
  webPushConfigured = true;
  return true;
}

// ─── GET /api/push/vapid-public-key — key pública para el cliente ─────────────
router.get("/push/vapid-public-key", (_req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(503).json({ ok:false, error:"Push no configurado" });
  return res.json({ ok:true, publicKey: key });
});

// ─── POST /api/push/subscribe — registrar suscripción del dispositivo ─────────
router.post("/push/subscribe", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId } = getAuth(req);
  const { subscription } = req.body || {};
  if (!subscription?.endpoint) return res.status(400).json({ ok:false, error:"subscription.endpoint requerido" });

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: { userId: userId!, endpoint: subscription.endpoint, keys: subscription.keys || {} },
      update: { userId: userId!, keys: subscription.keys || {} },
    });
    return res.status(201).json({ ok:true, message:"Suscripción registrada" });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── DELETE /api/push/subscribe — eliminar suscripción ───────────────────────
router.delete("/push/subscribe", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ ok:false, error:"endpoint requerido" });
  try {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return res.json({ ok:true });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── Función interna: enviar push a un usuario ────────────────────────────────
export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string; icon?: string }) {
  const prisma = new PrismaClient();
  const wp = await getWebPush();
  if (!wp || !(await ensureVapid())) return;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const message = JSON.stringify({ ...payload, icon: payload.icon || "/icons/icon-192x192.png" });

  for (const sub of subs) {
    try {
      await wp.sendNotification({ endpoint: sub.endpoint, keys: sub.keys as any }, message);
    } catch(e: any) {
      if (e.statusCode === 410 || e.statusCode === 404) {
        // Suscripción inválida — limpiar
        await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
      }
    }
  }
}

// ─── POST /api/push/send/:userId — admin envía push manualmente ───────────────
router.post("/push/send/:userId", authRequired, requireRole("ADMIN"), async (req, res) => {
  const { title, body, url } = req.body || {};
  if (!title || !body) return res.status(400).json({ ok:false, error:"title y body requeridos" });
  try {
    await sendPushToUser(req.params.userId, { title, body, url });
    return res.json({ ok:true });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

export default router;
