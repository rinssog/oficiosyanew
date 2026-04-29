/**
 * subscriptions.ts — Suscripciones recurrentes via MercadoPago Preapproval
 * Docs: https://www.mercadopago.com.ar/developers/es/reference/subscriptions
 *
 * Flujo:
 *  1. POST /api/mp/plans/seed        → crea los 3 planes en MP (solo 1 vez, admin)
 *  2. POST /api/mp/subscribe         → crea suscripción del prestador en MP
 *  3. POST /api/mp/subscriptions/webhook → MP notifica cambios de estado
 *  4. GET  /api/mp/subscriptions/:id → consulta estado de suscripción
 *  5. POST /api/mp/subscriptions/:id/cancel → cancela
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { requireRole } from "../security/roles.js";
import { PrismaClient } from "@prisma/client";
import { readJson, writeJson, generateId } from "../storage.js";

const router = Router();

const MP_BASE = "https://api.mercadopago.com";
const TOKEN = () => process.env.MP_ACCESS_TOKEN || "";
const BASE_URL = () => process.env.NEXT_PUBLIC_BASE_URL || "https://oficiosya.com.ar";

// ─── Helper fetch a MP ────────────────────────────────────────────────────────
async function mpFetch(method: string, path: string, body?: object) {
  const res = await fetch(`${MP_BASE}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${TOKEN()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `MP error ${res.status}`);
  return data;
}

// ─── Definición de los 3 planes ───────────────────────────────────────────────
const PLAN_DEFS = [
  {
    key: "base",
    reason: "OficiosYa Plan Base — Prestadores",
    priceMonthly: 10000,   // ARS
    commissionPct: 0.20,
    leadFee: 700,
    features: { services: 5, visibility: "standard", support: "standard" },
  },
  {
    key: "pro",
    reason: "OficiosYa Plan Pro — Prestadores",
    priceMonthly: 20000,
    commissionPct: 0.15,
    leadFee: 0,
    features: { services: -1, visibility: "high", badge: "Pro", corporateAccess: true, couponCreation: true, support: "priority" },
  },
  {
    key: "premium",
    reason: "OficiosYa Plan Premium — Prestadores",
    priceMonthly: 30000,
    commissionPct: 0.13,
    leadFee: 0,
    features: { services: -1, visibility: "max", badge: "Premium", rc_insurance: true, accidents_insurance: true, corporateAccess: true, couponCreation: true, support: "dedicated" },
  },
];

// ─── GET /api/plans — lista planes (frontend) ─────────────────────────────────
router.get("/plans", async (_req, res) => {
  try {
    const prisma = new PrismaClient();
    const plans = await prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { priceMonthly: "asc" },
    });
    res.json({ ok: true, plans });
  } catch {
    const fallback = PLAN_DEFS.map(p => ({ id: p.key, name: p.reason, priceMonthly: p.priceMonthly, commissionPct: p.commissionPct, leadFee: p.leadFee, features: p.features }));
    res.json({ ok: true, plans: fallback });
  }
});

// ─── POST /api/mp/plans/seed — crea planes en MP + DB (admin, 1 vez) ──────────
router.post("/mp/plans/seed", authRequired, requireRole("ADMIN"), async (_req, res) => {
  if (!TOKEN()) return res.status(400).json({ ok: false, error: "MP_ACCESS_TOKEN no configurado" });
  const prisma = new PrismaClient();
  const results = [];

  for (const def of PLAN_DEFS) {
    try {
      // Crear plan en MercadoPago
      const mpPlan = await mpFetch("POST", "/preapproval_plan", {
        reason: def.reason,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: def.priceMonthly,
          currency_id: "ARS",
        },
        back_url: `${BASE_URL()}/providers/suscripcion?plan=${def.key}`,
      });

      // Guardar/actualizar en DB
      const existing = await prisma.subscriptionPlan.findFirst({ where: { name: { contains: def.key } } });
      const dbPlan = existing
        ? await prisma.subscriptionPlan.update({ where: { id: existing.id }, data: { name: def.reason, priceMonthly: def.priceMonthly, commissionPct: def.commissionPct, leadFee: def.leadFee, features: { ...def.features, mpPlanId: mpPlan.id } } })
        : await prisma.subscriptionPlan.create({ data: { name: def.reason, priceMonthly: def.priceMonthly, commissionPct: def.commissionPct, leadFee: def.leadFee, features: { ...def.features, mpPlanId: mpPlan.id }, recommended: def.key === "pro" } });

      results.push({ key: def.key, dbId: dbPlan.id, mpPlanId: mpPlan.id, status: "created" });
    } catch (e: any) {
      results.push({ key: def.key, status: "error", error: e.message });
    }
  }
  res.json({ ok: true, results });
});

// ─── POST /api/mp/subscribe — suscribir prestador a un plan ──────────────────
router.post("/mp/subscribe", authRequired, async (req, res) => {
  const { planId, payerEmail, cardTokenId } = req.body || {};
  if (!planId) return res.status(400).json({ ok: false, error: "planId requerido" });

  const prisma = new PrismaClient();
  const auth = (req as any).auth as { sub: string; role: string } | undefined;
  const userId = auth?.sub;
  if (!userId) return res.status(401).json({ ok: false, error: "No autenticado" });

  try {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ ok: false, error: "Plan no encontrado" });

    const features = (plan.features as any) || {};
    const mpPlanId = features.mpPlanId;

    // Si MP está configurado y hay mpPlanId, crear preapproval real
    if (TOKEN() && mpPlanId) {
      const body: any = {
        preapproval_plan_id: mpPlanId,
        reason: plan.name,
        external_reference: `${userId}_${planId}`,
        payer_email: payerEmail,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          start_date: new Date().toISOString(),
          transaction_amount: plan.priceMonthly,
          currency_id: "ARS",
        },
        back_url: `${BASE_URL()}/providers/suscripcion/confirmacion`,
        status: "authorized",
      };
      if (cardTokenId) body.card_token_id = cardTokenId;

      const mpSub = await mpFetch("POST", "/preapproval", body);

      // Guardar suscripción en DB
      const existing = await prisma.userSubscription.findFirst({ where: { userId, status: "ACTIVE" } });
      if (existing) await prisma.userSubscription.update({ where: { id: existing.id }, data: { status: "CANCELED", canceledAt: new Date() } });

      const renewAt = new Date(); renewAt.setMonth(renewAt.getMonth() + 1);
      const sub = await prisma.userSubscription.create({
        data: { userId, planId, status: "ACTIVE", renewAt, },
      });

      return res.status(201).json({ ok: true, subscription: sub, mpSubscriptionId: mpSub.id, initPoint: mpSub.init_point || null });
    }

    // Fallback sin MP (testing local)
    const renewAt = new Date(); renewAt.setMonth(renewAt.getMonth() + 1);
    const sub = await prisma.userSubscription.create({ data: { userId, planId, status: "ACTIVE", renewAt } });
    return res.status(201).json({ ok: true, subscription: sub, mpSubscriptionId: null, note: "Modo test — sin MP configurado" });

  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── POST /api/mp/subscriptions/webhook — MP notifica cambios ────────────────
router.post("/mp/subscriptions/webhook", async (req, res) => {
  const { type, data } = req.body || {};
  if (type !== "subscription_preapproval" || !data?.id) return res.status(204).send();

  try {
    if (!TOKEN()) return res.status(204).send();
    // Consultar estado actual en MP
    const mpSub = await mpFetch("GET", `/preapproval/${data.id}`);
    const externalRef: string = mpSub.external_reference || "";
    const [userId, planId] = externalRef.split("_");

    if (userId && planId) {
      const prisma = new PrismaClient();
      const newStatus = mpSub.status === "authorized" ? "ACTIVE" : mpSub.status === "cancelled" ? "CANCELED" : "PAUSED";
      await prisma.userSubscription.updateMany({
        where: { userId, planId, status: { not: "CANCELED" } },
        data: { status: newStatus, ...(newStatus === "CANCELED" ? { canceledAt: new Date() } : {}) },
      });
    }
  } catch { /* swallow — siempre ack */ }
  return res.status(204).send();
});

// ─── GET /api/mp/subscriptions/user/:userId — estado suscripción activa ───────
router.get("/mp/subscriptions/user/:userId", authRequired, async (req, res) => {
  try {
    const prisma = new PrismaClient();
    const sub = await prisma.userSubscription.findFirst({
      where: { userId: req.params.userId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { startedAt: "desc" },
    });
    res.json({ ok: true, subscription: sub || null });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── POST /api/mp/subscriptions/:id/cancel — cancela suscripción ─────────────
router.post("/mp/subscriptions/:id/cancel", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const auth2 = (req as any).auth as { sub: string; role: string } | undefined;
  const userId2 = auth2?.sub;  try {
    const sub = await prisma.userSubscription.findUnique({ where: { id: req.params.id }, include: { plan: true } });
    if (!sub || sub.userId !== userId2) return res.status(403).json({ ok: false, error: "No autorizado" });

    // Cancelar en MP si hay mpSubscriptionId
    const mpSubId = req.body?.mpSubscriptionId;
    if (TOKEN() && mpSubId) {
      try { await mpFetch("PUT", `/preapproval/${mpSubId}`, { status: "cancelled" }); } catch { /* ignorar */ }
    }

    const updated = await prisma.userSubscription.update({
      where: { id: req.params.id },
      data: { status: "CANCELED", canceledAt: new Date() },
    });
    res.json({ ok: true, subscription: updated, message: "Suscripción cancelada. Mantiene beneficios hasta fin del período." });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── Rutas legacy compatibles ─────────────────────────────────────────────────
router.get("/users/:userId/subscriptions", authRequired, async (req, res) => {
  try {
    const prisma = new PrismaClient();
    const subs = await prisma.userSubscription.findMany({ where: { userId: req.params.userId }, orderBy: { startedAt: "desc" }, include: { plan: true } });
    res.json({ ok: true, subscriptions: subs });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
