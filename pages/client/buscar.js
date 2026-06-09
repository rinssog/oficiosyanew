/**
 * pages/client/buscar.js — Búsqueda de prestadores
 * Fixed: added useRouter (was missing — bug: router.push called without import)
 * Removed: "use client" directive (Pages Router)
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const F = "#0D3B1F", V = "#16A34A";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const priceFmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

function StarRating({ r = 0 }) {
  const s = Math.round(r);
  return <span style={{ color: "#C9A227", fontSize: 13 }}>{"★".repeat(s)}{"☆".repeat(5 - s)}{r > 0 ? ` ${r.toFixed(1)}` : " Nuevo"}</span>;
}

export default function ClientSearchPage() {
  const router = useRouter();

  const [filters, setFilters]         = useState({ categories: [], modalities: [], subfilters: [], barrios: [], synonyms: {} });
  const [catalog, setCatalog]         = useState([]);
  const [searchParams, setSearchParams] = useState({ category: "", subCategory: "", catalogId: "", modality: "", urgent: false, zone: "" });
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error,   setError]           = useState(null);
  const [query,   setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searched, setSearched]       = useState(false);
  const debounceRef = useRef(null);

  // Load catalog + filters from URL params
  useEffect(() => {
    if (router.isReady && router.query.q) setQuery(router.query.q);
    if (router.isReady && router.query.category) setSearchParams(p => ({ ...p, category: router.query.category }));
  }, [router.isReady, router.query.q, router.query.category]);

  useEffect(() => {
    const load = async () => {
      try {
        const [filtersRes, catalogRes] = await Promise.all([
          fetch(`${API_BASE}/api/catalog/filters`).then(r => r.json()),
          fetch(`${API_BASE}/api/catalog`).then(r => r.json()),
        ]);
        if (filtersRes.ok !== false) setFilters({ categories: filtersRes.categories || [], modalities: filtersRes.modalities || [], subfilters: filtersRes.subfilters || [], barrios: filtersRes.barrios || [], synonyms: filtersRes.synonyms || {} });
        if (catalogRes.ok !== false) setCatalog(catalogRes.catalog || []);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  // Autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!query || query.trim().length < 2) { setSuggestions([]); return; }
      try {
        const params = new URLSearchParams({ q: query.trim() });
        if (searchParams.category) params.append("rubro", searchParams.category);
        const res = await fetch(`${API_BASE}/api/search/suggest?${params}`);
        const data = await res.json();
        if (data?.ok) setSuggestions(data.suggestions || []);
      } catch { setSuggestions([]); }
    }, 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query, searchParams.category]);

  const catalogByCategory = useMemo(() =>
    searchParams.category ? catalog.filter(i => i.categoria === searchParams.category) : catalog,
    [catalog, searchParams.category]);

  const handleField = e => {
    const { name, value } = e.target;
    setSearchParams(p => ({ ...p, [name]: value }));
  };

  const runSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);
    setSuggestions([]);
    try {
      const params = new URLSearchParams();
      if (searchParams.catalogId)  params.append("catalogId",   searchParams.catalogId);
      if (searchParams.category)   params.append("category",    searchParams.category);
      if (searchParams.subCategory) params.append("subCategory", searchParams.subCategory);
      if (searchParams.modality)   params.append("modality",    searchParams.modality);
      if (searchParams.urgent)     params.append("urgent",      "true");
      if (searchParams.zone)       params.append("zone",        searchParams.zone);
      if (query.trim())            params.append("q",           query.trim());

      const res  = await fetch(`${API_BASE}/api/providers/search${params.toString() ? `?${params}` : ""}`);
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || "No se pudo buscar");
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Buscar Prestadores · OficiosYa</title>
        <meta name="description" content="Buscá prestadores verificados por rubro, zona y modalidad. OficiosYa — plataforma argentina de servicios del hogar." />
      </Head>
      <NavBar />
      <main style={{ background: "#F7F9F5", minHeight: "100vh", padding: "0 0 80px" }}>

        {/* Search hero */}
        <div style={{ background: `linear-gradient(135deg,${F},#1A5C35)`, padding: "36px 20px 60px", marginBottom: -36 }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ color: "#fff", fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: "0 0 20px", textAlign: "center" }}>
              ¿Qué servicio necesitás?
            </h1>
            <form onSubmit={runSearch} style={{ background: "#fff", borderRadius: 16, padding: "20px 20px 16px", boxShadow: "0 10px 40px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Main search input */}
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#6B7C6E" }}>🔍</span>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder='Ej: plomero Palermo, electricista urgente, gasista CABA...'
                  style={{ width: "100%", padding: "12px 14px 12px 46px", borderRadius: 10, border: "1.5px solid #D4E0D6", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                  onKeyDown={e => e.key === "Enter" && runSearch()}
                />
                {suggestions.length > 0 && (
                  <div style={{ position: "absolute", zIndex: 10, top: "100%", left: 0, right: 0, background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 12, marginTop: 4, boxShadow: "0 14px 28px rgba(0,0,0,0.12)", overflow: "hidden" }}>
                    {suggestions.map(s => (
                      <button type="button" key={s.id}
                        onClick={() => { setSearchParams(p => ({ ...p, catalogId: s.id })); setQuery(s.nombre || ""); setSuggestions([]); }}
                        style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "10px 14px", cursor: "pointer", fontSize: 14, color: F, borderBottom: "1px solid #F3F4F6" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F0FDF4"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {s.nombre}
                        {s.rubro && <small style={{ marginLeft: 8, color: "#9CA3AF" }}>({s.rubro}{s.subrubro ? ` / ${s.subrubro}` : ""})</small>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filters row */}
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                <select name="category" value={searchParams.category} onChange={handleField}
                  style={{ padding: "9px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, outline: "none", background: "#fff" }}>
                  <option value="">Todas las categorías</option>
                  {filters.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>

                <select name="subCategory" value={searchParams.subCategory} onChange={handleField}
                  style={{ padding: "9px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, outline: "none", background: "#fff" }}>
                  <option value="">Subcategoría</option>
                  {filters.categories.find(c => c.id === searchParams.category)?.subcategorias?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select name="zone" value={searchParams.zone} onChange={handleField}
                  style={{ padding: "9px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, outline: "none", background: "#fff" }}>
                  <option value="">Toda la zona</option>
                  {filters.barrios.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select name="modality" value={searchParams.modality} onChange={handleField}
                  style={{ padding: "9px 10px", borderRadius: 8, border: "1.5px solid #D4E0D6", fontSize: 13, outline: "none", background: "#fff" }}>
                  <option value="">Cualquier modalidad</option>
                  {filters.modalities.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#DC2626" }}>
                  <input
                    type="checkbox"
                    checked={searchParams.urgent}
                    onChange={e => setSearchParams(p => ({ ...p, urgent: e.target.checked }))}
                    style={{ accentColor: "#DC2626", width: 16, height: 16 }}
                  />
                  🚨 Solo urgencias 24hs disponibles
                </label>
                <button type="submit" disabled={loading}
                  style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 24, padding: "11px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer", minWidth: 140, opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Buscando..." : "Buscar →"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results area */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 16px 0" }}>
          {error && (
            <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 12, padding: "12px 16px", color: "#991B1B", fontSize: 14, marginBottom: 16 }}>{error}</div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: "#fff", borderRadius: 18, height: 160, border: "1.5px solid #D4E0D6", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg,#e8f4eb 25%,#f0fdf4 50%,#e8f4eb 75%)", backgroundSize: "200%" }} />
                </div>
              ))}
            </div>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <h3 style={{ color: F, fontFamily: "Georgia,serif", marginBottom: 8 }}>Sin resultados</h3>
              <p style={{ color: "#6B7C6E", fontSize: 14, marginBottom: 20 }}>
                No encontramos prestadores con los filtros elegidos. Probá ampliando la búsqueda o cambiando la zona.
              </p>
              <button onClick={() => { setSearchParams({ category: "", subCategory: "", catalogId: "", modality: "", urgent: false, zone: "" }); setQuery(""); }}
                style={{ background: F, color: "#fff", border: "none", borderRadius: 20, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                Limpiar filtros
              </button>
            </div>
          )}

          {!loading && !searched && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7C6E" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👆</div>
              <p style={{ fontSize: 15 }}>Usá el buscador para encontrar prestadores verificados en tu zona.</p>
            </div>
          )}

          {results.length > 0 && !loading && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontWeight: 800, color: F, fontSize: 16 }}>
                  {results.length} prestador{results.length !== 1 ? "es" : ""} encontrado{results.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {results.map(entry => {
                  const rating = entry.provider?.rating || 0;
                  const name   = entry.provider?.companyName || entry.owner?.name || entry.provider?.id;
                  return (
                    <article key={entry.provider.id} style={{ background: "#fff", border: "1.5px solid #D4E0D6", borderRadius: 18, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14, transition: "box-shadow .15s" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(22,163,74,0.12)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                    >
                      {/* Provider header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${V},${F})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, flexShrink: 0 }}>
                            {name?.[0]?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 16, color: F }}>{name}</div>
                            <StarRating r={rating} />
                            {entry.profile?.areas?.length > 0 && (
                              <div style={{ fontSize: 12, color: "#6B7C6E", marginTop: 2 }}>📍 {entry.profile.areas.slice(0,3).join(", ")}</div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {entry.profile?.verificationStatus === "APPROVED" && (
                            <span style={{ background: "#F0FDF4", color: "#166534", border: "1.5px solid rgba(22,163,74,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 800 }}>✅ Verificado</span>
                          )}
                          <Link href={`/providers/${entry.provider.id}`}>
                            <button style={{ background: "#F7F9F5", color: F, border: "1.5px solid #D4E0D6", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Ver perfil</button>
                          </Link>
                        </div>
                      </div>

                      {/* Services */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {entry.services.slice(0, 3).map(srv => (
                          <div key={srv.id} style={{ background: "#F7F9F5", border: "1.5px solid #D4E0D6", borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: F, marginBottom: 4 }}>
                                {srv.catalog?.nombre || srv.category || "Servicio"}
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {(srv.modalities || []).map(m => (
                                  <span key={m} style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{m}</span>
                                ))}
                                {srv.allowsUrgent && (
                                  <span style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>🚨 Urgencias</span>
                                )}
                                {srv.estimatedDuration && (
                                  <span style={{ background: "#F3F4F6", color: "#6B7C6E", borderRadius: 20, padding: "2px 8px", fontSize: 10 }}>⏱ {srv.estimatedDuration} min</span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                              <div style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 17, color: F, whiteSpace: "nowrap" }}>
                                {priceFmt.format((srv.price || 0) / 100)}
                              </div>
                              <button
                                type="button"
                                onClick={() => router.push(`/solicitar/${srv.id}?providerId=${entry.provider.id}`)}
                                style={{ background: `linear-gradient(135deg,${V},${F})`, color: "#fff", border: "none", borderRadius: 20, padding: "9px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
                              >
                                Solicitar →
                              </button>
                            </div>
                          </div>
                        ))}
                        {entry.services.length > 3 && (
                          <Link href={`/providers/${entry.provider.id}`}>
                            <div style={{ textAlign: "center", color: V, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "4px 0" }}>
                              + {entry.services.length - 3} servicios más → Ver perfil completo
                            </div>
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
