import { Router } from "express";

import { readJson, writeJson, generateId } from "../storage.js";

const router = Router();

router.post("/support/tickets", (req, res) => {
  const { userId, role, category, message } = req.body || {};
  if (!userId || !message) {
    return res.status(400).json({ ok: false, error: "userId y message son requeridos" });
  }
  const tickets = readJson<any[]>("support_tickets", []);
  const ticket = {
    id: generateId("ticket_"),
    userId,
    role: role || "CLIENT",
    category: category || "GENERAL",
    message: String(message).slice(0, 2000),
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tickets.push(ticket);
  writeJson("support_tickets", tickets);
  res.json({ ok: true, ticket });
});

router.get("/admin/support/tickets", (_req, res) => {
  const tickets = readJson<any[]>("support_tickets", []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  res.json({ ok: true, tickets });
});

router.patch("/admin/support/tickets/:id", (req, res) => {
  const tickets = readJson<any[]>("support_tickets", []);
  const idx = tickets.findIndex((ticket) => ticket.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, error: "Ticket no encontrado" });
  tickets[idx] = {
    ...tickets[idx],
    status: req.body?.status || tickets[idx].status,
    updatedAt: new Date().toISOString(),
    resolution: req.body?.resolution || tickets[idx].resolution,
  };
  writeJson("support_tickets", tickets);
  res.json({ ok: true, ticket: tickets[idx] });
});

export default router;
