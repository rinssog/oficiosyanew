import { schedulingRepos } from "../repositories/scheduling.js";

export interface SlotPreview {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // ISO
  end: string;   // ISO
  capacity: number;
  available: number;
  urgent: boolean;
  label?: string | null;
  source: "RULE" | "MANUAL";
}

function isoDate(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}

function minutesSinceMidnight(time: string) {
  const [h, m] = time.split(":").map((x) => Number(x));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

function addMinutes(date: Date, mins: number) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + mins);
  return d;
}

const DAY_CODE = ["SUN","MON","TUE","WED","THU","FRI","SAT"] as const;

export async function computeProviderSlotsPrisma(providerId: string, from: Date, to: Date): Promise<SlotPreview[]> {
  const sched = schedulingRepos();
  const [rules, blackouts, manual] = await Promise.all([
    sched.listRules(providerId),
    sched.listBlackouts(providerId),
    sched.listManualSlots(providerId),
  ]);

  // Normalize blackouts to timestamp ranges
  const blackoutRanges = blackouts.map((b: any) => ({ start: new Date(b.start).getTime(), end: new Date(b.end).getTime() }));

  const out: SlotPreview[] = [];

  // 1) Manual slots direct
  for (const m of manual) {
    const start = new Date(m.start);
    const end = new Date(m.end);
    if (end < from || start > to) continue;
    out.push({
      id: m.id,
      date: isoDate(start),
      start: start.toISOString(),
      end: end.toISOString(),
      capacity: Number(m.capacity || 1),
      available: Number(m.capacity || 1),
      urgent: !!m.urgent,
      label: m.label || null,
      source: "MANUAL",
    });
  }

  // 2) Generate rule-based slots within window
  const dayMs = 24 * 60 * 60 * 1000;
  for (let t = new Date(from).getTime(); t <= to.getTime(); t += dayMs) {
    const day = new Date(t);
    const dayCode = DAY_CODE[day.getDay()];

    for (const r of rules) {
      if (r.active === false) continue;
      const set = String(r.daysOfWeek || "").split(",").map((s) => s.trim().toUpperCase());
      if (!set.includes(dayCode)) continue;

      const startMin = minutesSinceMidnight(r.startTime || "09:00");
      const endMin = minutesSinceMidnight(r.endTime || "18:00");
      const slot = Number(r.slotMinutes || 60);
      const buffer = Number(r.bufferMinutes || 0);
      const capacity = Number(r.maxPerSlot || 1);
      if (endMin <= startMin || slot <= 0) continue;

      // base start/end of the day in local time approximated as UTC slots
      const base = new Date(isoDate(day) + "T00:00:00.000Z");
      for (let m = startMin; m + slot <= endMin; m += slot + buffer) {
        const s = addMinutes(base, m);
        const e = addMinutes(s, slot);
        const sMs = s.getTime();
        const eMs = e.getTime();
        // Skip outside window
        if (e < from || s > to) continue;
        // Skip if overlapped with any blackout
        if (blackoutRanges.some((b) => sMs < b.end && b.start < eMs)) continue;
        out.push({
          id: `rule_${r.id}_${isoDate(s)}_${r.startTime}`,
          date: isoDate(s),
          start: s.toISOString(),
          end: e.toISOString(),
          capacity,
          available: capacity,
          urgent: !!r.urgent,
          source: "RULE",
        });
      }
    }
  }

  // TODO: restar reservas/appointments cuando implementemos reservas en DB.
  // Restar reservas (appointments) para capacidad real
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const appts = await prisma.appointment.findMany({ where: { providerId, start: { lte: to }, end: { gte: from } } });
    for (const a of appts) {
      const aS = new Date(a.start).getTime();
      const aE = new Date(a.end).getTime();
      for (const s of out) {
        const sS = new Date(s.start).getTime();
        const sE = new Date(s.end).getTime();
        if (aS < sE && sS < aE) {
          s.available = Math.max(0, (s.available || 0) - 1);
        }
      }
    }
  } catch {}
  // Ordenar por fecha/hora
  out.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return out;
}
