/**
 * workPhotos.ts — Sistema de fotos de trabajos con watermark OficiosYa
 * Ruta destino: server-node/src/routes/workPhotos.ts
 *
 * Flujo:
 *  1. Prestador sube foto del trabajo completado
 *  2. Backend aplica watermark con canvas (logo OficiosYa + "Trabajo Verificado")
 *  3. La foto procesada se guarda con metadatos (requestId, aprobado por cliente)
 *  4. Solo fotos de trabajos con status DONE y confirmados por cliente reciben
 *     el badge "Aprobado por cliente" en el perfil del prestador
 *
 * Registrar en index.ts:
 *   import photosRouter from "./routes/workPhotos.js";
 *   app.use("/api", photosRouter);
 */
import { Router } from "express";
import { authRequired } from "../security/middleware.js";
import { PrismaClient } from "@prisma/client";
import { createCanvas, loadImage, registerFont } from "canvas";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const router = Router();
const UPLOADS_DIR = path.resolve("./uploads/work-photos");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function getAuth(req: any) {
  return (req.auth ?? req.user ?? {}) as { sub?: string; role?: string };
}

// ─── WATERMARK ENGINE ──────────────────────────────────────────────────────────
/**
 * Aplica el watermark de OficiosYa sobre una imagen.
 *
 * El watermark consiste en:
 * - Logo "Ya" + "OficiosYa" en esquina inferior derecha
 * - Texto "Trabajo Verificado" si el trabajo fue aprobado por el cliente
 * - Timestamp de la aprobación
 * - Hash SHA-256 único para detectar alteraciones
 *
 * IMPORTANTE: El texto es blurred/semitransparente para no obstruir el trabajo,
 * pero suficientemente visible para certificar la autenticidad.
 */
async function applyWatermark(
  inputPath: string,
  outputPath: string,
  options: {
    verified: boolean;
    approvedAt?: Date;
    requestId: string;
    providerName: string;
  }
): Promise<{ hash: string; outputPath: string }> {
  const img = await loadImage(inputPath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  // Dibujar imagen original
  ctx.drawImage(img, 0, 0);

  const W = img.width;
  const H = img.height;
  const pad = W * 0.02;
  const fontSize = Math.max(18, Math.floor(W * 0.025));

  // ── FRANJA INFERIOR (degradado semitransparente) ───────────────────────────
  const barH = H * 0.12;
  const grad = ctx.createLinearGradient(0, H - barH, 0, H);
  grad.addColorStop(0, "rgba(13,59,31,0)");
  grad.addColorStop(0.4, "rgba(13,59,31,0.75)");
  grad.addColorStop(1, "rgba(13,59,31,0.90)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, H - barH, W, barH);

  // ── TEXTO "OficiosYa" ──────────────────────────────────────────────────────
  ctx.font = `bold ${fontSize * 1.1}px Georgia, serif`;
  ctx.fillStyle = "rgba(240, 216, 117, 0.95)"; // gold
  ctx.textBaseline = "bottom";
  ctx.textAlign = "right";
  ctx.fillText("OficiosYa", W - pad, H - pad);

  // ── ESCUDO "Ya" (dibujado como texto) ─────────────────────────────────────
  ctx.font = `bold ${fontSize * 0.9}px Georgia, serif`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.textAlign = "right";
  ctx.fillText("🛡️ Ya", W - pad - fontSize * 4.5, H - pad);

  // ── BADGE "Trabajo Verificado" ─────────────────────────────────────────────
  if (options.verified) {
    ctx.font = `bold ${fontSize * 0.85}px Arial, sans-serif`;
    ctx.fillStyle = "rgba(187, 247, 208, 0.95)"; // green-200
    ctx.textAlign = "left";
    ctx.fillText("✓ Trabajo aprobado por el cliente", pad, H - pad - fontSize * 1.4);

    if (options.approvedAt) {
      ctx.font = `${fontSize * 0.7}px Arial, sans-serif`;
      ctx.fillStyle = "rgba(187, 247, 208, 0.75)";
      const dateStr = options.approvedAt.toLocaleDateString("es-AR", { day:"2-digit", month:"2-digit", year:"numeric" });
      ctx.fillText(`Aprobado el ${dateStr} · ID: ${options.requestId.slice(0,8)}`, pad, H - pad);
    }
  } else {
    ctx.font = `${fontSize * 0.75}px Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textAlign = "left";
    ctx.fillText(`Trabajo realizado por ${options.providerName}`, pad, H - pad);
  }

  // ── PATRÓN DIAGONAL BLUR (anti-screenshot) ─────────────────────────────────
  // Texto diagonal tenue en todo el fondo para dificultar recorte sin marca
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.font = `${fontSize * 0.9}px Arial, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 6);
  for (let y = -H; y < H; y += fontSize * 3.5) {
    for (let x = -W; x < W; x += W * 0.4) {
      ctx.fillText("OficiosYa", x, y);
    }
  }
  ctx.restore();

  // ── GUARDAR + HASH ─────────────────────────────────────────────────────────
  const buffer = canvas.toBuffer("image/jpeg", { quality: 0.92 });
  fs.writeFileSync(outputPath, buffer);

  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  return { hash, outputPath };
}

// ─── MULTIPART UPLOAD SIN MULTER (simple para MVP) ───────────────────────────
// En producción usar multer o busboy con S3
function parseBase64Upload(body: any): { buffer: Buffer; ext: string } | null {
  const { imageBase64, mimeType } = body || {};
  if (!imageBase64 || !mimeType) return null;
  const ext = mimeType === "image/png" ? "png" : "jpg";
  const buffer = Buffer.from(imageBase64, "base64");
  return { buffer, ext };
}

// ─── POST /api/work-photos/upload ─────────────────────────────────────────────
// Body: { requestId, imageBase64, mimeType }
// El cliente ya confirmó el trabajo (status DONE) antes de que el prestador suba fotos
router.post("/work-photos/upload", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId } = getAuth(req);
  const { requestId, imageBase64, mimeType, caption } = req.body || {};

  if (!requestId || !imageBase64)
    return res.status(400).json({ ok: false, error: "requestId e imageBase64 requeridos" });

  try {
    // Verificar que el trabajo existe y fue completado
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });
    if (request.status !== "DONE")
      return res.status(400).json({ ok: false, error: "Solo se pueden subir fotos de trabajos completados" });

    // Verificar que el prestador es dueño del trabajo
    const provider = await prisma.provider.findUnique({ where: { id: request.providerId || "" } });
    if (!provider || provider.userId !== userId)
      return res.status(403).json({ ok: false, error: "Sin permisos" });

    // Parsear imagen
    const upload = parseBase64Upload(req.body);
    if (!upload) return res.status(400).json({ ok: false, error: "Imagen inválida" });

    const photoId = crypto.randomBytes(8).toString("hex");
    const inputPath  = path.join(UPLOADS_DIR, `${photoId}_raw.${upload.ext}`);
    const outputPath = path.join(UPLOADS_DIR, `${photoId}_wm.jpg`);
    fs.writeFileSync(inputPath, upload.buffer);

    // Verificar si el trabajo fue aprobado por el cliente (escrow liberado)
    const escrow = await prisma.escrowRecord.findFirst({
      where: { requestId, status: "RELEASED" },
    }).catch(() => null);

    const isVerified = !!escrow;
    const approvedAt = escrow?.releasedAt ? new Date(escrow.releasedAt) : undefined;

    // Aplicar watermark
    const { hash } = await applyWatermark(inputPath, outputPath, {
      verified: isVerified,
      approvedAt,
      requestId,
      providerName: provider.companyName || "Prestador OficiosYa",
    });

    // Limpiar archivo raw
    fs.unlinkSync(inputPath);

    // Guardar en DB
    const photo = await prisma.workPhoto.create({
      data: {
        providerId: provider.id,
        requestId,
        path: outputPath,
        caption: caption || null,
        verified: isVerified,
        approvedAt: approvedAt || null,
        hash,
        publicUrl: `/api/work-photos/${photoId}_wm.jpg`,
      },
    });

    return res.status(201).json({ ok: true, photo, verified: isVerified });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── GET /api/providers/:providerId/photos ─────────────────────────────────────
router.get("/providers/:providerId/photos", async (req, res) => {
  const prisma = new PrismaClient();
  const { verifiedOnly } = req.query;
  try {
    const photos = await prisma.workPhoto.findMany({
      where: {
        providerId: req.params.providerId,
        ...(verifiedOnly === "true" ? { verified: true } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return res.json({ ok: true, photos });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── GET /api/work-photos/:filename ───────────────────────────────────────────
router.get("/work-photos/:filename", (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ ok: false, error: "Foto no encontrada" });
  res.setHeader("Cache-Control", "public, max-age=31536000");
  res.sendFile(filePath);
});

// ─── DELETE /api/work-photos/:photoId ─────────────────────────────────────────
router.delete("/work-photos/:photoId", authRequired, async (req, res) => {
  const prisma = new PrismaClient();
  const { sub: userId } = getAuth(req);
  try {
    const photo = await prisma.workPhoto.findUnique({ where: { id: req.params.photoId } });
    if (!photo) return res.status(404).json({ ok: false, error: "Foto no encontrada" });

    const provider = await prisma.provider.findUnique({ where: { id: photo.providerId } });
    if (!provider || provider.userId !== userId)
      return res.status(403).json({ ok: false, error: "Sin permisos" });

    if (photo.verified)
      return res.status(400).json({ ok: false, error: "No podés eliminar fotos aprobadas por el cliente" });

    // Eliminar archivo
    if (fs.existsSync(photo.path)) fs.unlinkSync(photo.path);
    await prisma.workPhoto.delete({ where: { id: req.params.photoId } });

    return res.json({ ok: true, message: "Foto eliminada" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
