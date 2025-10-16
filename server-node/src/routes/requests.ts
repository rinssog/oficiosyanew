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

router.post("/quotes/:id/accept", (req, res) => {
  const quotes = ensureJsonArray<any>("quotes");
  const quote = quotes.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: "No existe" });

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


export default router;
