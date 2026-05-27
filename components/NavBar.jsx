"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

/* ── Shield SVG logo ─────────────────────────────────────────── */
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

/* ── Hamburger icon ─────────────────────────────────────────── */
function HamburgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <style>{`
        .ham-line { transition: all 0.25s ease; transform-origin: center; }
      `}</style>
      {open ? (
        <>
          <line className="ham-line" x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line className="ham-line" x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line className="ham-line" x1="3" y1="6"  x2="19" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line className="ham-line" x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line className="ham-line" x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/* ── Chat icon ──────────────────────────────────────────────── */
function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ── Bell icon ──────────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

const getDashboard = (role) => {
  if (role === "PROVIDER") return "/providers/dashboard";
  if (role === "ADMIN")    return "/admin/dashboard";
  return "/client/dashboard";
};

export default function NavBar() {
  const { user, logout, isReady } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const drawerRef = useRef(null);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [router.pathname]);

  // Close drawer when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Poll unread chat messages
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/threads?unread=true`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (data.ok) setUnread(data.totalUnread || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") window.location.href = "/";
  };

  const dashHref = user ? getDashboard(user.role) : "/auth/login";

  const navLinks = [
    { href: "/client/buscar", label: "Buscar servicio" },
    { href: "/planes",        label: "Planes" },
    { href: "/soporte",       label: "Soporte" },
  ];

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 1000,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 clamp(12px,4vw,48px)", height: 60,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #D4E0D6",
        boxShadow: "0 2px 12px rgba(13,59,31,0.06)",
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Shield size={34} />
          <span style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 900, fontSize: 20, color: "#0D3B1F" }}>
            OficiosYa
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar-desktop-links">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              color: router.pathname === l.href ? "#0D3B1F" : "#4b5f55",
              fontWeight: router.pathname === l.href ? 700 : 500,
              textDecoration: "none", padding: "6px 12px", borderRadius: 8, fontSize: 14,
              background: router.pathname === l.href ? "rgba(22,163,74,0.08)" : "transparent",
              transition: "all 0.15s",
            }}>
              {l.label}
            </Link>
          ))}

          {!isReady ? null : user ? (
            <>
              {/* Chat button */}
              <Link href="/chat" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <button className="btn btn-ghost btn-icon" title="Chat">
                  <ChatIcon />
                  {unread > 0 && <span className="notif-dot" />}
                </button>
              </Link>

              {/* User badge */}
              <span style={{
                background: "#F0FDF4", border: "1px solid rgba(22,163,74,0.4)", borderRadius: 24,
                padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#166534",
              }}>
                {user.role === "PROVIDER" ? "🔧 " : user.role === "ADMIN" ? "⚙️ " : "👤 "}
                {user.name?.split(" ")[0] || user.email?.split("@")[0]}
              </span>

              <Link href={dashHref}>
                <button style={{
                  background: "rgba(22,163,74,0.10)", color: "#0D3B1F",
                  borderRadius: 24, padding: "8px 18px", border: "1px solid rgba(22,163,74,0.3)",
                  fontWeight: 600, cursor: "pointer", fontSize: 14,
                }}>
                  {user.role === "PROVIDER" ? "Mi panel" : user.role === "ADMIN" ? "Admin" : "Mis servicios"}
                </button>
              </Link>

              <button onClick={handleLogout} style={{
                background: "transparent", border: "none", color: "#dc2626",
                cursor: "pointer", padding: "6px 12px", fontSize: 14, fontWeight: 600, borderRadius: 8,
              }}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button style={{
                  background: "rgba(22,163,74,0.1)", color: "#0D3B1F",
                  borderRadius: 24, padding: "8px 18px", border: "1px solid rgba(22,163,74,0.3)",
                  fontWeight: 600, cursor: "pointer", fontSize: 14,
                }}>
                  Ingresar
                </button>
              </Link>
              <Link href="/auth/registro">
                <button style={{
                  background: "linear-gradient(135deg,#16A34A,#0D3B1F)", color: "#fff",
                  borderRadius: 24, padding: "8px 18px", border: "none",
                  fontWeight: 700, cursor: "pointer", fontSize: 14,
                  boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
                }}>
                  Registrarse
                </button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile right: chat + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {user && (
            <Link href="/chat" style={{ position: "relative", display: "flex" }} className="navbar-menu-btn">
              <ChatIcon />
              {unread > 0 && <span className="notif-dot" />}
            </Link>
          )}
          <button
            className="navbar-menu-btn"
            onClick={() => setOpen(o => !o)}
            aria-label="Menú"
            aria-expanded={open}
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div ref={drawerRef} className={`navbar-drawer${open ? " open" : ""}`}>
        {navLinks.map(l => (
          <Link key={l.href} href={l.href} className={`drawer-link${router.pathname === l.href ? " active" : ""}`}>
            {l.label}
          </Link>
        ))}

        <div style={{ height: 1, background: "#E5E7EB", margin: "4px 0" }} />

        {!isReady ? null : user ? (
          <>
            <div style={{ padding: "8px 16px", fontSize: 13, color: "#6B7C6E", fontWeight: 600 }}>
              {user.role === "PROVIDER" ? "🔧 " : user.role === "ADMIN" ? "⚙️ " : "👤 "}
              {user.name || user.email}
            </div>
            <Link href={dashHref} className="drawer-link">
              📊 Mi panel
            </Link>
            <Link href="/chat" className="drawer-link">
              💬 Chat {unread > 0 && <span className="badge badge-red" style={{ marginLeft: 8 }}>{unread}</span>}
            </Link>
            {user.role !== "ADMIN" && (
              <Link href={user.role === "CLIENT" ? "/client/reclamos" : "/client/reclamos"} className="drawer-link">
                📋 Mis reclamos
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="drawer-link"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", textAlign: "left" }}
            >
              🚪 Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="drawer-link">🔐 Ingresar</Link>
            <Link href="/auth/registro" className="drawer-link">✨ Registrarse</Link>
          </>
        )}
      </div>
    </>
  );
}
