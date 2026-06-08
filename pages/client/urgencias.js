/**
 * pages/client/urgencias.js
 * Urgencias 24/7 — con recargos por franja horaria y calculadora live
 * Franjas: 07-19h base · 19-23h +20% nocturno · 23-07h +50% urgencia nocturna
 */
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const navItems = [
  { href: "/client/dashboard",  label: "Panel general" },
  { href: "/client/urgencias",  label: "Urgencias 24/7", badge: "24/7" },
  { href: "/client/contratos",  label: "Contratos y seguros" },
  { href: "/client/facturacion",label: "Pagos y facturas" },
  { href: "/client/reclamos",   label: "Reclamos" },
  { href: "/chat",              label: "Chat" },
];

/* ── Franjas horarias con recargos ─────────────────────────────────── */
const FRANJAS = [
  {
    id: "diurno",
    label: "Horario diurno",
    rango: "07:00 — 19:00",
    icon: "☀️",
    recargo: 0,
    color: V,
    bg: "#F0FDF4",
    badge: "PRECIO BASE",
    desc: "Sin recargo adicional. Tarifa estándar del prestador.",
  },
  {
    id: "nocturno",
    label: "Horario nocturno",
    rango: "19:00 — 23:00",
    icon: "🌙",
    recargo: 20,
    color: G,
    bg: "#FFFBEB",
    badge: "+20% NOCTURNO",
    desc: "Recargo del 20% sobre la tarifa base del servicio.",
  },
  {
    id: "madrugada",
    label: "Urgencia nocturna",
    rango: "23:00 — 07:00",
    icon: "🌙🔴",
    recargo: 50,
    color: "#DC2626",
    bg: "#FEF2F2",
    badge: "+50% URGENCIA",
    desc: "Recargo del 50% sobre la tarifa base. Solo para emergencias reales.",
  },
];

/* ── Tipos de urgencia disponibles ─────────────────────────────────── */
const TIPOS_URGENCIA = [
  { id: "gas",        icon: "🔥", label: "Fuga de gas",         matricula: true,  eta: "10-20 min" },
  { id: "electrico",  icon: "⚡", label: "Corte eléctrico",     matricula: true,  eta: "15-30 min" },
  { id: "plomeria",   icon: "💧", label: "Pérdida de agua",     matricula: false, eta: "20-35 min" },
  { id: "cerrajeria", icon: "🔑", label: "Apertura sin llave",  matricula: false, eta: "10-25 min" },
  { id: "techado",    icon: "🏠", label: "Gotera urgente",      matricula: false, eta: "30-60 min" },
  { id: "mecanico",   icon: "🚗", label: "Auxilio en ruta",     matricula: false, eta: "20-40 min" },
];

/* ── Prestadores demo disponibles ahora ────────────────────────────── */
const PRESTADORES_NOW = [
  { name: "Gasista Express Palermo",   eta: "12 min", zone: "Palermo · Belgrano · Núñez",    mat: "ENARGAS GN-54123", rating: 4.9, jobs: 312 },
  { name: "Cerrajería 24 Hs CABA",    eta: "18 min", zone: "CABA Centro · Microcentro",       mat: "CRA-88771",        rating: 4.8, jobs: 216 },
  { name: "Electricista Urgencias BA", eta: "22 min", zone: "CABA + GBA Norte",               mat: "MAT-ELEC-7721",    rating: 4.9, jobs: 445 },
  { name: "Remolque Urbano",           eta: "28 min", zone: "CABA + GBA Zona Norte y Oeste",  mat: "Seguro RC vigente", rating: 4.7, jobs: 189 },
];

/* ── Pasos del flujo de urgencia ───────────────────────────────────── */
const PASOS = [
  { n: "01", icon: "📱", title: "Seleccioná el tipo",     desc: "Gas, electricidad, plomería, cerrajería o mecánica." },
  { n: "02", icon: "📍", title: "Confirmá tu ubicación", desc: "GPS automático + validación de dirección." },
  { n: "03", icon: "🔐", title: "Seña 50% en custodia",  desc: "El pago queda retenido hasta confirmar el trabajo con fotos." },
  { n: "04", icon: "✅", title: "Confirmás y calificás",  desc: "Cargás fotos del resultado. Se libera el pago al prestador." },
];

/* ── Calculadora live de precios ────────────────────────────────────── */
function getRecargoFranja(hora) {
  if (hora >= 7 && hora < 19) return { franja: "diurno",    recargo: 0 };
  if (hora >= 19 && hora < 23) return { franja: "nocturno", recargo: 20 };
  return { franja: "madrugada", recargo: 50 };
}

export default function ClientUrgencias() {
  const [precioBase, setPrecioBase] = useState(15000);
  const [horaActual, setHoraActual] = useState(new Date().getHours());
  const [tipoSeleccionado, setTipoSeleccionado] = useState("gas");

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date().getHours()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { franja, recargo } = getRecargoFranja(horaActual);
  const franjaActual = FRANJAS.find(f => f.id === franja);
  const precioFinal = Math.round(precioBase * (1 + recargo / 100));

  return (
    <>
      <Head><title>Urgencias 24/7 · OficiosYa</title></Head>
      <NavBar />
      <DashboardShell
        title="Urgencias 24/7"
        subtitle="Prestadores matriculados disponibles ahora. Precios con recargo por franja horaria."
        navItems={navItems}
        active="/client/urgencias"
      >

        {/* ── Alerta franja actual ─────────────────────────────────── */}
        <div style={{ background: franjaActual.bg, border: `2px solid ${franjaActual.color}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 32 }}>{franjaActual.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: franjaActual.color, fontSize: 15 }}>
              Ahora: {franjaActual.label} ({franjaActual.rango})
            </div>
            <div style={{ fontSize: 13, color: "#374151" }}>{franjaActual.desc}</div>
          </div>
          <div style={{ background: franjaActual.color, color: "#fff", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 800 }}>
            {franjaActual.badge}
          </div>
        </div>

        {/* ── Calculadora de precios ──────────────────────────────── */}
        <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: F }}>🧮 Calculadora de precio urgencia</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: F, display: "block", marginBottom: 6 }}>Precio base estimado (mano de obra)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#6B7C6E" }}>$</span>
                <input
                  type="number"
                  value={precioBase}
                  onChange={e => setPrecioBase(Number(e.target.value) || 0)}
                  min={0}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none" }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: F, display: "block", marginBottom: 6 }}>Hora de solicitud</label>
              <input
                type="number"
                min={0} max={23}
                value={horaActual}
                onChange={e => setHoraActual(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none" }}
              />
            </div>
            <div style={{ background: F, borderRadius: 14, padding: "16px 20px", color: "#fff" }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Precio urgencia final</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>${precioFinal.toLocaleString("es-AR")}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                {recargo > 0 ? `Incluye recargo +${recargo}% (franja ${franjaActual.label.toLowerCase()})` : "Sin recargo — horario diurno"}
              </div>
            </div>
          </div>

          {/* Tabla de franjas */}
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {FRANJAS.map(f => (
              <div key={f.id} style={{ background: f.id === franja ? f.bg : "#F7F9F5", border: `1.5px solid ${f.id === franja ? f.color : "#D4E0D6"}`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontWeight: 800, color: f.color, fontSize: 13, marginBottom: 2 }}>{f.icon} {f.label}</div>
                <div style={{ fontSize: 12, color: "#6B7C6E", marginBottom: 4 }}>{f.rango}</div>
                <div style={{ background: f.color, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>{f.badge}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tipos de urgencia ────────────────────────────────────── */}
        <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: F }}>⚡ Tipo de urgencia</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
            {TIPOS_URGENCIA.map(tipo => (
              <button
                key={tipo.id}
                onClick={() => setTipoSeleccionado(tipo.id)}
                style={{ background: tipoSeleccionado === tipo.id ? "#F0FDF4" : "#F7F9F5", border: `2px solid ${tipoSeleccionado === tipo.id ? V : "#D4E0D6"}`, borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "all .15s" }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{tipo.icon}</div>
                <div style={{ fontWeight: 700, color: F, fontSize: 13, marginBottom: 2 }}>{tipo.label}</div>
                <div style={{ fontSize: 11, color: "#6B7C6E" }}>ETA: {tipo.eta}</div>
                {tipo.matricula && <div style={{ fontSize: 10, background: "#DBEAFE", color: "#1D4ED8", borderRadius: 4, padding: "2px 6px", display: "inline-block", marginTop: 4, fontWeight: 700 }}>MATRÍCULA REQ.</div>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Prestadores disponibles ahora ─────────────────────────── */}
        <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: F }}>🟢 Prestadores disponibles ahora</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#16A34A", fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, background: V, borderRadius: "50%", display: "inline-block" }}></span>
              Actualizado hace 2 min
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PRESTADORES_NOW.map(p => (
              <div key={p.name} style={{ border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, color: F, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7C6E", marginBottom: 6 }}>📍 {p.zone}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#F0FDF4", color: "#166534", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⏱️ {p.eta}</span>
                    <span style={{ background: "#F7F9F5", color: F, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>⭐ {p.rating} ({p.jobs} trabajos)</span>
                    <span style={{ background: "#FFFBEB", color: "#92400E", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{p.mat}</span>
                  </div>
                </div>
                <button style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Llamar →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Flujo de urgencia ────────────────────────────────────── */}
        <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: F }}>📋 ¿Cómo funciona?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            {PASOS.map(paso => (
              <div key={paso.n} style={{ background: "#F7F9F5", borderRadius: 14, padding: "16px" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{paso.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: V, marginBottom: 4 }}>PASO {paso.n}</div>
                <div style={{ fontWeight: 800, color: F, fontSize: 14, marginBottom: 6 }}>{paso.title}</div>
                <div style={{ fontSize: 12, color: "#6B7C6E", lineHeight: 1.5 }}>{paso.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SLA + Antifraude ─────────────────────────────────────── */}
        <div style={{ background: "#FEF2F2", border: "1.5px solid rgba(220,38,38,0.2)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontWeight: 800, color: "#991B1B", fontSize: 14, marginBottom: 8 }}>⚠️ SLA de urgencias y penalidades</div>
          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
            Si el prestador no acepta en <strong>2 minutos</strong>, se reenvía automáticamente a los siguientes disponibles. El prestador que no se presenta sin aviso sufre:
            suspensión de 7 días · descenso en el ranking · retención del pago.{" "}
            <strong>Queda prohibido acordar pagos fuera de la plataforma</strong> durante los 12 meses posteriores al primer contacto en OficiosYa.
          </div>
        </div>

      </DashboardShell>
      <Footer />
    </>
  );
}
