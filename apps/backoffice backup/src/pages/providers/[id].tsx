"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const priceFmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const resolveAssetUrl = (path) => (path && (path.startsWith('http') ? path : `${API_BASE}${path}`));


export default function ProviderPublicPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/providers/${id}/public`);
        const payload = await res.json();
        if (!res.ok || payload.ok === false) throw new Error(payload.error || "No se pudo obtener el prestador");
        setData(payload);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const requestService = (serviceId) => {
    router.push(`/solicitar/${serviceId}?providerId=${id}`);
  };

  const areas = useMemo(() => data?.profile?.areas || [], [data]);
  const documents = useMemo(() => data?.profile?.documents || [], [data]);
  const services = useMemo(() => data?.services || [], [data]);

  const displayName = data?.owner?.name || data?.owner?.email || "Prestador";

  return (
    <div>
      <Head>
        <title>{displayName} | OficiosYa</title>
      </Head>
      <NavBar />
      <main style={{ maxWidth: 1080, margin: "32px auto", padding: "0 16px 80px", display: "grid", gap: 24 }}>
        {loading && <p>Cargando perfil.</p>}
        {error && <p style={{ color: "#c62828" }}>{error}</p>}
        {!loading && !error && data && (
          <>
            <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 12 }}>
              <h1 style={{ margin: 0 }}>{displayName}</h1>
              <p style={{ margin: 0, color: "#555" }}>Prestador verificado en OficiosYa.</p>
              {areas.length > 0 ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <strong>Zonas de trabajo:</strong>
                  {areas.map((area) => (
                    <span key={area} style={{ background: "var(--panel)", borderRadius: 999, padding: "4px 10px", fontSize: 13 }}>{area}</span>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#777" }}>El prestador aún no declaró zonas de trabajo.</p>
              )}
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                <span><strong>Calificaciones:</strong> próximamente</span>
                <span><strong>Miembro desde:</strong> {new Date(data.provider.createdAt || Date.now()).toLocaleDateString("es-AR")}</span>
              </div>
            </section>

            <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 12 }}>
              <h2 style={{ margin: 0 }}>Documentación</h2>
              <p style={{ color: "#555" }}>Estados de validación visibles para generar confianza en los clientes.</p>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {documents.map((doc) => (
                  <div key={doc.type} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 14 }}>
                    <strong>{doc.label}</strong>
                    <p style={{ margin: "4px 0", color: "#555", fontSize: 13 }}>Estado: {doc.status}</p>
                    {doc.url ? (
                      <a href={resolveAssetUrl(doc.url)} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>
                        Ver archivo
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: "#999" }}>Sin archivo cargado aún.</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
              <div>
                <h2 style={{ margin: 0 }}>Servicios disponibles</h2>
                <p style={{ color: "#555" }}>Seleccioná el servicio que necesitás. Podrás coordinar fecha y hora en el siguiente paso.</p>
              </div>
              <div style={{ display: "grid", gap: 18 }}>
                {services.length === 0 && <p style={{ color: "#777" }}>Este prestador todavía no publicó servicios.</p>}
                {services.map((srv) => (
                  <div key={srv.id} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12, background: "#fdfdfd" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{srv.catalog?.nombre || "Servicio"}</h3>
                        <p style={{ margin: 0, color: "#666" }}>
                          {srv.catalog?.rubro}
                          {srv.catalog?.subrubro ? ` (${srv.catalog?.subrubro})` : ""}
                        </p>
                        <p style={{ margin: 0, color: "#777", fontSize: 13 }}>Categoria: {srv.category} / {srv.subCategory}</p>
                      </div>
                      <span style={{ fontWeight: 600 }}>{priceFmt.format((srv.price || 0) / 100)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(srv.modalities || []).map((mod) => (
                        <span key={mod} style={{ border: "1px solid #2563eb", color: "#2563eb", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>{mod}</span>
                      ))}
                      {srv.allowsUrgent && (
                        <span style={{ border: "1px solid #b91c1c", color: "#b91c1c", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>Urgencias 24hs</span>
                      )}
                      {(srv.tags || []).map((tag) => (
                        <span key={tag} style={{ border: "1px solid #d1d5db", color: "#374151", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>{tag}</span>
                      ))}
                    </div>
                    <p style={{ color: "#555", margin: 0 }}>{srv.notes || "Sin descripción adicional."}</p>
                    {srv.estimatedDuration ? (
                      <small style={{ color: "#777" }}>Tiempo estimado: {srv.estimatedDuration} minutos</small>
                    ) : null}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <small style={{ color: "#777" }}>Actualizado: {new Date(srv.updatedAt || srv.createdAt).toLocaleString("es-AR")}</small>
                      <button
                        type="button"
                        onClick={() => requestService(srv.id)}
                        style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}
                      >
                        Solicitar servicio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 12 }}>
              <h2 style={{ margin: 0 }}>Reseñas y trabajos confirmados</h2>
              <p style={{ color: "#777" }}>Próximamente podrás ver fotos confirmadas por clientes y calificaciones detalladas.</p>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
