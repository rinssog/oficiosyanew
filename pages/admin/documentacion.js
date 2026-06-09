/**
 * pages/admin/documentacion.js — Revisión de documentación KYC
 */
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../contexts/AuthContext";

const F = "#0D3B1F", V = "#16A34A";

const ADMIN_NAV = [
  { href: "/admin/dashboard",      label: "📊 Dashboard" },
  { href: "/admin/verificaciones", label: "🛡️ Verificaciones" },
  { href: "/admin/users",          label: "👥 Usuarios" },
  { href: "/admin/solicitudes",    label: "📋 Solicitudes" },
  { href: "/admin/escrow",         label: "💳 Escrow" },
  { href: "/admin/ratings",        label: "⭐ Reseñas" },
  { href: "/admin/reclamos",       label: "📝 Reclamos" },
  { href: "/admin/chat-alerts",    label: "🚨 Chat/Alertas" },
  { href: "/admin/documentacion",  label: "📄 Docs KYC" },
  { href: "/admin/reportes",       label: "📈 Reportes" },
];

export default function AdminDocs() {
  const { user, apiRequest, isReady } = useAuth();
  const router = useRouter();
  const [queue,   setQueue]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "ADMIN") { router.replace("/"); return; }
    load();
  }, [isReady, user]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/admin/documents/pending");
      if (data.ok === false) throw new Error(data.error || "No se pudo obtener la cola");
      setQueue(data.pending || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const navItems = useMemo(() => [
    ...ADMIN_NAV.slice(0, 2),
    { ...ADMIN_NAV[2], badge: queue.length ? String(queue.length) : undefined },
    ...ADMIN_NAV.slice(3),
  ], [queue.length]);

  if (!isReady || !user || user.role !== "ADMIN") return null;

  return (
    <>
      <Head><title>Documentación KYC · OficiosYa Admin</title></Head>
      <NavBar />
      <DashboardShell
        title="Revisión de documentación"
        subtitle="Cola de KYC — aprobar, rechazar u observar archivos de prestadores."
        navItems={navItems}
        active="/admin/documentacion"
        rightSlot={<button className="btn btn-ghost btn-sm" onClick={load}>🔄</button>}
      >
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
          </div>
        ) : (
          <div className="card-flat">
            <h3 style={{ margin: "0 0 16px", color: F, fontSize: 16, fontWeight: 800 }}>
              Cola de revisión — {queue.length} pendiente{queue.length !== 1 ? "s" : ""}
            </h3>
            {queue.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                ✅ Sin documentos pendientes de revisión.
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Prestador</th>
                      <th>Documento</th>
                      <th>Estado</th>
                      <th>Enviado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map(item => (
                      <tr key={`${item.providerId}-${item.type || "doc"}`}>
                        <td style={{ fontWeight: 600, color: F }}>{item.providerId?.slice(0, 14) || "—"}</td>
                        <td>{item.label || item.type || "—"}</td>
                        <td>
                          <span style={{ background: "#FFFBEB", color: "#92400E", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                          {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString("es-AR") : "—"}
                        </td>
                        <td>
                          <Link href={`/admin/verificaciones?providerId=${item.providerId}`}>
                            <button className="btn btn-primary btn-sm">Revisar →</button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="alert alert-info" style={{ fontSize: 13 }}>
          💡 Hacé click en "Revisar" para ver todos los documentos del prestador, aprobar o rechazar con nota.
          Los prestadores reciben notificación por email automáticamente.
        </div>
      </DashboardShell>
      <Footer />
    </>
  );
}
