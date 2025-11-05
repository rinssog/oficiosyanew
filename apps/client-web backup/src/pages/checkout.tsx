import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function CheckoutPage() {
  const { user, apiRequest } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subs, setSubs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  // demo: totals pueden venir por query
  const [totals, setTotals] = useState({ labor: 0, materials: 0, urgent: false, providerId: '' });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const labor = Number(q.get('labor') || 0);
    const materials = Number(q.get('materials') || 0);
    const urgent = String(q.get('urgent') || '').toLowerCase() === 'true';
    const providerId = String(q.get('providerId') || '');
    setTotals({ labor, materials, urgent, providerId });
  }, []);

  useEffect(() => {
    fetch(API_BASE + '/api/plans').then(r=>r.json()).then(d=> setPlans(d.plans || [])).catch(()=>{});
    if (user?.id) {
      apiRequest(`/api/users/${user.id}/subscriptions`).then(d=> setSubs(d.subscriptions || [])).catch(()=>{});
    }
  }, [user, apiRequest]);

  const base = useMemo(()=> (Number(totals.labor)||0) + (Number(totals.materials)||0), [totals]);
  const currentCommissionPct = 0.15; // Base
  const currentLead = 700;
  const currentFee = Math.round(base * currentCommissionPct) + currentLead;

  const suggested = useMemo(() => {
    if (!Array.isArray(plans) || plans.length === 0) return null;
    // Elegir el plan con menor comisión efectiva
    const scored = plans.map(p => ({
      id: p.id, name: p.name, priceMonthly: p.priceMonthly || 0, commissionPct: p.commissionPct || 0.15, leadFee: p.leadFee || 0,
      fee: Math.round(base * (p.commissionPct || 0.15)) + (p.leadFee || 0)
    }));
    scored.sort((a,b)=> a.fee - b.fee);
    return scored[0];
  }, [plans, base]);

  const savings = useMemo(() => suggested ? Math.max(currentFee - suggested.fee, 0) : 0, [suggested, currentFee]);

  const checkout = async () => {
    setBusy(true); setError(null); setMsg(null);
    try {
      const res = await apiRequest('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id, providerId: totals.providerId, totals, urgent: totals.urgent })
      });
      setMsg('Checkout creado. Redirigiendo...');
      if (res.redirectUrl) window.location.href = res.redirectUrl;
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const subscribe = async (planId) => {
    if (!user?.id) return;
    setBusy(true); setError(null); setMsg(null);
    try {
      await apiRequest(`/api/users/${user.id}/subscriptions`, { method: 'POST', body: JSON.stringify({ planId }) });
      setMsg('Suscripción activada');
      const d = await apiRequest(`/api/users/${user.id}/subscriptions`);
      setSubs(d.subscriptions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Head><title>Checkout | OficiosYa</title></Head>
      <NavBar />
      <main style={{ maxWidth: 980, margin: '24px auto', padding: '0 16px 72px', display: 'grid', gap: 16 }}>
        <h1>Checkout</h1>
        <section style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'grid', gap: 12 }}>
          <strong>Resumen</strong>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>Mano de obra: ${ (Number(totals.labor)/100).toFixed(2) }</span>
            <span>Materiales: ${ (Number(totals.materials)/100).toFixed(2) }</span>
            <span>Fee plataforma (plan actual): ${ (currentFee/100).toFixed(2) }</span>
            {totals.urgent && <span style={{ color: '#b45309' }}>Retención operativa: 50% (no seña)</span>}
            <strong>Total estimado: ${ ((base + currentFee)/100).toFixed(2) }</strong>
          </div>
        </section>

        {suggested && (
          <section style={{ background: '#f8fff3', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'grid', gap: 10 }}>
            <strong>Ahorrá con suscripción</strong>
            <span>Con el plan {suggested.name} pagarías fee de ${ (suggested.fee/100).toFixed(2) } en lugar de ${ (currentFee/100).toFixed(2) }.</span>
            {savings > 0 && <span style={{ color: '#166534', fontWeight: 700 }}>Ahorro estimado por trabajo: ${ (savings/100).toFixed(2) }</span>}
            {user ? (
              <button onClick={() => subscribe(suggested.id)} disabled={busy} style={{ alignSelf: 'start', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 600 }}>Suscribirme al plan {suggested.name}</button>
            ) : (
              <Link href="/auth/login" style={{ color: 'var(--primary-700)' }}>Ingresá para suscribirte</Link>
            )}
          </section>
        )}

        <section style={{ display: 'grid', gap: 10 }}>
          <button onClick={checkout} disabled={busy || !user} style={{ alignSelf: 'start', background: '#111827', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700 }}>
            {busy ? 'Procesando…' : 'Confirmar y pagar'}
          </button>
          {!user && <span style={{ color: '#b91c1c' }}>Ingresá para confirmar el pago</span>}
          {msg && <span style={{ color: '#166534' }}>{msg}</span>}
          {error && <span style={{ color: '#b91c1c' }}>{error}</span>}
          <small style={{ color: '#555' }}>
            Transparencia de precios: mostramos mano de obra, materiales y tarifa de plataforma. La retención operativa del 50% (si aplica) no constituye seña.
          </small>
        </section>
      </main>
      <Footer />
    </div>
  );
}

