/**
 * Chat route stub — MVP placeholder.
 * Full implementation pending real-time messaging (WebSocket / SSE).
 */
import { Router } from "express";
const router = Router();

// Placeholder — returns empty thread list
router.get("/chat/threads", (_req, res) => {
  res.json({ ok: true, threads: [] });
});

router.get("/chat/threads/:id/messages", (_req, res) => {
  res.json({ ok: true, messages: [] });
});

router.post("/chat/threads/:id/messages", (_req, res) => {
  res.status(501).json({ ok: false, error: "Chat en tiempo real próximamente" });
});

export default router;
