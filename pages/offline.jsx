/**
 * pages/offline.jsx — Página mostrada cuando no hay conexión
 */
import Link from "next/link";

const F = "#0D3B1F", V = "#16A34A";

export default function OfflinePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F9F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui,sans-serif" }}>
      <svg width={80} height={94} viewBox="0 0 80 94" fill="none" style={{ marginBottom: 24 }}>
        <defs>
          <linearGradient id="of-f" x1="40" y1="4" x2="40" y2="88" gradientUnits="userSpaceOnUse"><stop stopColor="#6B7C6E"/><stop offset="1" stopColor={F}/></linearGradient>
          <linearGradient id="of-g" x1="0" y1="0" x2="80" y2="94" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FAF0B0"/><stop offset="50%" stopColor="#C9A227"/><stop offset="100%" stopColor="#FAF0B0"/></linearGradient>
        </defs>
        <path d="M40 1 L78 15 L78 48 C78 70 62 85 40 93 C18 85 2 70 2 48 L2 15 Z" fill="url(#of-g)"/>
        <path d="M40 5.5 L74.5 18 L74.5 48 C74.5 68 60 81 40 89 C20 81 5.5 68 5.5 48 L5.5 18 Z" fill={F} opacity="0.5"/>
        <path d="M40 8 L72 20.5 L72 48 C72 66.5 58 79 40 86.5 C22 79 8 66.5 8 48 L8 20.5 Z" fill="url(#of-g)"/>
        <path d="M40 12 L68 23.5 L68 48 C68 64.5 55.5 76.5 40 83.5 C24.5 76.5 12 64.5 12 48 L12 23.5 Z" fill="url(#of-f)"/>
        <text x="40" y="55" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="22" fontWeight="900" fontFamily="Georgia,serif">Ya</text>
      </svg>
      <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif" }}>Sin conexión</h1>
      <p style={{ color: "#6B7C6E", fontSize: 15, textAlign: "center", maxWidth: 300, lineHeight: 1.6, margin: "0 0 28px" }}>
        Verificá tu conexión a internet y volvé a intentarlo.
      </p>
      <button onClick={() => window.location.reload()} style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 24, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 12 }}>
        Reintentar
      </button>
      <Link href="/" style={{ color: V, fontWeight: 600, fontSize: 14 }}>Volver al inicio</Link>
    </div>
  );
}
