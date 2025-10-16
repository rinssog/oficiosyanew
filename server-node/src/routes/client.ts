import { Router } from "express";
import { readJson } from "../storage.js";

const router = Router();

router.get("/client/contracts", (_req, res) => {
  const templates = readJson("contract_templates", []);
  return res.json({ ok: true, templates });
});

router.get("/client/insurances", (_req, res) => {
  const products = readJson("insurance_products", []);
  return res.json({ ok: true, products });
});

export default router;
