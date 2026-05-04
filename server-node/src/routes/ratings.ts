/**
 * server-node/src/routes/ratings.ts — Sistema de reseñas
 * POST /api/ratings            → crear reseña (solo clientes que completaron)
 * GET  /api/ratings/provider/:id → reseñas de un prestador
 * PUT  /api/ratings/:id/response → prestador responde una reseña
 * DELETE /api/ratings/:id       → admin elimina reseña (fraude)
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { requireRole } from "../security/roles.js";
import { PrismaClient } from "@prisma/client";

const router = Router();
function getAuth(req: any) { return (req.auth ?? req.user ?? {}) as { sub?: string; role?: string }; }

// ─── POST /api/ratings ────────────────────────────────────────────────────────
router.post("/ratings", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: clientId, role } = getAuth(req);
  const { requestId, providerId, quality, punctuality, communication, comment } = req.body || {};

  if (!requestId || !providerId || !quality) return res.status(400).json({ ok:false, error:"Campos requeridos: requestId, providerId, quality" });
  if (role !== "CLIENT") return res.status(403).json({ ok:false, error:"Solo clientes pueden calificar" });

  try {
    // Verificar que el trabajo existe, está DONE y el cliente es el correcto
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ ok:false, error:"Solicitud no encontrada" });
    if (request.status !== "DONE") return res.status(400).json({ ok:false, error:"Solo podés calificar trabajos completados" });
    if (request.clientId !== clientId) return res.status(403).json({ ok:false, error:"No sos el cliente de esta solicitud" });

    // Verificar que no calificó antes
    const existing = await prisma.rating.findFirst({ where: { requestId } });
    if (existing) return res.status(409).json({ ok:false, error:"Ya calificaste este trabajo" });

    const q = Number(quality)||5, p = Number(punctuality)||5, c = Number(communication)||5;
    const average = (q*0.7 + p*0.2 + c*0.1);

    const rating = await prisma.rating.create({
      data: { requestId, providerId, clientId, quality:q, punctuality:p, communication:c, average, comment:comment||null },
    });

    // Actualizar rating promedio del prestador
    const allRatings = await prisma.rating.findMany({ where: { providerId } });
    const avgRating = allRatings.reduce((a, r) => a + r.average, 0) / allRatings.length;
    await prisma.provider.update({
      where: { id: providerId },
      data: { rating: avgRating, reviewCount: allRatings.length,
        goldLevel: allRatings.length >= 50 && avgRating >= 4.8 },
    });

    return res.status(201).json({ ok:true, rating });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── GET /api/ratings/provider/:providerId ────────────────────────────────────
router.get("/ratings/provider/:providerId", async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const ratings = await prisma.rating.findMany({
      where: { providerId: req.params.providerId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { client: { select: { id:true, name:true } } },
    });
    const avg = ratings.length ? ratings.reduce((a,r)=>a+r.average,0)/ratings.length : 0;
    return res.json({ ok:true, ratings, average: avg.toFixed(1), total: ratings.length });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── PUT /api/ratings/:id/response — Prestador responde ──────────────────────
router.put("/ratings/:id/response", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId, role } = getAuth(req);
  const { response } = req.body || {};
  if (!response?.trim()) return res.status(400).json({ ok:false, error:"Respuesta requerida" });
  try {
    const rating = await prisma.rating.findUnique({ where: { id: req.params.id } });
    if (!rating) return res.status(404).json({ ok:false, error:"Reseña no encontrada" });
    const prov = await prisma.provider.findUnique({ where: { id: rating.providerId } });
    if (!prov || prov.userId !== userId) return res.status(403).json({ ok:false, error:"Sin permisos" });
    const updated = await prisma.rating.update({ where:{ id: req.params.id }, data:{ response } });
    return res.json({ ok:true, rating: updated });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

// ─── DELETE /api/ratings/:id — Admin elimina reseña ──────────────────────────
router.delete("/ratings/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  const prisma = new PrismaClient();
  try {
    await prisma.rating.delete({ where:{ id: req.params.id } });
    return res.json({ ok:true, message:"Reseña eliminada" });
  } catch(e: any) { return res.status(500).json({ ok:false, error: e.message }); }
});

export default router;
