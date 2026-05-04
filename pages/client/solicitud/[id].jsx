/**
 * pages/client/solicitud/[id].jsx
 * Panel del cliente para ver y gestionar una solicitud
 */
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";
import ChatWindow from "../../../components/ChatWindow";
import { useAuth } from "../../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const STATUS = {
  PENDING:     { label:"Buscando prestador", color:"#1D4ED8", bg:"#EFF6FF", icon:"🔍" },
  QUOTED:      { label:"Con presupuesto",    color:"#854D0E", bg:"#FEF9C3", icon:"📋" },
  CONFIRMED:   { label:"Confirmado",          color:V,         bg:"#F0FDF4", icon:"✅" },
  IN_PROGRESS: { label:"En curso",            color:"#C2410C", bg:"#FFF7ED", icon:"⚙️" },
  DONE:        { label:"Completado",           color:F,         bg:"#F0FDF4", icon:"🎉" },
  CANCELLED:   { label:"Cancelado",           color:"#DC2626", bg:"#FEF2F2", icon:"❌" },
};

export default function ClientSolicitudPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, apiRequest } = useAuth();
  const [req,       setReq]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [confirming, setConfirm]  = useState(false);
  const [rejecting,  setReject]   = useState(false);
  const [rating,     setRating]   = useState({ quality:5, punctuality:5, communication:5, comment:"" });
  const [showRating, setShowRating] = useState(false);
  const [rated,      setRated]    = useState(false);
  const [err,        setErr]      = useState(null);

  useEffect(() => {
    if (!id) return;
    apiRequest(`/api/requests/${id}`)
      .then(d => setReq(d.request || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, apiRequest]);

  const confirmWork = async () => {
    setConfirm(true); setErr(null);
    try {
      await apiRequest(`/api/requests/${id}/confirm`, { method: "POST" });
      setReq(prev => ({ ...prev, status: "DONE" }));
      setShowRating(true);
    } catch(e) { setErr(e.message); }
    finally { setConfirm(false); }
  };

  const rejectWork = async () => {
    const reason = prompt("¿Por qué rechazás el trabajo? (requerido)");
    if (!reason) return;
    setReject(true);
    try {
      await apiRequest(`/api/requests/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
      setReq(prev => ({ ...prev, status: "PENDING" }));
    } catch(e) { setErr(e.message); }
    finally { setReject(false); }
  };

  const submitRating = async () => {
    try {
      await apiRequest("/api/ratings", {
        method: "POST",
        body: JSON.stringify({ requestId: id, providerId: req.providerId, ...rating }),
      });
      setRated(true); setShowRating(false);
    } catch(e) { setErr(e.message); }
  };

  if (loading) return <><NavBar /><div style={{ padding:60, textAlign:"center", color:F }}>Cargando...</div></>;
  if (!req)    return <><NavBar /><div style={{ padding:60, textAlign:"center" }}>Solicitud no encontrada. <Link href="/client/dashboard" style={{ color:V }}>Volver</Link></div></>;

  const s = STATUS[req.status] || STATUS.PENDING;

  return (
    <>
      <Head><title>Solicitud #{id?.slice(0,8)} — OficiosYa</title></Head>
      <NavBar />
      <main style={{ background:"#F7F9F5", minHeight:"100vh", padding:"24px 20px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <Link href="/client/dashboard" style={{ color:V, fontWeight:700, fontSize:14, textDecoration:"none" }}>← Volver</Link>
            <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.color}30`, borderRadius:20, padding:"4px 12px", fontSize:13, fontWeight:700 }}>{s.icon} {s.label}</span>
          </div>

          {err && <div style={{ background:"#FEF2F2", border:"1px solid #DC2626", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#991B1B", marginBottom:14 }}>{err}</div>}

          {/* Resumen */}
          <div style={{ background:"#fff", border:"1.5px solid #D4E0D6", borderRadius:16, padding:20, marginBottom:16 }}>
            <h2 style={{ margin:"0 0 16px", fontSize:18, fontWeight:900, color:F, fontFamily:"Georgia,serif" }}>
              {req.rubro || req.catalogId || "Servicio"}
            </h2>
            {[
              ["Descripción",  req.description || "Sin descripción"],
              ["Dirección",    req.address || "—"],
              ["Fecha",        req.datetime ? new Date(req.datetime).toLocaleString("es-AR") : "A coordinar"],
              ["Urgente",      req.urgent ? "Sí ⚡" : "No"],
              ["Solicitado",   new Date(req.createdAt).toLocaleDateString("es-AR")],
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F3F4F6", fontSize:14 }}>
                <span style={{ color:"#6B7C6E" }}>{l}</span>
                <span style={{ fontWeight:600, color:F }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Presupuesto */}
          {req.quote && (
            <div style={{ background:"#F0FDF4", border:"1.5px solid rgba(22,163,74,0.4)", borderRadius:16, padding:20, marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:16, color:F, marginBottom:8 }}>Presupuesto del prestador</div>
              <div style={{ fontSize:28, fontWeight:900, color:V, fontFamily:"Georgia,serif", marginBottom:4 }}>${Number(req.quote.amount).toLocaleString("es-AR")}</div>
              {req.quote.notes && <div style={{ fontSize:14, color:"#374151", marginBottom:12 }}>{req.quote.notes}</div>}
              {req.status === "QUOTED" && (
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={confirmWork} disabled={confirming} style={{ flex:1, background:`linear-gradient(135deg,${V},${F})`, color:"#fff", border:"none", borderRadius:10, padding:"11px", fontWeight:800, cursor:"pointer", fontSize:14 }}>
                    {confirming ? "Confirmando..." : "✅ Aceptar y pagar"}
                  </button>
                  <button style={{ flex:1, background:"#FEF2F2", color:"#DC2626", border:"1px solid rgba(220,38,38,0.3)", borderRadius:10, padding:"11px", fontWeight:700, cursor:"pointer" }}>
                    Rechazar presupuesto
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confirmar trabajo completado */}
          {req.status === "IN_PROGRESS" && (
            <div style={{ background:"#FFFBEB", border:"1.5px solid rgba(201,162,39,0.4)", borderRadius:16, padding:20, marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:15, color:F, marginBottom:6 }}>¿El trabajo está terminado?</div>
              <div style={{ fontSize:13, color:"#6B7C6E", marginBottom:12, lineHeight:1.5 }}>
                Confirmá cuando el prestador haya finalizado el trabajo correctamente. El pago será liberado en 48hs.
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={confirmWork} disabled={confirming} style={{ flex:1, background:`linear-gradient(135deg,${V},${F})`, color:"#fff", border:"none", borderRadius:10, padding:"11px", fontWeight:800, cursor:"pointer" }}>
                  {confirming ? "..." : "✅ Confirmar trabajo OK"}
                </button>
                <button onClick={rejectWork} disabled={rejecting} style={{ flex:1, background:"#FEF2F2", color:"#DC2626", border:"1px solid rgba(220,38,38,0.3)", borderRadius:10, padding:"11px", fontWeight:700, cursor:"pointer" }}>
                  {rejecting ? "..." : "❌ Rechazar trabajo"}
                </button>
              </div>
            </div>
          )}

          {/* Rating */}
          {showRating && !rated && (
            <div style={{ background:"#fff", border:"1.5px solid #D4E0D6", borderRadius:16, padding:20, marginBottom:16 }}>
              <h3 style={{ margin:"0 0 14px", color:F, fontFamily:"Georgia,serif" }}>Calificá al prestador</h3>
              {[["quality","Calidad del trabajo"],["punctuality","Puntualidad"],["communication","Comunicación"]].map(([k,l]) => (
                <div key={k} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:F, marginBottom:4 }}>{l}</div>
                  <div style={{ display:"flex", gap:4 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setRating(prev=>({...prev,[k]:n}))} style={{ fontSize:22, background:"none", border:"none", cursor:"pointer", color:n<=rating[k]?G:"#D1D5DB" }}>★</button>
                    ))}
                  </div>
                </div>
              ))}
              <textarea value={rating.comment} onChange={e=>setRating(prev=>({...prev,comment:e.target.value}))} placeholder="Contá tu experiencia (opcional)..." rows={3} style={{ width:"100%", border:"1px solid #D4E0D6", borderRadius:10, padding:"8px 12px", fontSize:14, resize:"none", outline:"none", marginBottom:12 }} />
              <button onClick={submitRating} style={{ background:`linear-gradient(135deg,${V},${F})`, color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", fontWeight:700, cursor:"pointer" }}>Enviar reseña →</button>
            </div>
          )}

          {rated && <div style={{ background:"#F0FDF4", border:"1px solid rgba(22,163,74,0.3)", borderRadius:12, padding:14, fontSize:14, color:"#166534", marginBottom:16 }}>⭐ ¡Gracias por tu reseña! Ayuda a otros clientes a elegir mejor.</div>}

          {/* Chat */}
          {req.providerId && (
            <div style={{ background:"#fff", border:"1.5px solid #D4E0D6", borderRadius:16, padding:20 }}>
              <h3 style={{ margin:"0 0 14px", color:F, fontFamily:"Georgia,serif" }}>Chat con el prestador</h3>
              <ChatWindow requestId={id} toId={req.provider?.userId} toName={req.provider?.companyName || "Prestador"} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
