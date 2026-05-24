/**
 * pages/auth/login.js
 * Login diferenciado por rol — Cliente · Prestador
 * Nota: acceso de administración NO está disponible aquí.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const ROLES = [
  {
    id: "CLIENT",
    label: "Soy Cliente",
    icon: "👤",
    desc: "Busco servicios y profesionales para mi hogar",
    color: V,
    bg: "#F0FDF4",
    border: "rgba(22,163,74,0.4)",
    dashboard: "/client/dashboard",
  },
  {
    id: "PROVIDER",
    label: "Soy Prestador",
    icon: "🛠️",
    desc: "Ofrezco servicios profesionales verificados",
    color: F,
    bg: "#F7F9F5",
    border: "rgba(13,59,31,0.4)",
    dashboard: "/providers/dashboard",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isReady } = useAuth();
  const [roleHint, setRoleHint] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  // Leer hint de rol desde query params (ej: /auth/login?role=PROVIDER)
  useEffect(() => {
    const r = router.query.role;
    if (r && ROLES.find(x => x.id === r)) setRoleHint(r);
  }, [router.query]);

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isReady && user) {
      const rol = ROLES.find(r => r.id === user.role);
      router.replace(rol?.dashboard || "/");
    }
  }, [isReady, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login({ email: form.email, password: form.password });
      router.push(result.redirectTo || "/");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas. Verificá tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === roleHint);

  return (
    <>
      <Head>
        <title>Ingresar · OficiosYa</title>
        <meta name="description" content="Accedé a tu cuenta de OficiosYa como cliente o prestador de servicios." />
      </Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "40px 20px 80px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 8px" }}>
              Ingresar a OficiosYa
            </h1>
            <p style={{ color: "#6B7C6E", fontSize: 15, margin: 0 }}>
              ¿Primera vez?{" "}
              <Link href="/auth/register" style={{ color: V, fontWeight: 700 }}>Creá tu cuenta gratis</Link>
            </p>
          </div>

          {/* Selector de rol */}
          {!roleHint && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#6B7C6E", textAlign: "center", marginBottom: 12 }}>
                ¿Con qué perfil ingresás?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRoleHint(r.id)}
                    style={{ background: "#fff", border: `2px solid #D4E0D6`, borderRadius: 14, padding: "14px 10px", cursor: "pointer", textAlign: "center", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.background = r.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#D4E0D6"; e.currentTarget.style.background = "#fff"; }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: F, lineHeight: 1.3 }}>{r.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card de rol seleccionado */}
          {selectedRole && (
            <div style={{ background: selectedRole.bg, border: `2px solid ${selectedRole.border}`, borderRadius: 16, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{selectedRole.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: selectedRole.color, fontSize: 15 }}>{selectedRole.label}</div>
                <div style={{ fontSize: 12, color: "#6B7C6E" }}>{selectedRole.desc}</div>
              </div>
              <button onClick={() => setRoleHint(null)}
                style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
            </div>
          )}

          {/* Formulario */}
          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "28px 24px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: F, display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = V}
                  onBlur={e => e.target.style.borderColor = "#D4E0D6"}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: F, display: "block", marginBottom: 6 }}>
                  Contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="Tu contraseña"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = V}
                    onBlur={e => e.target.style.borderColor = "#D4E0D6"}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 16 }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ background: loading ? "#9CA3AF" : `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, transition: "background .2s" }}>
                {loading ? "Verificando..." : selectedRole ? `Ingresar como ${selectedRole.label}` : "Ingresar"}
              </button>

            </form>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>
              ¿Olvidaste tu contraseña?{" "}
              <Link href="/soporte" style={{ color: V, fontWeight: 600 }}>Contactá soporte</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
