import { Router } from "express";

import { pushItem, readJson, writeJson, generateId } from "../storage.js";
import { computeProviderSlots } from "../services/availability.js";
import { DEFAULT_TIMEZONE } from "../utils/constants.js";
import { notifyProviderRequestCreated } from "../services/notifications.js";
import { queuePushNotification } from "../services/push.js";
import { createEscrowRecord } from "../services/escrow.js";
import { ensureJsonArray } from "../utils/persistence.js";
import { z } from "zod";
import { CancellationSchema, QuoteCreateSchema, RequestCreateSchema } from "../validation/schemas.js";
import { authRequired } from "../security/middleware.js";
import { requireRole, getAuth } from "../security/roles.js";
import { findProviderByUserId } from "../services/providersRepo.js";
import { getRepos } from "../repositories/factory.js";
import { PrismaClient } from "@prisma/client";

const router = Router();

router.post("/requests", authRequired, requireRole("CLIENT", "ADMIN"), async (req, res) => {
  const parsed = RequestCreateSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ ok: false, error: "Datos inválidos" });
  const { serviceId, providerId, clientId, schedule = {}, notes } = parsed.data as any;

  let normalizedSchedule: Record<string, unknown> = {};

  if (schedule.slotId) {
    const referenceDate = schedule.start ? new Date(schedule.start as string) : new Date();
    const base = Number.isNaN(referenceDate.getTime())
      ? new Date()
      : new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    const to = new Date(base);
    to.setDate(to.getDate() + 30);
    const slots = computeProviderSlots(providerId, base, to);
    const selected = slots.find((slot) => slot.id === schedule.slotId);
    if (!selected || selected.available <= 0) {
      return res.status(409).json({ ok: false, error: "El horario seleccionado ya no esta disponible" });
    }
    normalizedSchedule = {
      slotId: selected.id,
      ruleId: selected.ruleId,
      start: selected.start,
      end: selected.end,
      date: selected.date,
      label: selected.label,
      timeSlot: selected.label,
      urgent: Boolean(schedule.urgent || selected.urgent),
      durationMinutes: selected.durationMinutes,
      timezone: DEFAULT_TIMEZONE,
    };
  } else {
    normalizedSchedule = {
      date: schedule?.date || null,
      timeSlot: schedule?.timeSlot || null,
      start: schedule?.start || (schedule?.date && schedule?.startTime ? `${schedule.date}T${schedule.startTime}` : null),
      end: schedule?.end || (schedule?.date && schedule?.endTime ? `${schedule.date}T${schedule.endTime}` : null),
      label: schedule?.label || null,
      urgent: Boolean(schedule?.urgent),
      timezone: schedule?.timezone || DEFAULT_TIMEZONE,
    };
  }

  const request = {
    id: generateId("req_"),
    serviceId,
    providerId,
    clientId,
    schedule: normalizedSchedule,
    notes: notes || "",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const repos = getRepos();
  await repos.requests.create(request);
  // crear appointment si hay fecha concreta
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const hasWindow = request.schedule && (request.schedule as any).start && (request.schedule as any).end;
    if (hasWindow) {
      await prisma.appointment.create({ data: {
        requestId: request.id,
        providerId: providerId,
        clientId: clientId,
        start: new Date(String((request.schedule as any).start)),
        end: new Date(String((request.schedule as any).end)),
        status: 'SCHEDULED',
      }});
    }
  } catch {}
  notifyProviderRequestCreated(request);
  return res.json({ ok: true, request });
});

/* ── GET /requests ─── list requests for current user (CLIENT sees own; PROVIDER sees assigned; ADMIN sees all) ── */
router.get("/requests", authRequired, (req, res) => {
  const auth = getAuth(req);
  const userId: string = auth?.sub ?? "";
  const role: string   = auth?.role ?? "";

  const statusFilter = [req.query.status].flat().filter(Boolean) as string[];
  let all = readJson<any[]>("requests", []);

  if (role === "ADMIN") {
    // admins see all
  } else if (role === "PROVIDER") {
    const provider = findProviderByUserId(userId);
    const providerId = provider?.id;
    all = all.filter((r: any) => r.providerId === providerId || r.acceptedProviderId === providerId);
  } else {
    // CLIENT sees own requests
    all = all.filter((r: any) => r.clientId === userId);
  }

  if (statusFilter.length > 0) {
    all = all.filter((r: any) => statusFilter.includes(r.status));
  }

  all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({ ok: true, requests: all, total: all.length });
});

/* ── GET /requests/:id ─── single request detail ── */
router.get("/requests/:id", authRequired, (req, res) => {
  const { id } = req.params;
  const auth = getAuth(req);
  const userId: string = auth?.sub ?? "";
  const role: string   = auth?.role ?? "";

  const all = readJson<any[]>("requests", []);
  const request = all.find((r: any) => r.id === id);
  if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

  // Ownership check
  if (role !== "ADMIN") {
    const provider = role === "PROVIDER" ? findProviderByUserId(userId) : null;
    const isOwner = request.clientId === userId ||
      (provider && (request.providerId === provider.id || request.acceptedProviderId === provider.id));
    if (!isOwner) return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  return res.json({ ok: true, request });
});

/* ── POST /requests/:id/confirm ─── client confirms work done, triggers payment release ── */
router.post("/requests/:id/confirm", authRequired, requireRole("CLIENT", "ADMIN"), (req, res) => {
  const { id } = req.params;
  const auth = getAuth(req);
  const userId: string = auth?.sub ?? "";
  const role: string   = auth?.role ?? "";

  const all = readJson<any[]>("requests", []);
  const idx = all.findIndex((r: any) => r.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

  const request = all[idx];
  if (role !== "ADMIN" && request.clientId !== userId) {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }
  if (request.status === "DONE") {
    return res.json({ ok: true, request, message: "Ya confirmado" });
  }

  all[idx].status = "DONE";
  all[idx].confirmedAt = new Date().toISOString();
  all[idx].updatedAt   = new Date().toISOString();
  writeJson("requests", all);

  return res.json({ ok: true, request: all[idx] });
});

/* ── POST /requests/:id/reject ─── client rejects work, sends back to PENDING ── */
router.post("/requests/:id/reject", authRequired, requireRole("CLIENT", "ADMIN"), (req, res) => {
  const { id } = req.params;
  const auth = getAuth(req);
  const userId: string = auth?.sub ?? "";
  const role: string   = auth?.role ?? "";
  const { reason } = req.body || {};

  if (!reason?.trim()) {
    return res.status(400).json({ ok: false, error: "Razón requerida para rechazar" });
  }

  const all = readJson<any[]>("requests", []);
  const idx = all.findIndex((r: any) => r.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

  const request = all[idx];
  if (role !== "ADMIN" && request.clientId !== userId) {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  all[idx].status = "REVISION";
  all[idx].rejectionReason  = reason.trim();
  all[idx].rejectedAt       = new Date().toISOString();
  all[idx].updatedAt        = new Date().toISOString();
  writeJson("requests", all);

  return res.json({ ok: true, request: all[idx] });
});

/* ── GET /providers/:providerId/requests ─── shortcut for provider's own requests ── */
router.get("/providers/:providerId/requests", authRequired, (req, res) => {
  const { providerId } = req.params;
  const auth = getAuth(req);
  const role: string = auth?.role ?? "";

  // Only ADMIN or the provider's own user can see this
  if (role !== "ADMIN") {
    const provider = findProviderByUserId(auth?.sub ?? "");
    if (!provider || provider.id !== providerId) {
      return res.status(403).json({ ok: false, error: "Sin acceso" });
    }
  }

  const all = readJson<any[]>("requests", [])
    .filter((r: any) => r.providerId === providerId || r.acceptedProviderId === providerId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({ ok: true, requests: all, total: all.length });
});

router.post("/quotes", authRequired, requireRole("PROVIDER", "ADMIN"), async (req, res) => {
  const parsed = QuoteCreateSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ ok: false, error: "Datos inválidos" });
  const { requestId, providerId, items } = parsed.data;
  // Ownership: si es PROVIDER, su providerId debe coincidir
  const auth = getAuth(req);
  if (auth?.role === "PROVIDER") {
    const provider = findProviderByUserId(auth.sub);
    if (!provider || provider.id !== providerId) {
      return res.status(403).json({ ok: false, error: "No puede presupuestar por otro prestador" });
    }
  }

  const sum = (kind: "LABOR" | "MATERIAL" | "PART" | "OTHER") =>
    items
      .filter((i: any) => i.kind === kind)
      .reduce((acc: number, cur: any) => acc + (Number(cur.total) || 0), 0);

  const laborTotal = sum("LABOR");
  const materialsTotal = sum("MATERIAL") + sum("PART");
  const quote: any = {
    id: generateId("q_"),
    requestId,
    providerId,
    items,
    laborTotal,
    materialsTotal,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const providerServices = readJson<any[]>("provider_services", []);
  const requestsList = readJson<any[]>("requests", []);
  const linkedRequest = requestsList.find((reqItem) => reqItem.id === requestId);
  const baseService = linkedRequest
    ? providerServices.find((srv) => srv.id === linkedRequest.serviceId)
    : undefined;
  if (baseService && baseService.price) {
    const baseline = Number(baseService.price);
    if (baseline && laborTotal > baseline * 5) {
      quote.flagged = true;
      quote.flagReason = "Importe excede referencia del servicio (>5x)";
    }
  }

  // Calcular fees según plan de suscripción del prestador (fallback Base)
  try {
    const prisma = new PrismaClient();
    const provider = await prisma.provider.findUnique({ where: { id: providerId }, include: { user: true } });
    let commissionPct = 0.15;
    let leadFee = 700;
    if (provider?.user?.id) {
      const sub = await prisma.userSubscription.findFirst({ where: { userId: provider.user.id, status: 'ACTIVE' }, include: { plan: true } });
      if (sub?.plan) {
        commissionPct = sub.plan.commissionPct ?? commissionPct;
        leadFee = sub.plan.leadFee ?? leadFee;
      }
    }
    const base = laborTotal + materialsTotal;
    (quote as any).commissionPct = commissionPct;
    (quote as any).leadFee = leadFee;
    (quote as any).platformFee = Math.round(base * commissionPct) + Number(leadFee || 0);
  } catch {}

  const repos = getRepos();
  await repos.quotes.create(quote);
  return res.json({ ok: true, quote });
});

router.post("/quotes/:id/accept", authRequired, requireRole("CLIENT", "ADMIN"), (req, res) => {
  const quotes = ensureJsonArray<any>("quotes");
  const quote = quotes.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: "No existe" });

  quote.status = "ACCEPTED";
  quote.updatedAt = new Date().toISOString();
  writeJson("quotes", quotes);
  return res.json({ ok: true, quote });
});

/* ── POST /quotes/accept ─── alternate: body { quoteId } instead of path param ── */
router.post("/quotes/accept", authRequired, requireRole("CLIENT", "ADMIN"), (req, res) => {
  const { quoteId } = req.body || {};
  if (!quoteId) return res.status(400).json({ ok: false, error: "quoteId requerido" });
  const quotes = ensureJsonArray<any>("quotes");
  const quote = quotes.find((q: any) => q.id === quoteId);
  if (!quote) return res.status(404).json({ ok: false, error: "Presupuesto no encontrado" });
  quote.status = "ACCEPTED";
  quote.updatedAt = new Date().toISOString();
  writeJson("quotes", quotes);
  return res.json({ ok: true, quote });
});

router.get("/quotes/by-request/:requestId", (req, res) => {
  const quotes = readJson<any[]>("quotes", []);
  const filtered = quotes.filter((q) => q.requestId === req.params.requestId);
  return res.json({ ok: true, quotes: filtered });
});

router.post("/requests/:id/cancel", authRequired, (req, res) => {
  const parsed = CancellationSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ ok: false, error: "Datos inválidos" });
  const requests = readJson<any[]>("requests", []);
  const idx = requests.findIndex((reqItem) => reqItem.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, error: "Solicitud inexistente" });

  const requestRecord = requests[idx];
  const { action, reason, proposedSlot } = parsed.data || {};
  const now = new Date().toISOString();
  const normalizedReason = String(reason || "").trim() || "Sin motivo especificado";
  const cancellation = {
    reason: normalizedReason,
    actor: req.body?.actor === 'CLIENT' ? 'CLIENT' : 'PROVIDER',
    createdAt: now,
  } as any;

  if (action === 'RESCHEDULE' && proposedSlot?.date && proposedSlot?.start && proposedSlot?.end) {
    cancellation.proposedSlot = {
      date: proposedSlot.date,
      start: proposedSlot.start,
      end: proposedSlot.end,
      label: proposedSlot.label || `${proposedSlot.date} ${proposedSlot.start}-${proposedSlot.end}`,
    };
    requestRecord.status = 'RESCHEDULE_PROPOSED';
    requestRecord.rescheduleProposal = cancellation.proposedSlot;
  } else {
    requestRecord.status = 'CANCELLED_PROVIDER';
    requestRecord.retentionReleased = true;
  }

  requestRecord.cancellation = cancellation;
  requestRecord.updatedAt = now;
  writeJson("requests", requests);
  res.json({ ok: true, request: requestRecord });
});


/* ── POST /requests/:id/quote ─── provider creates quick quote on a request ── */
router.post("/requests/:id/quote", authRequired, requireRole("PROVIDER", "ADMIN"), async (req, res) => {
  const { id } = req.params;
  const auth = getAuth(req);
  const { items, notes } = req.body || {};

  const all = readJson<any[]>("requests", []);
  const request = all.find((r: any) => r.id === id);
  if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

  const provider = findProviderByUserId(auth?.sub ?? "");
  const providerId = provider?.id ?? req.body?.providerId;
  if (!providerId) return res.status(400).json({ ok: false, error: "Prestador no encontrado" });

  const laborItems = Array.isArray(items) ? items.filter((i: any) => i.kind === "LABOR" || !i.kind) : [];
  const materialItems = Array.isArray(items) ? items.filter((i: any) => i.kind === "MATERIAL" || i.kind === "PART") : [];

  const sum = (arr: any[]) => arr.reduce((s: number, i: any) => s + (Number(i.total) || Number(i.price) || 0), 0);
  const laborTotal     = sum(laborItems.length ? laborItems : (Array.isArray(items) ? items : []));
  const materialsTotal = sum(materialItems);

  const quote: any = {
    id: generateId("q_"),
    requestId: id,
    providerId,
    items: Array.isArray(items) ? items : [{ label: notes || "Servicio", total: laborTotal, kind: "LABOR" }],
    laborTotal,
    materialsTotal,
    notes: notes || "",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const repos = getRepos();
  await repos.quotes.create(quote);

  // Update request status
  const idx = all.findIndex((r: any) => r.id === id);
  if (idx !== -1) {
    all[idx].status = "QUOTED";
    all[idx].providerId = all[idx].providerId || providerId;
    all[idx].updatedAt = new Date().toISOString();
    writeJson("requests", all);
  }

  return res.status(201).json({ ok: true, quote });
});

/* ── PUT /requests/:id/status ─── provider updates request status ── */
router.put("/requests/:id/status", authRequired, (req, res) => {
  const { id } = req.params;
  const auth = getAuth(req);
  const userId: string = auth?.sub ?? "";
  const role: string   = auth?.role ?? "";
  const { status } = req.body || {};

  const VALID = ["PENDING", "QUOTED", "CONFIRMED", "IN_PROGRESS", "DONE", "CANCELLED", "REVISION"];
  if (!status || !VALID.includes(status)) {
    return res.status(400).json({ ok: false, error: `Estado inválido. Válidos: ${VALID.join(", ")}` });
  }

  const all = readJson<any[]>("requests", []);
  const idx = all.findIndex((r: any) => r.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

  const request = all[idx];

  // Access check
  if (role !== "ADMIN") {
    const provider = role === "PROVIDER" ? findProviderByUserId(userId) : null;
    const isOwner = request.clientId === userId ||
      (provider && (request.providerId === provider.id || request.acceptedProviderId === provider.id));
    if (!isOwner) return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  all[idx].status    = status;
  all[idx].updatedAt = new Date().toISOString();
  if (status === "IN_PROGRESS") all[idx].startedAt = new Date().toISOString();
  if (status === "DONE")        all[idx].completedAt = new Date().toISOString();
  writeJson("requests", all);

  return res.json({ ok: true, request: all[idx] });
});

export default router;
