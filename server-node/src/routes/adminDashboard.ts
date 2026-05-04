/**
 * server-node/src/routes/adminDashboard.ts
 * Panel de admin — KPIs, usuarios, suspensiones, escrow
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { requireRole } from "../security/roles.js";
import { PrismaClient } from "@prisma/client";

const router = Router();

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
router.get("/admin/dashboard", authRequired, requireRole("ADMIN"), async (_req, res) => {
  const prisma = new PrismaClient();
  try {
    const [totalUsers, totalProviders, totalRequests, completedJobs, heldEscrow, pendingAlerts, pendingVerifications] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.request.count(),
      prisma.request.count({ where: { status: "DONE" } }),
      prisma.escrowRecord.aggregate({ where:{ status:"HELD" }, _sum:{ amount:true } }),
      prisma.auditLog.count({ where: { action: "ACCOUNT_SUSPENDED_CRITICAL" } }),
      prisma.auditLog.count({ where: { action: "VERIFICATION_SUBMITTED" } }),
    ]);

    return res.json({
      ok: true,
      stats: {
        totalUsers,
        totalProviders,
        totalRequests,
        completedJobs,
        escrowHeld: `$${((heldEscrow._sum.amount || 0) / 100).toLocaleString("es-AR")}`,
        pendingAlerts,
        pendingVerifications,
      },
    });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get("/admin/users", authRequired, requireRole("ADMIN"), async (req, res) => {
  const prisma = new PrismaClient();
  const { role, q, page = "1" } = req.query as Record<string,string>;
  const skip = (Number(page)-1)*20;
  try {
    const where: any = {};
    if (role) where.role = role;
    if (q) where.OR = [{ name:{ contains:q } },{ email:{ contains:q } }];
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take:20, orderBy:{ createdAt:"desc" }, select:{ id:true, name:true, email:true, role:true, createdAt:true } }),
      prisma.user.count({ where }),
    ]);
    return res.json({ ok:true, users, total, page:Number(page), pages:Math.ceil(total/20) });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── POST /api/admin/users/:id/suspend ───────────────────────────────────────
router.post("/admin/users/:id/suspend", authRequired, requireRole("ADMIN"), async (req, res) => {
  const prisma = new PrismaClient();
  const { reason, hours = 48 } = req.body || {};
  const { sub: adminId } = (req as any).auth || {};
  try {
    const until = new Date(Date.now() + Number(hours)*3600*1000);
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: "ADMIN",
        action: "ACCOUNT_SUSPENDED",
        entity: "User",
        entityId: req.params.id,
        payload: { reason, until: until.toISOString(), hours },
      },
    });
    return res.json({ ok:true, message:`Usuario suspendido hasta ${until.toLocaleString("es-AR")}` });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── GET /api/admin/audit-log ────────────────────────────────────────────────
router.get("/admin/audit-log", authRequired, requireRole("ADMIN"), async (req, res) => {
  const prisma = new PrismaClient();
  const { action, entityId, page = "1" } = req.query as Record<string,string>;
  const skip = (Number(page)-1)*50;
  try {
    const where: any = {};
    if (action) where.action = action;
    if (entityId) where.entityId = entityId;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take:50, orderBy:{ createdAt:"desc" } }),
      prisma.auditLog.count({ where }),
    ]);
    return res.json({ ok:true, logs, total, page:Number(page), pages:Math.ceil(total/50) });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── GET /api/admin/verificaciones ───────────────────────────────────────────
router.get("/admin/verificaciones", authRequired, requireRole("ADMIN"), async (_req, res) => {
  const prisma = new PrismaClient();
  try {
    const pending = await prisma.auditLog.findMany({
      where: { action: "VERIFICATION_SUBMITTED" },
      orderBy: { createdAt: "asc" },
    });
    return res.json({ ok:true, count: pending.length, items: pending });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── POST /api/admin/verificaciones/:logId/approve ───────────────────────────
router.post("/admin/verificaciones/:logId/approve", authRequired, requireRole("ADMIN"), async (req, res) => {
  const prisma = new PrismaClient();
  const { approved, notes } = req.body || {};
  const { sub: adminId } = (req as any).auth || {};
  try {
    const log = await prisma.auditLog.findUnique({ where:{ id: req.params.logId } });
    if (!log) return res.status(404).json({ ok:false, error:"Log no encontrado" });

    if (approved) {
      // Verificar al prestador
      const provider = await prisma.provider.findFirst({ where:{ userId: log.entityId } });
      if (provider) {
        await prisma.provider.update({ where:{ id: provider.id }, data:{ verified: true } });
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: "ADMIN",
        action: approved ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
        entity: "User",
        entityId: log.entityId,
        payload: { notes, originalLogId: log.id },
      },
    });

    return res.json({ ok:true, message: approved ? "Prestador verificado" : "Verificación rechazada" });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

export default router;
