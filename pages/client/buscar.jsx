/**
 * pages/client/buscar.jsx
 * Búsqueda de prestadores — filtros, listado, mapa futuro
 */
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { RUBROS_FLAT } from "../../server-node/src/data/rubros";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const ZONAS_CABA = ["Palermo","Belgrano","Recoleta","Caballito","Flores","Villa Crespo","Almagro","San Telmo","Balvanera","Boedo","Parque Patricios","Barracas","La Boca","San Cristóbal","Monserrat","Retiro","Villa del Parque","Devoto","Mataderos","Liniers","Versalles","Monte Castro","Villa Luro","Floresta","Vélez Sársfield","Villa Real","Villa Pueyrredón","Villa Urquiza","Coghlan","Saavedra","Colegiales","Chacarita","Villa Ortúzar","Paternal","Villa General Mitre","Agronomía","Parque Chas","Núñez","Villa Riachuelo","Villa Lugano","Villa Soldati","Pompeya","Parque Avellaneda","Villa Santa Rita","Parque Chacabuco","Nueva Pompeya"];

function ShieldSVG({ tier="base", size=38 }) {
  const fills = { base:["#6B7C6E",F], verified:[V,F], gold:[G,"#7A5C0A"] };
  const [c1,c2] = fills[tier]||fills.base;
  const id=`srp-${tier}-${size}`;
  return (
    <svg width={size} height={size*1.18} viewBox="0 0 80 94" fill="none" style={{flexShrink:0}}>
      <defs>
        <linearGradient id={`${id}-f`} x1="40" y1="4" x2="40" y2="88" gradientUnits="userSpaceOnUse"><stop stopColor={c1}/><stop offset="1" stopColor={c2}/></linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="80" y2="94" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FAF0B0"/><stop offset="50%" stopColor="#C9A227"/><stop offset="100%" stopColor="#FAF0B0"/></linearGradient>
      </defs>
      <path d="M40 1 L78 15 L78 48 C78 70 62 85 40 93 C18 85 2 70 2 48 L2 15 Z" fill={`url(#${id}-g)`}/>
      <path d="M40 5.5 L74.5 18 L74.5 48 C74.5 68 60 81 40 89 C20 81 5.5 68 5.5 48 L5.5 18 Z" fill={F} opacity="0.5"/>
      <path d="M40 8 L72 20.5 L72 48 C72 66.5 58 79 40 86.5 C22 79 8 66.5 8 48 L8 20.5 Z" fill={`url(#${id}-g)`}/>
      <path d="M40 12 L68 23.5 L68 48 C68 64.5 55.5 76.5 40 83.5 C24.5 76.5 12 64.5 12 48 L12 23.5 Z" fill={`url(#${id}-f)`}/>
      <text x="40" y="55" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="22" fontWeight="900" fontFamily="Georgia,serif">Ya</text>
    </svg>
  );
}

function ProviderCard({ provider }) {
  const tier = provider.goldLevel ? "gold" : provider.verified ? "verified" : "base";
  return (
    <Link href={`/prestador/${provider.id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer", transition: "border-color .15s,box-shadow .15s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=V;e.currentTarget.style.boxShadow=`0 6px 24px rgba(22,163,74,0.15)`;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="#D4E0D6";e.currentTarget.style.boxShadow="none";}}>
        <ShieldSVG tier={tier} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: F }}>{provider.companyName || provider.user?.name || "Prestador"}</div>
              <div style={{ fontSize: 13, color: "#6B7C6E", marginTop: 1 }}>
                {provider.rubro} · {provider.zone || "CABA"}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {provider.priceFrom && <div style={{ fontWeight: 800, fontSize: 16, color: F }}>${Number(provider.priceFrom).toLocaleString("es-AR")}</div>}
              {provider.priceFrom && <div style={{ fontSize: 11, color: "#9CA3AF" }}>por visita</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            {provider.rating > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13 }}>
                <span style={{ color: G }}>★</span>
                <span style={{ fontWeight: 700, color: F }}>{Number(provider.rating).toFixed(1)}</span>
                <span style={{ color: "#9CA3AF" }}>({provider.reviewCount||0})</span>
              </span>
            )}
            {provider.verified && <span style={{ background: "#F0FDF4", color: V, border: "1px solid rgba(22,163,74,0.3)", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>✓ Verificado</span>}
            {provider.goldLevel && <span style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid rgba(201,162,39,0.5)", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>Gold</span>}
            {provider.urgent && <span style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⚡ Urgencias</span>}
            {provider.planName && <span style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid rgba(29,78,216,0.2)", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{provider.planName}</span>}
          </div>
          {provider.bio && <div style={{ fontSize: 12, color: "#6B7C6E", marginTop: 6, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{provider.bio}</div>}
        </div>
      </div>
    </Link>
  );
}

export default function BuscarPage() {
  const router = useRouter();
  const { apiRequest } = useAuth();
  const { q="", rubro="", zona="", urgente="" } = router.query;

  const [search,   setSearch]   = useState(q);
  const [rubroSel, setRubroSel] = useState(rubro);
  const [zonaSel,  setZonaSel]  = useState(zona);
  const [soloUrg,  setSoloUrg]  = useState(urgente==="true");
  const [soloVer,  setSoloVer]  = useState(false);
  const [providers,setProviders]=useState([]);
  const [total,    setTotal]    =useState(0);
  const [loading,  setLoading]  =useState(true);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)   params.set("q", search);
      if (rubroSel) params.set("rubro", rubroSel);
      if (zonaSel)  params.set("zone", zonaSel);
      if (soloUrg)  params.set("urgent", "true");
      if (soloVer)  params.set("verified", "true");
      params.set("limit", "20");
      const data = await apiRequest(`/api/providers?${params.toString()}`);
      setProviders(data.providers || []);
      setTotal(data.total || 0);
    } catch { setProviders([]); }
    finally { setLoading(false); }
  }, [search, rubroSel, zonaSel, soloUrg, soloVer, apiRequest]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const handleSearch = (e) => { e.preventDefault(); fetchProviders(); };

  const filterBtn = (active, onClick, label) => (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${active?F:"#D4E0D6"}`, background: active?F:"#fff", color: active?"#fff":"#6B7C6E", fontWeight: active?700:400, fontSize: 12, cursor: "pointer" }}>
      {label}
    </button>
  );

  return (
    <>
      <Head><title>Buscar prestadores — OficiosYa</title></Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh" }}>
        {/* Search hero */}
        <div style={{ background: `linear-gradient(135deg,${F},#1A5C35)`, padding: "24px 20px" }}>
          <form onSubmit={handleSearch} style={{ maxWidth: 840, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="¿Qué servicio necesitás?" style={{ flex: 2, minWidth: 180, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }} />
            <select value={rubroSel} onChange={e=>setRubroSel(e.target.value)} style={{ flex: 1, minWidth: 140, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }}>
              <option value="">Todos los rubros</option>
              {RUBROS_FLAT.map(r=><option key={r.id} value={r.id}>{r.icon} {r.nombre}</option>)}
            </select>
            <select value={zonaSel} onChange={e=>setZonaSel(e.target.value)} style={{ flex: 1, minWidth: 140, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }}>
              <option value="">Todas las zonas</option>
              {ZONAS_CABA.map(z=><option key={z}>{z}</option>)}
            </select>
            <button type="submit" style={{ background: V, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Buscar</button>
          </form>
        </div>

        <div style={{ maxWidth: 840, margin: "0 auto", padding: "20px 20px" }}>
          {/* Filtros rápidos */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {filterBtn(soloUrg, ()=>setSoloUrg(!soloUrg), "⚡ Solo urgencias")}
            {filterBtn(soloVer, ()=>setSoloVer(!soloVer), "✓ Verificados")}
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#6B7C6E" }}>{loading ? "Buscando..." : `${total} prestadores`}</span>
          </div>

          {/* Resultados */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>Buscando prestadores...</div>
          )}
          {!loading && providers.length === 0 && (
            <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16, padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 700, color: F, fontSize: 16, marginBottom: 6 }}>Sin resultados</div>
              <div style={{ color: "#6B7C6E", fontSize: 14 }}>Probá con otros filtros o expandí la búsqueda a toda CABA.</div>
            </div>
          )}
          <div style={{ display: "grid", gap: 10 }}>
            {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
