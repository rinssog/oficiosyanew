"use client";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

// ─── SHIELD SVG con marco dorado + "Ya" centrado ─────────────────────────────
function Shield({ size = 34 }) {
  const id = `nav-sh-${size}`;
  return (
    <svg width={size} height={size * 1.18} viewBox="0 0 80 94" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="40" y1="4" x2="40" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16A34A" /><stop offset="1" stopColor="#0D3B1F" />
        </linearGradient>
        <linearGradient id={`${id}-go`} x1="0" y1="0" x2="80" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FAF0B0" />
          <stop offset="25%" stopColor="#F0D875" />
          <stop offset="50%" stopColor="#C9A227" />
          <stop offset="75%" stopColor="#F0D875" />
          <stop offset="100%" stopColor="#FAF0B0" />
        </linearGradient>
        <linearGradient id={`${id}-gi`} x1="80" y1="0" x2="0" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FAF0B0" />
          <stop offset="40%" stopColor="#F0D875" />
          <stop offset="65%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#FAF0B0" />
        </linearGradient>
      </defs>
      <path d="M40 1 L78 15 L78 48 C78 70 62 85 40 93 C18 85 2 70 2 48 L2 15 Z" fill={`url(#${id}-go)`} />
      <path d="M40 5.5 L74.5 18 L74.5 48 C74.5 68 60 81 40 89 C20 81 5.5 68 5.5 48 L5.5 18 Z" fill="#0D3B1F" opacity="0.55" />
      <path d="M40 8 L72 20.5 L72 48 C72 66.5 58 79 40 86.5 C22 79 8 66.5 8 48 L8 20.5 Z" fill={`url(#${id}-gi)`} />
      <path d="M40 12 L68 23.5 L68 48 C68 64.5 55.5 76.5 40 83.5 C24.5 76.5 12 64.5 12 48 L12 23.5 Z" fill={`url(#${id}-fill)`} />
      <ellipse cx="28" cy="30" rx="9" ry="5" fill="rgba(255,255,255,0.20)" transform="rotate(-25 28 30)" />
      <text x="40" y="55" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="24" fontWeight="900" fontFamily="Georgia,'Times New Roman',serif" letterSpacing="-0.5">Ya</text>
      <path d="M33 83.5 Q40 89 47 83.5" stroke="#F0D875" strokeWidth="1.2" fill="none" opacity="0.6" />
    </svg>
  );
}

const S = {
  header: {
    position: "sticky", top: 0, zIndex: 1000,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0 clamp(16px,4vw,56px)", height: 60,
    background: "rgba(255,255,255,0.96)", backdropFilter: "blur(14px)",
    borderBottom: "1px solid #D4E0D6",
    boxShadow: "0 2px 12px rgba(13,59,31,0.06)",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  logoText: { fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 900, fontSize: 22, color: "#0D3B1F", lineHeight: 1 },
  nav: { display: "flex", gap: 6, alignItems: "center" },
  link: { color: "#4b5f55", fontWeight: 500, textDecoration: "none", padding: "6px 12px", borderRadius: 8, fontSize: 14 },
  btnPrimary: {
    background: "linear-gradient(135deg,#16A34A,#0D3B1F)", color: "#fff",
    borderRadius: 24, padding: "8px 18px", border: "none",
    fontWeight: 700, cursor: "pointer", fontSize: 14,
    boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
  },
  btnSecondary: {
    background: "rgba(22,163,74,0.1)", color: "#0D3B1F",
    borderRadius: 24, padding: "8px 18px", border: "1px solid rgba(22,163,74,0.3)",
    fontWeight: 600, cursor: "pointer", fontSize: 14,
  },
  userBadge: {
    background: "#F0FDF4", border: "1px solid rgba(22,163,74,0.4)", borderRadius: 24,
    padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#166534",
  },
};

export default function NavBar() {
  const { user, provider, logout, isReady } = useAuth();
  const handleLogout = () => { logout(); if (typeof window !== "undefined") window.location.href = "/"; };

  return (
    <header style={S.header}>
      <Link href="/" style={S.logo}>
        <Shield size={36} />
        <span style={S.logoText}>OficiosYa</span>
      </Link>

      <nav style={S.nav}>
        <Link href="/client/buscar" style={S.link}>Buscar servicio</Link>
        <Link href="/planes" style={S.link}>Planes</Link>
        <Link href="/soporte" style={S.link}>Soporte</Link>

        {!isReady ? null : user ? (
          <>
            <span style={S.userBadge}>
              {user.role === "PROVIDER" ? "🔧 " : user.role === "ADMIN" ? "⚙️ " : "👤 "}
              {user.name?.split(" ")[0] || user.email?.split("@")[0]}
            </span>
            {user.role === "PROVIDER" && (
              <Link href="/providers/dashboard"><button style={S.btnSecondary}>Mi panel</button></Link>
            )}
            {user.role === "CLIENT" && (
              <Link href="/client/dashboard"><button style={S.btnSecondary}>Mis solicitudes</button></Link>
            )}
            {user.role === "ADMIN" && (
              <Link href="/admin/dashboard"><button style={S.btnSecondary}>Admin</button></Link>
            )}
            <button onClick={handleLogout} style={{ ...S.link, color: "#dc2626" }}>Salir</button>
          </>
        ) : (
          <>
            <Link href="/auth/login"><button style={S.btnSecondary}>Ingresar</button></Link>
            <Link href="/auth/registro">
              <button style={S.btnPrimary}>Postulá tu oficio</button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
