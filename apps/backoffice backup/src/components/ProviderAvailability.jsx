"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";
const DAY_OPTIONS = [
  { code: "MON", label: "Lunes" },
  { code: "TUE", label: "Martes" },
  { code: "WED", label: "Miercoles" },
  { code: "THU", label: "Jueves" },
  { code: "FRI", label: "Viernes" },
  { code: "SAT", label: "Sabado" },
  { code: "SUN", label: "Domingo" },
];

const dayOrder = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const dayLabel = (code) => DAY_OPTIONS.find((item) => item.code === code)?.label || code;

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
};

const formatDateLabel = (value) => {
  if (!value) return "";
  const base = new Date(`${value}T00:00:00`);
  if (Number.isNaN(base.getTime())) return value;
  return base.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
};

const formatSlotRange = (startIso, endIso, fallback) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return fallback || "-";
  const startStr = start.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const endStr = end.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  return `${startStr} - ${endStr}`;
};

const durationMinutesBetween = (startIso, endIso) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(Math.round((end.getTime() - start.getTime()) / 60000), 0);
};

const createRuleDraft = () => ({
  daysOfWeek: ["MON", "TUE", "WED", "THU", "FRI"],
  startTime: "09:00",
  endTime: "18:00",
  slotMinutes: "60",
  bufferMinutes: "0",
  maxPerSlot: "1",
  maxPerDay: "8",
  urgent: false,
  active: true,
  notes: "",
});

const createManualDraft = () => ({
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  capacity: "1",
  urgent: false,
  label: "",
  notes: "",
});

const groupSlotsByDate = (slots, onlyUrgent) => {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  const filtered = onlyUrgent ? slots.filter((slot) => slot.urgent) : slots;
  const map = new Map();
  filtered.forEach((slot) => {
    const list = map.get(slot.date) || [];
    list.push(slot);
    map.set(slot.date, list);
  });
  return Array.from(map.entries())
    .sort((a, b) => new Date(`${a[0]}T00:00:00`).getTime() - new Date(`${b[0]}T00:00:00`).getTime())
    .map(([date, items]) => ({
      date,
      slots: items.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    }));
};
function ProviderAvailability({ providerId, apiRequest }) {
  const [state, setState] = useState({ rules: [], blackouts: [], timezone: DEFAULT_TIMEZONE });
  const [loading, setLoading] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [savingBlackout, setSavingBlackout] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [ruleDraft, setRuleDraft] = useState(createRuleDraft);
  const [blackoutDraft, setBlackoutDraft] = useState({ start: "", end: "", reason: "" });
  const [manualSlots, setManualSlots] = useState([]);
  const [manualDraft, setManualDraft] = useState(createManualDraft);
  const [savingManual, setSavingManual] = useState(false);
  const [manualMessage, setManualMessage] = useState(null);
  const [manualError, setManualError] = useState(null);
  const [slotPreview, setSlotPreview] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);

  const refreshManualSlots = useCallback(async () => {
    if (!providerId) return;
    try {
      const res = await apiRequest(`/api/providers/${providerId}/manual-slots`);
      const items = (res.slots || []).slice().sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      setManualSlots(items);
      setManualError(null);
    } catch (err) {
      setManualError(err.message);
    }
  }, [providerId, apiRequest]);

  const refreshSlotPreview = useCallback(async () => {
    if (!providerId) return;
    setLoadingPreview(true);
    try {
      const res = await apiRequest(`/api/providers/${providerId}/slots?days=21&includeFullyBooked=true`);
      setSlotPreview(res.slots || []);
      setPreviewError(null);
    } catch (err) {
      setPreviewError(err.message);
    } finally {
      setLoadingPreview(false);
    }
  }, [providerId, apiRequest]);

  useEffect(() => {
    if (!providerId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`/api/providers/${providerId}/availability`);
        if (!cancelled) {
          setState({
            rules: res.rules || [],
            blackouts: res.blackouts || [],
            timezone: res.timezone || DEFAULT_TIMEZONE,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    refreshManualSlots();
    refreshSlotPreview();
    return () => {
      cancelled = true;
    };
  }, [providerId, apiRequest, refreshManualSlots, refreshSlotPreview]);
  const sortedRules = useMemo(() => {
    return [...(state.rules || [])].sort((a, b) => {
      const firstA = Math.min(...a.daysOfWeek.map((code) => dayOrder[code] ?? 7));
      const firstB = Math.min(...b.daysOfWeek.map((code) => dayOrder[code] ?? 7));
      if (firstA !== firstB) return firstA - firstB;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [state.rules]);

  const sortedBlackouts = useMemo(
    () => [...(state.blackouts || [])].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [state.blackouts],
  );

  const manualSlotsWithStatus = useMemo(() => {
    if (!manualSlots.length) return [];
    return manualSlots.map((slot) => {
      const preview = slotPreview.find((item) => item.manualSlotId === slot.id || item.id === slot.id);
      const taken = preview?.taken ?? 0;
      const capacity = preview?.capacity ?? slot.capacity ?? 1;
      const available = preview?.available ?? Math.max(capacity - taken, 0);
      const label = preview?.label || slot.label;
      const duration = preview?.durationMinutes ?? durationMinutesBetween(slot.start, slot.end);
      return { ...slot, taken, capacity, available, label, duration };
    });
  }, [manualSlots, slotPreview]);

  const groupedPreview = useMemo(() => groupSlotsByDate(slotPreview, showOnlyUrgent), [slotPreview, showOnlyUrgent]);
  const previewSummary = useMemo(() => {
    const totalSlots = slotPreview.length;
    const totalCapacity = slotPreview.reduce((acc, slot) => acc + (slot.capacity || 0), 0);
    const totalAvailable = slotPreview.reduce((acc, slot) => acc + (slot.available || 0), 0);
    const urgentSlots = slotPreview.filter((slot) => slot.urgent).length;
    return { totalSlots, totalCapacity, totalAvailable, urgentSlots };
  }, [slotPreview]);

  const clearFeedback = () => {
    setError(null);
    setMessage(null);
  };
  const saveRules = async (payload) => {
    if (!providerId) return;
    clearFeedback();
    setSavingRules(true);
    try {
      const res = await apiRequest(`/api/providers/${providerId}/availability`, {
        method: "PUT",
        body: JSON.stringify({ rules: payload }),
      });
      setState((prev) => ({ ...prev, rules: res.rules || [] }));
      setMessage("Disponibilidad actualizada");
      setTimeout(() => setMessage(null), 4000);
      await refreshSlotPreview();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingRules(false);
    }
  };

  const handleAddRule = async (evt) => {
    evt.preventDefault();
    if (!ruleDraft.daysOfWeek.length) {
      setError("Selecciona al menos un dia.");
      return;
    }
    const slotMinutes = Number(ruleDraft.slotMinutes);
    if (!Number.isFinite(slotMinutes) || slotMinutes <= 0) {
      setError("La duracion del turno debe ser mayor a 0.");
      return;
    }
    const bufferMinutes = Number(ruleDraft.bufferMinutes) > 0 ? Number(ruleDraft.bufferMinutes) : 0;
    const maxPerSlot = Number(ruleDraft.maxPerSlot) > 0 ? Number(ruleDraft.maxPerSlot) : 1;
    const maxPerDay =
      ruleDraft.maxPerDay === "" || ruleDraft.maxPerDay === null
        ? undefined
        : Math.max(Number(ruleDraft.maxPerDay), 0);
    const payloadRule = {
      daysOfWeek: [...ruleDraft.daysOfWeek],
      startTime: ruleDraft.startTime,
      endTime: ruleDraft.endTime,
      slotMinutes,
      bufferMinutes,
      maxPerSlot,
      maxPerDay,
      urgent: ruleDraft.urgent,
      active: ruleDraft.active,
      notes: ruleDraft.notes ? ruleDraft.notes.trim() : undefined,
    };
    await saveRules([...(state.rules || []), payloadRule]);
    setRuleDraft((prev) => ({ ...createRuleDraft(), daysOfWeek: prev.daysOfWeek }));
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Eliminar la regla de disponibilidad?")) return;
    await saveRules((state.rules || []).filter((rule) => rule.id !== ruleId));
  };

  const handleToggleRule = async (ruleId, field) => {
    const updated = (state.rules || []).map((rule) =>
      rule.id === ruleId ? { ...rule, [field]: !rule[field] } : rule,
    );
    await saveRules(updated);
  };

  const handleRuleDraftInput = (evt) => {
    const { name, value, type, checked } = evt.target;
    setRuleDraft((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleDraftDay = (code) => {
    setRuleDraft((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(code)
        ? prev.daysOfWeek.filter((item) => item !== code)
        : [...prev.daysOfWeek, code],
    }));
  };
  const handleAddBlackout = async (evt) => {
    evt.preventDefault();
    if (!blackoutDraft.start || !blackoutDraft.end) {
      setError("Completa inicio y fin del bloqueo.");
      return;
    }
    const start = new Date(blackoutDraft.start);
    const end = new Date(blackoutDraft.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError("Las fechas del bloqueo son invalidas.");
      return;
    }
    setSavingBlackout(true);
    try {
      const res = await apiRequest(`/api/providers/${providerId}/blackouts`, {
        method: "POST",
        body: JSON.stringify({ start: start.toISOString(), end: end.toISOString(), reason: blackoutDraft.reason }),
      });
      setState((prev) => ({ ...prev, blackouts: [...(prev.blackouts || []), res.blackout] }));
      setBlackoutDraft({ start: "", end: "", reason: "" });
      await refreshSlotPreview();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingBlackout(false);
    }
  };

  const handleRemoveBlackout = async (blackoutId) => {
    try {
      await apiRequest(`/api/providers/${providerId}/blackouts/${blackoutId}`, { method: "DELETE" });
      setState((prev) => ({
        ...prev,
        blackouts: (prev.blackouts || []).filter((blk) => blk.id !== blackoutId),
      }));
      await refreshSlotPreview();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleManualField = (evt) => {
    const { name, value, type, checked } = evt.target;
    setManualDraft((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddManualSlot = async (evt) => {
    evt.preventDefault();
    if (!manualDraft.date) {
      setManualError("Selecciona una fecha para el turno manual.");
      return;
    }
    const startIso = new Date(`${manualDraft.date}T${manualDraft.startTime}`);
    const endIso = new Date(`${manualDraft.date}T${manualDraft.endTime}`);
    if (Number.isNaN(startIso.getTime()) || Number.isNaN(endIso.getTime()) || endIso <= startIso) {
      setManualError("Revisa el horario seleccionado.");
      return;
    }
    const capacityNumber = Number(manualDraft.capacity) > 0 ? Math.floor(Number(manualDraft.capacity)) : 1;
    setSavingManual(true);
    setManualError(null);
    try {
      await apiRequest(`/api/providers/${providerId}/manual-slots`, {
        method: "POST",
        body: JSON.stringify({
          start: startIso.toISOString(),
          end: endIso.toISOString(),
          label: manualDraft.label,
          urgent: manualDraft.urgent,
          capacity: capacityNumber,
          notes: manualDraft.notes,
        }),
      });
      setManualMessage("Turno manual publicado");
      setManualDraft((prev) => ({ ...createManualDraft(), date: prev.date }));
      await refreshManualSlots();
      await refreshSlotPreview();
      setTimeout(() => setManualMessage(null), 4000);
    } catch (err) {
      setManualError(err.message);
    } finally {
      setSavingManual(false);
    }
  };

  const handleRemoveManualSlot = async (slotId) => {
    if (!window.confirm("Eliminar este turno manual?")) return;
    try {
      await apiRequest(`/api/providers/${providerId}/manual-slots/${slotId}`, { method: "DELETE" });
      await refreshManualSlots();
      await refreshSlotPreview();
    } catch (err) {
      setManualError(err.message);
    }
  };

  const handleRefreshPreview = () => {
    refreshSlotPreview();
  };
  return (
    <section style={{ display: "grid", gap: 24 }}>
      <header style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Disponibilidad y agenda inteligente</h2>
        <p style={{ margin: 0, color: "#555" }}>
          Define tus horarios recurrentes, bloquea feriados, suma turnos manuales para urgencias y controla los cupos publicados.
        </p>
        {loading ? <p style={{ color: "#555" }}>Cargando configuracion...</p> : null}
        {error ? <p style={{ color: "#c62828" }}>{error}</p> : null}
        {message ? <p style={{ color: "#0f6a3b" }}>{message}</p> : null}
      </header>

      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Reglas recurrentes</h3>
        <p style={{ margin: 0, color: "#555" }}>Configura tus horarios base. Puedes activar urgencias y definir buffers entre turnos.</p>
        {sortedRules.length === 0 ? (
          <p style={{ color: "#777" }}>Aun no tienes reglas cargadas.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sortedRules.map((rule) => (
              <div key={rule.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 16, display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <strong>{rule.startTime} - {rule.endTime}</strong>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => handleToggleRule(rule.id, "active")} style={{ padding: "6px 12px", borderRadius: 8, border: rule.active ? "1px solid #0f6a3b" : "1px solid #d1d5db", background: rule.active ? "#ecfdf3" : "#fff", color: rule.active ? "#0f6a3b" : "#374151", cursor: "pointer" }}>
                      {rule.active ? "Activa" : "Inactiva"}
                    </button>
                    <button type="button" onClick={() => handleToggleRule(rule.id, "urgent")} style={{ padding: "6px 12px", borderRadius: 8, border: rule.urgent ? "1px solid #b91c1c" : "1px solid #d1d5db", background: rule.urgent ? "#fef2f2" : "#fff", color: rule.urgent ? "#b91c1c" : "#374151", cursor: "pointer" }}>
                      {rule.urgent ? "Acepta urgencias" : "Sin urgencias"}
                    </button>
                    <button type="button" onClick={() => handleDeleteRule(rule.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ef4444", background: "#fff5f5", color: "#b91c1c", cursor: "pointer" }}>Eliminar</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {rule.daysOfWeek.map((code) => (
                    <span key={code} style={{ background: "#f3f4f6", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>{dayLabel(code)}</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "#555", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span>Duracion: {rule.slotMinutes} min</span>
                  <span>Buffer: {rule.bufferMinutes || 0} min</span>
                  <span>Cupos por turno: {rule.maxPerSlot}</span>
                  {rule.maxPerDay !== undefined ? <span>Cupos diarios: {rule.maxPerDay}</span> : null}
                  {rule.notes ? <span>Notas: {rule.notes}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddRule} style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gap: 14 }}>
          <h4 style={{ margin: 0 }}>Nueva regla de disponibilidad</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DAY_OPTIONS.map((day) => (
              <label key={day.code} style={{ display: "flex", alignItems: "center", gap: 6, background: ruleDraft.daysOfWeek.includes(day.code) ? "var(--accent-soft)" : "#f9fafb", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 12px", fontSize: 13 }}>
                <input type="checkbox" checked={ruleDraft.daysOfWeek.includes(day.code)} onChange={() => toggleDraftDay(day.code)} />
                {day.label}
              </label>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <label>
              Hora inicio
              <input type="time" name="startTime" value={ruleDraft.startTime} onChange={handleRuleDraftInput} required style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
            <label>
              Hora fin
              <input type="time" name="endTime" value={ruleDraft.endTime} onChange={handleRuleDraftInput} required style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
            <label>
              Duracion (min)
              <input type="number" min="10" name="slotMinutes" value={ruleDraft.slotMinutes} onChange={handleRuleDraftInput} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
            <label>
              Buffer (min)
              <input type="number" min="0" name="bufferMinutes" value={ruleDraft.bufferMinutes} onChange={handleRuleDraftInput} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
            <label>
              Cupos por turno
              <input type="number" min="1" name="maxPerSlot" value={ruleDraft.maxPerSlot} onChange={handleRuleDraftInput} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
            <label>
              Cupos diarios (opcional)
              <input type="number" min="0" name="maxPerDay" value={ruleDraft.maxPerDay} onChange={handleRuleDraftInput} placeholder="Ej: 6" style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="urgent" checked={ruleDraft.urgent} onChange={handleRuleDraftInput} /> Permitir urgencias
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="active" checked={ruleDraft.active} onChange={handleRuleDraftInput} /> Regla activa
          </label>
          <label>
            Notas internas (opcional)
            <textarea name="notes" value={ruleDraft.notes} onChange={handleRuleDraftInput} rows={3} placeholder="Ej. solo clientes fidelizados" style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", fontFamily: "inherit" }} />
          </label>
          <button type="submit" disabled={savingRules} style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 600, cursor: "pointer", opacity: savingRules ? 0.7 : 1 }}>
            {savingRules ? "Guardando..." : "Agregar regla"}
          </button>
        </form>
      </div>
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Bloqueos temporales</h3>
        <p style={{ margin: 0, color: "#555" }}>Usalos para vacaciones, capacitaciones o cortes de servicio. Durante ese rango no se publican turnos.</p>
        <form onSubmit={handleAddBlackout} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            Inicio
            <input type="datetime-local" value={blackoutDraft.start} onChange={(e) => setBlackoutDraft((prev) => ({ ...prev, start: e.target.value }))} required style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            Fin
            <input type="datetime-local" value={blackoutDraft.end} onChange={(e) => setBlackoutDraft((prev) => ({ ...prev, end: e.target.value }))} required style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
          </label>
          <label style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 4 }}>
            Motivo (opcional)
            <input type="text" value={blackoutDraft.reason} onChange={(e) => setBlackoutDraft((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Vacaciones, inventario, etc" style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
          </label>
          <button type="submit" disabled={savingBlackout} style={{ background: "#0f6a3b", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>
            {savingBlackout ? "Guardando..." : "Agregar bloqueo"}
          </button>
        </form>
        <div style={{ display: "grid", gap: 10 }}>
          {sortedBlackouts.length === 0 ? (
            <p style={{ color: "#777" }}>No hay bloqueos cargados.</p>
          ) : (
            sortedBlackouts.map((blk) => (
              <div key={blk.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ color: "#555", fontSize: 14 }}>
                  <strong>{formatDateTime(blk.start)}</strong> - <strong>{formatDateTime(blk.end)}</strong>
                  {blk.reason ? <span style={{ marginLeft: 8 }}>({blk.reason})</span> : null}
                </div>
                <button type="button" onClick={() => handleRemoveBlackout(blk.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ef4444", background: "#fff5f5", color: "#b91c1c", cursor: "pointer" }}>Quitar</button>
              </div>
            ))
          )}
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Turnos manuales y urgencias</h3>
        <p style={{ margin: 0, color: "#555" }}>Publica slots puntuales para cubrir urgencias o eventos especiales. Puedes eliminarlos si aun no fueron reservados.</p>
        <form onSubmit={handleAddManualSlot} style={{ display: "grid", gap: 12, border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <label>
              Fecha
              <input type="date" name="date" value={manualDraft.date} onChange={handleManualField} required style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
            <label>
              Desde
              <input type="time" name="startTime" value={manualDraft.startTime} onChange={handleManualField} required style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
            <label>
              Hasta
              <input type="time" name="endTime" value={manualDraft.endTime} onChange={handleManualField} required style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
            <label>
              Cupos
              <input type="number" min="1" name="capacity" value={manualDraft.capacity} onChange={handleManualField} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </label>
          </div>
          <label>
            Titulo (opcional)
            <input type="text" name="label" value={manualDraft.label} onChange={handleManualField} placeholder="Ej. Guardia domingo" style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }} />
          </label>
          <label>
            Notas internas (opcional)
            <textarea name="notes" value={manualDraft.notes} onChange={handleManualField} rows={3} placeholder="Ej. llevar herramientas especiales" style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", fontFamily: "inherit" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="urgent" checked={manualDraft.urgent} onChange={handleManualField} /> Marcar como urgencia
          </label>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="submit" disabled={savingManual} style={{ background: "#0f6a3b", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, cursor: "pointer", opacity: savingManual ? 0.7 : 1 }}>
              {savingManual ? "Publicando..." : "Publicar turno manual"}
            </button>
            {manualMessage ? <span style={{ color: "#0f6a3b" }}>{manualMessage}</span> : null}
            {manualError ? <span style={{ color: "#b91c1c" }}>{manualError}</span> : null}
          </div>
        </form>
        <div style={{ display: "grid", gap: 10 }}>
          {manualSlotsWithStatus.length === 0 ? (
            <p style={{ color: "#777" }}>No hay turnos manuales cargados.</p>
          ) : (
            manualSlotsWithStatus.map((slot) => (
              <div key={slot.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 14, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 600 }}>
                    {formatDateLabel(slot.start ? slot.start.slice(0, 10) : slot.date)} - {formatSlotRange(slot.start, slot.end, slot.label)}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "#555" }}>Cupos usados: {slot.taken}/{slot.capacity}</span>
                    {slot.urgent ? <span style={{ background: "#fef2f2", color: "#b91c1c", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>Urgencia</span> : null}
                    <button type="button" onClick={() => handleRemoveManualSlot(slot.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ef4444", background: "#fff5f5", color: "#b91c1c", cursor: "pointer" }}>Eliminar</button>
                  </div>
                </div>
                {slot.notes ? <div style={{ fontSize: 13, color: "#555" }}>Notas: {slot.notes}</div> : null}
              </div>
            ))
          )}
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Vista previa de turnos publicados</h3>
        <p style={{ margin: 0, color: "#555" }}>Asi veran tus clientes la agenda. Actualiza luego de modificar reglas o turnos manuales.</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={handleRefreshPreview} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>Actualizar vista</button>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
            <input type="checkbox" checked={showOnlyUrgent} onChange={(e) => setShowOnlyUrgent(e.target.checked)} /> Mostrar solo urgencias
          </label>
          <span style={{ fontSize: 13, color: "#555" }}>
            Slots: {previewSummary.totalSlots} - Disponibles: {previewSummary.totalAvailable}/{previewSummary.totalCapacity} - Urgencias: {previewSummary.urgentSlots}
          </span>
        </div>
        {loadingPreview ? (
          <p style={{ color: "#555" }}>Calculando disponibilidad...</p>
        ) : previewError ? (
          <p style={{ color: "#b91c1c" }}>{previewError}</p>
        ) : groupedPreview.length === 0 ? (
          <p style={{ color: "#777" }}>No hay slots publicados en este rango.</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {groupedPreview.slice(0, 7).map((group) => (
              <div key={group.date} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, display: "grid", gap: 8 }}>
                <strong style={{ textTransform: "capitalize" }}>{formatDateLabel(group.date)}</strong>
                <div style={{ display: "grid", gap: 6 }}>
                  {group.slots.map((slot) => (
                    <div key={slot.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#374151", background: "#f9fafb", borderRadius: 10, padding: "8px 12px", gap: 12, flexWrap: "wrap" }}>
                      <span>{formatSlotRange(slot.start, slot.end, slot.label)}</span>
                      <span style={{ color: slot.available > 0 ? "#0f6a3b" : "#b91c1c" }}>Disponibles: {slot.available}/{slot.capacity}</span>
                      {slot.source === "MANUAL" ? <span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 999, padding: "2px 8px", fontSize: 11 }}>Manual</span> : null}
                      {slot.urgent ? <span style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 999, padding: "2px 8px", fontSize: 11 }}>Urgencia</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProviderAvailability;


