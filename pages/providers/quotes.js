/**
 * pages/providers/quotes.js — Envío de presupuestos
 */
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const PROVIDER_NAV = [
  { href: "/providers/dashboard",      label: "Mi panel" },
  { href: "/providers/solicitudes",    label: "Solicitudes" },
  { href: "/providers/quotes",         label: "Presupuestos" },
  { href: "/providers/verificacion",   label: "Verificación" },
  { href: "/chat",                     label: "Chat" },
];

const KINDS = [
  { value: "LABOR",    label: "Mano de obra" },
  { value: "MATERIAL", label: "Material" },
  { value: "PART",     label: "Repuesto/Pieza" },
  { value: "OTHER",    label: "Otro" },
];

const EMPTY_ROW = { kind: "LABOR", description: "", qty: 1, unit: "", total: "" };

async function uploadFile(file, token) {
  const fd = new FormData();
  fd.append("file", file);
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/files/upload`, { method: "POST", body: fd, headers });
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(data.error || "No se pudo subir el archivo");
  return data.url;
}

const fmt = v => {
  const n = Number(v);
  if (!n) return "";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
};

export default function ProviderQuotesPage() {
  const router = useRouter();
  const { user, provider, token, refreshProvider, apiRequest, isReady } = useAuth();

  const [requestId, setRequestId] = useState("");
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [message, setMessage] = useState(null);
  const [error,   setError]   = useState(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    if (router.query.requestId) setRequestId(router.query.requestId);
  }, [router.query.requestId]);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "PROVIDER") { router.replace("/"); return; }
    if (!provider) refreshProvider(user.id);
  }, [isReady, user, provider]);

  const totals = useMemo(() => {
    const byKind = (k) => rows.filter(r => r.kind === k).reduce((a, b) => a + (Number(b.total) || 0), 0);
    return {
      labor:     byKind("LABOR"),
      materials: byKind("MATERIAL") + byKind("PART"),
      other:     byKind("OTHER"),
      grand:     rows.reduce((a, b) => a + (Number(b.total) || 0), 0),
    };
  }, [rows]);

  const updateRow = (idx, patch) =>
    setRows(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const merged = { ...r, ...patch };
      // Auto-calc total from qty × unit when both change
      if ("unit" in patch || "qty" in patch) {
        const u = Number("unit" in patch ? patch.unit : r.unit) || 0;
        const q = Number("qty" in patch ? patch.qty : r.qty) || 1;
        merged.total = u > 0 ? String(u * q) : merged.total;
      }
      return merged;
    }));

  const addRow = () => setRows(prev => [...prev, { ...EMPTY_ROW }]);
  const removeRow = idx => setRows(prev => prev.filter((_, i) => i !== idx));

  const handleUpload = async (idx, file) => {
    setUploading(u => ({ ...u, [idx]: true }));
    try {
      const url = await uploadFile(file, token);
      updateRow(idx, { attachmentUrl: url });
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(u => ({ ...u, [idx]: false }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!requestId.trim()) { setError("Ingresá el ID de la solicitud"); return; }
    if (!provider?.id)     { setError("No se encontró el perfil de prestador. Reintentá."); return; }
    const items = rows
      .filter(r => r.description.trim())
      .map(r => ({
        kind: r.kind,
        description: r.description,
        qty: Number(r.qty) || 1,
        unit:  Math.round(Number(r.unit)  * 100) || 0,
        total: Math.round(Number(r.total) * 100) || 0,
        ...(r.attachmentUrl ? { attachmentUrl: r.attachmentUrl } : {}),
      }));
    if (items.length === 0) { setError("Agregá al menos un ítem con descripción"); return; }
    setSending(true);
    try {
      const data = await apiRequest("/api/quotes", {
        method: "POST",
        body: JSON.stringify({ requestId: requestId.trim(), providerId: provider.id, items }),
      });
      setMessage(`✅ Presupuesto enviado — ID: ${data.quote?.id || "ok"}. El cliente recibirá notificación.`);
      setRows([{ ...EMPTY_ROW }]);
      setRequestId("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  if (!isReady || !user || user.role !== "PROVIDER") return null;

  return (
    <>
      <Head><title>Enviar Presupuesto · OficiosYa</title></Head>
      <NavBar />
      <DashboardShell
        title="Enviar presupuesto"
        subtitle="Detallá mano de obra, materiales y repuestos. El cliente puede aceptar o contraofertar."
        navItems={PROVIDER_NAV}
        active="/providers/quotes"
      >
        {message && <div className="alert alert-success">{message}</div>}
        {error   && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Request ID */}
          <div className="card-flat">
            <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 700, color: F }}>
              ID de la solicitud *
              <input
                value={requestId}
                onChange={e => setRequestId(e.target.value)}
                placeholder="ej: req_abc123"
                required
                style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 14, outline: "none" }}
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>
                Podés copiarlo desde la página de solicitudes o viene pre-cargado si llegaste desde &quot;Enviar presupuesto&quot;.
              </span>
            </label>
          </div>

          {/* Items table */}
          <div className="card-flat">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: F }}>Ítems del presupuesto</h3>
              <button type="button" onClick={addRow} className="btn btn-ghost btn-sm">+ Agregar ítem</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((row, idx) => (
                <div key={idx} style={{ border: "1.5px solid #D4E0D6", borderRadius: 12, padding: "14px 16px", display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F }}>
                      Tipo
                      <select
                        value={row.kind}
                        onChange={e => updateRow(idx, { kind: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, marginTop: 4, background: "#fff" }}
                      >
                        {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                      </select>
                    </label>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F }}>
                      Descripción *
                      <input
                        value={row.description}
                        onChange={e => updateRow(idx, { description: e.target.value })}
                        placeholder="Ej: Diagnóstico y reparación de pérdida"
                        required
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, marginTop: 4, outline: "none" }}
                      />
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F }}>
                      Cantidad
                      <input type="number" min="1" value={row.qty}
                        onChange={e => updateRow(idx, { qty: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, marginTop: 4, outline: "none" }} />
                    </label>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F }}>
                      P. unitario (ARS)
                      <input type="number" min="0" value={row.unit}
                        onChange={e => updateRow(idx, { unit: e.target.value })}
                        placeholder="0"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, marginTop: 4, outline: "none" }} />
                    </label>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F }}>
                      Total (ARS)
                      <input type="number" min="0" value={row.total}
                        onChange={e => updateRow(idx, { total: e.target.value })}
                        placeholder="0"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, marginTop: 4, outline: "none" }} />
                    </label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <span>📎</span>
                      {row.attachmentUrl
                        ? <span style={{ color: V, fontWeight: 700 }}>Archivo adjunto ✅</span>
                        : uploading[idx]
                          ? <span>Subiendo...</span>
                          : <span>Adjuntar foto/factura (opcional)</span>}
                      <input type="file" accept="image/*,application/pdf" style={{ display: "none" }}
                        onChange={e => e.target.files?.[0] && handleUpload(idx, e.target.files[0])} />
                    </label>
                    {rows.length > 1 && (
                      <button type="button" onClick={() => removeRow(idx)}
                        style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="card-flat" style={{ background: "#F0FDF4", border: "1.5px solid rgba(22,163,74,0.3)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              {[
                { label: "Mano de obra", value: totals.labor },
                { label: "Materiales",   value: totals.materials },
                { label: "Otros",        value: totals.other },
                { label: "TOTAL",        value: totals.grand, bold: true },
              ].map(({ label, value, bold }) => (
                <div key={label} style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: bold ? 20 : 16, fontWeight: bold ? 900 : 700, color: F }}>
                    {fmt(value) || "$0"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="submit" disabled={sending} className="btn btn-primary" style={{ opacity: sending ? 0.7 : 1 }}>
              {sending ? "Enviando..." : "📤 Enviar presupuesto"}
            </button>
            <button type="button" onClick={() => { setRows([{ ...EMPTY_ROW }]); setRequestId(""); setMessage(null); setError(null); }}
              className="btn btn-ghost" disabled={sending}>
              Limpiar
            </button>
          </div>
        </form>

        <div className="alert alert-info" style={{ fontSize: 13 }}>
          💡 Una vez enviado, el cliente tiene 72 hs para aceptar o rechazar el presupuesto.
          Podés enviar hasta 3 revisiones por solicitud. Los importes incluyen IVA si sos Responsable Inscripto.
        </div>
      </DashboardShell>
      <Footer />
    </>
  );
}
