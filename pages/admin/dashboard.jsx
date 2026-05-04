/**
 * pages/admin/dashboard.jsx — Panel de administración
 */
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

function Stat({ value, label, color = V, icon }) {
  return (
    <div style={{ background:"#fff", border:"1.5px solid #D4E0D6", borderRadius:14, padding:"18px 16px", textAlign:"center" }}>
      <div style={{ fontSize:28, marginBottom:4 }}>{icon}</div>
      <div style={{ fontWeight:900, fontSize:26, color, fontFamily:"Georgia,serif" }}>{value}</div>
      <div style={{ color:"#6B7C6E", fontSize:13, marginTop:2 }}>{label}</div>
    </div>
  );
}

const SECTIONS = [
  { id:"chat-alerts",  label:"🚨 Alertas de chat",      href:"/admin/chat-alerts",    desc:"Intentos de desvío y suspensiones" },
  { id:"users",        label:"👥 Usuarios",              href:"/admin/users",          desc:"Clientes y prestadores registrados" },
  { id:"verificacion", label:"🛡️ Verificaciones",        href:"/admin/verificaciones", desc:"Documentos pendientes de revisión" },
  { id:"escrow",       label:"💳 Escrow",                href:"/admin/escrow",         desc:"Pagos retenidos y liberados" },
  { id:"solicitudes",  label:"📋 Solicitudes",           href:"/admin/solicitudes",    desc:"Todos los trabajos de la plataforma" },
  { id:"ratings",      label:"⭐ Reseñas",               href:"/admin/ratings",        desc:"Calificaciones y detección de fraude" },
];

export default function AdminDashboard() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    apiRequest("/api/admin/dashboard")
      .then(d => setStats(d.stats || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [isReady, user]);

  if (!isReady || loading) return <div style={{ padding:60, textAlign:"center", color:F }}>Cargando panel...</div>;

  return (
    <>
      <Head><title>Panel Admin — OficiosYa</title></Head>
      <main style={{ background:"#0D3B1F", minHeight:"100vh", fontFamily:"system-ui,sans-serif" }}>
        {/* Header */}
        <div style={{ background:"rgba(255,255,255,0.05)", padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ color:"#C9A227", fontFamily:"Georgia,serif", fontWeight:900, fontSize:20 }}>OficiosYa Admin</div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ color:"#BBF7D0", fontSize:13 }}>⚙️ {user?.email}</span>
            <Link href="/" style={{ color:"#9CA3AF", fontSize:13 }}>← Salir</Link>
          </div>
        </div>

        <div style={{ padding:"24px 28px" }}>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:28 }}>
            <Stat icon="👥" value={stats?.totalUsers    || "—"} label="Usuarios"       color="#60A5FA" />
            <Stat icon="🔧" value={stats?.totalProviders|| "—"} label="Prestadores"    color={V}      />
            <Stat icon="📋" value={stats?.totalRequests || "—"} label="Solicitudes"    color="#A78BFA" />
            <Stat icon="✅" value={stats?.completedJobs || "—"} label="Completados"    color={G}      />
            <Stat icon="💳" value={stats?.escrowHeld    || "—"} label="Escrow ($)"     color="#34D399" />
            <Stat icon="🚨" value={stats?.pendingAlerts || "—"} label="Alertas chat"   color="#F87171" />
          </div>

          {/* Secciones */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
            {SECTIONS.map(s => (
              <Link key={s.id} href={s.href} style={{ textDecoration:"none" }}>
                <div style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:"18px 16px", cursor:"pointer", transition:"background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.07)"}>
                  <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:12, color:"#9CA3AF" }}>{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ marginTop:28, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:16 }}>
            <div style={{ color:"#BBF7D0", fontWeight:700, fontSize:14, marginBottom:10 }}>Acciones rápidas</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[
                ["Seed planes MP",       "POST /api/mp/plans/seed",                    "Crea los 3 planes en MercadoPago (1 sola vez)"],
                ["Ver alertas críticas", "/admin/chat-alerts",                          "Suspensiones HIGH/CRITICAL pendientes"],
                ["Verificar prestadores","/admin/verificaciones",                       "Documentos subidos sin revisar"],
              ].map(([l, href, hint]) => (
                <div key={l} style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 12px" }}>
                  <div style={{ color:"#F0D875", fontWeight:700, fontSize:12 }}>{l}</div>
                  <div style={{ color:"#9CA3AF", fontSize:11, marginTop:2 }}>{hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
