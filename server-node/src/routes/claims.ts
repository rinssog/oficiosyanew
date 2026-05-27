/**
 * Claims / Reclamos route
 * Sistema de reclamos entre clientes, prestadores y administración
 *
 * POST   /claims            — crear reclamo (cliente o prestador)
 * GET    /claims            — listar propios reclamos
 * GET    /claims/:id        — detalle de reclamo
 * PATCH  /claims/:id        — admin: actualizar estado / nota
 * GET    /admin/claims      — admin: listar todos
 * POST   /claims/:id/messages — añadir mensaje al reclamo
 * GET    /claims/:id/messages — historial de mensajes del reclamo
 */
import { Router } from "express";
import { randomUUID } from "crypto";
import { authRequired } from "../security/middleware.js";
import { readJson, writeJson } from "../storage.js";

const router = Router();

/* ── Types ──────────────────────────────────────────────────── */
type ClaimStatus = "PENDING" | "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED" | "CLOSED";
type ClaimCategory =
  | "CALIDAD_SERVICIO"
  | "NO_SE_PRESENTO"
  | "COBRO_INDEBIDO"
  | "MATERIALES_FALTANTES"
  | "DATOS_FALSOS"
  | "ACUERDO_FUERA_PLATAFORMA"
  | "PAGO_NO_LIBERADO"
  | "OTRO";

interface Claim {
  id: string;
  requestId: string;
  reporterId: string;  // who filed
  reporterRole: "CLIENT" | "PROVIDER";
  accusedId: string;   // who is accused
  category: ClaimCategory;
  description: string;
  evidence?: string[];
  status: ClaimStatus;
  adminNote?: string;
  resolution?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface ClaimMessage {
  id: string;
  claimId: string;
  senderId: string;
  senderRole: "CLIENT" | "PROVIDER" | "ADMIN";
  senderName?: string;
  body: string;
  createdAt: string;
}

/* ── Helpers ─────────────────────────────────────────────────── */
function getClaims(): Claim[] { return readJson<Claim[]>("claims", []); }
function saveClaims(c: Claim[]) { writeJson("claims", c); }
function getClaimMessages(): ClaimMessage[] { return readJson<ClaimMessage[]>("claim_messages", []); }
function saveClaimMessages(m: ClaimMessage[]) { writeJson("claim_messages", m); }

function getPriority(category: ClaimCategory): Claim["priority"] {
  if (["DATOS_FALSOS", "ACUERDO_FUERA_PLATAFORMA"].includes(category)) return "CRITICAL";
  if (["NO_SE_PRESENTO", "COBRO_INDEBIDO", "PAGO_NO_LIBERADO"].includes(category)) return "HIGH";
  if (["CALIDAD_SERVICIO", "MATERIALES_FALTANTES"].includes(category)) return "MEDIUM";
  return "LOW";
}

/* ── POST /claims ─────────────────────────────────────────────── */
router.post("/claims", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";

  if (!["CLIENT", "PROVIDER"].includes(role)) {
    return res.status(403).json({ ok: false, error: "Solo clientes y prestadores pueden crear reclamos" });
  }

  const { requestId, category, description, accusedId } = req.body;
  if (!requestId)   return res.status(400).json({ ok: false, error: "requestId es requerido" });
  if (!category)    return res.status(400).json({ ok: false, error: "category es requerida" });
  if (!description || description.trim().length < 20) {
    return res.status(400).json({ ok: false, error: "La descripción debe tener al menos 20 caracteres" });
  }

  const VALID_CATEGORIES: ClaimCategory[] = [
    "CALIDAD_SERVICIO", "NO_SE_PRESENTO", "COBRO_INDEBIDO",
    "MATERIALES_FALTANTES", "DATOS_FALSOS", "ACUERDO_FUERA_PLATAFORMA",
    "PAGO_NO_LIBERADO", "OTRO"
  ];
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ ok: false, error: "Categoría inválida" });
  }

  // Find request to get accused party
  const requests = readJson<any[]>("requests", []);
  const request  = requests.find((r: any) => r.id === requestId);
  if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

  // Determine accused: if reporter is client, accused is provider and vice versa
  const resolvedAccusedId = accusedId ||
    (role === "CLIENT" ? request.providerId : request.clientId) || "";

  // Check for duplicate (same reporter + requestId + open)
  const existing = getClaims().find(c =>
    c.reporterId === userId &&
    c.requestId  === requestId &&
    !["RESOLVED", "REJECTED", "CLOSED"].includes(c.status)
  );
  if (existing) {
    return res.status(409).json({ ok: false, error: "Ya tenés un reclamo activo para esta solicitud", claimId: existing.id });
  }

  const claim: Claim = {
    id:           randomUUID(),
    requestId,
    reporterId:   userId,
    reporterRole: role as "CLIENT" | "PROVIDER",
    accusedId:    resolvedAccusedId,
    category,
    description:  description.trim(),
    status:       "PENDING",
    priority:     getPriority(category),
    createdAt:    new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
  };

  const claims = getClaims();
  claims.push(claim);
  saveClaims(claims);

  return res.status(201).json({ ok: true, claim });
});

/* ── GET /claims ──────────────────────────────────────────────── */
router.get("/claims", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";

  const claims = getClaims();

  let mine: Claim[];
  if (role === "ADMIN") {
    mine = claims;
  } else {
    mine = claims.filter(c => c.reporterId === userId || c.accusedId === userId);
  }

  mine.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({ ok: true, claims: mine, total: mine.length });
});

/* ── GET /admin/claims ────────────────────────────────────────── */
router.get("/admin/claims", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const role: string = auth.role ?? "";
  if (role !== "ADMIN") return res.status(403).json({ ok: false, error: "Solo admins" });

  const { status, priority, category } = req.query as any;
  let claims = getClaims();

  if (status)   claims = claims.filter(c => c.status   === status);
  if (priority) claims = claims.filter(c => c.priority === priority);
  if (category) claims = claims.filter(c => c.category === category);

  claims.sort((a, b) => {
    // Sort by priority then date
    const pOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const pd = (pOrder[a.priority] || 3) - (pOrder[b.priority] || 3);
    if (pd !== 0) return pd;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Enrich with user info
  const users = readJson<any[]>("users", []);
  const enriched = claims.map(c => ({
    ...c,
    reporter: users.find(u => u.id === c.reporterId)
      ? { id: c.reporterId, name: users.find(u => u.id === c.reporterId)?.name, email: users.find(u => u.id === c.reporterId)?.email }
      : { id: c.reporterId },
    accused: users.find(u => u.id === c.accusedId)
      ? { id: c.accusedId, name: users.find(u => u.id === c.accusedId)?.name, email: users.find(u => u.id === c.accusedId)?.email }
      : { id: c.accusedId },
  }));

  const counts = {
    total:    claims.length,
    pending:  claims.filter(c => c.status === "PENDING").length,
    open:     claims.filter(c => c.status === "OPEN").length,
    inReview: claims.filter(c => c.status === "IN_REVIEW").length,
    resolved: claims.filter(c => c.status === "RESOLVED").length,
    rejected: claims.filter(c => c.status === "REJECTED").length,
  };

  return res.json({ ok: true, claims: enriched, counts, total: claims.length });
});

/* ── GET /claims/:id ──────────────────────────────────────────── */
router.get("/claims/:id", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const { id } = req.params;

  const claim = getClaims().find(c => c.id === id);
  if (!claim) return res.status(404).json({ ok: false, error: "Reclamo no encontrado" });

  if (role !== "ADMIN" && claim.reporterId !== userId && claim.accusedId !== userId) {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  return res.json({ ok: true, claim });
});

/* ── PATCH /claims/:id ─────────────────────────────────────────── */
router.patch("/claims/:id", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const role: string = auth.role ?? "";
  if (role !== "ADMIN") return res.status(403).json({ ok: false, error: "Solo admins" });

  const { id } = req.params;
  const { status, adminNote, resolution } = req.body;

  const VALID_STATUS: ClaimStatus[] = ["PENDING","OPEN","IN_REVIEW","RESOLVED","REJECTED","CLOSED"];
  if (status && !VALID_STATUS.includes(status)) {
    return res.status(400).json({ ok: false, error: "Estado inválido" });
  }

  const claims = getClaims();
  const idx = claims.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: "Reclamo no encontrado" });

  if (status)     claims[idx].status     = status;
  if (adminNote !== undefined) claims[idx].adminNote = adminNote;
  if (resolution !== undefined) claims[idx].resolution = resolution;
  claims[idx].updatedAt = new Date().toISOString();
  if (["RESOLVED","REJECTED","CLOSED"].includes(status)) {
    claims[idx].resolvedAt = new Date().toISOString();
  }

  saveClaims(claims);
  return res.json({ ok: true, claim: claims[idx] });
});

/* ── POST /claims/:id/messages ─────────────────────────────────── */
router.post("/claims/:id/messages", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const { id } = req.params;
  const { body } = req.body;

  if (!body?.trim()) return res.status(400).json({ ok: false, error: "Mensaje vacío" });

  const claim = getClaims().find(c => c.id === id);
  if (!claim) return res.status(404).json({ ok: false, error: "Reclamo no encontrado" });

  if (role !== "ADMIN" && claim.reporterId !== userId && claim.accusedId !== userId) {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  const users = readJson<any[]>("users", []);
  const sender = users.find((u: any) => u.id === userId);

  const msg: ClaimMessage = {
    id:         randomUUID(),
    claimId:    id,
    senderId:   userId,
    senderRole: role as any,
    senderName: sender?.name || sender?.email || "Usuario",
    body:       body.trim(),
    createdAt:  new Date().toISOString(),
  };

  const msgs = getClaimMessages();
  msgs.push(msg);
  saveClaimMessages(msgs);

  // Update claim updatedAt
  const claims = getClaims();
  const cidx = claims.findIndex(c => c.id === id);
  if (cidx !== -1) {
    claims[cidx].updatedAt = msg.createdAt;
    // Auto-transition PENDING to OPEN when admin responds
    if (role === "ADMIN" && claims[cidx].status === "PENDING") {
      claims[cidx].status = "OPEN";
    }
    saveClaims(claims);
  }

  return res.status(201).json({ ok: true, message: msg });
});

/* ── GET /claims/:id/messages ─────────────────────────────────── */
router.get("/claims/:id/messages", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const { id } = req.params;

  const claim = getClaims().find(c => c.id === id);
  if (!claim) return res.status(404).json({ ok: false, error: "Reclamo no encontrado" });

  if (role !== "ADMIN" && claim.reporterId !== userId && claim.accusedId !== userId) {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  const msgs = getClaimMessages()
    .filter(m => m.claimId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return res.json({ ok: true, messages: msgs });
});

export default router;
