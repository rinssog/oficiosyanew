import { Router } from "express";

import { readJson, writeJson, pushItem, generateId } from "../storage.js";

const router = Router();

router.get("/privacy/consents/:userId", (req, res) => {
  const consents = readJson<any[]>("privacy_consents", []).filter((item) => item.userId === req.params.userId);
  res.json({ ok: true, consents });
});

router.post("/privacy/consents", (req, res) => {
  const { userId, consentType, granted } = req.body || {};
  if (!userId || !consentType) {
    return res.status(400).json({ ok: false, error: "userId y consentType son requeridos" });
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
