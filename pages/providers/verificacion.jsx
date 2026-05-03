/**
 * pages/providers/verificacion.jsx
 * Flujo de verificación del prestador — carga de documentos
 */
import { useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";

const STEPS = [
  { id: "dni",       label: "DNI",           icon: "🪪", desc: "Frente y dorso del DNI",         required: true },
  { id: "matricula", label: "Matrícula",      icon: "📋", desc: "Habilitación profesional (si aplica)", required: false },
  { id: "antecedentes", label: "Antecedentes", icon: "⚖️", desc: "Certificado de antecedentes penales (RENAPER)", required: true },
  { id: "impositiva", label: "Situación fiscal", icon: "📊", desc: "Constancia de inscripción AFIP", required: true },
];

function FileUpload({ label, desc, required, onChange, uploaded }) {
  const ref = useRef(null);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: F, marginBottom: 4 }}>
        {label} {required && <span style={{ color: "#DC2626" }}>*</span>}
      </div>
      <div style={{ fontSize: 12, color: "#6B7C6E", marginBottom: 6 }}>{desc}</div>
      <label style={{ display: "flex", alignItems: "center", gap: 10, background: uploaded ? "#F0FDF4" : "#F9FAFB", border: `1.5px dashed ${uploaded ? V : "#D4E0D6"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
        <span style={{ fontSize: 18 }}>{uploaded ? "✅" : "📎"}</span>
        <span style={{ fontSize: 13, color: uploaded ? "#166534" : "#6B7C6E", fontWeight: uploaded ? 700 : 400 }}>
          {uploaded ? `Cargado: ${uploaded}` : "Seleccionar archivo (PDF o imagen)"}
        </span>
        <input ref={ref} type="file" accept="application/pdf,image/jpeg,image/png" style={{ display: "none" }} onChange={e => onChange(e.target.files?.[0])} />
      </label>
    </div>
  );
}

export default function VerificacionPage() {
  const { user, provider, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState({ dni: null, matricula: null, antecedentes: null, impositiva: null });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState(null);

  const setFile = (key, file) => setFiles(prev => ({ ...prev, [key]: file }));

  const toBase64 = (f) => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(f);
  });

  const handleSubmit = async () => {
    if (!files.dni || !files.antecedentes || !files.impositiva) {
      setErr("Debés cargar al menos DNI, antecedentes y situación fiscal."); return;
    }
    setSending(true); setErr(null);
    try {
      const payload = {};
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          payload[key] = { name: file.name, type: file.type, base64: await toBase64(file) };
        }
      }
      await apiRequest("/api/providers/verification/submit", {
        method: "POST",
        body: JSON.stringify({ providerId: provider?.id, documents: payload }),
      });
      setSuccess(true);
    } catch (e) {
      setErr(e.message || "Error al enviar. Intentá de nuevo.");
    } finally { setSending(false); }
  };

  if (!isReady) return null;
  if (!user || user.role !== "PROVIDER") {
    return <><NavBar /><div style={{ padding: 60, textAlign: "center", color: F }}>Acceso solo para prestadores. <Link href="/auth/login" style={{ color: V }}>Ingresar</Link></div><Footer /></>;
  }
  if (provider?.verified) {
    return (
      <>
        <NavBar />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#F0FDF4", border: "1.5px solid rgba(22,163,74,0.4)", borderRadius: 20, padding: "36px 32px", textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontSize: 60, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif", marginBottom: 8 }}>Tu perfil está verificado</div>
            <div style={{ color: "#166534", fontSize: 14, lineHeight: 1.6 }}>Ya tenés el escudo verde OficiosYa en tu perfil. Eso te da mayor visibilidad y genera confianza en los clientes.</div>
            <Link href="/providers/dashboard"><button style={{ marginTop: 20, background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 24, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>Ir a mi panel</button></Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (success) return (
    <>
      <NavBar />
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#F0FDF4", border: "1.5px solid rgba(22,163,74,0.4)", borderRadius: 20, padding: "36px 32px", textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>📬</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif", marginBottom: 8 }}>Documentación enviada</div>
          <div style={{ color: "#166534", fontSize: 14, lineHeight: 1.6 }}>Recibimos tu documentación. El equipo de OficiosYa la revisará en un plazo de 5 días hábiles y recibirás un email con el resultado.</div>
          <Link href="/providers/dashboard"><button style={{ marginTop: 20, background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 24, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>Volver a mi panel</button></Link>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Head><title>Verificación de identidad — OficiosYa</title></Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "28px 20px" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <Link href="/providers/dashboard" style={{ color: V, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← Volver</Link>

          <div style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "28px 24px", marginTop: 16 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
              <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: F, fontFamily: "Georgia,serif" }}>Verificación de identidad</h1>
              <p style={{ color: "#6B7C6E", fontSize: 14, margin: 0, lineHeight: 1.6 }}>Al verificarte obtenés el escudo verde en tu perfil, mayor visibilidad en los resultados y acceso a clientes corporativos.</p>
            </div>

            <div style={{ background: "#FFFBEB", border: "1px solid rgba(201,162,39,0.4)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400E", marginBottom: 20 }}>
              🔒 Tus documentos son confidenciales. Solo los revisa el equipo de compliance de OficiosYa para verificar tu identidad y nunca se comparten con terceros.
            </div>

            {err && <div style={{ background: "#FEF2F2", border: "1px solid #DC2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#991B1B", marginBottom: 16 }}>{err}</div>}

            {STEPS.map(s => (
              <FileUpload
                key={s.id}
                label={s.label}
                desc={s.desc}
                required={s.required}
                uploaded={files[s.id]?.name || null}
                onChange={f => setFile(s.id, f)}
              />
            ))}

            <div style={{ background: "#F0FDF4", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#166534", marginBottom: 20 }}>
              ℹ️ El certificado de antecedentes penales podés obtenerlo en <strong>argentina.gob.ar/justicia/reincidencia</strong> con tu clave fiscal. No debe tener más de 6 meses de antigüedad.
            </div>

            <button onClick={handleSubmit} disabled={sending} style={{ width: "100%", background: sending ? "#D4E0D6" : `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 24, padding: "14px", fontWeight: 800, fontSize: 15, cursor: sending ? "default" : "pointer" }}>
              {sending ? "Enviando documentación..." : "Enviar documentación →"}
            </button>
          </div>

          <div style={{ marginTop: 20, background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontWeight: 700, color: F, fontSize: 14, marginBottom: 12 }}>Niveles de verificación</div>
            {[["🔘 Básico","Email y teléfono verificado. Gratuito."],["🟢 Verificado","DNI + antecedentes + situación fiscal. Escudo verde."],["🥇 Gold","Automático al superar 50 reseñas con ≥4.8★. Escudo dorado."]].map(([t,d])=>(
              <div key={t} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{t.split(" ")[0]}</div>
                <div><div style={{ fontWeight: 700, fontSize: 13, color: F }}>{t.slice(3)}</div><div style={{ fontSize: 12, color: "#6B7C6E" }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
