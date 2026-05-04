/**
 * pages/providers/solicitud/[id].jsx
 * Panel del prestador para atender una solicitud
 */
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";
import ChatWindow from "../../../components/ChatWindow";
import WorkPhotoGallery from "../../../components/WorkPhotoGallery";
import { useAuth } from "../../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

const STATUS_LABELS = {
  PENDING:"Pendiente",QUOTED:"Presupuestado",CONFIRMED:"Confirmado",
  IN_PROGRESS:"En curso",DONE:"Completado",CANCELLED:"Cancelado",
};

export default function ProviderSolicitudPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, provider, apiRequest } = useAuth();
  const [req,     setReq]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote,   setQuote]   = useState({ amount:"", notes:"" });
  const [sending, setSending] = useState(false);
  const [err,     setErr]     = useState(null);
  const [tab,     setTab]     = useState("detalle");

  useEffect(() => {
    if (!id) return;
    apiRequest(`/api/requests/${id}`)
      .then(d => setReq(d.request || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, apiRequest]);

  const sendQuote = async () => {
    if (!quote.amount || isNaN(Number(quote.amount))) { setErr("Ingresá un monto válido"); return; }
    setSending(true); setErr(null);
    try {
      await apiRequest(`/api/requests/${id}/quote`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(quote.amount), notes: quote.notes }),
      });
      setReq(prev => ({ ...prev, status:"QUOTED", quote: { amount: Number(quote.amount), notes: quote.notes } }));
    } catch(e) { setErr(e.message); }
    finally { setSending(false); }
  };

  const startWork = async () => {
    setSending(true);
    try {
      await apiRequest(`/api/requests/${id}/status`, { method:"PUT", body:JSON.stringify({ status:"IN_PROGRESS" }) });
      setReq(prev => ({ ...prev, status:"IN_PROGRESS" }));
    } catch(e) { setErr(e.message); }
    finally { setSending(false); }
  };

  const finishWork = async () => {
    setSending(true);
    try {
      await apiRequest(`/api/requests/${id}/status`, { method:"PUT", body:JSON.stringify({ status:"DONE" }) });
      setReq(prev => ({ ...prev, status:"DONE" }));
    } catch(e) { setErr(e.message); }
    finally { setSending(false); }
  };

  if (loading) return <><NavBar /><div style={{ padding:60, textAlign:"center", color:F }}>Cargando...</div></>;
  if (!req)    return <><NavBar /><div style={{ padding:60, textAlign:"center" }}>Solicitud no encontrada.</div></>;

  const statusLabel = STATUS_LABELS[req.status] || req.status;

  return (
    <>
      <Head><title>Solicitud #{id?.slice(0,8)} — Panel Prestador</title></Head>
      <NavBar />
      <main style={{ background:"#F7F9F5", minHeight:"100vh", padding:"24px 20px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            <Link href="/providers/dashboard" style={{ color:V, fontWeight:700, fontSize:14, textDecoration:"none" }}>← Volver</Link>
            <span style={{ background:"#F3F4F6", color:F, borderRadius:20, padding:"4px 12px", fontSize:13, fontWeight:700 }}>{statusLabel}</span>
            {req.urgent && <span style={{ background:"#FEF2F2", color:"#DC2626", border:"1px solid rgba(220,38,38,0.3)", borderRadius:20, padding:"4px 10px", fontSize:12, fontWeight:700 }}>⚡ Urgente</span>}
          </div>

          {err && <div style={{ background:"#FEF2F2", border:"1px solid #DC2626", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#991B1B", marginBottom:14 }}>{err}</div>}

          {/* Tabs */}
          <div style={{ display:"flex", background:"#F3F4F6", borderRadius:12, padding:4, marginBottom:16, gap:2 }}>
            {[["detalle","📋 Detalle"],["chat","💬 Chat"],["fotos","📷 Fotos"]].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"8px", borderRadius:10, border:"none", background:tab===t?"#fff":"transparent", fontWeight:700, fontSize:13, cursor:"pointer", color:tab===t?F:"#6B7C6E" }}>{l}</button>
            ))}
          </div>

          {tab==="detalle" && (
            <>
              <div style={{ background:"#fff", border:"1.5px solid #D4E0D6", borderRadius:16, padding:20, marginBottom:16 }}>
                <h2 style={{ margin:"0 0 16px", fontSize:18, fontWeight:900, color:F, fontFamily:"Georgia,serif" }}>{req.rubro || req.catalogId || "Servicio"}</h2>
                {[
                  ["Descripción", req.description || "Sin descripción"],
                  ["Dirección",   req.address || "—"],
                  ["Fecha",       req.datetime ? new Date(req.datetime).toLocaleString("es-AR") : "A coordinar"],
                  ["Recibido",    new Date(req.createdAt).toLocaleDateString("es-AR")],
                ].map(([l,v]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F3F4F6", fontSize:14 }}>
                    <span style={{ color:"#6B7C6E" }}>{l}</span>
                    <span style={{ fontWeight:600, color:F }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Acciones según estado */}
              {req.status === "PENDING" && (
                <div style={{ background:"#fff", border:"1.5px solid #D4E0D6", borderRadius:16, padding:20, marginBottom:16 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:F, marginBottom:12 }}>Enviar presupuesto</div>
                  <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:F, marginBottom:4 }}>Monto total (ARS) *</div>
                      <input type="number" value={quote.amount} onChange={e=>setQuote(p=>({...p,amount:e.target.value}))} placeholder="Ej: 15000" style={{ width:"100%", border:"1px solid #D4E0D6", borderRadius:8, padding:"8px 12px", fontSize:14, outline:"none" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:F, marginBottom:4 }}>Notas del presupuesto</div>
                    <textarea value={quote.notes} onChange={e=>setQuote(p=>({...p,notes:e.target.value}))} placeholder="Detallá qué incluye el presupuesto, materiales, tiempo estimado..." rows={3} style={{ width:"100%", border:"1px solid #D4E0D6", borderRadius:8, padding:"8px 12px", fontSize:14, resize:"none", outline:"none" }} />
                  </div>
                  <button onClick={sendQuote} disabled={sending} style={{ background:`linear-gradient(135deg,${V},${F})`, color:"#fff", border:"none", borderRadius:24, padding:"11px 24px", fontWeight:800, cursor:"pointer" }}>
                    {sending ? "Enviando..." : "Enviar presupuesto →"}
                  </button>
                </div>
              )}

              {req.status === "CONFIRMED" && (
                <div style={{ background:"#F0FDF4", border:"1.5px solid rgba(22,163,74,0.4)", borderRadius:16, padding:20, marginBottom:16 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:F, marginBottom:6 }}>Presupuesto aceptado ✅</div>
                  <div style={{ fontSize:13, color:"#166534", marginBottom:12 }}>El cliente aceptó el presupuesto. El pago está retenido en Escrow.</div>
                  <button onClick={startWork} disabled={sending} style={{ background:`linear-gradient(135deg,${V},${F})`, color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, cursor:"pointer" }}>
                    Iniciar trabajo
                  </button>
                </div>
              )}

              {req.status === "IN_PROGRESS" && (
                <div style={{ background:"#FFF7ED", border:"1.5px solid rgba(194,65,12,0.4)", borderRadius:16, padding:20, marginBottom:16 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:F, marginBottom:6 }}>Trabajo en curso ⚙️</div>
                  <div style={{ fontSize:13, color:"#6B7C6E", marginBottom:12 }}>Cuando termines, marcalo como finalizado para notificar al cliente.</div>
                  <button onClick={finishWork} disabled={sending} style={{ background:`linear-gradient(135deg,${V},${F})`, color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, cursor:"pointer" }}>
                    Marcar como finalizado
                  </button>
                </div>
              )}

              {req.status === "DONE" && (
                <div style={{ background:"#F0FDF4", border:"1px solid rgba(22,163,74,0.3)", borderRadius:12, padding:14, fontSize:14, color:"#166534" }}>
                  🎉 Trabajo completado. El pago será liberado en 48hs una vez que el cliente confirme.
                </div>
              )}

              {req.quote && (
                <div style={{ background:"#F9FAFB", border:"1px solid #D4E0D6", borderRadius:12, padding:14, marginTop:12, fontSize:13 }}>
                  <div style={{ fontWeight:700, color:F, marginBottom:4 }}>Tu presupuesto enviado</div>
                  <div style={{ fontSize:20, fontWeight:900, color:V, fontFamily:"Georgia,serif" }}>${Number(req.quote.amount).toLocaleString("es-AR")}</div>
                  {req.quote.notes && <div style={{ color:"#6B7C6E", marginTop:4 }}>{req.quote.notes}</div>}
                </div>
              )}
            </>
          )}

          {tab==="chat" && (
            <div style={{ background:"#fff", border:"1.5px solid #D4E0D6", borderRadius:16, padding:20 }}>
              <ChatWindow requestId={id} toId={req.clientId} toName={req.client?.name || "Cliente"} />
            </div>
          )}

          {tab==="fotos" && (
            <div style={{ background:"#fff", border:"1.5px solid #D4E0D6", borderRadius:16, padding:20 }}>
              <WorkPhotoGallery providerId={provider?.id} requestId={id} isOwner={true} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
