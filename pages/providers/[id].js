/**
 * pages/providers/[id].js — Perfil público del prestador
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const F = "#0D3B1F", V = "#16A34A", G = "#C9A227";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const priceFmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

const resolveUrl = (p) => (p && (p.startsWith("http") ? p : `${API_BASE}${p}`));

const BADGE = {
  APPROVED: { label: "✅ Verificado", bg: "#F0FDF4", color: "#166534", border: "rgba(22,163,74,0.3)" },
  PENDING:  { label: "⏳ En revisión", bg: "#FFFBEB", color: "#92400E", border: "rgba(201,162,39,0.3)" },
  REJECTED: { label: "❌ No aprobado", bg: "#FEF2F2", color: "#991B1B", border: "#FCA5A5" },
};

function VerifiedBadge({ status }) {
  const b = BADGE[status] || BADGE.PENDING;
  return (
    <span style={{ background: b.bg, color: b.color, border: `1.5px solid ${b.border}`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
      {b.label}
    </span>
  );
}

function StarRating({ rating = 0, count = 0 }) {
  const stars = Math.round(rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: G, fontSize: 16 }}>{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: F }}>{rating > 0 ? rating.toFixed(1) : "Nuevo"}</span>
      {count > 0 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({count} reseñas)</span>}
    </div>
  );
}

export default function ProviderPublicPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/providers/${id}/public`)
      .then(r => r.json())
      .then(p => {
        if (p.ok === false) throw new Error(p.error || "Prestador no encontrado");
        setData(p);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Cargar reseñas reales del prestador
  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    fetch(`${API_BASE}/api/ratings/provider/${id}`)
      .then(r => r.json())
      .then(p => {
        const list = p?.ratings || p?.reviews || [];
        setReviews(Array.isArray(list) ? list : []);
      })
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const displayName = data?.owner?.name || data?.owner?.email || "Prestador";
  const areas        = useMemo(() => data?.profile?.areas || [], [data]);
  const documents    = useMemo(() => data?.profile?.documents || [], [data]);
  const services     = useMemo(() => data?.services || [], [data]);
  const rating       = data?.provider?.rating || 0;
  const reviewCount  = data?.provider?.reviewCount || 0;
  const joined       = data?.provider?.createdAt ? new Date(data.provider.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long" }) : "—";
  const verified     = data?.profile?.verificationStatus || "PENDING";

  return (
    <>
      <Head>
        <title>{displayName} · Prestador verificado — OficiosYa</title>
        <meta name="description" content={`${displayName} — prestador de servicios del hogar verificado en OficiosYa. ${services.length} servicios disponibles en ${areas.slice(0,2).join(", ")}.`} />
      </Head>
      <NavBar />

      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "0 0 60px" }}>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 100, borderRadius: 16, background: "linear-gradient(90deg,#e8f4eb 25%,#f0fdf4 50%,#e8f4eb 75%)", backgroundSize: "200%", animation: "skeleton-shimmer 1.4s ease infinite" }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
            <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 16, padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>😞</div>
              <div style={{ fontWeight: 800, color: F, fontSize: 18, marginBottom: 8 }}>Prestador no encontrado</div>
              <div style={{ color: "#6B7C6E", marginBottom: 16 }}>{error}</div>
              <Link href="/client/buscar"><button style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 24, padding: "10px 22px", fontWeight: 700, cursor: "pointer" }}>Buscar otro prestador</button></Link>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px" }}>

            {/* Header card */}
            <div style={{ background: `linear-gradient(135deg,${F} 0%,#1A5C35 100%)`, padding: "40px 32px 80px", marginBottom: -60, borderRadius: "0 0 30px 30px", position: "relative" }}>
              <Link href="/client/buscar" style={{ color: "#BBF7D0", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-block", marginBottom: 20 }}>← Volver a búsqueda</Link>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Avatar */}
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", flexShrink: 0 }}>
                  {displayName[0]?.toUpperCase() || "P"}
                </div>
                <div>
                  <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "Georgia,serif" }}>{displayName}</h1>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <VerifiedBadge status={verified} />
                    <span style={{ color: "#BBF7D0", fontSize: 12 }}>Miembro desde {joined}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main card */}
            <div style={{ position: "relative", zIndex: 2 }}>

              {/* Stats strip */}
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #D4E0D6", padding: "20px 24px", marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <StarRating rating={rating} count={reviewCount} />
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Calificación</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: F }}>{services.length}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Servicios</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: F }}>{areas.length}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Zonas de trabajo</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: V }}>30 días</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Garantía</div>
                </div>
              </div>

              {/* Zonas */}
              {areas.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #D4E0D6", padding: "18px 22px", marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, color: F, fontSize: 14, marginBottom: 10 }}>📍 Zonas de trabajo</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {areas.map(a => (
                      <span key={a} style={{ background: "#F0FDF4", color: "#166534", border: "1.5px solid rgba(22,163,74,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentación */}
              {documents.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #D4E0D6", padding: "18px 22px", marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, color: F, fontSize: 14, marginBottom: 10 }}>🛡️ Documentación verificada</div>
                  <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
                    {documents.map(doc => (
                      <div key={doc.type} style={{ border: "1.5px solid #D4E0D6", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: F }}>{doc.label}</div>
                          <VerifiedBadge status={doc.status} />
                        </div>
                        {doc.url && (
                          <a href={resolveUrl(doc.url)} target="_blank" rel="noopener noreferrer" style={{ color: V, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Ver →</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servicios */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #D4E0D6", padding: "18px 22px", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, color: F, fontSize: 14, marginBottom: 14 }}>🔧 Servicios disponibles</div>
                {services.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>Este prestador todavía no publicó servicios.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {services.map(srv => (
                      <div key={srv.id} style={{ border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: F, marginBottom: 2 }}>
                            {srv.catalog?.nombre || srv.category || "Servicio"}
                          </div>
                          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                            {[srv.catalog?.rubro, srv.catalog?.subrubro].filter(Boolean).join(" · ")}
                          </div>
                          {srv.notes && (
                            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginBottom: 8 }}>{srv.notes}</div>
                          )}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {(srv.modalities || []).map(m => (
                              <span key={m} style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid rgba(29,78,216,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{m}</span>
                            ))}
                            {srv.allowsUrgent && (
                              <span style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>🚨 Urgencias</span>
                            )}
                            {srv.estimatedDuration && (
                              <span style={{ background: "#F7F9F5", color: "#6B7C6E", borderRadius: 20, padding: "2px 10px", fontSize: 11 }}>⏱ {srv.estimatedDuration} min</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                          <div style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 18, color: F }}>
                            {priceFmt.format((srv.price || 0) / 100)}
                          </div>
                          <Link href={`/solicitar/${srv.id}?providerId=${id}`}>
                            <button style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 20, padding: "10px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                              Solicitar →
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reseñas */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #D4E0D6", padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, color: F, fontSize: 15 }}>⭐ Reseñas</div>
                  {reviewCount > 0 && (
                    <div style={{ fontSize: 13, color: "#6B7C6E" }}>
                      <b style={{ color: F }}>{rating.toFixed(1)}</b> ★ · {reviewCount} reseña{reviewCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                {reviewsLoading ? (
                  <p style={{ color: "#6B7C6E", margin: 0, fontSize: 13 }}>Cargando reseñas…</p>
                ) : reviews.length === 0 ? (
                  <p style={{ color: "#6B7C6E", margin: 0, fontSize: 13 }}>
                    {reviewCount === 0
                      ? "Este prestador todavía no tiene reseñas. ¡Sé el primero en contratar y calificar!"
                      : "Todavía no hay comentarios publicados."}
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reviews.slice(0, 10).map((rv, i) => {
                      const score = Math.max(0, Math.min(5, Math.round(rv.score || rv.quality || 0)));
                      const when = rv.createdAt ? new Date(typeof rv.createdAt === "number" ? rv.createdAt : Date.parse(rv.createdAt)) : null;
                      const whenTxt = when && !isNaN(when) ? when.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "";
                      return (
                        <div key={rv.id || i} style={{ borderTop: i ? "1px solid #F0F4EF" : "none", paddingTop: i ? 12 : 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E7F6EC", color: F, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
                                {(rv.clientName || "Cliente").slice(0, 1).toUpperCase()}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#12261A" }}>{rv.clientName || "Cliente verificado"}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ color: "#C9A227", fontSize: 13, letterSpacing: 1 }}>{"★".repeat(score)}<span style={{ color: "#D4E0D6" }}>{"★".repeat(5 - score)}</span></span>
                              {whenTxt && <span style={{ fontSize: 11, color: "#9CA3AF" }}>{whenTxt}</span>}
                            </div>
                          </div>
                          {rv.comment && <p style={{ margin: "6px 0 0 38px", fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{rv.comment}</p>}
                          {rv.response && (
                            <div style={{ margin: "8px 0 0 38px", padding: "8px 10px", background: "#F7F9F5", borderRadius: 8, fontSize: 12.5, color: "#374151" }}>
                              <b style={{ color: F }}>Respuesta del prestador:</b> {rv.response}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
