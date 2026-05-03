/**
 * services/watermark.ts — Sistema de watermark OficiosYa para fotos de trabajos
 * Ruta destino: server-node/src/services/watermark.ts
 *
 * Flujo:
 * 1. Prestador sube foto al finalizar el trabajo
 * 2. OficiosYa aplica watermark con escudo + logo + hash de verificación
 * 3. Cliente aprueba → foto queda certificada en el perfil del prestador
 * 4. Las fotos certificadas tienen badge "✓ Trabajo verificado por OficiosYa"
 *
 * Implementación MVP: usa sharp (npm install sharp)
 * El watermark se aplica en el servidor, no en el cliente.
 */
import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

// ─── Tipos ─────────────────────────────────────────────────────────────────
export interface WatermarkJob {
  workPhotoId: string;
  inputPath:   string;  // ruta local de la imagen original
  outputPath:  string;  // ruta donde se guarda la imagen con watermark
  requestId:   string;
  providerId:  string;
}

export interface WatermarkResult {
  success: boolean;
  watermarkedUrl?: string;
  hash?: string;
  error?: string;
}

// ─── Función principal ─────────────────────────────────────────────────────
export async function applyWatermark(job: WatermarkJob): Promise<WatermarkResult> {
  try {
    // 1. Intentar importar sharp (se instala con npm install sharp)
    const sharp = await import("sharp").then(m => m.default).catch(() => null);

    if (!sharp) {
      // Fallback: sin sharp, marcamos como pendiente para procesar después
      console.warn("[Watermark] sharp no instalado — usando modo fallback");
      return { success: false, error: "sharp_not_installed" };
    }

    // 2. Obtener dimensiones de la imagen
    const meta = await sharp(job.inputPath).metadata();
    const W = meta.width  || 1200;
    const H = meta.height || 900;

    // 3. Generar hash de verificación (SHA-256 del archivo + requestId)
    const fileBuffer = fs.readFileSync(job.inputPath);
    const hash = crypto.createHash("sha256")
      .update(fileBuffer)
      .update(job.requestId)
      .digest("hex")
      .slice(0, 12)
      .toUpperCase();

    // 4. Construir el SVG del watermark con el escudo OficiosYa
    //    — posición: esquina inferior derecha
    //    — fondo translúcido oscuro
    //    — escudo dorado + texto "OficiosYa" + hash de verificación
    const WM_W = Math.round(W * 0.35);  // 35% del ancho de la imagen
    const WM_H = 72;
    const MARGIN = 16;
    const LEFT = W - WM_W - MARGIN;
    const TOP  = H - WM_H - MARGIN;

    // SVG del watermark (fondo semi-transparente + escudo + texto)
    const wmSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WM_W}" height="${WM_H}">
  <rect x="0" y="0" width="${WM_W}" height="${WM_H}" rx="10" fill="rgba(0,0,0,0.62)"/>
  <g transform="translate(10, 10) scale(0.55)">
    <defs>
      <linearGradient id="wg" x1="40" y1="4" x2="40" y2="88" gradientUnits="userSpaceOnUse">
        <stop stop-color="#16A34A"/><stop offset="1" stop-color="#0D3B1F"/>
      </linearGradient>
      <linearGradient id="wgo" x1="0" y1="0" x2="80" y2="94" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FAF0B0"/><stop offset="50%" stop-color="#C9A227"/>
        <stop offset="100%" stop-color="#FAF0B0"/>
      </linearGradient>
    </defs>
    <path d="M40 1 L78 15 L78 48 C78 70 62 85 40 93 C18 85 2 70 2 48 L2 15 Z" fill="url(#wgo)"/>
    <path d="M40 5.5 L74.5 18 L74.5 48 C74.5 68 60 81 40 89 C20 81 5.5 68 5.5 48 L5.5 18 Z" fill="#0D3B1F" opacity="0.5"/>
    <path d="M40 8 L72 20.5 L72 48 C72 66.5 58 79 40 86.5 C22 79 8 66.5 8 48 L8 20.5 Z" fill="url(#wgo)"/>
    <path d="M40 12 L68 23.5 L68 48 C68 64.5 55.5 76.5 40 83.5 C24.5 76.5 12 64.5 12 48 L12 23.5 Z" fill="url(#wg)"/>
    <text x="40" y="55" text-anchor="middle" dominant-baseline="middle" fill="#ffffff"
      font-size="22" font-weight="900" font-family="Georgia,serif">Ya</text>
  </g>
  <text x="62" y="26" fill="#FFFFFF" font-size="15" font-weight="700" font-family="Arial,sans-serif">OficiosYa</text>
  <text x="62" y="42" fill="#BBF7D0" font-size="11" font-family="Arial,sans-serif">✓ Trabajo certificado</text>
  <text x="62" y="57" fill="#9CA3AF" font-size="9" font-family="monospace">#${hash}</text>
</svg>`.trim();

    const wmBuffer = Buffer.from(wmSvg);

    // 5. Aplicar watermark con blur muy suave en los bordes del overlay
    const outputBuffer = await sharp(job.inputPath)
      .composite([{
        input: wmBuffer,
        top:  TOP,
        left: LEFT,
        blend: "over",
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    // 6. Guardar la imagen con watermark
    fs.mkdirSync(path.dirname(job.outputPath), { recursive: true });
    fs.writeFileSync(job.outputPath, outputBuffer);

    return { success: true, watermarkedUrl: job.outputPath, hash };

  } catch (e: any) {
    console.error("[Watermark] Error:", e.message);
    return { success: false, error: e.message };
  }
}

// ─── Endpoint helper: procesar fotos pendientes ────────────────────────────
export async function processPendingWatermarks() {
  const prisma = new PrismaClient();
  const pending = await prisma.workPhoto.findMany({
    where: { watermarkStatus: "PENDING" },
    take: 10,
  });

  for (const photo of pending) {
    const outputPath = photo.originalUrl.replace(/\.(jpe?g|png|webp)$/i, "_oya.jpg");
    const result = await applyWatermark({
      workPhotoId: photo.id,
      inputPath:   photo.originalUrl,
      outputPath,
      requestId:   photo.requestId,
      providerId:  photo.providerId,
    });
    await prisma.workPhoto.update({
      where: { id: photo.id },
      data: {
        watermarkStatus: result.success ? "APPLIED" : "FAILED",
        watermarkedUrl:  result.success ? result.watermarkedUrl : null,
      },
    });
  }
  await prisma.$disconnect();
  return { processed: pending.length };
}
