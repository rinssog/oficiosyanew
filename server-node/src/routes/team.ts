/**
 * routes/team.ts — Gestión de equipo de trabajo del prestador
 * Ruta destino: server-node/src/routes/team.ts
 *
 * Agregar en index.ts:
 *   import teamRouter from "./routes/team.js";
 *   app.use("/api", teamRouter);
 *
 * Endpoints:
 *   GET    /api/providers/:providerId/team          → lista del equipo
 *   POST   /api/providers/:providerId/team          → agregar miembro
 *   PATCH  /api/providers/:providerId/team/:id      → editar miembro
 *   DELETE /api/providers/:providerId/team/:id      → desactivar miembro
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { PrismaClient } from "@prisma/client";

const router = Router();
function auth(req: any) { return (req.auth ?? req.user ?? {}) as { sub?: string; role?: string }; }

// GET — lista del equipo público (para el perfil)
router.get("/providers/:providerId/team", async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const members = await prisma.teamMember.findMany({
      where: { providerId: req.params.providerId, active: true },
      select: { id:true, name:true, role:true, verified:true, canBeAssigned:true },
      orderBy: { createdAt: "asc" },
    });
    return res.json({ ok: true, members });
  } catch (e: any) { return res.status(500).json({ ok: false, error: e.message }); }
});

// POST — agregar miembro (solo el prestador dueño)
router.post("/providers/:providerId/team", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId, role } = auth(req);
  const { name, memberRole, dni, phone } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ ok: false, error: "Nombre requerido" });
  try {
    const provider = await prisma.provider.findUnique({ where: { id: req.params.providerId } });
    if (!provider) return res.status(404).json({ ok: false, error: "Prestador no encontrado" });
    if (provider.userId !== userId && role !== "ADMIN")
      return res.status(403).json({ ok: false, error: "Solo el prestador puede gestionar su equipo" });
    const limit = await prisma.teamMember.count({ where: { providerId: req.params.providerId, active: true } });
    if (limit >= 20) return res.status(400).json({ ok: false, error: "Máximo 20 miembros por equipo" });
    const member = await prisma.teamMember.create({
      data: { providerId: req.params.providerId, name: name.trim(), role: memberRole || "ayudante", dni, phone },
    });
    return res.status(201).json({ ok: true, member });
  } catch (e: any) { return res.status(500).json({ ok: false, error: e.message }); }
});

// PATCH — editar miembro
router.patch("/providers/:providerId/team/:memberId", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId, role } = auth(req);
  try {
    const provider = await prisma.provider.findUnique({ where: { id: req.params.providerId } });
    if (!provider || (provider.userId !== userId && role !== "ADMIN"))
      return res.status(403).json({ ok: false, error: "No autorizado" });
    const { name, memberRole, dni, phone, canBeAssigned } = req.body || {};
    const updated = await prisma.teamMember.update({
      where: { id: req.params.memberId },
      data: { ...(name && { name }), ...(memberRole && { role: memberRole }), ...(dni !== undefined && { dni }), ...(phone !== undefined && { phone }), ...(canBeAssigned !== undefined && { canBeAssigned }) },
    });
    return res.json({ ok: true, member: updated });
  } catch (e: any) { return res.status(500).json({ ok: false, error: e.message }); }
});

// DELETE — desactivar (soft delete)
router.delete("/providers/:providerId/team/:memberId", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId, role } = auth(req);
  try {
    const provider = await prisma.provider.findUnique({ where: { id: req.params.providerId } });
    if (!provider || (provider.userId !== userId && role !== "ADMIN"))
      return res.status(403).json({ ok: false, error: "No autorizado" });
    await prisma.teamMember.update({ where: { id: req.params.memberId }, data: { active: false } });
    return res.json({ ok: true, message: "Miembro desactivado" });
  } catch (e: any) { return res.status(500).json({ ok: false, error: e.message }); }
});

export default router;
