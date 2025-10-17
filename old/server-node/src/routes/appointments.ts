import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired } from "../security/middleware.js";
import { requireRole } from "../security/roles.js";

const router = Router();

// Crear una cita si hay capacidad
router.post('/appointments', authRequired, requireRole('CLIENT','PROVIDER','ADMIN'), async (req, res) => {
  const prisma = new PrismaClient();
  const { requestId, providerId, clientId, start, end } = req.body || {};
  if (!providerId || !clientId || !start || !end) return res.status(400).json({ ok:false, error:'Datos incompletos' });
  const s = new Date(start), e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) return res.status(400).json({ ok:false, error:'Rango horario inválido' });
  // verificar sobre-ocupación sencilla: no permitir solapamientos simultáneos > 1 hasta que tengamos capacidad por slot
  const overlaps = await prisma.appointment.count({ where: { providerId, start: { lt: e }, end: { gt: s }, status: { in: ['SCHEDULED','CONFIRMED'] } } });
  if (overlaps >= 1) return res.status(409).json({ ok:false, error:'Horarios sin capacidad' });
  const appt = await prisma.appointment.create({ data: { requestId, providerId, clientId, start: s, end: e, status: 'SCHEDULED' } });
  return res.status(201).json({ ok:true, appointment: appt });
});

// Cancelar cita
router.post('/appointments/:id/cancel', authRequired, requireRole('CLIENT','PROVIDER','ADMIN'), async (req, res) => {
  const prisma = new PrismaClient();
  const appt = await prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'CANCELED' } }).catch(()=>null);
  if (!appt) return res.status(404).json({ ok:false, error:'Cita no encontrada' });
  return res.json({ ok:true, appointment: appt });
});

// Reprogramar cita
router.post('/appointments/:id/reschedule', authRequired, requireRole('CLIENT','PROVIDER','ADMIN'), async (req, res) => {
  const prisma = new PrismaClient();
  const { start, end } = req.body || {};
  const s = new Date(start), e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) return res.status(400).json({ ok:false, error:'Rango horario inválido' });
  const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!appt) return res.status(404).json({ ok:false, error:'Cita no encontrada' });
  const overlaps = await prisma.appointment.count({ where: { providerId: appt.providerId, id: { not: appt.id }, start: { lt: e }, end: { gt: s }, status: { in: ['SCHEDULED','CONFIRMED'] } } });
  if (overlaps >= 1) return res.status(409).json({ ok:false, error:'Sin capacidad en el nuevo horario' });
  const updated = await prisma.appointment.update({ where: { id: appt.id }, data: { start: s, end: e, status: 'SCHEDULED' } });
  return res.json({ ok:true, appointment: updated });
});

export default router;

