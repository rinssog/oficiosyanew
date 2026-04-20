import { Router } from "express";
import multer from "multer";
import { fileURLToPath } from "url";

import { readJson, writeJson, pushItem, generateId } from "../storage.js";
import { CatalogItem, ProviderMaterial } from "../types.js";
import {
  ensureProviderProfile,
  saveProviderProfile,
  sanitizeAreas,
} from "../services/providerProfile.js";
import {
  listCollaborators,
  findCollaboratorById,
  createCollaborator,
  updateCollaborator,
  removeCollaborator,
  ensureCollaboratorProfile,
  saveCollaboratorProfile,
  registerCollaboratorTerms,
  listCollaboratorTerms,
  ensureCollaboratorMetrics,
} from "../services/collaborators.js";
import { normalizeAvailabilityRule } from "../services/availability.js";
import { ensureJsonArray } from "../utils/persistence.js";
import { DEFAULT_TIMEZONE } from "../utils/constants.js";
import { schedulingRepos } from "../repositories/scheduling.js";
import { computeProviderSlotsPrisma } from "../services/slotCompute.js";

const uploadDir = fileURLToPath(new URL("../../uploads", import.meta.url));
const upload = multer({ dest: uploadDir });

import { getRepos } from "../repositories/factory.js";

const router = Router();

router.get("/providers/by-user/:userId", (req, res) => {
  const providers = readJson<any[]>("providers", []);
  const provider = providers.find((p) => p.userId === req.params.userId) || null;
  res.json({ ok: true, provider });
});

router.post("/providers/:id/services", async (req, res) => {
  const { id } = req.params;
  const { catalogId, pricingType, price, notes, urgent } = req.body || {};
  if (!catalogId || !pricingType || typeof price !== "number") {
    return res.status(400).json({ ok: false, error: "Faltan campos" });
  }

  const catalog = readJson<CatalogItem[]>("catalog", []);
  const catalogItem = catalog.find((item) => item.id === catalogId);
  if (!catalogItem) {
    return res.status(404).json({ ok: false, error: "Servicio del catalogo inexistente" });
  }

  const now = Date.now();
  const service = {
    id: generateId("srv_"),
    providerId: id,
    catalogId,
    pricingType,
    price,
    notes: notes || "",
    urgent: typeof urgent === "boolean" ? urgent : catalogItem.permiteUrgencias,
    category: catalogItem.categoria,
    subCategory: catalogItem.subcategoria,
    modalities: catalogItem.modalidades,
    allowsUrgent: catalogItem.permiteUrgencias,
    tags: catalogItem.etiquetas,
    synonyms: catalogItem.sinonimos || [],
    estimatedDuration: catalogItem.tiempoEstimado || null,
    createdAt: now,
    updatedAt: now,
    priceHistory: [] as Array<{ oldPrice: number; newPrice: number; changedAt: string }>,
  };
  const repos = getRepos();
  if (repos.services) {
    await repos.services.create(service);
  } else {
    pushItem("provider_services", service);
  }
  res.json({ ok: true, service });
});

router.get("/providers/:id/services", async (req, res) => {
  const repos = getRepos();
  if (repos.services) {
    const services = await repos.services.listByProvider(req.params.id);
    return res.json({ ok: true, services });
  }
  const services = readJson<any[]>("provider_services", []).filter((s) => s.providerId === req.params.id);
  const catalog = readJson<any[]>("catalog", []);
  const enriched = services.map((s) => ({ ...s, catalog: catalog.find((c) => c.id === s.catalogId) || null }));
  return res.json({ ok: true, services: enriched });
});

router.put("/providers/:providerId/services/:serviceId", async (req, res) => {
  const { providerId, serviceId } = req.params;
  const patch = {
    price: typeof req.body?.price === 'number' ? req.body.price : undefined,
    pricingType: req.body?.pricingType,
    notes: req.body?.notes,
    urgent: req.body?.urgent,
  };
  const repos = getRepos();
  if (repos.services) {
    const service = await repos.services.update(providerId, serviceId, patch);
    return res.json({ ok: true, service });
  }
  const services = readJson<any[]>("provider_services", []);
  const idx = services.findIndex((s) => s.id === serviceId && s.providerId === providerId);
  if (idx < 0) return res.status(404).json({ ok: false, error: "Servicio no encontrado" });
  const service = { ...services[idx], ...patch, updatedAt: Date.now() };
  services[idx] = service;
  writeJson("provider_services", services);
  return res.json({ ok: true, service });
});

router.delete("/providers/:providerId/services/:serviceId", async (req, res) => {
  const { providerId, serviceId } = req.params;
  const repos = getRepos();
  if (repos.services) {
    await repos.services.remove(providerId, serviceId);
    return res.json({ ok: true, removed: serviceId });
  }
  const services = readJson<any[]>("provider_services", []);
  const filtered = services.filter((s) => !(s.id === serviceId && s.providerId === providerId));
  if (filtered.length === services.length) return res.status(404).json({ ok: false, error: "Servicio no encontrado" });
  writeJson("provider_services", filtered);
  return res.json({ ok: true, removed: serviceId });
});

router.get("/providers/:providerId/profile", (req, res) => {
  const profile = ensureProviderProfile(req.params.providerId);
  res.json({ ok: true, profile });
});

router.put("/providers/:providerId/areas", (req, res) => {
  const { areas } = req.body || {};
  if (!Array.isArray(areas)) return res.status(400).json({ ok: false, error: "Las areas deben ser un arreglo" });
  const profile = ensureProviderProfile(req.params.providerId);
  profile.areas = sanitizeAreas(areas as string[]);
  profile.updatedAt = new Date().toISOString();
  saveProviderProfile(profile);
  res.json({ ok: true, profile });
});

router.get("/providers/:providerId/documents", async (req, res) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient();
    const documents = await client.document.findMany({ where: { providerId: req.params.providerId }, orderBy: { createdAt: 'desc' } });
    return res.json({ ok: true, documents });
  } catch {
    const profile = ensureProviderProfile(req.params.providerId);
    return res.json({ ok: true, documents: profile.documents });
  }
});

router.post("/providers/:providerId/documents", upload.single("file"), async (req, res) => {
  const type = String((req.body?.type || req.query?.type || "")).trim();
  if (!type) return res.status(400).json({ ok: false, error: "Tipo de documento requerido" });
  const file = req.file;
  if (!file) return res.status(400).json({ ok: false, error: "Archivo requerido" });

  const providerIdParam = req.params.providerId;
  if (!providerIdParam) return res.status(400).json({ ok: false, error: "Proveedor invalido" });
  const url = `/uploads/${file.filename}`;
  try {
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient();
    const document = await client.document.upsert({
      where: { id: `${providerIdParam}_${type}` },
      update: { url, status: 'SUBMITTED' },
      create: { id: `${providerIdParam}_${type}`, providerId: providerIdParam, kind: type, url, status: 'SUBMITTED' },
    });
    return res.json({ ok: true, document });
  } catch {
    const profile = ensureProviderProfile(providerIdParam);
    const document = profile.documents.find((doc) => doc.type === type);
    if (!document) return res.status(400).json({ ok: false, error: "Tipo de documento invalido" });
    document.status = "SUBMITTED";
    document.url = url;
    document.uploadedAt = new Date().toISOString();
    document.notes = "";
    profile.updatedAt = new Date().toISOString();
    saveProviderProfile(profile);
    return res.json({ ok: true, document });
  }
});

router.get("/providers/:providerId/collaborators", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  if (!providerId) return res.status(400).json({ ok: false, error: "providerId requerido" });

  const collaborators = listCollaborators(providerId);
  res.json({ ok: true, collaborators });
});

router.post("/providers/:providerId/collaborators", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  if (!providerId) return res.status(400).json({ ok: false, error: "providerId requerido" });

  const { email, displayName, phone, roles, permissions, invitedBy } = req.body || {};
  if (!email || !displayName) {
    return res.status(400).json({ ok: false, error: "email y displayName son obligatorios" });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const trimmedName = String(displayName).trim();
  if (!trimmedName) {
    return res.status(400).json({ ok: false, error: "Nombre del colaborador requerido" });
  }

  const existing = listCollaborators(providerId).find(
    (item) => item.email === normalizedEmail && item.status !== "REMOVED",
  );
  if (existing) {
    return res.status(409).json({ ok: false, error: "Ya existe un colaborador con ese email" });
  }

  const collaboratorData: any = {
    providerId,
    email: normalizedEmail,
    displayName: trimmedName,
    invitedBy: String(invitedBy || providerId),
  };
  if (typeof phone === "string" && phone.trim()) collaboratorData.phone = phone.trim();
  if (Array.isArray(roles) && roles.length > 0) collaboratorData.roles = roles;
  if (Array.isArray(permissions) && permissions.length > 0) collaboratorData.permissions = permissions;

  const collaborator = createCollaborator(collaboratorData);
  ensureCollaboratorProfile(collaborator.id, providerId);
  ensureCollaboratorMetrics(collaborator.id, providerId);

  res.status(201).json({ ok: true, collaborator });
});

router.put("/providers/:providerId/collaborators/:collaboratorId", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  if (!providerId || !collaboratorId) {
    return res.status(400).json({ ok: false, error: "providerId y collaboratorId son requeridos" });
  }

  const current = findCollaboratorById(collaboratorId);
  if (!current || current.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }

  const phoneValue = req.body?.phone;
  const patch: any = {};
  if (typeof req.body?.displayName === "string") patch.displayName = req.body.displayName;
  if (phoneValue === null) patch.phone = null;
  else if (typeof phoneValue === "string") patch.phone = phoneValue;
  if (Array.isArray(req.body?.roles) && req.body.roles.length > 0) patch.roles = req.body.roles;
  if (Array.isArray(req.body?.permissions) && req.body.permissions.length > 0) patch.permissions = req.body.permissions;
  if (typeof req.body?.status === "string") patch.status = req.body.status;
  if (typeof req.body?.userId === "string") patch.userId = req.body.userId;
  if (typeof req.body?.invitationAcceptedAt === "string") patch.invitationAcceptedAt = req.body.invitationAcceptedAt;

  const updated = updateCollaborator(collaboratorId, patch);
  if (!updated) return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });

  res.json({ ok: true, collaborator: updated });
});

router.delete("/providers/:providerId/collaborators/:collaboratorId", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  if (!providerId || !collaboratorId) {
    return res.status(400).json({ ok: false, error: "providerId y collaboratorId son requeridos" });
  }

  const current = findCollaboratorById(collaboratorId);
  if (!current || current.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }

  removeCollaborator(collaboratorId);
  res.json({ ok: true, removed: collaboratorId });
});

router.get("/providers/:providerId/collaborators/:collaboratorId/profile", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  if (!providerId || !collaboratorId) {
    return res.status(400).json({ ok: false, error: "providerId y collaboratorId son requeridos" });
  }
  const collaborator = findCollaboratorById(collaboratorId);
  if (!collaborator || collaborator.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }
  const profile = ensureCollaboratorProfile(collaboratorId, providerId);
  res.json({ ok: true, profile });
});

router.put("/providers/:providerId/collaborators/:collaboratorId/profile", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  if (!providerId || !collaboratorId) {
    return res.status(400).json({ ok: false, error: "providerId y collaboratorId son requeridos" });
  }
  const collaborator = findCollaboratorById(collaboratorId);
  if (!collaborator || collaborator.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }
  const profile = ensureCollaboratorProfile(collaboratorId, providerId);
  if (typeof req.body?.overview === "string") {
    profile.overview = req.body.overview.trim();
  }
  if (Array.isArray(req.body?.documents)) {
    const now = new Date().toISOString();
    req.body.documents.forEach((doc: any) => {
      const docType = typeof doc?.type === "string" ? doc.type : null;
      if (!docType) return;
      const existing = profile.documents.find((item) => item.type === docType);
      if (!existing) return;
      if (typeof doc.status === "string") existing.status = doc.status;
      if (typeof doc.notes === "string") existing.notes = doc.notes;
    });
  }
  profile.updatedAt = new Date().toISOString();
  saveCollaboratorProfile(profile);
  res.json({ ok: true, profile });
});

router.get("/providers/:providerId/collaborators/:collaboratorId/documents", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  if (!providerId || !collaboratorId) {
    return res.status(400).json({ ok: false, error: "providerId y collaboratorId son requeridos" });
  }
  const collaborator = findCollaboratorById(collaboratorId);
  if (!collaborator || collaborator.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }
  const profile = ensureCollaboratorProfile(collaboratorId, providerId);
  res.json({ ok: true, documents: profile.documents });
});

router.post("/providers/:providerId/collaborators/:collaboratorId/documents", upload.single("file"), (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  const docType = String(req.body?.type || req.query?.type || "").trim();
  if (!providerId || !collaboratorId || !docType) {
    return res.status(400).json({ ok: false, error: "Datos de colaborador o tipo de documento invalidos" });
  }
  const collaborator = findCollaboratorById(collaboratorId);
  if (!collaborator || collaborator.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }
  const file = req.file;
  if (!file) return res.status(400).json({ ok: false, error: "Archivo requerido" });

  const profile = ensureCollaboratorProfile(collaboratorId, providerId);
  const document = profile.documents.find((doc) => doc.type === docType);
  if (!document) return res.status(400).json({ ok: false, error: "Tipo de documento invalido" });
  document.status = "SUBMITTED";
  document.url = `/uploads/${file.filename}`;
  document.uploadedAt = new Date().toISOString();
  document.notes = "";
  profile.updatedAt = document.uploadedAt;
  saveCollaboratorProfile(profile);

  res.json({ ok: true, document });
});

router.put("/providers/:providerId/collaborators/:collaboratorId/documents/:docType/status", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  const docType = String(req.params?.docType || "").trim();
  if (!providerId || !collaboratorId || !docType) {
    return res.status(400).json({ ok: false, error: "Datos de colaborador o tipo de documento invalidos" });
  }
  const collaborator = findCollaboratorById(collaboratorId);
  if (!collaborator || collaborator.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }
  const profile = ensureCollaboratorProfile(collaboratorId, providerId);
  const document = profile.documents.find((doc) => doc.type === docType);
  if (!document) return res.status(404).json({ ok: false, error: "Documento no encontrado" });
  if (typeof req.body?.status === "string") {
    document.status = req.body.status;
  }
  if (typeof req.body?.notes === "string") {
    document.notes = req.body.notes;
  }
  const now = new Date().toISOString();
  profile.updatedAt = now;
  saveCollaboratorProfile(profile);
  res.json({ ok: true, document });
});

router.get("/providers/:providerId/collaborators/:collaboratorId/metrics", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  if (!providerId || !collaboratorId) {
    return res.status(400).json({ ok: false, error: "providerId y collaboratorId son requeridos" });
  }
  const collaborator = findCollaboratorById(collaboratorId);
  if (!collaborator || collaborator.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }
  const metrics = ensureCollaboratorMetrics(collaboratorId, providerId);
  res.json({ ok: true, metrics });
});

router.get("/providers/:providerId/collaborators/:collaboratorId/terms", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  if (!providerId || !collaboratorId) {
    return res.status(400).json({ ok: false, error: "providerId y collaboratorId son requeridos" });
  }
  const collaborator = findCollaboratorById(collaboratorId);
  if (!collaborator || collaborator.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }
  const history = listCollaboratorTerms(collaboratorId);
  res.json({ ok: true, history });
});

router.post("/providers/:providerId/collaborators/:collaboratorId/terms", (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const collaboratorId = String(req.params?.collaboratorId || "").trim();
  if (!providerId || !collaboratorId) {
    return res.status(400).json({ ok: false, error: "providerId y collaboratorId son requeridos" });
  }
  const collaborator = findCollaboratorById(collaboratorId);
  if (!collaborator || collaborator.providerId !== providerId) {
    return res.status(404).json({ ok: false, error: "Colaborador no encontrado" });
  }
  const { version, contractHash, signatureHash } = req.body || {};
  if (!version || !signatureHash) {
    return res.status(400).json({ ok: false, error: "version y signatureHash son obligatorios" });
  }
  const log = registerCollaboratorTerms({
    collaboratorId,
    providerId,
    version: String(version),
    acceptedAt: new Date().toISOString(),
    contractHash: contractHash ? String(contractHash) : null,
    signatureHash: String(signatureHash),
  });
  res.status(201).json({ ok: true, log });
});

router.get("/providers/:providerId/availability", async (req, res) => {
  const { providerId } = req.params;
  const sched = schedulingRepos();
  const [rules, blackouts] = await Promise.all([
    sched.listRules(providerId),
    sched.listBlackouts(providerId),
  ]);
  res.json({ ok: true, rules, blackouts, timezone: DEFAULT_TIMEZONE });
});

router.put("/providers/:providerId/availability", async (req, res) => {
  const { providerId } = req.params;
  const incoming = req.body?.rules;
  if (!Array.isArray(incoming)) {
    return res.status(400).json({ ok: false, error: "Formato de reglas invalido" });
  }
  const sched = schedulingRepos();
  const existing = await sched.listRules(providerId);
  const existingMap = new Map(existing.map((rule: any) => [rule.id, rule]));
  try {
    const normalized = incoming.map((raw: any) => normalizeAvailabilityRule(providerId, raw, existingMap.get(raw?.id)));
    await sched.upsertRules(providerId, normalized);
    res.json({ ok: true, rules: normalized, timezone: DEFAULT_TIMEZONE });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "No se pudo guardar la disponibilidad" });
  }
});

router.post("/providers/:providerId/blackouts", async (req, res) => {
  const { providerId } = req.params;
  const { start, end, reason } = req.body || {};
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!start || Number.isNaN(startDate.getTime()) || !end || Number.isNaN(endDate.getTime())) {
    return res.status(400).json({ ok: false, error: "Fechas invalidas para el bloqueo" });
  }
  if (startDate >= endDate) {
    return res.status(400).json({ ok: false, error: "La fecha de fin debe ser posterior al inicio" });
  }
  const sched = schedulingRepos();
  const blackout = await sched.addBlackout({
    id: generateId("blk_"),
    providerId,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    reason: reason ? String(reason).trim() : null,
  });
  res.json({ ok: true, blackout });
});

router.delete("/providers/:providerId/blackouts/:blackoutId", async (req, res) => {
  const { providerId, blackoutId } = req.params;
  const sched = schedulingRepos();
  await sched.removeBlackout(providerId, blackoutId);
  res.json({ ok: true, removed: blackoutId });
});

router.get("/providers/:providerId/slots", async (req, res) => {
  const { providerId } = req.params;
  const query = req.query || {};
  const fromParam = typeof query.from === "string" ? query.from : "";
  const toParam = typeof query.to === "string" ? query.to : "";
  const daysParam = query.days ? Number(query.days) : undefined;

  let from = new Date();
  if (fromParam) {
    const parsed = new Date(fromParam);
    if (!Number.isNaN(parsed.getTime())) from = parsed;
  }

  let to: Date;
  if (toParam) {
    const parsedTo = new Date(toParam);
    to = Number.isNaN(parsedTo.getTime()) ? new Date(from) : parsedTo;
  } else {
    const daysWindow = Number.isFinite(daysParam) && daysParam && daysParam > 0 ? Math.min(Math.floor(daysParam), 60) : 21;
    to = new Date(from);
    to.setDate(to.getDate() + daysWindow);
  }

  if (to < from) {
    const temp = to;
    to = from;
    from = temp;
  }

  const includeFullyBooked = String(query.includeFullyBooked || "").toLowerCase() === "true";
  const urgentOnly = String(query.urgent || "").toLowerCase() === "true";

  let slots = await computeProviderSlotsPrisma(providerId, from, to);
  if (!includeFullyBooked) slots = slots.filter((s) => s.available > 0);
  if (urgentOnly) slots = slots.filter((s) => s.urgent);

  res.json({ ok: true, slots, timezone: DEFAULT_TIMEZONE });
});

router.get("/providers/:providerId/manual-slots", async (req, res) => {
  const sched = schedulingRepos();
  const slots = await sched.listManualSlots(req.params.providerId);
  res.json({ ok: true, slots });
});

router.post("/providers/:providerId/manual-slots", async (req, res) => {
  const { providerId } = req.params;
  const { start, end, label, urgent, capacity, notes } = req.body || {};
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!start || Number.isNaN(startDate.getTime()) || !end || Number.isNaN(endDate.getTime())) {
    return res.status(400).json({ ok: false, error: "Fechas invalidas para el turno manual" });
  }
  if (endDate <= startDate) {
    return res.status(400).json({ ok: false, error: "La fecha de fin debe ser posterior al inicio" });
  }
  const capacityNumber = Number(capacity || 1);
  if (!Number.isFinite(capacityNumber) || capacityNumber <= 0) {
    return res.status(400).json({ ok: false, error: "La capacidad debe ser mayor a 0" });
  }

  const sched = schedulingRepos();
  const manual = await sched.addManualSlot({
    id: generateId("ms_"),
    providerId,
    date: startDate.toISOString(),
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    label: label ? String(label).trim() : null,
    urgent: Boolean(urgent),
    capacity: Math.floor(capacityNumber),
    notes: notes ? String(notes).trim() : null,
  });
  res.json({ ok: true, slot: manual });
});

router.delete("/providers/:providerId/manual-slots/:slotId", async (req, res) => {
  const { providerId, slotId } = req.params;
  const active = readJson<any[]>("requests", []).filter(
    (reqItem) =>
      reqItem.providerId === providerId &&
      reqItem.schedule?.slotId === slotId &&
      ["PENDING", "CONFIRMED"].includes(reqItem.status),
  );
  if (active.length > 0) {
    return res.status(409).json({ ok: false, error: "El turno tiene reservas activas. Cancela la solicitud antes de eliminarlo." });
  }
  const sched = schedulingRepos();
  await sched.removeManualSlot(providerId, slotId);
  res.json({ ok: true, removed: slotId });
});

router.get("/providers/:providerId/notifications", (req, res) => {
  const { providerId } = req.params;
  const unreadOnly = String(req.query.unread || "").toLowerCase() === "true";
  const limit = Number(req.query.limit || 50);
  const items = readJson<any[]>("provider_notifications", [])
    .filter((notif) => notif.providerId === providerId && (!unreadOnly || !notif.read))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, Math.max(Math.min(limit, 200), 1));
  const unreadCount = readJson<any[]>("provider_notifications", []).filter((notif) => notif.providerId === providerId && !notif.read).length;
  res.json({ ok: true, notifications: items, unreadCount });
});

router.post("/providers/:providerId/notifications/:notificationId/read", (req, res) => {
  const { providerId, notificationId } = req.params;
  const readFlag = req.body?.read === false ? false : true;
  const notifications = readJson<any[]>("provider_notifications", []);
  let updated = false;
  for (const notif of notifications) {
    if (notif.providerId === providerId && notif.id === notificationId) {
      notif.read = readFlag;
      updated = true;
    }
  }
  if (!updated) return res.status(404).json({ ok: false, error: "Notificacion no encontrada" });
  writeJson("provider_notifications", notifications);
  res.json({ ok: true, notificationId, read: readFlag });
});

router.post("/providers/:providerId/notifications/read-all", (req, res) => {
  const { providerId } = req.params;
  const notifications = readJson<any[]>("provider_notifications", []);
  let changed = false;
  for (const notif of notifications) {
    if (notif.providerId === providerId && !notif.read) {
      notif.read = true;
      changed = true;
    }
  }
  if (changed) writeJson("provider_notifications", notifications);
  res.json({ ok: true, updated: changed });
});

router.post("/providers/:providerId/push-subscriptions", (req, res) => {
  const { providerId } = req.params;
  const { endpoint, keys, platform } = req.body || {};
  if (!endpoint || typeof endpoint !== "string") {
    return res.status(400).json({ ok: false, error: "Endpoint de notificacion requerido" });
  }
  const nowIso = new Date().toISOString();
  const subscription: any = {
    id: generateId("push_"),
    providerId,
    endpoint,
    createdAt: nowIso,
  };

  if (keys && typeof keys === "object") {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(keys)) {
      if (typeof value === "string") sanitized[String(key)] = value;
    }
    if (Object.keys(sanitized).length > 0) subscription.keys = sanitized;
  }
  if (platform) subscription.platform = String(platform);

  const existing = readJson<any[]>("provider_push_subscriptions", []);
  const others = existing.filter(
    (item) => !(item.providerId === providerId && item.endpoint === subscription.endpoint),
  );
  writeJson("provider_push_subscriptions", [...others, subscription]);
  res.json({ ok: true, subscription });
});

router.delete("/providers/:providerId/push-subscriptions/:subscriptionId", (req, res) => {
  const { providerId, subscriptionId } = req.params;
  const existing = readJson<any[]>("provider_push_subscriptions", []);
  const filtered = existing.filter(
    (item) => !(item.providerId === providerId && item.id === subscriptionId),
  );
  if (filtered.length === existing.length) {
    return res.status(404).json({ ok: false, error: "Suscripcion no encontrada" });
  }
  writeJson("provider_push_subscriptions", filtered);
  res.json({ ok: true, removed: subscriptionId });
});

router.get("/providers/search", (req, res) => {
  const catalogId = typeof req.query.catalogId === "string" ? req.query.catalogId : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const subCategory = typeof req.query.subCategory === "string" ? req.query.subCategory : undefined;
  const modality = typeof req.query.modality === "string" ? req.query.modality.toUpperCase() : undefined;
  const wantsUrgent = String(req.query.urgent || "").toLowerCase() === "true";
  const zone = typeof req.query.zone === "string" ? req.query.zone : undefined;

  const services = readJson<any[]>("provider_services", []);
  const catalog = readJson<CatalogItem[]>("catalog", []);
  const providers = readJson<any[]>("providers", []);
  const profiles = readJson<any[]>("provider_profiles", []);

  const filteredServices = services.filter((service) => {
    if (catalogId && service.catalogId !== catalogId) return false;
    if (category && service.category !== category) return false;
    if (subCategory && service.subCategory !== subCategory) return false;
    if (wantsUrgent && service.allowsUrgent !== true) return false;
    if (modality && !(Array.isArray(service.modalities) && service.modalities.includes(modality))) return false;
    return true;
  });

  const results = filteredServices.reduce((acc: any[], service) => {
    const provider = providers.find((p) => p.id === service.providerId);
    if (!provider) return acc;
    const profile = profiles.find((p) => p.providerId === service.providerId) || ensureProviderProfile(service.providerId);

    if (zone && profile.areas && profile.areas.length > 0 && !profile.areas.includes(zone)) {
      return acc;
    }

    let entry = acc.find((item) => item.provider.id === provider.id);
    if (!entry) {
      entry = {
        provider,
        profile,
        services: [],
      };
      acc.push(entry);
    }

    const catalogItem = catalog.find((item) => item.id === service.catalogId) || null;
    entry.services.push({
      ...service,
      catalog: catalogItem,
    });
    return;

 acc;
  }, [] as any[]);

  res.json({ ok: true, results });
});

router.get("/providers/:providerId/public", (req, res) => {
  const { providerId } = req.params;
  const providers = readJson<any[]>("providers", []);
  const provider = providers.find((p) => p.id === providerId);
  if (!provider) return res.status(404).json({ ok: false, error: "Prestador no encontrado" });

  const users = readJson<any[]>("users", []);
  const owner = users.find((u) => u.id === provider.userId) || null;
  const profile = ensureProviderProfile(providerId);
  const services = readJson<any[]>("provider_services", []).filter((s) => s.providerId === providerId);

  res.json({ ok: true, provider, owner, profile, services });
});

import { getRepos } from "../repositories/factory.js";

router.get("/providers/:providerId/materials", async (req, res) => {
  const repos = getRepos();
  const materials = await repos.materials.listByProvider(req.params.providerId);
  res.json({ ok: true, materials });
});

router.post("/providers/:providerId/materials", upload.single("file"), async (req, res) => {
  const providerId = String(req.params?.providerId || "").trim();
  const description = String(req.body?.description || "").trim();
  const requestId = String(req.body?.requestId || "").trim();
  const currency = String(req.body?.currency || "ARS").trim().toUpperCase();
  const amountRaw = Number(req.body?.amount || 0);

  if (!providerId) return res.status(400).json({ ok: false, error: "providerId requerido" });
  if (!description) return res.status(400).json({ ok: false, error: "Descripcion requerida" });
  if (!requestId) return res.status(400).json({ ok: false, error: "requestId requerido" });
  if (!Number.isFinite(amountRaw) || amountRaw <= 0) {
    return res.status(400).json({ ok: false, error: "Importe invalido" });
  }

  const file = req.file;
  const attachmentUrl = file ? `/uploads/${file.filename}` : null;

  const material: ProviderMaterial = {
    id: generateId("mat_"),
    providerId,
    requestId,
    description,
    amount: Math.round(amountRaw * 100),
    currency,
    attachmentUrl,
    createdAt: new Date().toISOString(),
  };

  const repos = getRepos();
  await repos.materials.create(material);
  res.json({ ok: true, material });
});
router.get("/requests/:requestId/materials", async (req, res) => {
  const repos = getRepos();
  const materials = await repos.materials.listByRequest(req.params.requestId);
  res.json({ ok: true, materials });
});
export default router;







