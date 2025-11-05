"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../_components/NavBar";
import Footer from "../../_components/Footer";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const priceFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function ClientSearchPage() {
  const [filters, setFilters] = useState({
    categories: [],
    modalities: [],
    subfilters: [],
    barrios: [],
    synonyms: {},
  });
  const [catalog, setCatalog] = useState([]);
  const [searchParams, setSearchParams] = useState({
    category: "",
    subCategory: "",
    catalogId: "",
    modality: "",
    urgent: false,
    zone: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [filtersRes, catalogRes] = await Promise.all([
          fetch(`${API_BASE}/api/catalog/filters`).then((r) => r.json()),
          fetch(`${API_BASE}/api/catalog`).then((r) => r.json()),
        ]);
        if (filtersRes.ok === false)
          throw new Error(filtersRes.error || "No se pudieron cargar filtros");
        if (catalogRes.ok === false)
          throw new Error(catalogRes.error || "No se pudo obtener el catalogo");
        setFilters({
          categories: filtersRes.categories || [],
          modalities: filtersRes.modalities || [],
          subfilters: filtersRes.subfilters || [],
          barrios: filtersRes.barrios || [],
          synonyms: filtersRes.synonyms || {},
        });
        setCatalog(catalogRes.catalog || []);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  // Autocompletar con backend de búsqueda (Meilisearch)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const params = new URLSearchParams();
        params.append("q", query.trim());
        if (searchParams.category)
          params.append("rubro", searchParams.category);
        if (searchParams.subCategory)
          params.append("subrubro", searchParams.subCategory);
        const res = await fetch(
          `${API_BASE}/api/search/suggest?${params.toString()}`,
        );
        const data = await res.json();
        if (data?.ok) setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query, searchParams.category, searchParams.subCategory]);

  const catalogByCategory = useMemo(() => {
    if (!searchParams.category) return catalog;
    return catalog.filter((item) => item.categoria === searchParams.category);
  }, [catalog, searchParams.category]);

  const handleField = (event) => {
    const { name, value } = event.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleUrgentToggle = (event) => {
    setSearchParams((prev) => ({ ...prev, urgent: event.target.checked }));
  };

  const runSearch = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const params = new URLSearchParams();
      if (searchParams.catalogId)
        params.append("catalogId", searchParams.catalogId);
      if (searchParams.category)
        params.append("category", searchParams.category);
      if (searchParams.subCategory)
        params.append("subCategory", searchParams.subCategory);
      if (searchParams.modality)
        params.append("modality", searchParams.modality);
      if (searchParams.urgent) params.append("urgent", "true");
      if (searchParams.zone) params.append("zone", searchParams.zone);

      const url = `${API_BASE}/api/providers/search${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || data.ok === false)
        throw new Error(data.error || "No se pudo buscar");
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Buscar prestadores | OficiosYa</title>
      </Head>
      <NavBar />
      <main
        style={{
          maxWidth: 1100,
          margin: "32px auto",
          padding: "0 16px 96px",
          display: "grid",
          gap: 24,
        }}
      >
        <header style={{ display: "grid", gap: 12 }}>
          <h1 style={{ margin: 0 }}>Buscar prestadores</h1>
          <p style={{ margin: 0, color: "#555" }}>
            Filtrá por categoría, modalidad y urgencias para encontrar
            prestadores que operen en tu zona.
          </p>
        </header>

        <form
          onSubmit={runSearch}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: 18,
            display: "grid",
            gap: 12,
            background: "#fff",
          }}
        >
          <label>
            ¿Qué necesitás?
            <div style={{ position: "relative" }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: cambiar canilla, enchufe, cortocircuito"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              />
              {suggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    marginTop: 6,
                    boxShadow: "0 14px 28px rgba(22,101,52,.08)",
                  }}
                >
                  {suggestions.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => {
                        setSearchParams((prev) => ({
                          ...prev,
                          catalogId: s.id,
                        }));
                        setQuery(s.nombre || "");
                        setSuggestions([]);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                    >
                      {s.nombre || ""}
                      {s.rubro ? (
                        <small style={{ marginLeft: 8, color: "#777" }}>
                          ({s.rubro}
                          {s.subrubro ? ` / ${s.subrubro}` : ""})
                        </small>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </label>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            <label>
              Categoría
              <select
                name="category"
                value={searchParams.category}
                onChange={handleField}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <option value="">Todas</option>
                {filters.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Subcategoría
              <select
                name="subCategory"
                value={searchParams.subCategory}
                onChange={handleField}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <option value="">Todas</option>
                {filters.categories
                  .find((cat) => cat.id === searchParams.category)
                  ?.subcategorias?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Servicio específico
              <select
                name="catalogId"
                value={searchParams.catalogId}
                onChange={handleField}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <option value="">Todos</option>
                {catalogByCategory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.rubro} - {item.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Modalidad
              <select
                name="modality"
                value={searchParams.modality}
                onChange={handleField}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <option value="">Cualquiera</option>
                {filters.modalities.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Zona (CABA)
              <select
                name="zone"
                value={searchParams.zone}
                onChange={handleField}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <option value="">Todas</option>
                {filters.barrios.map((barrio) => (
                  <option key={barrio} value={barrio}>
                    {barrio}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={searchParams.urgent}
              onChange={handleUrgentToggle}
            />
            Mostrar solo urgencias 24hs
          </label>
          <button
            type="submit"
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 600,
              cursor: "pointer",
              width: "max-content",
            }}
          >
            Buscar prestadores
          </button>
        </form>

        {error && <p style={{ color: "#c62828" }}>{error}</p>}
        {loading && <p>Buscando prestadores...</p>}

        <section style={{ display: "grid", gap: 16 }}>
          {!loading && results.length === 0 && (
            <p style={{ color: "#777" }}>
              No encontramos prestadores con los filtros seleccionados.
            </p>
          )}
          {results.map((entry) => (
            <article
              key={entry.provider.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 18,
                background: "#fff",
                display: "grid",
                gap: 12,
              }}
            >
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>
                    {entry.provider.companyName || entry.provider.id}
                  </h3>
                  <p style={{ margin: 0, color: "#555" }}>
                    Servicios publicados: {entry.services.length}
                  </p>
                  {entry.profile?.areas?.length ? (
                    <small style={{ color: "#777" }}>
                      Zonas: {entry.profile.areas.join(", ")}
                    </small>
                  ) : null}
                </div>
                <Link
                  href={`/providers/${entry.provider.id}`}
                  style={{ color: "var(--primary)", fontWeight: 600 }}
                >
                  Ver perfil
                </Link>
              </header>
              <div style={{ display: "grid", gap: 10 }}>
                {entry.services.map((srv) => (
                  <div
                    key={srv.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 12,
                      display: "grid",
                      gap: 8,
                      background: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <strong>{srv.catalog?.nombre || "Servicio"}</strong>
                      <span style={{ fontWeight: 600 }}>
                        {priceFmt.format((srv.price || 0) / 100)}
                      </span>
                    </div>
                    <small style={{ color: "#555" }}>
                      Categoría: {srv.category} · {srv.subCategory}
                    </small>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(srv.modalities || []).map((mod) => (
                        <span
                          key={mod}
                          style={{
                            border: "1px solid #2563eb",
                            color: "#2563eb",
                            borderRadius: 999,
                            padding: "2px 8px",
                            fontSize: 11,
                          }}
                        >
                          {mod}
                        </span>
                      ))}
                      {srv.allowsUrgent && (
                        <span
                          style={{
                            border: "1px solid #b91c1c",
                            color: "#b91c1c",
                            borderRadius: 999,
                            padding: "2px 8px",
                            fontSize: 11,
                          }}
                        >
                          Urgencia
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: "#555" }}>
                      {srv.notes || "Sin descripción adicional."}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/solicitar/${srv.id}?providerId=${entry.provider.id}`,
                        )
                      }
                      style={{
                        background: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        width: "max-content",
                      }}
                    >
                      Solicitar servicio
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
