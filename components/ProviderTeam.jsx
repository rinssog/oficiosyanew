/**
 * components/ProviderTeam.jsx
 * Sección de equipo de trabajo en el perfil del prestador
 * Muestra los miembros con sus roles, verificación y foto
 */
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

const ROLES = ["ayudante","oficial","socio","supervisor","capataz"];

function MemberAvatar({ name, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${V},${F})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

export default function ProviderTeam({ providerId, isOwner = false }) {
  const { apiRequest } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [form,    setForm]    = useState({ name:"", roleInTeam:"oficial", bio:"", phone:"", matricula:"" });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState(null);

  useEffect(() => {
    if (!providerId) return;
    apiRequest(`/api/providers/${providerId}/team`)
      .then(d => setMembers(d.members || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [providerId]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addMember = async () => {
    if (!form.name || !form.roleInTeam) { setErr("Nombre y rol son requeridos"); return; }
    setSaving(true); setErr(null);
    try {
      const res = await apiRequest(`/api/providers/${providerId}/team`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(res.error);
      setMembers(prev => [...prev, res.member]);
      setForm({ name:"", roleInTeam:"oficial", bio:"", phone:"", matricula:"" });
      setAdding(false);
    } catch(e) {
      setErr(e.message || "Error al agregar");
    } finally { setSaving(false); }
  };

  const removeMember = async (memberId) => {
    if (!confirm("¿Desactivar este miembro?")) return;
    try {
      await apiRequest(`/api/providers/${providerId}/team/${memberId}`, { method: "DELETE" });
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch {}
  };

  const inp = { width:"100%", border:"1px solid #D4E0D6", borderRadius:8, padding:"8px 12px", fontSize:13, outline:"none", fontFamily:"inherit", color:"#111", marginBottom:8 };

  if (loading) return null;
  if (!isOwner && members.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ fontSize:14, fontWeight:700, color:F }}>
          Equipo de trabajo
          {members.length > 0 && <span style={{ marginLeft:8, background:"#F0FDF4", color:V, border:"1px solid rgba(22,163,74,0.3)", borderRadius:20, padding:"1px 8px", fontSize:12 }}>{members.length}</span>}
        </div>
        {isOwner && (
          <button onClick={() => setAdding(!adding)} style={{ background:adding?"#FEF2F2":"#F0FDF4", color:adding?"#DC2626":V, border:`1px solid ${adding?"#DC262640":"rgba(22,163,74,0.3)"}`, borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {adding ? "✕ Cancelar" : "+ Agregar"}
          </button>
        )}
      </div>

      {/* Lista de miembros */}
      <div style={{ display:"grid", gap:8 }}>
        {members.map(m => (
          <div key={m.id} style={{ background:"var(--color-background-primary, #fff)", border:"1px solid #D4E0D6", borderRadius:12, padding:"12px 14px", display:"flex", gap:12, alignItems:"flex-start" }}>
            <MemberAvatar name={m.name} size={40} />
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontWeight:700, fontSize:14, color:F }}>{m.name}</span>
                <span style={{ background:"#F3F4F6", color:"#374151", borderRadius:20, padding:"1px 8px", fontSize:11, fontWeight:600, textTransform:"capitalize" }}>{m.roleInTeam}</span>
                {m.verified && (
                  <span style={{ background:"#F0FDF4", color:V, border:"1px solid rgba(22,163,74,0.3)", borderRadius:20, padding:"1px 8px", fontSize:11, fontWeight:700 }}>✓ Verificado</span>
                )}
              </div>
              {m.bio && <div style={{ fontSize:12, color:"#6B7C6E", marginTop:3, lineHeight:1.4 }}>{m.bio}</div>}
              {m.matricula && <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>Matrícula: {m.matricula}</div>}
            </div>
            {isOwner && (
              <button onClick={() => removeMember(m.id)} style={{ background:"none", border:"none", color:"#9CA3AF", cursor:"pointer", fontSize:16, padding:"0 4px", flexShrink:0 }}>✕</button>
            )}
          </div>
        ))}
        {members.length === 0 && !adding && isOwner && (
          <div style={{ background:"#F9FAFB", border:"1px dashed #D4E0D6", borderRadius:12, padding:"20px", textAlign:"center", color:"#9CA3AF", fontSize:13 }}>
            Agregá a tu equipo para mostrar quiénes realizan los trabajos
          </div>
        )}
      </div>

      {/* Formulario de nuevo miembro */}
      {adding && (
        <div style={{ background:"#F7F9F5", border:"1px solid #D4E0D6", borderRadius:12, padding:16, marginTop:10 }}>
          <div style={{ fontSize:13, fontWeight:700, color:F, marginBottom:12 }}>Nuevo miembro del equipo</div>
          {err && <div style={{ background:"#FEF2F2", border:"1px solid #DC2626", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#991B1B", marginBottom:8 }}>{err}</div>}
          <label style={{ fontSize:12, fontWeight:700, color:F, display:"block", marginBottom:3 }}>Nombre completo *</label>
          <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Juan García" style={inp} />
          <label style={{ fontSize:12, fontWeight:700, color:F, display:"block", marginBottom:3 }}>Rol en el equipo *</label>
          <select value={form.roleInTeam} onChange={e=>set("roleInTeam",e.target.value)} style={{...inp,cursor:"pointer"}}>
            {ROLES.map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
          </select>
          <label style={{ fontSize:12, fontWeight:700, color:F, display:"block", marginBottom:3 }}>Descripción (opcional)</label>
          <input value={form.bio} onChange={e=>set("bio",e.target.value)} placeholder="10 años de experiencia en plomería..." style={inp} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:F, display:"block", marginBottom:3 }}>Teléfono (opcional)</label>
              <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="11 1234-5678" style={{...inp,marginBottom:0}} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:F, display:"block", marginBottom:3 }}>Matrícula (si aplica)</label>
              <input value={form.matricula} onChange={e=>set("matricula",e.target.value)} placeholder="Mat. 12345" style={{...inp,marginBottom:0}} />
            </div>
          </div>
          <div style={{ marginTop:12, background:"#F0FDF4", border:"1px solid rgba(22,163,74,0.2)", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#166534" }}>
            🛡️ Los datos de contacto del equipo no se muestran públicamente. Solo se usa el nombre y el rol. OficiosYa puede verificar al miembro con su DNI.
          </div>
          <div style={{ marginTop:12, display:"flex", gap:8 }}>
            <button onClick={addMember} disabled={saving} style={{ background:`linear-gradient(135deg,${V},${F})`, color:"#fff", border:"none", borderRadius:24, padding:"9px 20px", fontWeight:700, fontSize:13, cursor:"pointer", flex:1 }}>
              {saving ? "Guardando..." : "Agregar al equipo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
