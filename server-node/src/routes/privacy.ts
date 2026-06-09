import { Router } from "express";

import { readJson, writeJson, pushItem, generateId } from "../storage.js";
import { authRequired } from "../security/middleware.js";

const router = Router();

// Users can read their own consents; ADMIN can read any
router.get("/privacy/consents/:userId", authRequired, (req, res) => {
  const auth = (req as any).auth as { sub: string; role: string } | undefined;
  if (auth?.sub !== req.params.userId && auth?.role !== "ADMIN") {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }
  const consents = readJson<any[]>("privacy_consents", []).filter((item) => item.userId === req.params.userId);
  res.json({ ok: true, consents });
});

// Users can manage their own consents; ADMIN can manage any
router.post("/privacy/consents", authRequired, (req, res) => {
  const auth = (req as any).auth as { sub: string; role: string } | undefined;
  const { userId, consentType, granted } = req.body || {};
  if (!userId || !consentType) {
    return res.status(400).json({ ok: false, error: "userId y consentType son requeridos" });
  }
  if (auth?.sub !== userId && auth?.role !== "ADMIN") {
    return res.status(403).json({ ok: false, error: "Solo podés gestionar tus propios consentimientos" });
  }

  const consents = readJson<any[]>("privacy_consents", []);
  const now = new Date().toISOString();
  const record = consents.find((item) => item.userId === userId && item.consentType === consentType && !item.revokedAt);

  if (granted === false) {
    if (record) {
      record.revokedAt = now;
      writeJson("privacy_consents", consents);
      return res.json({ ok: true, consent: record });
    }
    return res.status(404).json({ ok: false, error: "No hay consentimiento activo para revocar" });
  }

  const consent = {
    id: generateId("consent_"),
    userId,
    consentType,
    grantedAt: now,
    revokedAt: null,
  };
  consents.push(consent);
  writeJson("privacy_consents", consents);
  res.json({ ok: true, consent });
});

export default router;
