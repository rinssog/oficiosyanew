/**
 * teamMembers.ts — Equipos de trabajo de Prestadores
 * Ruta destino: server-node/src/routes/teamMembers.ts
 *
 * Registrar en index.ts:
 *   import teamRouter from "./routes/teamMembers.js";
 *   app.use("/api", teamRouter);
 *
 * Endpoints:
 *   GET    /api/providers/:providerId/team          → listar equipo
 *   POST   /api/providers/:providerId/team          → agregar miembro
 *   PUT    /api/providers/:providerId/team/:memberId → editar miembro
 *   DELETE /api/providers/:providerId/team/:memberId → eliminar miembro
 *   POST   /api/providers/:providerId/team/:memberId/verify → admin verifica miembro
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { requireRole } from "../security/roles.js";
import { PrismaClient } from "@prisma/client";

const router = Router();

function getAuth(req: any) {
  return (req.auth ?? req.user ?? {}) as { sub?: string; role?: string };
}

// ── GET /api/providers/:providerId/team ────────────────────────────────────────
router.get("/providers/:providerId/team", async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const members = await prisma.teamMember.findMany({
      where: { providerId: req.params.providerId, active: true },
      orderBy: { createdAt: "asc" },
    });
    return res.json({ ok: true, members });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ── POST /api/providers/:providerId/team ───────────────────────────────────────
router.post("/providers/:providerId/team", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId, role } = getAuth(req);
  const { providerId } = req.params;
  const { name, roleInTeam, bio, phone, dni, matricula } = req.body || {};

  if (!name || !roleInTeam)
    return res.status(400).json({ ok: false, error: "name y roleInTeam requeridos" });

  // Verificar que el usuario es el dueño del provider o admin
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) return res.status(404).json({ ok: false, error: "Prestador no encontrado" });
  if (provider.userId !== userId && role !== "ADMIN")
    return res.status(403).json({ ok: false, error: "Sin permisos" });

  try {
    const member = await prisma.teamMember.create({
      data: {
        providerId,
        name,
        roleInTeam,
        bio: bio || null,
        phone: phone || null,
        dni: dni || null,
        matricula: matricula || null,
        verified: false,
        active: true,
      },
    });
    return res.status(201).json({ ok: true, member });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ── PUT /api/providers/:providerId/team/:memberId ──────────────────────────────
router.put("/providers/:providerId/team/:memberId", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId, role } = getAuth(req);
  const { providerId, memberId } = req.params;

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) return res.status(404).json({ ok: false, error: "Prestador no encontrado" });
  if (provider.userId !== userId && role !== "ADMIN")
    return res.status(403).json({ ok: false, error: "Sin permisos" });

  const { name, roleInTeam, bio, phone, dni, matricula } = req.body || {};
  try {
    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: { name, roleInTeam, bio, phone, dni, matricula },
    });
    return res.json({ ok: true, member });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ── DELETE /api/providers/:providerId/team/:memberId ───────────────────────────
router.delete("/providers/:providerId/team/:memberId", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId, role } = getAuth(req);
  const { providerId, memberId } = req.params;

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) return res.status(404).json({ ok: false, error: "Prestador no encontrado" });
  if (provider.userId !== userId && role !== "ADMIN")
    return res.status(403).json({ ok: false, error: "Sin permisos" });

  try {
    // Soft delete
    await prisma.teamMember.update({ where: { id: memberId }, data: { active: false } });
    return res.json({ ok: true, message: "Miembro desactivado" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ── POST /api/providers/:providerId/team/:memberId/verify — admin ──────────────
router.post("/providers/:providerId/team/:memberId/verify", authRequired, requireRole("ADMIN"), async (req, res) => {
  const prisma = new PrismaClient();
  const { verified, notes } = req.body || {};
  const { sub: adminId } = getAuth(req);
  try {
    const member = await prisma.teamMember.update({
      where: { id: req.params.memberId },
      data: { verified: !!verified, verifiedBy: adminId, verifiedAt: new Date() },
    });
    // Log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: "ADMIN",
        action: verified ? "TEAM_MEMBER_VERIFIED" : "TEAM_MEMBER_REJECTED",
        entity: "TeamMember",
        entityId: req.params.memberId,
        payload: { notes },
      },
    }).catch(() => {});
    return res.json({ ok: true, member });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
