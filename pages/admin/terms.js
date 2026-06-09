/**
 * pages/admin/terms.js — Editar Términos y Condiciones
 * Migrado a useAuth + apiRequest — sin campo manual de token
 */
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F";

const ADMIN_NAV = [
  { href: "/admin/dashboard",      label: "KPI generales" },
  { href: "/admin/users",          label: "Usuarios" },
  { href: "/admin/verificaciones", label: "Verificaciones" },
  { href: "/admin/solicitudes",    label: "Solicitudes" },
  { href: "/admin/reclamos",       label: "📝 Reclamos" },
  { href: "/admin/escrow",         label: "Escrow" },
  { href: "/admin/ratings",        label: "Calificaciones" },
  { href: "/admin/chat-alerts",    label: "Chat/Alertas" },
  { href: "/admin/documentacion",  label: "CMS Docs" },
  { href: "/admin/reportes",       label: "Reportes" },
];

export default function AdminTermsPage() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();

  const [form,    setForm]    = useState({ version: "", title: "", content: "" });
  const [message, setMessage] = useState(null);
  const [error,   setError]   = useState(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "ADMIN") { router.replace("/"); return; }
  }, [isReady, user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.version.trim()) { setError("La versión es obligatoria (ej: 1.1.0)"); return; }
    if (!form.content.trim()) { setError("El contenido no puede estar vacío"); return; }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const data = await apiRequest("/api/admin/terms", {
        method: "POST",
        body: JSON.stringify({ version: form.version, title: form.title, content: form.content }),
      });
      if (data.ok === false) throw new Error(data.error || "Error al actualizar");
      setMessage("✅ Términos actualizados correctamente. La página /terminos refleja el nuevo contenido.");
      setForm({ version: "", title: "", content: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || !user || user.role !== "ADMIN") return null;

  return (
    <>
      <Head><title>Términos y Condiciones · OficiosYa Admin</title></Head>
      <NavBar />
      <DashboardShell
        title="Editar Términos y Condiciones"
        subtitle="Publicá una nueva versión de los Términos. Los cambios son inmediatos y quedan auditados."
        navItems={ADMIN_NAV}
        active="/admin/terms"
      >
        {message && <div className="alert alert-success">{message}</div>}
        {error   && <div className="alert alert-danger">{error}</div>}

        <div className="alert alert-info" style={{ fontSize: 13 }}>
          ⚠️ <strong>Importante:</strong> Al guardar una nueva versión, los usuarios serán notificados al próximo inicio de sesión
          y deberán aceptar los nuevos términos para continuar usando la plataforma.
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card-flat" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600, color: F }}>
              Número de versión *
              <input
                type="text"
                name="version"
                value={form.version}
                onChange={handleChange}
                placeholder="Ej: 1.1.0"
                required
                style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 14, outline: "none" }}
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>Usá semver (MAJOR.MINOR.PATCH)</span>
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600, color: F }}>
              Título del documento
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Términos y Condiciones de Uso — OficiosYa"
                style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 14, outline: "none" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600, color: F }}>
              Contenido completo *
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={18}
                placeholder="Pegá aquí el texto completo del documento (Markdown o texto plano)..."
                required
                style={{ padding: "12px 14px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 13, fontFamily: "monospace", lineHeight: 1.6, outline: "none", resize: "vertical" }}
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>
                {form.content.length.toLocaleString("es-AR")} caracteres
              </span>
            </label>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Publicando..." : "📢 Publicar nueva versión"}
              </button>
              <button
                type="button"
                onClick={() => setForm({ version: "", title: "", content: "" })}
                className="btn btn-ghost"
                disabled={saving}
              >
                Limpiar
              </button>
            </div>
          </div>
        </form>

        <div style={{ background: "#F7F9F5", border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" }}>
          <strong style={{ color: F }}>Nota legal:</strong> Toda publicación queda registrada en el log de auditoría con fecha, hora y usuario administrador.
          Conservá siempre las versiones anteriores archivadas offline por cumplimiento normativo (Ley 25.326 y Res. AAIP).
        </div>
      </DashboardShell>
      <Footer />
    </>
  );
}
