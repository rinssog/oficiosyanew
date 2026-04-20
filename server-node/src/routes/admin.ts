import { Router } from "express";
import { readJson, writeJson } from "../storage.js";
import { adminTokenRequired } from "../security/middleware.js";
import { getRepos } from "../repositories/factory.js";

const router = Router();
router.get("/admin/metrics", (_req, res) => {
  const providers = readJson<any[]>("providers", []);
  const requests = readJson<any[]>("requests", []);
  const quotes = readJson<any[]>("quotes", []);
  const profiles = readJson<any[]>("provider_profiles", []);
  const ratings = readJson<any[]>("provider_ratings", []);
  const cancellations = readJson<any[]>("cancellation_stats", []);

  const verifiedProviders = providers.filter((p) => p.verified).length;
  const urgentRequests = requests.filter((req) => req.schedule?.urgent).length;
  const acceptedQuotes = quotes.filter((q) => q.status === "ACCEPTED").length;
  const pendingDocs = profiles.flatMap((profile) =>
    (profile.documents || []).filter((doc: any) => doc.required && doc.status !== "APPROVED"),
  ).length;
  const averageRating = ratings.length
    ? Number((ratings.reduce((acc, rating) => acc + (rating.score || 0), 0) / ratings.length).toFixed(2))
    : null;
  const totalCancellations = cancellations.reduce((acc, item) => acc + (item.cancellations || 0), 0);

  const metrics = {
    providersTotal: providers.length,
    providersVerified: verifiedProviders,
    urgentActive: urgentRequests,
    quotesAccepted: acceptedQuotes,
    documentsPending: pendingDocs,
    averageRating,
    cancellations: totalCancellations,
    updatedAt: new Date().toISOString(),
  };

  writeJson("admin_metrics_snapshot", metrics);

  return res.json({ ok: true, metrics });
});

router.get("/admin/documents/pending", async (_req, res) => {
  const repos = getRepos();
  if (repos.documents) {
    const pending = await repos.documents.listPending();
    return res.json({ ok: true, pending });
  }
  const profiles = readJson<any[]>("provider_profiles", []);
  const pending = profiles.flatMap((profile) =>
    (profile.documents || [])
      .filter((doc: any) => doc.status === "PENDING" || doc.status === "SUBMITTED")
      .map((doc: any) => ({ providerId: profile.providerId, type: doc.type, label: doc.label, status: doc.status, required: doc.required, uploadedAt: doc.uploadedAt }))
  );
  return res.json({ ok: true, pending });
});

router.post("/admin/documents/:documentId/status", adminTokenRequired, async (req, res) => {
  const { documentId } = req.params;
  const status = String(req.body?.status || "").toUpperCase();
  if (!status || !["APPROVED", "REJECTED", "SUBMITTED", "PENDING"].includes(status)) {
    return res.status(400).json({ ok: false, error: "Estado invalido" });
  }
  const repos = getRepos();
  try {
    let updated: any = null;
    if (repos.documents) {
      updated = await repos.documents.setStatus(documentId, status, req.body?.notes);
    } else {
      updated = await (repos as any).documents.setStatus(documentId, status);
    }
    // audit
    await repos.audit.write({
      action: 'document.status.change',
      entity: 'document',
      entityId: documentId,
      payload: { status, notes: req.body?.notes || null },
    });
    return res.json({ ok: true, document: updated });
  } catch (e: any) {
    return res.status(404).json({ ok: false, error: e?.message || "Documento no encontrado" });
  }
});

router.get("/admin/plans", async (_req, res) => {
  const repos = getRepos();
  if (repos.plans) {
    const plans = await repos.plans.list();
    return res.json({ ok: true, plans });
  }
  const plans = readJson("subscription_plans", []);
  return res.json({ ok: true, plans });
});

router.put("/admin/plans/:planId", adminTokenRequired, async (req, res) => {
  const patch = {
    priceMonthly: Number(req.body?.priceMonthly) || 0,
    commissionPct: Number(req.body?.commissionPct) || 0,
    leadFee: Number(req.body?.leadFee) || 0,
  };
  const repos = getRepos();
  if (repos.plans) {
    const plan = await repos.plans.update(req.params.planId, patch);
    return res.json({ ok: true, plan });
  }
  const plans = readJson<any[]>("subscription_plans", []);
  const idx = plans.findIndex((plan) => plan.id === req.params.planId);
  if (idx < 0) return res.status(404).json({ ok: false, error: "Plan no encontrado" });
  plans[idx] = { ...plans[idx], ...patch, updatedAt: new Date().toISOString() };
  writeJson("subscription_plans", plans);
  return res.json({ ok: true, plan: plans[idx] });
});

router.get("/admin/cms/sections", (_req, res) => {
  const sections = readJson("cms_sections", []);
  return res.json({ ok: true, sections });
});

router.put("/admin/cms/sections/:sectionId", adminTokenRequired, (req, res) => {

  const sections = readJson<any[]>("cms_sections", []);
  const idx = sections.findIndex((section) => section.id === req.params.sectionId);
  if (idx < 0) return res.status(404).json({ ok: false, error: "Seccion no encontrada" });
  sections[idx] = { ...sections[idx], ...req.body, lastUpdated: new Date().toISOString() };
  writeJson("cms_sections", sections);
  return res.json({ ok: true, section: sections[idx] });
});

router.get("/admin/metrics/export", (_req, res) => {
  const metrics = readJson<Record<string, unknown>>("admin_metrics_snapshot", {});
  const now = new Date().toISOString();
  const rows = [["metric", "value"], ["generated_at", now], ...Object.entries(metrics)];
  const csv = rows
    .map((row) => row.map((cell) => "").join(","))
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);
});

router.get("/admin/quotes/flagged", (_req, res) => {
  const quotes = readJson<any[]>("quotes", []);
  const flagged = quotes.filter((quote) => quote.flagged);
  res.json({ ok: true, quotes: flagged });
});

router.post("/admin/quotes/:quoteId/resolve", adminTokenRequired, (req, res) => {

  const quotes = readJson<any[]>("quotes", []);
  const quote = quotes.find((item) => item.id === req.params.quoteId);
  if (!quote) return res.status(404).json({ ok: false, error: "Presupuesto no encontrado" });

  quote.flagged = false;
  quote.flagResolvedAt = new Date().toISOString();
  writeJson("quotes", quotes);
  res.json({ ok: true, quote });
});

router.get("/admin/escrow", (_req, res) => {
  const records = readJson<any[]>("escrow_records", []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  res.json({ ok: true, records });
});

router.get("/admin/push/queue", (_req, res) => {
  const queue = readJson<any[]>("provider_push_queue", []).sort(
    (a, b) => new Date(b.enqueuedAt).getTime() - new Date(a.enqueuedAt).getTime(),
  );
  res.json({ ok: true, queue });
});

router.get("/admin/cancellations", (_req, res) => {
  const stats = readJson<any[]>("cancellation_stats", []).sort(
    (a, b) => (b.cancellations || 0) - (a.cancellations || 0),
  );
  res.json({ ok: true, stats });
});

export default router;
