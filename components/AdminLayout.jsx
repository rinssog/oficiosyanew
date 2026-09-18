/**
 * AdminLayout — chrome dedicado del backoffice.
 * Reemplaza al NavBar público en las páginas /admin (por eso desaparecen
 * Buscar/Planes/Soporte y la casilla de mensajes duplicada).
 * Navegación filtrada por rol de staff (RBAC), paleta institucional.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { navForRole, STAFF_ROLE_LABELS, canAccessSection, normalizeStaffRole } from "../lib/adminRbac";

/* Paleta institucional */
const C = {
  verdeOscuro: "#0D3B1F",
  verde: "#16A34A",
  dorado: "#C9A227",
  doradoClaro: "#F0D875",
  menta: "#BBF7D0",
  fondo: "#F5F8F3",
  panel: "#FFFFFF",
  borde: "#D4E0D6",
  textoSec: "#6B7C6E",
  ink: "#12261A",
};

/* Íconos por sección (SVG simples, monocromo) */
const ICONS = {
  dashboard: "M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z",
  verificaciones: "M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z",
  documentacion: "M6 2h9l5 5v15H6zM14 2v6h6",
  solicitudes: "M4 4h16v4H4zM4 10h16v4H4zM4 16h10v4H4z",
  reclamos: "M12 2L2 21h20zM12 9v5M12 17v.5",
  escrow: "M3 7h18v12H3zM3 7l9-4 9 4M8 12h.5M12 12h4",
  ratings: "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  "chat-alerts": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  facturacion: "M4 2h16v20l-3-2-3 2-3-2-3 2zM8 7h8M8 11h8M8 15h5",
  reportes: "M3 3v18h18M7 14l3-3 3 3 5-6",
};

function Icon({ section, size = 18 }) {
  const d = ICONS[section] || ICONS.dashboard;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function AdminLayout({ active = "dashboard", title, subtitle, badges = {}, actions = null, children }) {
  const { user, isReady, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/oya-ops/acceso"); return; }
    if (user.role !== "ADMIN") { router.replace("/"); return; }
  }, [isReady, user, router]);

  const staffRole = normalizeStaffRole(user?.staffRole);
  const groups = useMemo(() => navForRole(staffRole), [staffRole]);

  if (!isReady || !user || user.role !== "ADMIN") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.fondo, color: C.textoSec, fontFamily: "system-ui, sans-serif" }}>
        Cargando panel…
      </div>
    );
  }

  // Si el rol no puede ver la sección actual, avisar (no romper)
  const allowedHere = canAccessSection(staffRole, active);

  const Shield = (
    <svg width="26" height="30" viewBox="0 0 40 46" aria-hidden="true">
      <path d="M20 1 L38 8 V22 C38 34 30 41 20 45 C10 41 2 34 2 22 V8 Z" fill={C.verdeOscuro} stroke={C.dorado} strokeWidth="2" />
      <text x="20" y="29" textAnchor="middle" fontFamily="Georgia,serif" fontSize="16" fontWeight="700" fill={C.doradoClaro}>Ya</text>
    </svg>
  );

  const NavList = ({ onNavigate }) => (
    <nav style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {groups.map((g) => (
        <div key={g.group}>
          <div style={{ fontSize: ".66rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(240,216,117,.55)", fontWeight: 700, margin: "0 0 8px 10px" }}>{g.group}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {g.items.map((it) => {
              const on = it.section === active;
              const badge = badges[it.section];
              return (
                <Link key={it.href} href={it.href} onClick={onNavigate}
                  style={{
                    display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 9,
                    color: on ? "#fff" : "rgba(255,255,255,.72)",
                    background: on ? "linear-gradient(90deg, rgba(22,163,74,.9), rgba(22,163,74,.35))" : "transparent",
                    fontWeight: on ? 700 : 500, fontSize: ".9rem", textDecoration: "none",
                    borderLeft: on ? `3px solid ${C.dorado}` : "3px solid transparent",
                  }}>
                  <span style={{ display: "flex", color: on ? C.doradoClaro : "rgba(187,247,208,.7)" }}><Icon section={it.section} /></span>
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {badge ? <span style={{ background: C.dorado, color: C.verdeOscuro, borderRadius: 999, padding: "1px 8px", fontSize: ".7rem", fontWeight: 800 }}>{badge}</span> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <Head><title>{title ? `${title} · Admin OficiosYa` : "Admin OficiosYa"}</title><meta name="robots" content="noindex" /></Head>
      <div style={{ minHeight: "100vh", background: C.fondo, fontFamily: "system-ui, -apple-system, sans-serif", color: C.ink }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>

          {/* Sidebar (desktop) */}
          <aside className="admin-sidebar" style={{
            width: 258, flexShrink: 0, background: C.verdeOscuro, color: "#fff",
            padding: "20px 14px", position: "sticky", top: 0, height: "100vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 18px" }}>
              {Shield}
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.05rem" }}>OficiosYa</div>
                <div style={{ fontSize: ".64rem", letterSpacing: ".16em", textTransform: "uppercase", color: C.doradoClaro }}>Backoffice</div>
              </div>
            </div>
            <NavList />
          </aside>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {/* Topbar */}
            <header style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
              background: C.panel, borderBottom: `1px solid ${C.borde}`, position: "sticky", top: 0, zIndex: 10,
            }}>
              <button onClick={() => setMenuOpen((v) => !v)} className="admin-burger" aria-label="Menú"
                style={{ display: "none", background: "none", border: `1px solid ${C.borde}`, borderRadius: 8, padding: "6px 9px", cursor: "pointer", color: C.verdeOscuro }}>
                ☰
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: 0, fontSize: "clamp(1.1rem,3vw,1.4rem)", color: C.verdeOscuro, fontWeight: 800, fontFamily: "Georgia, serif" }}>{title || "Panel"}</h1>
                {subtitle && <div style={{ color: C.textoSec, fontSize: ".82rem", marginTop: 1 }}>{subtitle}</div>}
              </div>
              {actions}
              {/* Notificaciones (una sola) */}
              <Link href="/admin/chat-alerts" title="Alertas" style={{ position: "relative", color: C.verdeOscuro, display: "flex", padding: 6 }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
              </Link>
              {/* Usuario + rol */}
              <div style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 12, borderLeft: `1px solid ${C.borde}` }}>
                <div style={{ textAlign: "right", lineHeight: 1.15 }} className="admin-userchip">
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: C.ink }}>{user.name || user.email}</div>
                  <div style={{ fontSize: ".68rem", color: C.verde, fontWeight: 700 }}>{STAFF_ROLE_LABELS[staffRole] || "Staff"}</div>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.verde, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: ".85rem" }}>
                  {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
                </div>
                <button onClick={() => { logout(); router.replace("/oya-ops/acceso"); }} title="Salir"
                  style={{ background: "none", border: `1px solid ${C.borde}`, borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.textoSec }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                </button>
              </div>
            </header>

            {/* Drawer mobile */}
            {menuOpen && (
              <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 40 }}>
                <div onClick={(e) => e.stopPropagation()} style={{ width: 260, height: "100%", background: C.verdeOscuro, color: "#fff", padding: "20px 14px", overflowY: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 18px" }}>{Shield}<strong style={{ fontFamily: "Georgia,serif" }}>OficiosYa</strong></div>
                  <NavList onNavigate={() => setMenuOpen(false)} />
                </div>
              </div>
            )}

            {/* Contenido */}
            <main style={{ padding: "22px 20px 60px", flex: 1 }}>
              {!allowedHere ? (
                <div style={{ background: C.panel, border: `1px solid ${C.borde}`, borderRadius: 14, padding: 28, textAlign: "center", color: C.textoSec }}>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔒</div>
                  <h2 style={{ color: C.verdeOscuro, margin: "0 0 6px" }}>Sin acceso a esta sección</h2>
                  <p style={{ margin: 0 }}>Tu rol <b>{STAFF_ROLE_LABELS[staffRole]}</b> no tiene permiso para <b>{active}</b>. Pedí acceso a un Manager.</p>
                </div>
              ) : children}
            </main>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .admin-sidebar { display: none !important; }
          .admin-burger { display: inline-flex !important; }
        }
        @media (max-width: 520px) {
          .admin-userchip { display: none !important; }
        }
      `}</style>
    </>
  );
}
