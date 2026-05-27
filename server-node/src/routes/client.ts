import { Router } from "express";
import { readJson } from "../storage.js";
import { authRequired } from "../security/middleware.js";

const router = Router();

router.get("/client/contracts", (_req, res) => {
  const templates = readJson("contract_templates", []);
  return res.json({ ok: true, templates });
});

router.get("/client/insurances", (_req, res) => {
  const products = readJson("insurance_products", []);
  return res.json({ ok: true, products });
});

// ─── GET /api/client/summary — KPIs reales del cliente autenticado
router.get("/client/summary", authRequired, (req, res) => {
  const auth = (req as any).auth ?? (req as any).user ?? {};
  const clientId: string = auth.sub ?? auth.id ?? "";
  if (!clientId) return res.status(401).json({ ok: false, error: "No autenticado" });

  const requests = readJson<any[]>("requests", []).filter((r: any) => r.clientId === clientId);
  const quotes   = readJson<any[]>("quotes",   []).filter((q: any) => q.clientId === clientId || requests.some(r => r.id === q.requestId));

  const active    = requests.filter(r => ["PENDING","ACCEPTED","IN_PROGRESS","QUOTE_PENDING"].includes(r.status));
  const completed = requests.filter(r => r.status === "DONE");

  // Próximas citas ordenadas por fecha
  const upcoming = active
    .filter(r => r.schedule?.start)
    .sort((a, b) => new Date(a.schedule.start).getTime() - new Date(b.schedule.start).getTime())
    .slice(0, 3)
    .map(r => ({
      id:       r.id,
      status:   r.status,
      notes:    r.notes || "",
      date:     r.schedule?.label || r.schedule?.start || "",
      urgent:   r.schedule?.urgent || false,
      createdAt: r.createdAt,
    }));

  // Últimas 5 actividades
  const recent = [...requests]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5)
    .map(r => ({ id: r.id, status: r.status, notes: r.notes, createdAt: r.createdAt, updatedAt: r.updatedAt }));

  return res.json({
    ok: true,
    summary: {
      totalRequests:  requests.length,
      activeRequests: active.length,
      completedJobs:  completed.length,
      pendingQuotes:  quotes.filter(q => q.status === "PENDING").length,
      upcoming,
      recent,
    },
  });
});

// ─── GET /api/client/escrow — pagos en custodia del cliente autenticado
router.get("/client/escrow", authRequired, (req, res) => {
  const auth = (req as any).auth ?? {};
  const clientId: string = auth.sub ?? auth.id ?? "";
  if (!clientId) return res.status(401).json({ ok: false, error: "No autenticado" });

  const all = readJson<any[]>("escrow", []);
  const mine = all.filter((e: any) => e.clientId === clientId || e.payerId === clientId);
  return res.json({ ok: true, escrow: mine });
});

// ─── GET /api/payments/history — historial de pagos del cliente
router.get("/payments/history", authRequired, (req, res) => {
  const auth = (req as any).auth ?? {};
  const userId: string = auth.sub ?? auth.id ?? "";
  if (!userId) return res.status(401).json({ ok: false, error: "No autenticado" });

  const all = readJson<any[]>("payments", []);
  const mine = all.filter((p: any) => p.userId === userId || p.clientId === userId || p.payerId === userId);
  return res.json({ ok: true, payments: mine });
});

export default router;
