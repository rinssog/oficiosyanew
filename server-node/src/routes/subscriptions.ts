import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { requireRole, getAuth } from "../security/roles.js";
import { PrismaClient } from "@prisma/client";

const router = Router();

router.get("/plans", async (_req, res) => {
  try {
    const prisma = new PrismaClient();
    const plans = await prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } });
    res.json({ ok: true, plans });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'Error' });
  }
});

router.get("/users/:userId/subscriptions", authRequired, async (req, res) => {
  try {
    const prisma = new PrismaClient();
    const subs = await prisma.userSubscription.findMany({ where: { userId: req.params.userId }, orderBy: { startedAt: 'desc' }, include: { plan: true } });
    res.json({ ok: true, subscriptions: subs });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'Error' });
  }
});

router.post("/users/:userId/subscriptions", authRequired, requireRole("CLIENT", "PROVIDER", "ADMIN"), async (req, res) => {
  const planId = String(req.body?.planId || "").trim();
  if (!planId) return res.status(400).json({ ok: false, error: 'planId requerido' });
  try {
    const prisma = new PrismaClient();
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) return res.status(404).json({ ok: false, error: 'Plan inexistente' });
    const sub = await prisma.userSubscription.create({ data: { userId: req.params.userId, planId: plan.id, status: 'ACTIVE', renewAt: null } });
    res.status(201).json({ ok: true, subscription: sub });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'Error' });
  }
});

router.post("/users/:userId/subscriptions/:id/cancel", authRequired, async (req, res) => {
  try {
    const prisma = new PrismaClient();
    const sub = await prisma.userSubscription.update({ where: { id: req.params.id }, data: { status: 'CANCELED', canceledAt: new Date() } });
    res.json({ ok: true, subscription: sub });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'Error' });
  }
});

export default router;

