import { Router } from "express";
import { readJson, writeJson, generateId, pushItem } from "../storage.js";
import { adminTokenRequired } from "../security/middleware.js";
import { getRepos } from "../repositories/factory.js";
import { createHash } from "crypto";

const router = Router();
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "changeme";

router.get("/terms/content", async (_req, res) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient();
    const terms = await client.termsContent.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json({ ok: true, terms });
  } catch {
    const terms = readJson("terms_content", null);
    res.json({ ok: true, terms: terms ? [terms] : [] });
  }
});

router.post("/admin/terms", adminTokenRequired, async (req, res) => {
  const { version, title, content, kind } = req.body || {};
  if (!version || !content) return res.status(400).json({ ok: false, error: "Version y contenido requeridos" });
  try {
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient();
    const entry = await client.termsContent.create({ data: { version, title: title || 'Términos y Condiciones', content, kind: (kind || 'GENERAL').toUpperCase() } });
    return res.json({ ok: true, terms: entry });
  } catch {
    const terms = { version, title: title || "Términos y Condiciones", content, updatedAt: new Date().toISOString() };
    writeJson("terms_content", terms);
    return res.json({ ok: true, terms });
  }
});

router.post("/terms/accept", async (req, res) => {
  const { userId, contractType, version, nameSigned, ip } = req.body || {};
  if (!userId || !contractType || !version || !nameSigned) {
    return res.status(400).json({ ok: false, error: "Campos requeridos" });
  }
  const timestamp = new Date().toISOString();
  const termsContent = readJson<any>("terms_content", null);
  const contentForVersion = termsContent && termsContent.version === version ? String(termsContent.content || "") : "";
  const contractHash = contentForVersion
    ? createHash("sha256").update(contentForVersion).digest("hex")
    : null;
  const signatureHash = createHash("sha256").update(`${userId}|${contractType}|${version}|${nameSigned}|${timestamp}`).digest("hex");

  const acceptance = {
    id: generateId("ta_"),
    userId,
    contractType: String(contractType).toUpperCase(),
    version,
    nameSigned,
    ipAddress: ip || req.ip,
    signatureHash,
    contractHash,
    createdAt: timestamp,
  };
  const repos = getRepos();
  if (repos.terms && typeof repos.terms.accept === 'function') {
    await repos.terms.accept({
      id: acceptance.id,
      userId: acceptance.userId,
      contractType: acceptance.contractType,
      version: acceptance.version,
      nameSigned: acceptance.nameSigned,
      ipAddress: acceptance.ipAddress,
      signatureHash: acceptance.signatureHash,
      createdAt: acceptance.createdAt,
    });
  } else {
    pushItem("terms", acceptance);
  }
  res.json({ ok: true, acceptance });
});

router.get("/users/:id/terms", async (req, res) => {
  const contractType = String(req.query.contractType || "GENERAL").toUpperCase();
  const repos = getRepos();
  let history: any[] = [];
  if (repos.terms && typeof repos.terms.listUser === 'function') {
    history = await repos.terms.listUser(req.params.id, contractType);
  } else {
    const items = readJson<any[]>("terms", []);
    history = items
      .filter((t) => t.userId === req.params.id && t.contractType === contractType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  res.json({ ok: true, latest: history[0] || null, history });
});

export default router;
