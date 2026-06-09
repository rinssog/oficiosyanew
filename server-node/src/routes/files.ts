import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import type { Express } from "express";
import { authRequired } from "../security/middleware.js";

type MulterFile = Express.Multer.File;

const uploadDir = fileURLToPath(new URL("../../uploads", import.meta.url));

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_MB = 10;

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido. Solo JPEG, PNG, WebP o PDF.") as any, false);
    }
  },
});
const router = Router();

router.post("/files/upload", authRequired, upload.single("file"), (req, res) => {
  const file = req.file as MulterFile | undefined;
  if (!file) return res.status(400).json({ ok: false, error: "Archivo requerido" });
  // Sanitize filename — use only the random multer name (no user-controlled extension)
  const safeFilename = path.basename(file.filename);
  return res.json({ ok: true, url: `/uploads/${safeFilename}` });
});

export default router;


