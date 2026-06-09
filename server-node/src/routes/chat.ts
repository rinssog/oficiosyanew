/**
 * Chat route — Full JSON-storage implementation
 * Threads per request · Polling-based · Chat moderation integrated
 *
 * Endpoints:
 *   GET    /chat/threads              — list threads for current user
 *   GET    /chat/threads/by-request/:requestId — get/create thread for request
 *   GET    /chat/threads/:id/messages — get messages in thread
 *   POST   /chat/threads/:id/messages — send message (with moderation)
 *   POST   /chat/threads/:id/read     — mark thread as read
 *   GET    /chat/moderation/logs      — admin: moderation log
 *   POST   /chat/moderation/:userId/unsuspend — admin: lift suspension
 */
import { Router } from "express";
import { randomUUID } from "crypto";
import { authRequired } from "../security/middleware.js";
import { readJson, writeJson } from "../storage.js";
import { moderateMessage } from "../services/chatModeration.js";

const router = Router();

/* ── Types ──────────────────────────────────────────────────── */
interface ChatThread {
  id: string;
  requestId: string;
  clientId: string;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadClient: number;
  unreadProvider: number;
  closed?: boolean;
}

interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: "CLIENT" | "PROVIDER" | "ADMIN";
  senderName?: string;
  body: string;
  createdAt: string;
  read: boolean;
  moderated?: boolean;
  moderationNote?: string;
}

/* ── Helpers ─────────────────────────────────────────────────── */
function getThreads(): ChatThread[] { return readJson<ChatThread[]>("chat_threads", []); }
function saveThreads(t: ChatThread[]) { writeJson("chat_threads", t); }
function getMessages(): ChatMessage[] { return readJson<ChatMessage[]>("chat_messages", []); }
function saveMessages(m: ChatMessage[]) { writeJson("chat_messages", m); }

function isSuspended(userId: string): boolean {
  const users = readJson<any[]>("users", []);
  const u = users.find((u: any) => u.id === userId);
  if (!u?.suspendedUntil) return false;
  return new Date(u.suspendedUntil) > new Date();
}

/* ── GET /chat/threads ─────────────────────────────────────── */
router.get("/chat/threads", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const threads = getThreads();

  let mine: ChatThread[];
  if (role === "ADMIN") {
    mine = threads;
  } else if (role === "PROVIDER") {
    mine = threads.filter(t => t.providerId === userId);
  } else {
    mine = threads.filter(t => t.clientId === userId);
  }

  mine.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const totalUnread = mine.reduce((sum, t) => sum + (role === "PROVIDER" ? t.unreadProvider : t.unreadClient), 0);

  return res.json({ ok: true, threads: mine, totalUnread });
});

/* ── GET /chat/threads/by-request/:requestId ────────────────── */
router.get("/chat/threads/by-request/:requestId", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const { requestId } = req.params;

  const threads = getThreads();
  let thread = threads.find(t => t.requestId === requestId);

  if (!thread) {
    // Auto-create thread from request info
    const requests = readJson<any[]>("requests", []);
    const request  = requests.find((r: any) => r.id === requestId);
    if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

    thread = {
      id: randomUUID(),
      requestId,
      clientId:   request.clientId   || (role === "CLIENT"   ? userId : ""),
      providerId: request.providerId || (role === "PROVIDER" ? userId : ""),
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      unreadClient:   0,
      unreadProvider: 0,
    };
    threads.push(thread);
    saveThreads(threads);
  }

  return res.json({ ok: true, thread });
});

/* ── GET /chat/threads/:id/messages ─────────────────────────── */
router.get("/chat/threads/:id/messages", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const { id } = req.params;

  const threads = getThreads();
  const thread  = threads.find(t => t.id === id);
  if (!thread) return res.status(404).json({ ok: false, error: "Hilo no encontrado" });

  // Check access
  if (role !== "ADMIN" && thread.clientId !== userId && thread.providerId !== userId) {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  const messages = getMessages()
    .filter(m => m.threadId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return res.json({ ok: true, messages, thread });
});

/* ── POST /chat/threads/:id/messages ─────────────────────────── */
router.post("/chat/threads/:id/messages", authRequired, async (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const { id } = req.params;
  const { body } = req.body;

  if (!body?.trim()) return res.status(400).json({ ok: false, error: "El mensaje no puede estar vacío" });
  if (body.length > 2000)  return res.status(400).json({ ok: false, error: "Mensaje demasiado largo (máx 2000 caracteres)" });

  const threads = getThreads();
  const thread  = threads.find(t => t.id === id);
  if (!thread) return res.status(404).json({ ok: false, error: "Hilo no encontrado" });

  if (thread.closed) return res.status(400).json({ ok: false, error: "Este hilo está cerrado" });

  if (role !== "ADMIN" && thread.clientId !== userId && thread.providerId !== userId) {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  // Suspension check
  if (isSuspended(userId)) {
    return res.status(403).json({ ok: false, error: "Tu cuenta está suspendida temporalmente y no puedes enviar mensajes" });
  }

  // Moderation
  let moderated = false;
  let moderationNote: string | undefined;
  try {
    const modResult = await moderateMessage(userId, thread.requestId, body);
    if (modResult?.blocked) {
      return res.status(400).json({ ok: false, error: "Mensaje bloqueado por el sistema de moderación", reason: modResult.reason });
    }
    if (modResult?.flagged) {
      moderated = true;
      moderationNote = modResult.reason;
    }
  } catch {}

  // Get sender name
  const users = readJson<any[]>("users", []);
  const sender = users.find((u: any) => u.id === userId);

  const message: ChatMessage = {
    id:          randomUUID(),
    threadId:    id,
    senderId:    userId,
    senderRole:  role as any,
    senderName:  sender?.name || sender?.email || "Usuario",
    body:        body.trim(),
    createdAt:   new Date().toISOString(),
    read:        false,
    moderated,
    moderationNote,
  };

  const messages = getMessages();
  messages.push(message);
  saveMessages(messages);

  // Update thread metadata
  const tidx = threads.findIndex(t => t.id === id);
  if (tidx !== -1) {
    threads[tidx].lastMessage   = body.trim().slice(0, 80);
    threads[tidx].lastMessageAt = message.createdAt;
    threads[tidx].updatedAt     = message.createdAt;

    if (role === "CLIENT")   threads[tidx].unreadProvider += 1;
    else if (role === "PROVIDER") threads[tidx].unreadClient += 1;
  }
  saveThreads(threads);

  return res.status(201).json({ ok: true, message });
});

/* ── POST /chat/threads/:id/read ─────────────────────────────── */
router.post("/chat/threads/:id/read", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const { id } = req.params;

  const threads = getThreads();
  const tidx = threads.findIndex(t => t.id === id);
  if (tidx === -1) return res.status(404).json({ ok: false, error: "Hilo no encontrado" });

  if (role === "CLIENT")   threads[tidx].unreadClient   = 0;
  if (role === "PROVIDER") threads[tidx].unreadProvider = 0;
  saveThreads(threads);

  // Mark individual messages as read
  const messages = getMessages();
  let changed = false;
  messages.forEach(m => {
    if (m.threadId === id && m.senderId !== userId && !m.read) {
      m.read = true;
      changed = true;
    }
  });
  if (changed) saveMessages(messages);

  return res.json({ ok: true });
});

/* ── GET /chat/:requestId ─── simplified endpoint for embedded ChatWindow ── */
router.get("/chat/:requestId", authRequired, (req, res) => {
  const { requestId } = req.params;
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";

  const threads = getThreads();
  let thread = threads.find(t => t.requestId === requestId);

  if (!thread) {
    const requests = readJson<any[]>("requests", []);
    const request  = requests.find((r: any) => r.id === requestId);
    if (!request) return res.json({ ok: true, messages: [] });

    thread = {
      id: randomUUID(),
      requestId,
      clientId:   request.clientId   || (role === "CLIENT"   ? userId : ""),
      providerId: request.providerId || (role === "PROVIDER" ? userId : ""),
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      unreadClient:   0,
      unreadProvider: 0,
    };
    threads.push(thread);
    saveThreads(threads);
  }

  if (role !== "ADMIN" && thread.clientId !== userId && thread.providerId !== userId) {
    return res.json({ ok: true, messages: [] });
  }

  const messages = getMessages()
    .filter(m => m.threadId === thread!.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return res.json({ ok: true, messages, threadId: thread.id });
});

/* ── POST /chat/:requestId ─── simplified endpoint for embedded ChatWindow ── */
router.post("/chat/:requestId", authRequired, async (req, res) => {
  const { requestId } = req.params;
  const auth = (req as any).auth;
  const userId: string = auth.sub ?? auth.id ?? "";
  const role: string   = auth.role ?? "";
  const { body } = req.body;

  if (!body?.trim()) return res.status(400).json({ ok: false, error: "Mensaje vacío" });
  if (body.length > 2000) return res.status(400).json({ ok: false, error: "Mensaje muy largo" });

  const threads = getThreads();
  let thread = threads.find(t => t.requestId === requestId);

  if (!thread) {
    const requests = readJson<any[]>("requests", []);
    const request  = requests.find((r: any) => r.id === requestId);
    if (!request) return res.status(404).json({ ok: false, error: "Solicitud no encontrada" });

    thread = {
      id: randomUUID(),
      requestId,
      clientId:   request.clientId   || (role === "CLIENT"   ? userId : ""),
      providerId: request.providerId || (role === "PROVIDER" ? userId : ""),
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      unreadClient:   0,
      unreadProvider: 0,
    };
    threads.push(thread);
    saveThreads(threads);
  }

  if (role !== "ADMIN" && thread.clientId !== userId && thread.providerId !== userId) {
    return res.status(403).json({ ok: false, error: "Sin acceso" });
  }

  if (isSuspended(userId)) {
    return res.status(403).json({ ok: false, error: "Tu cuenta está suspendida temporalmente" });
  }

  let moderated = false;
  try {
    const modResult = await moderateMessage(userId, thread.requestId, body);
    if (modResult?.blocked) {
      return res.status(400).json({ ok: false, error: "Mensaje bloqueado por moderación", reason: modResult.reason });
    }
    if (modResult?.flagged) moderated = true;
  } catch {}

  const users = readJson<any[]>("users", []);
  const sender = users.find((u: any) => u.id === userId);

  const message: ChatMessage = {
    id:         randomUUID(),
    threadId:   thread.id,
    senderId:   userId,
    senderRole: role as any,
    senderName: sender?.name || sender?.email || "Usuario",
    body:       body.trim(),
    createdAt:  new Date().toISOString(),
    read:       false,
    moderated,
  };

  const messages = getMessages();
  messages.push(message);
  saveMessages(messages);

  const tidx = threads.findIndex(t => t.id === thread!.id);
  if (tidx !== -1) {
    threads[tidx].lastMessage   = body.trim().slice(0, 80);
    threads[tidx].lastMessageAt = message.createdAt;
    threads[tidx].updatedAt     = message.createdAt;
    if (role === "CLIENT")   threads[tidx].unreadProvider += 1;
    else if (role === "PROVIDER") threads[tidx].unreadClient += 1;
  }
  saveThreads(threads);

  return res.status(201).json({ ok: true, message });
});

/* ── GET /chat/moderation/logs ───────────────────────────────── */
router.get("/chat/moderation/logs", authRequired, async (req, res) => {
  const auth = (req as any).auth;
  const role: string = auth.role ?? "";
  if (role !== "ADMIN") return res.status(403).json({ ok: false, error: "Solo admins" });

  try {
    const { PrismaClient } = await import("@prisma/client").catch(() => ({ PrismaClient: null })) as any;
    if (PrismaClient) {
      const prisma = new PrismaClient();
      const logs = await (prisma as any).chatModerationLog?.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { email: true, name: true } } }
      }) ?? [];
      await prisma.$disconnect();
      return res.json({ ok: true, logs });
    }
  } catch {}

  return res.json({ ok: true, logs: [], note: "Logs require PostgreSQL" });
});

/* ── POST /chat/moderation/:userId/unsuspend ─────────────────── */
router.post("/chat/moderation/:userId/unsuspend", authRequired, (req, res) => {
  const auth = (req as any).auth;
  const role: string = auth.role ?? "";
  if (role !== "ADMIN") return res.status(403).json({ ok: false, error: "Solo admins" });

  const { userId } = req.params;
  const users = readJson<any[]>("users", []);
  const idx = users.findIndex((u: any) => u.id === userId);
  if (idx === -1) return res.status(404).json({ ok: false, error: "Usuario no encontrado" });

  users[idx].suspendedUntil = null;
  writeJson("users", users);

  return res.json({ ok: true, message: "Suspensión levantada" });
});

export default router;
