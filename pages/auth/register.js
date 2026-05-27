/**
 * pages/auth/register.js
 * Registro diferenciado — Cliente o Prestador con UI específica por rol
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const ROLE_OPTIONS = [
  {
    id: "CLIENT",
    icon: "👤",
    title: "Soy Cliente",
    subtitle: "Quiero contratar servicios",
    perks: ["Búsqueda de prestadores verificados", "Pago protegido (escrow)", "Garantía 30 días obligatoria", "Urgencias 24/7"],
    color: V,
    bg: "#F0FDF4",
    border: V,
    accentText: "#166534",
  },
  {
    id: "PROVIDER",
    icon: "🛠️",
    title: "Soy Prestador",
    subtitle: "Quiero ofrecer mis servicios",
    perks: ["Clientes verificados en tu zona", "Cobro garantizado y seguro", "Dashboard de KPIs", "Planes desde $0/mes"],
    color: F,
    bg: "#F7F9F5",
    border: F,
    accentText: F,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isReady } = useAuth();
  const [step, setStep]       = useState(1); // 1: elegir rol · 2: datos
  const [role, setRole]       = useState(null);
  const [form, setForm]       = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [showPass, setShowPass] = useState(false);

  // Pre-seleccionar rol desde query
  useEffect(() => {
    const r = router.query.role;
    if (r === "PROVIDER" || r === "CLIENT") { setRole(r); setStep(2); }
  }, [router.query]);

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isReady && user) {
      router.replace(user.role === "PROVIDER" ? "/providers/dashboard" : "/client/dashboard");
    }
  }, [isReady, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await register({ name: form.name, email: form.email, password: form.password, role });
      router.push(result.redirectTo || "/");
    } catch (err) {
      setError(err.message || "Error al crear la cuenta. Intentá con otro email.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLE_OPTIONS.find(r => r.id === role);

  return (
    <>
      <Head>
        <title>Crear cuenta · OficiosYa</title>
        <meta name="description" content="Registrate en OficiosYa como cliente o prestador de servicios." />
      </Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "40px 20px 80px" }}>
        <div style={{ maxWidth: step === 1 ? 720 : 500, margin: "0 auto", transition: "max-width .3s" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: F, fontFamily: "Georgia,serif", margin: "0 0 8px" }}>
              {step === 1 ? "¿Cómo vas a usar OficiosYa?" : `Crear cuenta ${selectedRole?.title || ""}`}
            </h1>
            <p style={{ color: "#6B7C6E", fontSize: 15, margin: 0 }}>
              ¿Ya tenés cuenta?{" "}
              <Link href="/auth/login" style={{ color: V, fontWeight: 700 }}>Ingresá acá</Link>
            </p>
          </div>

          {/* PASO 1 — Elegir rol */}
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
              {ROLE_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => { setRole(opt.id); setStep(2); }}
                  style={{ background: "#fff", border: `2px solid #D4E0D6`, borderRadius: 20, padding: "28px 24px", cursor: "pointer", textAlign: "left", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.background = opt.bg; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#D4E0D6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{opt.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: F, marginBottom: 4, fontFamily: "Georgia,serif" }}>{opt.title}</div>
                  <div style={{ fontSize: 14, color: "#6B7C6E", marginBottom: 20 }}>{opt.subtitle}</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {opt.perks.map(p => (
                      <li key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                        <span style={{ color: opt.color, fontWeight: 900, fontSize: 16 }}>✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 24, background: opt.color, color: "#fff", borderRadius: 12, padding: "12px", textAlign: "center", fontWeight: 800, fontSize: 15 }}>
                    Registrarme como {opt.title.replace("Soy ", "")} →
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* PASO 2 — Datos del usuario */}
          {step === 2 && selectedRole && (
            <>
              {/* Badge del rol seleccionado */}
              <div style={{ background: selectedRole.bg, border: `2px solid ${selectedRole.border}`, borderRadius: 14, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{selectedRole.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: selectedRole.accentText, fontSize: 15 }}>{selectedRole.title}</div>
                  <div style={{ fontSize: 12, color: "#6B7C6E" }}>{selectedRole.subtitle}</div>
                </div>
                <button onClick={() => { setStep(1); setRole(null); setError(null); }}
                  style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 14, textDecoration: "underline" }}>
                  Cambiar
                </button>
              </div>

              {/* Form */}
              <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "28px 24px" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F, display: "block", marginBottom: 6 }}>
                      {role === "PROVIDER" ? "Nombre completo o razón social" : "Nombre completo"}
                    </label>
                    <input type="text" placeholder={role === "PROVIDER" ? "Ej: Juan Pérez Electricidad" : "Ej: María González"}
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = V}
                      onBlur={e => e.target.style.borderColor = "#D4E0D6"} />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F, display: "block", marginBottom: 6 }}>Email</label>
                    <input type="email" placeholder="tu@email.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = V}
                      onBlur={e => e.target.style.borderColor = "#D4E0D6"} />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F, display: "block", marginBottom: 6 }}>Contraseña</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPass ? "text" : "password"} placeholder="Mínimo 8 caracteres"
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8}
                        style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                        onFocus={e => e.target.style.borderColor = V}
                        onBlur={e => e.target.style.borderColor = "#D4E0D6"} />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 16 }}>
                        {showPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: F, display: "block", marginBottom: 6 }}>Repetir contraseña</label>
                    <input type="password" placeholder="Repetí tu contraseña"
                      value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = V}
                      onBlur={e => e.target.style.borderColor = "#D4E0D6"} />
                  </div>

                  {error && (
                    <div style={{ background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>
                    Al crear la cuenta aceptás los{" "}
                    <Link href="/terminos" style={{ color: V }}>Términos y Condiciones</Link>{" "}
                    y la{" "}
                    <Link href="/politica-privacidad" style={{ color: V }}>Política de Privacidad</Link>.
                  </div>

                  <button type="submit" disabled={loading}
                    style={{ background: loading ? "#9CA3AF" : `linear-gradient(135deg,${selectedRole.color === V ? V : F},${F})`, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", transition: "background .2s" }}>
                    {loading ? "Creando cuenta..." : `Crear mi cuenta ${selectedRole.title.replace("Soy ", "")}`}
                  </button>
                </form>

                {role === "PROVIDER" && (
                  <div style={{ marginTop: 16, background: "#FFFBEB", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
                    📋 <strong>Proceso de verificación:</strong> Después del registro deberás subir tu DNI, constancia AFIP y (si aplica) matrícula habilitante para aparecer en los resultados de búsqueda.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
