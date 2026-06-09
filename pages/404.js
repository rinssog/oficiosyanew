/**
 * pages/404.js — Página no encontrada
 */
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

export default function NotFoundPage() {
  const { user } = useAuth();
  const router = useRouter();

  const links = user
    ? user.role === "PROVIDER"
      ? [
          { href: "/providers/dashboard", label: "Mi panel" },
          { href: "/providers/solicitudes", label: "Solicitudes" },
          { href: "/chat", label: "Chat" },
        ]
      : user.role === "ADMIN"
      ? [{ href: "/admin/dashboard", label: "Panel Admin" }]
      : [
          { href: "/client/dashboard", label: "Mi panel" },
          { href: "/client/buscar", label: "Buscar prestadores" },
          { href: "/client/urgencias", label: "Urgencias 24/7" },
        ]
    : [
        { href: "/", label: "Inicio" },
        { href: "/auth/login", label: "Ingresar" },
        { href: "/auth/register", label: "Registrarme" },
      ];

  return (
    <>
      <Head>
        <title>Página no encontrada · OficiosYa</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main
        style={{
          minHeight: "100vh",
          background: "#F7F9F5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          fontFamily: "system-ui,sans-serif",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          <svg width="52" height="62" viewBox="0 0 80 94" fill="none">
            <defs>
              <linearGradient id="f4-g" x1="0" y1="0" x2="80" y2="94" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FAF0B0" />
                <stop offset="50%" stopColor="#C9A227" />
                <stop offset="100%" stopColor="#FAF0B0" />
              </linearGradient>
              <linearGradient id="f4-f" x1="40" y1="4" x2="40" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="#16A34A" /><stop offset="1" stopColor="#0D3B1F" />
              </linearGradient>
            </defs>
            <path d="M40 1 L78 15 L78 48 C78 70 62 85 40 93 C18 85 2 70 2 48 L2 15 Z" fill="url(#f4-g)" />
            <path d="M40 12 L68 23.5 L68 48 C68 64.5 55.5 76.5 40 83.5 C24.5 76.5 12 64.5 12 48 L12 23.5 Z" fill="url(#f4-f)" />
            <text x="40" y="55" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="22" fontWeight="900" fontFamily="Georgia,serif">Ya</text>
          </svg>
        </div>

        <div style={{ fontSize: 72, fontWeight: 900, color: "#D4E0D6", marginBottom: 8, lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 12px" }}>
          Esta página no existe
        </h1>
        <p style={{ color: "#6B7C6E", fontSize: 15, marginBottom: 32, maxWidth: 380, lineHeight: 1.6 }}>
          La URL que buscás no existe o fue movida. Usá los accesos de abajo para volver a la plataforma.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <button
                style={{
                  width: "100%",
                  background: l === links[0] ? `linear-gradient(135deg,${V},${F})` : "#fff",
                  color: l === links[0] ? "#fff" : F,
                  border: `2px solid ${l === links[0] ? "transparent" : "#D4E0D6"}`,
                  borderRadius: 14,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {l.label}
              </button>
            </Link>
          ))}

          <button
            onClick={() => router.back()}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              color: "#9CA3AF",
              fontSize: 13,
              cursor: "pointer",
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            ← Volver atrás
          </button>
        </div>

        <div style={{ marginTop: 40, fontSize: 12, color: "#9CA3AF" }}>
          OficiosYa · <a href="/soporte" style={{ color: V }}>Soporte</a>
        </div>
      </main>
    </>
  );
}
