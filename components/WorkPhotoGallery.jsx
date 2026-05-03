/**
 * components/WorkPhotoGallery.jsx
 * Galería de fotos de trabajos con watermark OficiosYa
 * Muestra badge "Aprobado por cliente" en fotos verificadas
 */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

function PhotoCard({ photo, onDelete, isOwner }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ position:"relative", borderRadius:12, overflow:"hidden", aspectRatio:"1", background:"#F3F4F6", cursor:"pointer" }}>
      <img
        src={photo.publicUrl || photo.watermarkedUrl || photo.originalUrl}
        alt={photo.caption || "Foto de trabajo"}
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
        loading="lazy"
      />
      {/* Badge verificado */}
      {photo.verified && (
        <div style={{ position:"absolute", top:8, left:8, background:"rgba(13,59,31,0.85)", color:"#BBF7D0", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20, backdropFilter:"blur(4px)" }}>
          ✓ Aprobado por cliente
        </div>
      )}
      {/* Caption y delete al hover */}
      {hovered && (
        <div style={{ position:"absolute", inset:0, background:"rgba(13,59,31,0.65)", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:10 }}>
          {photo.caption && <div style={{ color:"#fff", fontSize:11, lineHeight:1.4 }}>{photo.caption}</div>}
          {photo.approvedAt && (
            <div style={{ color:"#BBF7D0", fontSize:10, marginTop:3 }}>
              {new Date(photo.approvedAt).toLocaleDateString("es-AR")}
            </div>
          )}
          {isOwner && !photo.verified && (
            <button onClick={e=>{e.stopPropagation();onDelete(photo.id)}}
              style={{ marginTop:6, background:"rgba(220,38,38,0.8)", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", alignSelf:"flex-start" }}>
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkPhotoGallery({ providerId, requestId = null, isOwner = false }) {
  const { apiRequest } = useAuth();
  const [photos,    setPhotos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter,    setFilter]    = useState("all"); // all | verified
  const [caption,   setCaption]   = useState("");
  const [err,       setErr]       = useState(null);
  const fileRef = useRef(null);

  const loadPhotos = () => {
    const url = requestId
      ? `/api/providers/${providerId}/photos?requestId=${requestId}`
      : `/api/providers/${providerId}/photos${filter==="verified"?"?verifiedOnly=true":""}`;
    apiRequest(url)
      .then(d => setPhotos(d.photos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { if(providerId) loadPhotos(); }, [providerId, filter]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !requestId) return;
    setUploading(true); setErr(null);
    try {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const res = await apiRequest("/api/work-photos/upload", {
        method: "POST",
        body: JSON.stringify({ requestId, imageBase64: base64, mimeType: file.type, caption }),
      });
      if (!res.ok) throw new Error(res.error);
      setPhotos(prev => [res.photo, ...prev]);
      setCaption("");
    } catch(e) {
      setErr(e.message || "Error al subir");
    } finally { setUploading(false); if(fileRef.current) fileRef.current.value = ""; }
  };

  const handleDelete = async (photoId) => {
    if (!confirm("¿Eliminar esta foto?")) return;
    try {
      await apiRequest(`/api/work-photos/${photoId}`, { method: "DELETE" });
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch {}
  };

  const verified = photos.filter(p => p.verified).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:F }}>Fotos de trabajos</div>
          {verified > 0 && (
            <span style={{ background:"#F0FDF4", color:V, border:"1px solid rgba(22,163,74,0.3)", borderRadius:20, padding:"1px 8px", fontSize:11, fontWeight:700 }}>
              {verified} aprobadas
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["all","verified"].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?F:"transparent", color:filter===f?"#fff":"#6B7C6E", border:`1px solid ${filter===f?F:"#D4E0D6"}`, borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
              {f==="all" ? "Todas" : "✓ Aprobadas"}
            </button>
          ))}
        </div>
      </div>

      {/* Info sobre el watermark */}
      {photos.length > 0 && (
        <div style={{ background:"#FFFBEB", border:"1px solid rgba(201,162,39,0.4)", borderRadius:8, padding:"7px 12px", fontSize:11, color:"#92400E", marginBottom:12, display:"flex", gap:8, alignItems:"center" }}>
          <span>🛡️</span>
          <span>Todas las fotos tienen marca de agua OficiosYa. Las marcadas con "✓ Aprobado por cliente" fueron confirmadas después de que el cliente validó el trabajo.</span>
        </div>
      )}

      {/* Grid de fotos */}
      {loading && <div style={{ padding:"20px", textAlign:"center", color:"#9CA3AF", fontSize:13 }}>Cargando fotos...</div>}
      {!loading && photos.length === 0 && (
        <div style={{ background:"#F9FAFB", border:"1px dashed #D4E0D6", borderRadius:12, padding:"28px", textAlign:"center", color:"#9CA3AF", fontSize:13, lineHeight:1.6 }}>
          {isOwner ? "Subí fotos de tus trabajos completados. Aparecen con marca de agua OficiosYa y badge de aprobación del cliente." : "Este prestador aún no tiene fotos de trabajos."}
        </div>
      )}
      {photos.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8 }}>
          {photos.map(p => <PhotoCard key={p.id} photo={p} onDelete={handleDelete} isOwner={isOwner} />)}
        </div>
      )}

      {/* Upload — solo visible para el dueño con requestId */}
      {isOwner && requestId && (
        <div style={{ marginTop:14, background:"#F7F9F5", border:"1px solid #D4E0D6", borderRadius:12, padding:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:F, marginBottom:8 }}>Subir foto del trabajo</div>
          {err && <div style={{ background:"#FEF2F2", border:"1px solid #DC2626", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#991B1B", marginBottom:8 }}>{err}</div>}
          <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Descripción (opcional)" style={{ width:"100%", border:"1px solid #D4E0D6", borderRadius:8, padding:"7px 12px", fontSize:12, outline:"none", fontFamily:"inherit", marginBottom:8 }} />
          <label style={{ display:"flex", alignItems:"center", gap:10, background:uploading?"#F3F4F6":"#fff", border:"1.5px dashed #D4E0D6", borderRadius:8, padding:"10px 14px", cursor:uploading?"default":"pointer" }}>
            <span style={{ fontSize:18 }}>📷</span>
            <span style={{ fontSize:12, color:"#6B7C6E" }}>
              {uploading ? "Aplicando marca de agua OficiosYa..." : "Seleccioná una foto del trabajo (JPG o PNG)"}
            </span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleUpload} disabled={uploading} style={{ display:"none" }} />
          </label>
          <div style={{ marginTop:8, fontSize:11, color:"#9CA3AF", lineHeight:1.5 }}>
            📌 La foto recibirá automáticamente la marca de agua de OficiosYa. Si el cliente ya aprobó el trabajo, también aparecerá el badge "Aprobado por cliente".
          </div>
        </div>
      )}
    </div>
  );
}
