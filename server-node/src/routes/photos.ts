/**
 * routes/photos.ts — Upload y gestión de fotos de trabajos con watermark
 * Ruta destino: server-node/src/routes/photos.ts
 *
 * Agregar en index.ts:
 *   import photosRouter from "./routes/photos.js";
 *   app.use("/api", photosRouter);
 *
 * Endpoints:
 *   POST /api/requests/:requestId/photos   → subir foto
 *   GET  /api/requests/:requestId/photos   → listar fotos del trabajo
 *   POST /api/photos/:id/approve           → cliente aprueba el trabajo (libera escrow)
 *   GET  /api/providers/:providerId/portfolio → fotos certificadas del prestador
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { PrismaClient } from "@prisma/client";
import { processPendingWatermarks } from "../services/watermark.js";
import * as path from "path";
import * as fs from "fs";

const router = Router();
function auth(req: any) { return (req.auth ?? req.user ?? {}) as { sub?: string; role?: string }; }

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "work-photos");

// POST — subir foto de trabajo
router.post("/requests/:requestId/photos", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId } = auth(req);
  const { phase, caption, teamMemberId, base64Image, filename } = req.body || {};

  if (!base64Image || !filename) return res.status(400).json({ ok: false, error: "Imagen requerida (base64)" });
  if (!["before","during","after"].includes(phase)) return res.status(400).json({ ok: false, error: "phase debe ser before|during|after" });

  try {
    const request = await prisma.request.findUnique({ where: { id: req.params.requestId } });
    if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

    // Buscar el providerId del prestador
    const provider = await prisma.provider.findFirst({ where: { userId } });
    if (!provider) return res.status(403).json({ ok: false, error: "Solo prestadores pueden subir fotos de trabajo" });

    // Guardar imagen original en disco
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const safeFilename = `${request.id}_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._]/g,"_")}`;
    const localPath = path.join(UPLOAD_DIR, safeFilename);

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(localPath, Buffer.from(base64Data, "base64"));

    // Crear registro en DB
    const photo = await prisma.workPhoto.create({
      data: {
        requestId:       req.params.requestId,
        providerId:      provider.id,
        uploadedBy:      userId!,
        phase:           phase || "after",
        originalUrl:     localPath,
        watermarkStatus: "PENDING",
        caption,
        teamMemberId,
      },
    });

    // Disparar watermark en background (no bloquear la respuesta)
    processPendingWatermarks().catch(e => console.error("[photos] watermark error:", e));

    return res.status(201).json({ ok: true, photo, message: "Foto subida. El watermark OficiosYa se aplicará en segundos." });
  } catch (e: any) { return res.status(500).json({ ok: false, error: e.message }); }
});

// GET — fotos de un trabajo
router.get("/requests/:requestId/photos", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const photos = await prisma.workPhoto.findMany({
      where: { requestId: req.params.requestId },
      orderBy: { createdAt: "asc" },
    });
    return res.json({ ok: true, photos });
  } catch (e: any) { return res.status(500).json({ ok: false, error: e.message }); }
});

// POST — cliente aprueba trabajo (foto queda certificada en portfolio)
router.post("/photos/:photoId/approve", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId } = auth(req);
  try {
    const photo = await prisma.workPhoto.findUnique({ where: { id: req.params.photoId } });
    if (!photo) return res.status(404).json({ ok: false, error: "Foto no encontrada" });

    const request = await prisma.request.findUnique({ where: { id: photo.requestId } });
    if (!request || request.clientId !== userId)
      return res.status(403).json({ ok: false, error: "Solo el cliente puede aprobar el trabajo" });

    const approved = await prisma.workPhoto.update({
      where: { id: req.params.photoId },
      data:  { clientApproved: true, approvedAt: new Date() },
    });

    return res.json({ ok: true, photo: approved, message: "Trabajo aprobado. La foto queda certificada en el perfil del prestador." });
  } catch (e: any) { return res.status(500).json({ ok: false, error: e.message }); }
});

// GET — portfolio público del prestador (solo fotos aprobadas con watermark)
router.get("/providers/:providerId/portfolio", async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const photos = await prisma.workPhoto.findMany({
      where: {
        providerId:      req.params.providerId,
        clientApproved:  true,
        watermarkStatus: "APPLIED",
        phase:           "after",
      },
      select: {
        id:true, watermarkedUrl:true, caption:true, approvedAt:true,
        requestId:true, createdAt:true,
      },
      orderBy: { approvedAt: "desc" },
      take: 30,
    });
    return res.json({ ok: true, photos, total: photos.length });
  } catch (e: any) { return res.status(500).json({ ok: false, error: e.message }); }
});

export default router;
