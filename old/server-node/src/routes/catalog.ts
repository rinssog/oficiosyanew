import { Router } from "express";
import { readJson } from "../storage.js";
import { CABA_BARRIOS, SERVICE_CATEGORIES, SERVICE_MODALITIES, SERVICE_SUBFILTERS, SERVICE_SYNONYMS } from "../utils/constants.js";

const router = Router();

router.get("/catalog", (_req, res) => {
  const catalog = readJson("catalog", []);
  res.json({ ok: true, catalog });
});

router.get("/catalog/filters", (_req, res) => {
  res.json({
    ok: true,
    categories: SERVICE_CATEGORIES,
    modalities: SERVICE_MODALITIES,
    subfilters: SERVICE_SUBFILTERS,
    barrios: CABA_BARRIOS,
    synonyms: SERVICE_SYNONYMS,
  });
});

router.get("/reference/barrios", (_req, res) => {
  res.json({ ok: true, barrios: CABA_BARRIOS });
});

export default router;
