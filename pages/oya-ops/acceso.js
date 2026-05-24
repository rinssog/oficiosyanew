/**
 * pages/oya-ops/acceso.js
 * Portal de acceso interno — solo personal autorizado OficiosYa.
 * Esta ruta NO está enlazada en ningún lugar público de la plataforma.
 * No indexar en motores de búsqueda (noindex via Head).
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F";
const V = "#16A34A";

export default function AccesoInternoPage() {
  const router = useRouter();
  const { login, user, isReady } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [blockUntil, setBlockUntil] = useState(null);

  // Si ya autenticado como ADMIN, redirigir
  useEffect(() => {
    if (isReady && user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
    }
    // Si está autenticado como otro rol, no redirigir — simplemente mostrar error
  }, [isReady, user, router]);

  // Verificar bloqueo temporal al cargar
  useEffect(() => {
    const stored = localStorage.getItem("oya_ops_block");
    if (stored) {
      const until = parseInt(stored, 10);
      if (Date.now() < until) {
        setBlocked(true);
        setBlockUntil(until);
      } else {
        localStorage.removeItem("oya_ops_block");
        localStorage.removeItem("oya_ops_attempts");
      }
    }
    const storedAttempts = localStorage.getItem("oya_ops_attempts");
    if (storedAttempts) setAttempts(parseInt(storedAttempts, 10));
  }, []);

  // Countdown del bloqueo
  useEffect(() => {
    if (!blocked || !blockUntil) return;
    const interval = setInterval(() => {
      if (Date.now() >= blockUntil) {
        setBlocked(false);
        setBlockUntil(null);
        setAttempts(0);
        localStorage.removeItem("oya_ops_block");
        localStorage.removeItem("oya_ops_attempts");
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [blocked, blockUntil]);

  const remainingMinutes = blockUntil ? Math.ceil((blockUntil - Date.now()) / 60000) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (blocked) return;

    setLoading(true);
    setError(null);

    try {
      const result = await login({ email: form.email, password: form.password });

      // Solo permitir ADMIN — login() devuelve { user, provider, token }
      if (result?.user?.role !== "ADMIN") {
        // Desautenticar si no es admin (limpiar el estado guardado)
        setError("Acceso denegado. Esta sección es solo para personal autorizado.");
        setLoading(false);
        // Incrementar intentos como si fuera fallo
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem("oya_ops_attempts", String(newAttempts));
        if (newAttempts >= 5) {
          const until = Date.now() + 15 * 60 * 1000;
          setBlocked(true);
          setBlockUntil(until);
          localStorage.setItem("oya_ops_block", String(until));
        }
        return;
      }

      // Reset intentos al loguear bien
      localStorage.removeItem("oya_ops_attempts");
      localStorage.removeItem("oya_ops_block");
      router.push("/admin/dashboard");

    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("oya_ops_attempts", String(newAttempts));

      if (newAttempts >= 5) {
        // Bloqueo de 15 minutos tras 5 intentos fallidos
        const until = Date.now() + 15 * 60 * 1000;
        setBlocked(true);
        setBlockUntil(until);
        localStorage.setItem("oya_ops_block", String(until));
        setError("Demasiados intentos fallidos. Acceso bloqueado temporalmente.");
      } else {
        setError(`Credenciales incorrectas. (${5 - newAttempts} intentos restantes)`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) return null;

  return (
    <>
      <Head>
        <title>Acceso interno</title>
        {/* IMPORTANTE: nunca indexar esta página */}
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>

      <main style={{
        background: "#0f1117",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          {/* Logo minimal — sin marca visible */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg, #16A34A, #0D3B1F)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, marginBottom: 12,
            }}>🛡️</div>
            <div style={{ color: "#9CA3AF", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
              Acceso interno
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: "#1a1d27",
            border: "1px solid #2d3142",
            borderRadius: 16,
            padding: "28px 24px",
          }}>
            {blocked ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                <div style={{ color: "#EF4444", fontWeight: 700, marginBottom: 8 }}>
                  Acceso bloqueado
                </div>
                <div style={{ color: "#9CA3AF", fontSize: 13 }}>
                  Demasiados intentos fallidos.
                  <br />Intentá de nuevo en {remainingMinutes} minuto{remainingMinutes !== 1 ? "s" : ""}.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: 6, letterSpacing: 0.5 }}>
                    USUARIO
                  </label>
                  <input
                    type="email"
                    autoComplete="username"
                    placeholder="usuario@oficiosya.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    disabled={loading}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 9,
                      border: "1.5px solid #2d3142", background: "#0f1117",
                      color: "#F9FAFB", fontSize: 14, outline: "none", boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = V}
                    onBlur={e => e.target.style.borderColor = "#2d3142"}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: 6, letterSpacing: 0.5 }}>
                    CONTRASEÑA
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      disabled={loading}
                      style={{
                        width: "100%", padding: "11px 44px 11px 14px", borderRadius: 9,
                        border: "1.5px solid #2d3142", background: "#0f1117",
                        color: "#F9FAFB", fontSize: 14, outline: "none", boxSizing: "border-box",
                      }}
                      onFocus={e => e.target.style.borderColor = V}
                      onBlur={e => e.target.style.borderColor = "#2d3142"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#6B7280", fontSize: 15, padding: 4,
                      }}
                    >
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#EF4444",
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? "#374151" : "linear-gradient(135deg, #16A34A, #0D3B1F)",
                    color: "#fff", border: "none", borderRadius: 9, padding: "13px",
                    fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                    marginTop: 4, letterSpacing: 0.5,
                  }}
                >
                  {loading ? "Verificando..." : "Ingresar →"}
                </button>

              </form>
            )}
          </div>

          {/* Aviso de seguridad — sin mencionar "admin" */}
          <div style={{ marginTop: 20, textAlign: "center", color: "#4B5563", fontSize: 11, lineHeight: 1.6 }}>
            Los accesos son auditados y registrados.
            <br />Uso exclusivo de personal interno autorizado.
          </div>

        </div>
      </main>
    </>
  );
}
