import { describe, expect, it } from "vitest";
import { normalizeAvailabilityRule } from "../services/availability.js";

describe('normalizeAvailabilityRule', () => {
  it('normaliza datos basicos y completa campos opcionales', () => {
    const rule = normalizeAvailabilityRule('pro_test', {
      daysOfWeek: ['mon', 'wed', 'Fri'],
      startTime: '08:00',
      endTime: '12:00',
      slotMinutes: 60,
      bufferMinutes: 15,
      maxPerSlot: 2,
      maxPerDay: 4,
      urgent: true,
      notes: 'Turnos matutinos',
    });

    expect(rule.providerId).toBe('pro_test');
    expect(rule.daysOfWeek).toEqual(['MON', 'WED', 'FRI']);
    expect(rule.slotMinutes).toBe(60);
    expect(rule.bufferMinutes).toBe(15);
    expect(rule.maxPerSlot).toBe(2);
    expect(rule.maxPerDay).toBe(4);
    expect(rule.urgent).toBe(true);
    expect(rule.notes).toBe('Turnos matutinos');
  });

  it('lanza error si el rango horario es invalido', () => {
    expect(() =>
      normalizeAvailabilityRule('pro_test', {
        daysOfWeek: ['mon'],
        startTime: '10:00',
        endTime: '09:00',
        slotMinutes: 30,
      }),
    ).toThrow('El rango horario es invalido');
  });
});
