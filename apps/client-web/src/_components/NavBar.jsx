"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

const headerStyle = {
  position: "sticky",
  top: 0,
  zIndex: 1000,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px clamp(16px, 4vw, 56px)",
  background: "rgba(245, 251, 247, 0.94)",
  backdropFilter: "blur(14px)",
  borderBottom: "1px solid var(--border)",
};

const navStyle = {
  display: "flex",
  gap: 18,
  alignItems: "center",
};

const linkStyle = {
  color: "var(--text-soft)",
  fontWeight: 500,
  textDecoration: "none",
};

const primaryButton = {
  background: "var(--primary)",
  color: "var(--primary-contrast)",
  borderRadius: 999,
  padding: "10px 18px",
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(22, 101, 52, 0.18)",
};

const secondaryButton = {
  background: "rgba(22, 101, 52, 0.12)",
  color: "var(--primary-700)",
  borderRadius: 999,
  padding: "10px 18px",
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
};

export default function NavBar() {
  const { user, provider, logout, isReady } = useAuth();

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const primaryLinks = [
    { href: "/planes", label: "Planes" },
    { href: "/contacto", label: "Contacto" },
    { href: "/soporte", label: "Centro de ayuda" },
  ];

  return (
    <header style={headerStyle}>
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          color: "var(--primary-700)",
          fontWeight: 700,
          fontSize: 24,
          textDecoration: "none",
        }}
      >
        <img className="logo-breathe" src="/assets/oficiosya-logo.svg" alt="OficiosYa" width={60} height={60} />
        <span>OficiosYa</span>
      </Link>
      <nav style={navStyle}>
        {primaryLinks.map((link) => (
          <Link key={link.href} href={link.href} style={linkStyle}>
            {link.label}
          </Link>
        ))}
        {isReady && user ? (
          <>
            <span style={{ color: "var(--primary-700)", fontWeight: 600 }}>
              {user.name || user.email}
              {provider ? " · Prestador" : ""}
            </span>
            <button type="button" onClick={handleLogout} style={primaryButton}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/auth/login?role=client" style={{ ...secondaryButton, textDecoration: "none" }}>
              Ingresar clientes
            </Link>
            <Link href="/auth/login?role=provider" style={{ ...secondaryButton, textDecoration: "none" }}>
              Ingresar prestadores
            </Link>
            <Link href="/auth/register" style={{ ...primaryButton, textDecoration: "none" }}>
              Crear cuenta
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

