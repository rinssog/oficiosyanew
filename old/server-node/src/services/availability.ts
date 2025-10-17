import { AvailabilityBlackout, AvailabilityRule, AvailabilitySlot, DayCode } from "../types.js";
import { parseDays, parseTimeToMinutes, isoForDateMinutes, minutesToTime, formatDate, pad } from "../utils/time.js";
import { DEFAULT_TIMEZONE, DAY_LABELS } from "../utils/constants.js";
import { readJson, writeJson } from "../storage.js";
import { generateId } from "../storage.js";
import { ensureJsonArray } from "../utils/persistence.js";


const AVAILABILITY_RULES_KEY = "provider_availability_rules";
const AVAILABILITY_BLACKOUTS_KEY = "provider_availability_blackouts";
const MANUAL_SLOTS_KEY = "provider_manual_slots";

export const readAvailabilityRules = () => readJson<AvailabilityRule[]>(AVAILABILITY_RULES_KEY, []);
export const readAvailabilityBlackouts = () => readJson<AvailabilityBlackout[]>(AVAILABILITY_BLACKOUTS_KEY, []);
const readManualSlots = () => readJson<any[]>(MANUAL_SLOTS_KEY, []);

export const saveAvailabilityRules = (rules: AvailabilityRule[]) => writeJson(AVAILABILITY_RULES_KEY, rules);
export const saveAvailabilityBlackouts = (items: AvailabilityBlackout[]) => writeJson(AVAILABILITY_BLACKOUTS_KEY, items);

export const getProviderAvailabilityRules = (providerId: string) =>
  readAvailabilityRules().filter((rule) => rule.providerId === providerId);
export const getProviderBlackouts = (providerId: string) =>
  readAvailabilityBlackouts().filter((blk) => blk.providerId === providerId);
export const getProviderManualSlots = (providerId: string) => readManualSlots().filter((slot) => slot.providerId === providerId);

export const upsertProviderRules = (providerId: string, rules: AvailabilityRule[]) => {
  const others = readAvailabilityRules().filter((rule) => rule.providerId !== providerId);
  saveAvailabilityRules([...others, ...rules]);
};

export const storeManualSlot = (slot: any) => {
  const existing = readManualSlots();
  const others = existing.filter((item) => item.id !== slot.id);
  writeJson(MANUAL_SLOTS_KEY, [...others, slot]);
  return slot;
};

export const deleteManualSlot = (providerId: string, slotId: string) => {
  const existing = readManualSlots();
  const filtered = existing.filter((slot) => !(slot.providerId === providerId && slot.id === slotId));
  if (filtered.length === existing.length) return false;
  writeJson(MANUAL_SLOTS_KEY, filtered);
  return true;
};

const ACTIVE_REQUEST_STATUSES = new Set(["PENDING", "CONFIRMED"]);

const getActiveRequestsForProvider = (providerId: string) => {
  const requests = readJson<any[]>("requests", []);
  return requests.filter((req) => req.providerId === providerId && ACTIVE_REQUEST_STATUSES.has(req.status));
};

export const normalizeAvailabilityRule = (
  providerId: string,
  raw: any,
  previous?: AvailabilityRule,
): AvailabilityRule => {
  const id = typeof raw?.id === "string" && raw.id.trim() ? raw.id.trim() : generateId("rule_");
  const daysOfWeek = parseDays(raw?.daysOfWeek);
  if (!daysOfWeek.length) throw new Error("Selecciona al menos un dia de la semana");

  const startTime = String(raw?.startTime || "").trim();
  const endTime = String(raw?.endTime || "").trim();
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || startMinutes >= endMinutes) {
    throw new Error("El rango horario es invalido");
  }

  const slotMinutes = Number(raw?.slotMinutes || 0);
  if (!Number.isFinite(slotMinutes) || slotMinutes <= 0) {
    throw new Error("La duracion del turno debe ser mayor a 0");
  }

  const bufferMinutesRaw = Number(raw?.bufferMinutes || 0);
  const bufferMinutes = Number.isFinite(bufferMinutesRaw) && bufferMinutesRaw > 0 ? Math.floor(bufferMinutesRaw) : 0;

  const maxPerSlotRaw = Number(raw?.maxPerSlot || 1);
  const maxPerSlot = Number.isFinite(maxPerSlotRaw) && maxPerSlotRaw > 0 ? Math.floor(maxPerSlotRaw) : 1;

  const maxPerDayRaw = raw?.maxPerDay;
  const maxPerDayNumber = Number(maxPerDayRaw);
  const maxPerDay =
    maxPerDayRaw === undefined || maxPerDayRaw === null || Number.isNaN(maxPerDayNumber)
      ? undefined
      : Math.max(Math.floor(maxPerDayNumber), 0);

  const urgent = Boolean(raw?.urgent);
  const active = raw?.active === false ? false : true;
  const notes = raw?.notes ? String(raw.notes).trim() : undefined;
  const createdAt = previous?.createdAt || new Date().toISOString();
  const updatedAt = new Date().toISOString();

  const base: AvailabilityRule = {
    id,
    providerId,
    daysOfWeek,
    startTime,
    endTime,
    slotMinutes: Math.floor(slotMinutes),
    bufferMinutes,
    maxPerSlot,
    urgent,
    active,
    createdAt,
    updatedAt,
  };

  if (maxPerDay !== undefined) base.maxPerDay = maxPerDay;
  if (notes) base.notes = notes;
  return base;
};

export const computeProviderSlots = (providerId: string, from: Date, to: Date): AvailabilitySlot[] => {
  const rules = getProviderAvailabilityRules(providerId).filter((rule) => rule.active !== false);
  if (!rules.length) return [];
  const blackouts = getProviderBlackouts(providerId);
  const manualSlots = getProviderManualSlots(providerId);
  const requests = getActiveRequestsForProvider(providerId);
  const takenBySlot = new Map<string, number>();
  const takenByDayRule = new Map<string, number>();

  for (const req of requests) {
    const schedule = req.schedule || {};
    const slotId = schedule.slotId as string | undefined;
    if (slotId) takenBySlot.set(slotId, (takenBySlot.get(slotId) || 0) + 1);
    const ruleId = schedule.ruleId as string | undefined;
    const dateFromSchedule = (schedule.date || (schedule.start ? String(schedule.start).slice(0, 10) : null)) as string | null;
    if (ruleId && dateFromSchedule) {
      const key = `${ruleId}_${dateFromSchedule}`;
      takenByDayRule.set(key, (takenByDayRule.get(key) || 0) + 1);
    }
  }

  const slots: AvailabilitySlot[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const limit = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  while (cursor <= limit) {
    const dayIndex = cursor.getDay();
    const dayCode = DAY_LABELS[dayIndex];
    if (!dayCode) {
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }
    const dateStr = formatDate(cursor);

    for (const rule of rules) {
      if (!rule.daysOfWeek.includes(dayCode)) continue;
      const startMinutes = parseTimeToMinutes(rule.startTime);
      const endMinutes = parseTimeToMinutes(rule.endTime);
      if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || startMinutes >= endMinutes) continue;

      const dayKey = `${rule.id}_${dateStr}`;
      const existingDayCount = takenByDayRule.get(dayKey) || 0;
      let remainingDayCapacity = rule.maxPerDay ? Math.max(rule.maxPerDay - existingDayCount, 0) : Number.MAX_SAFE_INTEGER;
      if (remainingDayCapacity <= 0) continue;

      let slotStart = startMinutes;
      while (slotStart + rule.slotMinutes <= endMinutes && remainingDayCapacity > 0) {
        const slotEndMinutes = slotStart + rule.slotMinutes;
        const startIso = isoForDateMinutes(cursor, slotStart);
        const endIso = isoForDateMinutes(cursor, slotEndMinutes);
        const overlapsBlackout = blackouts.some((blk) => {
          const blkStart = new Date(blk.start).getTime();
          const blkEnd = new Date(blk.end).getTime();
          const slotStartMs = new Date(startIso).getTime();
          const slotEndMs = new Date(endIso).getTime();
          if (Number.isNaN(blkStart) || Number.isNaN(blkEnd)) return false;
          return slotStartMs < blkEnd && slotEndMs > blkStart;
        });
        if (!overlapsBlackout) {
          const slotId = `slot_${rule.id}_${dateStr}_${minutesToTime(slotStart).replace(":", "")}`;
          const capacity = Math.max(rule.maxPerSlot || 1, 1);
          const taken = takenBySlot.get(slotId) || 0;
          const available = Math.min(Math.max(capacity - taken, 0), remainingDayCapacity);
          if (available > 0) {
            slots.push({
              id: slotId,
              providerId,
              ruleId: rule.id,
              date: dateStr,
              start: startIso,
              end: endIso,
              label: `${dateStr} ${minutesToTime(slotStart)}-${minutesToTime(slotEndMinutes)}`,
              urgent: !!rule.urgent,
              capacity,
              taken,
              available,
              durationMinutes: rule.slotMinutes,
              source: "RULE",
            });
            remainingDayCapacity -= available;
          }
        }
        slotStart += rule.slotMinutes + (rule.bufferMinutes || 0);
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  for (const manual of manualSlots) {
    if (manual.providerId !== providerId) continue;
    const startDate = new Date(manual.start);
    const endDate = new Date(manual.end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) continue;
    if (endDate <= startDate) continue;
    if (endDate < from || startDate > to) continue;

    const overlapsBlackout = blackouts.some((blk) => {
      const blkStart = new Date(blk.start).getTime();
      const blkEnd = new Date(blk.end).getTime();
      const slotStartMs = startDate.getTime();
      const slotEndMs = endDate.getTime();
      if (Number.isNaN(blkStart) || Number.isNaN(blkEnd)) return false;
      return slotStartMs < blkEnd && slotEndMs > blkStart;
    });
    if (overlapsBlackout) continue;

    const slotId = manual.id;
    const capacity = Math.max(manual.capacity || 1, 1);
    const taken = takenBySlot.get(slotId) || 0;
    const available = Math.max(capacity - taken, 0);
    const durationMinutes = Math.max(Math.round((endDate.getTime() - startDate.getTime()) / 60000), 1);
    const dateStr = formatDate(startDate);
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
    const label = manual.label?.trim()
      ? manual.label.trim()
      : `${dateStr} ${minutesToTime(startMinutes)}-${minutesToTime(endMinutes)}`;

    const slot: AvailabilitySlot = {
      id: slotId,
      providerId,
      ruleId: null,
      date: dateStr,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      label,
      urgent: !!manual.urgent,
      capacity,
      taken,
      available,
      durationMinutes,
      source: "MANUAL",
      manualSlotId: slotId,
    };
    if (manual.notes) {
      slot.notes = manual.notes;
    }
    slots.push(slot);
  }

  return slots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
};
