"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
const priceFmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const groupSlotsByDate = (slots) => {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  const map = new Map();
  slots.forEach((slot) => {
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

export default function RequestServicePage() {
  const router = useRouter();
  const { serviceId } = router.query;
  const providerId = router.query.providerId;
  const { user, apiRequest } = useAuth();

  const [service, setService] = useState(null);
  const [providerName, setProviderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  const [mode, setMode] = useState('slot');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [manualSchedule, setManualSchedule] = useState({ date: '', startTime: '', endTime: '' });
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (!providerId) return;
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const res = await apiRequest(`/api/providers/${providerId}/slots?days=21`);
      const items = res.slots || [];
      setSlots(items);
      const firstAvailable = items.find((slot) => slot.available > 0);
      setSelectedSlotId((prev) => (prev && items.some((slot) => slot.id === prev && slot.available > 0) ? prev : firstAvailable?.id || ''));
    } catch (err) {
      setSlotsError(err.message);
    } finally {
      setSlotsLoading(false);
    }
  }, [providerId, apiRequest]);

  useEffect(() => {
    if (!serviceId || !providerId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/providers/${providerId}/public`);
        const payload = await res.json();
        if (!res.ok || payload.ok === false) throw new Error(payload.error || 'No se pudo obtener el servicio');
        const found = (payload.services || []).find((srv) => srv.id === serviceId);
        if (!found) throw new Error('Servicio no disponible.');
        setService(found);
        setProviderName(payload.owner?.name || payload.owner?.email || 'Prestador');
        await fetchSlots();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [serviceId, providerId, fetchSlots]);

  const priceLabel = useMemo(() => (service ? priceFmt.format((service.price || 0) / 100) : ''), [service]);

  const filteredSlots = useMemo(() => (showUrgentOnly ? slots.filter((slot) => slot.urgent) : slots), [slots, showUrgentOnly]);
  const groupedSlots = useMemo(() => groupSlotsByDate(filteredSlots), [filteredSlots]);

  const handleManualChange = (evt) => {
    const { name, value } = evt.target;
    setManualSchedule((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!service || !providerId) return;
    setMessage(null);
    setError(null);

    try {
      let schedule;
      if (mode === 'slot') {
        if (!selectedSlotId) {
          setError('Selecciona un horario disponible.');
          return;
        }
        schedule = { slotId: selectedSlotId, urgent: isUrgent };
      } else {
        if (!manualSchedule.date || !manualSchedule.startTime || !manualSchedule.endTime) {
          setError('Completa la fecha y el horario propuesto.');
          return;
        }
        const start = new Date(`${manualSchedule.date}T${manualSchedule.startTime}`);
        const end = new Date(`${manualSchedule.date}T${manualSchedule.endTime}`);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
          setError('Revisa el rango horario indicado.');
          return;
        }
        schedule = {
          date: manualSchedule.date,
          start: start.toISOString(),
          end: end.toISOString(),
          timeSlot: `${manualSchedule.startTime} - ${manualSchedule.endTime}`,
          label: 'Horario propuesto',
          urgent: isUrgent,
        };
      }

      await apiRequest('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: service.id,
          providerId,
          clientId: user?.id || 'usr_demo_client',
          schedule,
          notes,
        }),
      });

      setMessage('Solicitud enviada. El prestador confirmara horario y detalles.');
      setNotes('');
      setIsUrgent(false);
      if (mode === 'slot') {
        await fetchSlots();
      } else {
        setManualSchedule({ date: '', startTime: '', endTime: '' });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Head>
        <title>Solicitar servicio - OficiosYa</title>
      </Head>
      <NavBar />
      <main style={{ maxWidth: 780, margin: '32px auto', padding: '0 16px 80px', display: 'grid', gap: 24 }}>
        {loading && <p>Cargando informacion.</p>}
        {error && <p style={{ color: '#c62828' }}>{error}</p>}
        {!loading && !error && service && (
          <>
            <section style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: 24, display: 'grid', gap: 12 }}>
              <h1 style={{ margin: 0 }}>Solicitar: {service.catalog?.nombre || 'Servicio'}</h1>
              <p style={{ margin: 0, color: '#555' }}>Prestador: {providerName}</p>
              <p style={{ margin: 0, color: '#555' }}>Precio pactado: {priceLabel}</p>
              <p style={{ margin: 0, color: '#666' }}>{service.notes || 'Sin descripcion adicional.'}</p>
            </section>

            <section style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: 24, display: 'grid', gap: 16 }}>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
                <h2 style={{ margin: 0 }}>Coordinacion del turno</h2>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setMode('slot')} style={{ padding: '8px 18px', borderRadius: 999, border: mode === 'slot' ? '1px solid #2563eb' : '1px solid var(--border)', background: mode === 'slot' ? '#2563eb' : '#fff', color: mode === 'slot' ? '#fff' : '#374151', fontWeight: 600, cursor: 'pointer' }}>
                    Usar agenda disponible
                  </button>
                  <button type="button" onClick={() => setMode('manual')} style={{ padding: '8px 18px', borderRadius: 999, border: mode === 'manual' ? '1px solid #2563eb' : '1px solid var(--border)', background: mode === 'manual' ? '#2563eb' : '#fff', color: mode === 'manual' ? '#fff' : '#374151', fontWeight: 600, cursor: 'pointer' }}>
                    Proponer horario
                  </button>
                </div>

                {mode === 'slot' ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button type="button" onClick={fetchSlots} disabled={slotsLoading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 600, cursor: 'pointer', opacity: slotsLoading ? 0.7 : 1 }}>
                        {slotsLoading ? 'Actualizando...' : 'Actualizar agenda'}
                      </button>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                        <input type="checkbox" checked={showUrgentOnly} onChange={(e) => setShowUrgentOnly(e.target.checked)} /> Ver solo urgencias
                      </label>
                      {slotsError && <span style={{ color: '#b91c1c', fontSize: 13 }}>{slotsError}</span>}
                    </div>

                    {groupedSlots.length === 0 ? (
                      <p style={{ color: '#777' }}>No hay turnos publicados en los proximos dias.</p>
                    ) : (
                      groupedSlots.map((group) => (
                        <div key={group.date} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14, display: 'grid', gap: 10 }}>
                          <strong style={{ textTransform: 'capitalize' }}>{formatDateLabel(group.date)}</strong>
                          <div style={{ display: 'grid', gap: 8 }}>
                            {group.slots.map((slot) => (
                              <label key={slot.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center', padding: '10px 12px', borderRadius: 12, border: selectedSlotId === slot.id ? '1px solid #2563eb' : '1px solid var(--border)', background: selectedSlotId === slot.id ? '#eff6ff' : '#f9fafb', opacity: slot.available > 0 ? 1 : 0.6 }}>
                                <input type="radio" name="slotId" value={slot.id} checked={selectedSlotId === slot.id} onChange={() => setSelectedSlotId(slot.id)} disabled={slot.available <= 0} />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                  <span style={{ fontWeight: 600 }}>{formatSlotRange(slot.start, slot.end, slot.label)}</span>
                                  <span style={{ fontSize: 13, color: slot.available > 0 ? '#0f6a3b' : '#b91c1c' }}>Disponibles: {slot.available}/{slot.capacity}</span>
                                  {slot.source === 'MANUAL' ? <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>Manual</span> : null}
                                  {slot.urgent ? <span style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>Urgencia</span> : null}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <label>
                      Fecha
                      <input type="date" name="date" value={manualSchedule.date} onChange={handleManualChange} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }} />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                      <label>
                        Desde
                        <input type="time" name="startTime" value={manualSchedule.startTime} onChange={handleManualChange} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }} />
                      </label>
                      <label>
                        Hasta
                        <input type="time" name="endTime" value={manualSchedule.endTime} onChange={handleManualChange} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }} />
                      </label>
                    </div>
                  </div>
                )}

                <label>
                  Notas adicionales (opcional)
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Incluye detalles del acceso, mascotas, urgencia, etc." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', fontFamily: 'inherit' }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} /> Marcar solicitud como urgencia
                </label>

                <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 600, cursor: 'pointer' }}>
                  Enviar solicitud
                </button>
                {message && <span style={{ color: '#16a34a' }}>{message}</span>}
                {error && <span style={{ color: '#c62828' }}>{error}</span>}
                {!user && <p style={{ color: '#777', fontSize: 13 }}>Inicia sesion para seguir el estado de tus solicitudes en tu panel.</p>}
              </form>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

