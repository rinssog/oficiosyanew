import { Router } from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import type { Express } from "express";

type MulterFile = Express.Multer.File;

const uploadDir = fileURLToPath(new URL("../../uploads", import.meta.url));

const upload = multer({ dest: uploadDir });
const router = Router();

router.post("/files/upload", upload.single("file"), (req, res) => {
  const file = req.file as MulterFile | undefined;
  if (!file) return res.status(400).json({ ok: false, error: "Archivo requerido" });
  return res.json({ ok: true, url: `/uploads/${file.filename}` });
});

export default router;


