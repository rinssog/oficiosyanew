import { Router } from "express";
import { getRepos } from "../repositories/factory.js";
// Mercado Pago SDK (opcional). Si no hay token, cae a placeholder.
let mpAvailable = false as boolean;
let PreferenceClient: any = null;
let MercadoPagoConfig: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mp = require('mercadopago');
  MercadoPagoConfig = mp.MercadoPagoConfig;
  PreferenceClient = mp.PreferenceClient;
  mpAvailable = true;
} catch {}
import { readJson, writeJson, generateId } from "../storage.js";
import { PrismaClient } from "@prisma/client";

const router = Router();

// Configuración de checkout (placeholder, ampliable con Mercado Pago)
router.get("/payments/config", (_req, res) => {
  res.json({ ok: true, provider: "mercadopago", publicKey: process.env.MP_PUBLIC_KEY || null });
});

// Crea un intento de pago (placeholder). En el futuro: preference MP.
router.post("/payments/checkout", async (req, res) => {
  const { userId, providerId, quoteId, items = [], totals = {}, urgent } = req.body || {};
  if (!userId || !providerId) return res.status(400).json({ ok: false, error: "userId y providerId requeridos" });

  const repos = getRepos();
  let commissionPct = 0.15;
  let leadFee = 700;
  try {
    // intentar leer plan del prestador vía repos/prisma
    // la ruta de quotes ya calcula fee; acá recalculamos con seguridad
    // Si no hay repos/plans (fallback), se usan defaults
    // omitimos lectura en detalle para evitar dependencias fuertes
  } catch {}

  const base = Number(totals?.labor || 0) + Number(totals?.materials || 0);
  const platformFee = Math.round(base * commissionPct) + Number(leadFee || 0);
  const retentionPct = urgent ? 0.5 : 0; // retención operativa (no seña)
  const retained = Math.round(base * retentionPct);

  const attempt = {
    id: generateId("pay_"),
    userId,
    providerId,
    quoteId: quoteId || null,
    items,
    base,
    platformFee,
    retained,
    currency: "ARS",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  // Guardar intento en DB si hay Prisma
  try {
    const prisma = new PrismaClient();
    await prisma.paymentAttempt.create({ data: {
      id: attempt.id,
      userId, providerId, quoteId: quoteId || null,
      base, platformFee, retained,
      currency: attempt.currency,
      status: attempt.status,
      metadata: { items, urgent: !!urgent }
    }});
  } catch {
    const all = readJson<any[]>("payments", []);
    all.push(attempt);
    writeJson("payments", all);
  }

  // Si Mercado Pago está configurado, crear preference
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (mpAvailable && accessToken) {
    try {
      const client = new PreferenceClient(new MercadoPagoConfig({ accessToken }));
      const pref = await client.create({
        body: {
          items: [
            { title: 'Servicio - Mano de obra', quantity: 1, unit_price: Number(totals?.labor || 0) / 100, currency_id: 'ARS' },
            { title: 'Materiales', quantity: 1, unit_price: Number(totals?.materials || 0) / 100, currency_id: 'ARS' },
            { title: 'Tarifa de plataforma', quantity: 1, unit_price: platformFee / 100, currency_id: 'ARS' },
          ],
          metadata: { paymentId: attempt.id, urgent: !!urgent },
          back_urls: {
            success: `${req.headers.origin || ''}/checkout/success?payment=${attempt.id}`,
            failure: `${req.headers.origin || ''}/checkout/failure?payment=${attempt.id}`,
            pending: `${req.headers.origin || ''}/checkout/pending?payment=${attempt.id}`,
          },
          auto_return: 'approved',
        },
      });
      // persistir preferenceId
      try { const prisma = new PrismaClient(); await prisma.paymentAttempt.update({ where: { id: attempt.id }, data: { mpPreferenceId: pref.id }});} catch {}
      return res.status(201).json({ ok: true, attempt, preferenceId: pref.id, initPoint: pref.init_point });
    } catch (e: any) {
      return res.status(201).json({ ok: true, attempt, redirectUrl: `/success?payment=${attempt.id}` });
    }
  }
  // Fallback: redirect simulado
  return res.status(201).json({ ok: true, attempt, redirectUrl: `/success?payment=${attempt.id}` });
});

// Webhook placeholder (MP): recibirá notificaciones de pago real
router.post("/payments/webhook", async (req, res) => {
  const token = process.env.MP_ACCESS_TOKEN;
  const topic = (req.body?.type || req.query?.type || '').toString();
  const dataId = (req.body?.data?.id || req.query?.id || '').toString();
  try {
    let mpStatus: string | null = null;
    if (mpAvailable && token && dataId && topic === 'payment') {
      const mp = require('mercadopago');
      const Payment = new mp.PaymentClient(new mp.MercadoPagoConfig({ accessToken: token }));
      const info = await Payment.get({ id: dataId });
      mpStatus = info?.status || null;
      const paymentId = info?.metadata?.paymentId as string | undefined;
      if (paymentId) {
        const prisma = new PrismaClient();
        await prisma.paymentAttempt.update({ where: { id: paymentId }, data: { mpPaymentId: dataId, mpStatus, status: (mpStatus || '').toUpperCase(), updatedAt: new Date() } });
      }
    }
  } catch (e) {
    // swallow and ack to avoid retries en bucle
  }
  return res.status(204).send();
});

export default router;
