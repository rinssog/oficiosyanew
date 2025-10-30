"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import ProviderAvailability from "../../components/ProviderAvailability";
import ProviderNotifications from "../../components/ProviderNotifications";
import RequireRole from "../../components/RequireRole";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const statusColors = {
  PENDING: "#fbbf24",
  SUBMITTED: "#3b82f6",
  APPROVED: "#16a34a",
  REJECTED: "#f87171",
};

async function fetchCatalog() {
  const res = await fetch(API_BASE + '/api/catalog');
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || "No se pudo obtener el catalogo");
  }
  return data.catalog || [];
}

async function fetchFilters() {
  const res = await fetch(API_BASE + '/api/catalog/filters');
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || "No se pudieron obtener filtros");
  }
  return data;
}

export default function ProviderDashboard() {
  const router = useRouter();
  const { user, provider, refreshProvider, apiRequest, isReady } = useAuth();
  const providerId = provider?.id;

  const [catalog, setCatalog] = useState([]);
  const [filters, setFilters] = useState({ categories: [], modalities: [], barrios: [] });
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [barrios, setBarrios] = useState([]);
  const [areasDraft, setAreasDraft] = useState([]);
  const [areasSaving, setAreasSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docMessage, setDocMessage] = useState(null);
  const [docError, setDocError] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialMessage, setMaterialMessage] = useState(null);
  const [materialError, setMaterialError] = useState(null);
  const [cancellationMessage, setCancellationMessage] = useState(null);
  const [cancellationError, setCancellationError] = useState(null);

  const [form, setForm] = useState({
    catalogId: "",
    pricingType: "FIXED",
    price: "",
    notes: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [materialForm, setMaterialForm] = useState({
    requestId: "",
    description: "",
    amount: "",
    currency: "ARS",
    file: null,
  });

  const [cancellationForm, setCancellationForm] = useState({
    requestId: "",
    action: "RESCHEDULE",
    reason: "",
    proposedDate: "",
    proposedStart: "",
    proposedEnd: "",
  });

  useEffect(() => {
    fetchFilters()
      .then((data) => {
        setFilters({
          categories: data.categories || [],
          modalities: data.modalities || [],
          barrios: data.barrios || [],
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "PROVIDER") {
      router.replace("/");
      return;
    }
    if (user.role === "PROVIDER" && !providerId) {
      refreshProvider(user.id);
    }
  }, [isReady, user, providerId, refreshProvider, router]);

  useEffect(() => {
    if (!providerId || !isReady) return;

    const load = async () => {
      try {
        const [catalogItems, servicesRes, profileRes, barriosRes, materialsRes] = await Promise.all([
          fetchCatalog(),
          apiRequest('/api/providers/' + providerId + '/services'),
          apiRequest('/api/providers/' + providerId + '/profile'),
          fetch(API_BASE + '/api/reference/barrios').then((r) => r.json()),
          apiRequest('/api/providers/' + providerId + '/materials').catch(() => ({ materials: [] })),
        ]);

        setCatalog(catalogItems);
        setServices(servicesRes.services || []);
        const profileData = profileRes.profile || null;
        setProfile(profileData);
        setAreasDraft(profileData?.areas || []);
        setDocuments(profileData?.documents || []);
        setBarrios(barriosRes.barrios || []);
        setMaterials(materialsRes.materials || []);

        if (!form.catalogId && catalogItems.length) {
          setForm((prev) => ({ ...prev, catalogId: catalogItems[0].id }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    load();
  }, [providerId, isReady]);

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }),
    [],
  );

  const topServices = useMemo(() => {
    if (!services.length) return [];
    return services
      .slice()
      .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
      .slice(0, 3)
      .map((srv) => srv.catalog?.nombre || srv.notes || "Servicio sin titulo");
  }, [services]);

  const selectedCatalog = useMemo(
    () => catalog.find((item) => item.id === form.catalogId) || null,
    [catalog, form.catalogId],
  );

  const toggleArea = (barrio) => {
    setAreasDraft((prev) =>
      prev.includes(barrio)
        ? prev.filter((item) => item !== barrio)
        : [...prev, barrio],
    );
  };

  const handleSaveAreas = async () => {
    if (!providerId) return;
    setAreasSaving(true);
    try {
      const res = await apiRequest('/api/providers/' + providerId + '/areas', {
        method: "PUT",
        body: JSON.stringify({ areas: areasDraft }),
      });
      setProfile(res.profile || res);
      setDocMessage("Zonas actualizadas");
    } catch (err) {
      setDocError(err.message);
    } finally {
      setAreasSaving(false);
    }
  };

  const handleDocUpload = async (type, file) => {
    if (!providerId || !file) return;
    setDocMessage(null);
    setDocError(null);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", file);
      await apiRequest('/api/providers/' + providerId + '/documents', {
        method: "POST",
        body: formData,
      });
      const refreshed = await apiRequest('/api/providers/' + providerId + '/profile');
      setDocuments(refreshed.profile?.documents || []);
      setDocMessage("Documento enviado");
    } catch (err) {
      setDocError(err.message);
    }
  };

  const handleField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCatalogChange = (event) => {
    setForm((prev) => ({ ...prev, catalogId: event.target.value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!providerId) return;

    const payload = {
      catalogId: form.catalogId,
      pricingType: form.pricingType,
      price: Number(form.price) * 100,
      notes: form.notes,
    };

    try {
      if (!payload.catalogId) throw new Error("Selecciona un rubro del catalogo.");
      if (!payload.price || Number.isNaN(payload.price)) throw new Error("Indica un precio valido.");
      await apiRequest('/api/providers/' + providerId + '/services', {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const refreshed = await apiRequest('/api/providers/' + providerId + '/services');
      setServices(refreshed.services || []);
      setForm({ catalogId: form.catalogId, pricingType: "FIXED", price: "", notes: "" });
      setMessage("Servicio publicado");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!providerId) return;
    setMessage(null);
    setError(null);
    try {
      await apiRequest('/api/providers/' + providerId + '/services/' + serviceId, { method: "DELETE" });
      const refreshed = await apiRequest('/api/providers/' + providerId + '/services');
      setServices(refreshed.services || []);
      setMessage("Servicio eliminado");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMaterialField = (event) => {
    const { name, value } = event.target;
    setMaterialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaterialFile = (event) => {
    const file = event.target.files?.[0] || null;
    setMaterialForm((prev) => ({ ...prev, file }));
  };

  const refreshMaterials = async () => {
    if (!providerId) return;
    const res = await apiRequest('/api/providers/' + providerId + '/materials').catch(() => ({ materials: [] }));
    setMaterials(res.materials || []);
  };

  const handleMaterialSubmit = async (event) => {
    event.preventDefault();
    if (!providerId) return;
    setMaterialError(null);
    setMaterialMessage(null);
    try {
      const formData = new FormData();
      formData.append("requestId", materialForm.requestId);
      formData.append("description", materialForm.description);
      formData.append("amount", materialForm.amount);
      formData.append("currency", materialForm.currency || "ARS");
      if (materialForm.file) formData.append("file", materialForm.file);

      const response = await fetch(API_BASE + '/api/providers/' + providerId + '/materials', {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || data.ok === false) throw new Error(data.error || "No se pudo guardar el material");
      setMaterialMessage("Material registrado");
      setMaterialForm({ requestId: "", description: "", amount: "", currency: "ARS", file: null });
      await refreshMaterials();
    } catch (err) {
      setMaterialError(err.message);
    }
  };

  const handleCancellationField = (event) => {
    const { name, value } = event.target;
    setCancellationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancellationSubmit = async (event) => {
    event.preventDefault();
    setCancellationError(null);
    setCancellationMessage(null);
    try {
      const payload = {
        action: cancellationForm.action,
        reason: cancellationForm.reason,
      };
      if (cancellationForm.action === "RESCHEDULE" && cancellationForm.proposedDate && cancellationForm.proposedStart && cancellationForm.proposedEnd) {
        payload.proposedSlot = {
          date: cancellationForm.proposedDate,
          start: cancellationForm.proposedStart,
          end: cancellationForm.proposedEnd,
        };
      }
      await apiRequest('/api/requests/' + cancellationForm.requestId + '/cancel', {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCancellationMessage("Gestion registrada y enviada al cliente");
      setCancellationForm({ requestId: "", action: "RESCHEDULE", reason: "", proposedDate: "", proposedStart: "", proposedEnd: "" });
    } catch (err) {
      setCancellationError(err.message);
    }
  };

  const renderDocuments = () => {
    if (!documents.length) return <p>No hay documentos para mostrar.</p>;
    return documents.map((doc) => {
      const docUrl = doc.url && (doc.url.startsWith('http') ? doc.url : API_BASE + doc.url);
      return (
        <div
          key={doc.type}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 16,
            display: "grid",
            gap: 8,
            background: "#f9fafb",
          }}
        >
          <strong>{doc.label}</strong>
          <span style={{ color: statusColors[doc.status] || "#555" }}>{doc.status}</span>
          {docUrl ? (
            <a href={docUrl} target="_blank" rel="noreferrer">
              Ver archivo
            </a>
          ) : (
            <UploadField onUpload={(file) => handleDocUpload(doc.type, file)} />
          )}
          {doc.notes ? <small style={{ color: "#555" }}>{doc.notes}</small> : null}
        </div>
      );
    });
  };

  const renderServices = () => {
    if (!services.length) {
      return <p>No tienes servicios publicados aun.</p>;
    }
    return services.map((srv) => {
      const priceLabel = priceFormatter.format((srv.price || 0) / 100);
      const lastUpdate = new Date(srv.updatedAt || srv.createdAt).toLocaleString("es-AR");
      return (
        <div
          key={srv.id}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: 20,
            display: "grid",
            gap: 10,
            background: "#fdfdfd",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <strong>{srv.catalog?.nombre || "Servicio sin titulo"}</strong>
              <div style={{ color: "#555", fontSize: 13 }}>{srv.catalog?.rubro} � {srv.catalog?.subrubro}</div>
              <div style={{ color: "#777", fontSize: 13 }}>Categoria: {srv.category} � {srv.subCategory}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600 }}>{priceLabel}</div>
              <div style={{ fontSize: 12, color: "#777" }}>Actualizado: {lastUpdate}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(srv.modalities || []).map((mod) => (
              <span key={mod} style={{ border: "1px solid #2563eb", color: "#2563eb", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                {mod}
              </span>
            ))}
            {srv.allowsUrgent && (
              <span style={{ border: "1px solid #b91c1c", color: "#b91c1c", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                Urgencias 24hs
              </span>
            )}
            {(srv.tags || []).map((tag) => (
              <span key={tag} style={{ border: "1px solid #d1d5db", color: "#374151", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                {tag}
              </span>
            ))}
          </div>
          {srv.notes ? <p style={{ margin: 0, color: "#555" }}>{srv.notes}</p> : null}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => handleDeleteService(srv.id)}
              style={{ border: "1px solid #c62828", color: "#c62828", background: "#fff5f5", borderRadius: 10, padding: "8px 12px", cursor: "pointer" }}
            >
              Eliminar
            </button>
          </div>
        </div>
      );
    });
  };

  const renderMaterials = () => {
    if (!materials.length) return <p>No registraste materiales aun.</p>;
    return materials
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((material) => {
        const amount = priceFormatter.format((material.amount || 0) / 100);
        const attachmentUrl =
          material.attachmentUrl && (material.attachmentUrl.startsWith('http') ? material.attachmentUrl : API_BASE + material.attachmentUrl);
        return (
          <div key={material.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "#f9fafb" }}>
            <strong>{material.description}</strong>
            <div style={{ color: "#555", fontSize: 13 }}>Solicitud: {material.requestId}</div>
            <div style={{ color: "#555", fontSize: 13 }}>Importe: {amount} {material.currency}</div>
            <div style={{ color: "#777", fontSize: 12 }}>Registrado: {new Date(material.createdAt).toLocaleString("es-AR")}</div>
            {attachmentUrl ? (
              <a href={attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                Ver comprobante
              </a>
            ) : (
              <span style={{ fontSize: 13, color: "#999" }}>Sin archivo adjunto</span>
            )}
          </div>
        );
      });
  };

  return (
    <div>
      <Head>
        <title>OficiosYa | Panel del prestador</title>
      </Head>
      <NavBar />
      <RequireRole role="PROVIDER">
        <main style={{ maxWidth: 1150, margin: "0 auto", padding: "40px 16px 96px", display: "grid", gap: 24 }}>
          <header style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h1 style={{ margin: 0 }}>Panel de prestador</h1>
                <p style={{ margin: 0, color: "#555" }}>Gestiona tus servicios, agenda, materiales y notificaciones.</p>
              </div>
              {user?.name ? <span style={{ color: "#555" }}>Hola, {user.name}</span> : null}
            </div>
            {topServices.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 13, color: "#374151" }}>
                <span style={{ fontWeight: 600 }}>Servicios destacados recientes:</span>
                {topServices.map((svc) => (
                  <span key={svc} style={{ background: "#ecfdf5", color: "#047857", borderRadius: 999, padding: "4px 10px" }}>{svc}</span>
                ))}
              </div>
            )}
          </header>

          <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
            <h2 style={{ margin: 0 }}>Zonas de trabajo</h2>
            <p style={{ color: "#555" }}>Selecciona los barrios donde queres operar. Los clientes veran tu perfil solo en esas zonas.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {barrios.map((barrio) => (
                <label
                  key={barrio}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: areasDraft.includes(barrio) ? "var(--accent-soft)" : "#f9fafb",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "10px 12px",
                  }}
                >
                  <input type="checkbox" checked={areasDraft.includes(barrio)} onChange={() => toggleArea(barrio)} />
                  {barrio}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleSaveAreas}
                disabled={areasSaving}
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: areasSaving ? 0.6 : 1,
                }}
              >
                {areasSaving ? "Guardando..." : "Guardar zonas"}
              </button>
              {docMessage && <span style={{ color: "#16a34a" }}>{docMessage}</span>}
              {docError && <span style={{ color: "#c62828" }}>{docError}</span>}
            </div>
          </section>

          <ProviderAvailability providerId={providerId} apiRequest={apiRequest} />
          <ProviderNotifications providerId={providerId} apiRequest={apiRequest} />

          <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
            <h2 style={{ margin: 0 }}>Documentacion obligatoria</h2>
            <p style={{ color: "#555" }}>
              Los documentos enviados se revisan antes de habilitar tus servicios. Subi archivos claros y legibles para acelerar la aprobacion.
            </p>
            <div style={{ display: "grid", gap: 16 }}>{renderDocuments()}</div>
          </section>

          <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 24 }}>
            <div>
              <h2 style={{ margin: 0 }}>Servicios publicados</h2>
              <p style={{ color: "#555" }}>
                Selecciona servicios del catalogo maestro, ajusta tu tarifa y mantene tu informacion al dia. Los badges indican si el servicio admite urgencias o distintas modalidades.
              </p>
            </div>

            <form onSubmit={handleCreate} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "grid", gap: 14 }}>
              <h3 style={{ margin: 0 }}>Nuevo servicio</h3>
              <label>
                Rubro del catalogo
                <select
                  name="catalogId"
                  value={form.catalogId}
                  onChange={handleCatalogChange}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                >
                  {catalog.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.rubro} - {item.nombre}
                    </option>
                  ))}
                </select>
              </label>
              {selectedCatalog && (
                <div style={{ background: "#f9fafb", border: "1px solid var(--border)", borderRadius: 12, padding: 12, fontSize: 13, color: "#374151", display: "grid", gap: 4 }}>
                  <span><strong>Categoria:</strong> {selectedCatalog.categoria} � {selectedCatalog.subcategoria}</span>
                  <span><strong>Modalidades:</strong> {(selectedCatalog.modalidades || []).join(", ") || "N/A"}</span>
                  <span><strong>Urgencias:</strong> {selectedCatalog.permiteUrgencias ? "Si" : "No"}</span>
                  {selectedCatalog.tiempoEstimado ? <span><strong>Tiempo estimado:</strong> {selectedCatalog.tiempoEstimado} minutos</span> : null}
                  {selectedCatalog.etiquetas?.length ? <span><strong>Etiquetas:</strong> {selectedCatalog.etiquetas.join(", ")}</span> : null}
                </div>
              )}
              <label>
                Tipo de tarifa
                <select
                  name="pricingType"
                  value={form.pricingType}
                  onChange={handleField}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                >
                  <option value="FIXED">Precio fijo</option>
                  <option value="HOURLY">Por hora</option>
                  <option value="PER_KM">Por kilometro</option>
                  <option value="PER_UNIT">Por unidad</option>
                </select>
              </label>
              <label>
                Precio en ARS
                <input
                  type="number"
                  min="0"
                  name="price"
                  value={form.price}
                  onChange={handleField}
                  placeholder="Ej: 18000"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                />
              </label>
              <label>
                Notas de servicio
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleField}
                  rows={3}
                  placeholder="Detalle del servicio, alcance, materiales incluidos..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", fontFamily: "inherit" }}
                />
              </label>
              <button type="submit" style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 600, cursor: "pointer" }}>
                Publicar servicio
              </button>
              {message && <span style={{ color: "#16a34a" }}>{message}</span>}
              {error && <span style={{ color: "#c62828" }}>{error}</span>}
            </form>

            <div style={{ display: "grid", gap: 18 }}>{renderServices()}</div>
          </section>

          <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
            <h2 style={{ margin: 0 }}>Materiales y comprobantes</h2>
            <p style={{ color: "#555" }}>
              Digitaliza los materiales utilizados para cada solicitud. Puedes adjuntar facturas o fotos legibles.
            </p>
            <form onSubmit={handleMaterialSubmit} style={{ display: "grid", gap: 12, border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <label>
                ID de solicitud
                <input
                  name="requestId"
                  value={materialForm.requestId}
                  onChange={handleMaterialField}
                  placeholder="req_xxx"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                />
              </label>
              <label>
                Descripcion
                <input
                  name="description"
                  value={materialForm.description}
                  onChange={handleMaterialField}
                  required
                  placeholder="Detalle del material o insumo"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                />
              </label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <label style={{ flex: "1 1 160px" }}>
                  Importe (ARS)
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={materialForm.amount}
                    onChange={handleMaterialField}
                    required
                    placeholder="Ej: 12500"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                  />
                </label>
                <label style={{ width: 140 }}>
                  Moneda
                  <select name="currency" value={materialForm.currency} onChange={handleMaterialField} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
              </div>
              <label>
                Comprobante (opcional)
                <input type="file" accept="image/*,.pdf" onChange={handleMaterialFile} />
              </label>
              <button type="submit" style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>
                Registrar material
              </button>
              {materialMessage && <span style={{ color: "#16a34a" }}>{materialMessage}</span>}
              {materialError && <span style={{ color: "#c62828" }}>{materialError}</span>}
            </form>
            <div style={{ display: "grid", gap: 12 }}>{renderMaterials()}</div>
          </section>

          <section style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", padding: 24, display: "grid", gap: 16 }}>
            <h2 style={{ margin: 0 }}>Cancelar o proponer reprogramacion</h2>
            <p style={{ color: "#555" }}>
              Este formulario notifica al cliente cuando no podes asistir. Recorda indicar un motivo claro. Si propones otro horario, se mantiene la retencion operativa del 50% hasta que el cliente confirme.
            </p>
            <form onSubmit={handleCancellationSubmit} style={{ display: "grid", gap: 12, border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <label>
                ID de solicitud
                <input
                  name="requestId"
                  value={cancellationForm.requestId}
                  onChange={handleCancellationField}
                  required
                  placeholder="req_xxx"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                />
              </label>
              <label>
                Motivo
                <textarea
                  name="reason"
                  value={cancellationForm.reason}
                  onChange={handleCancellationField}
                  rows={3}
                  placeholder="Describe brevemente el motivo"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", fontFamily: "inherit" }}
                />
              </label>
              <label>
                Accion
                <select
                  name="action"
                  value={cancellationForm.action}
                  onChange={handleCancellationField}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
                >
                  <option value="RESCHEDULE">Proponer reprogramacion</option>
                  <option value="CANCEL">Cancelar definitivamente</option>
                </select>
              </label>
              {cancellationForm.action === "RESCHEDULE" && (
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                  <label>
                    Fecha propuesta
                    <input type="date" name="proposedDate" value={cancellationForm.proposedDate} onChange={handleCancellationField} required />
                  </label>
                  <label>
                    Desde
                    <input type="time" name="proposedStart" value={cancellationForm.proposedStart} onChange={handleCancellationField} required />
                  </label>
                  <label>
                    Hasta
                    <input type="time" name="proposedEnd" value={cancellationForm.proposedEnd} onChange={handleCancellationField} required />
                  </label>
                </div>
              )}
              <button type="submit" style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>
                Enviar aviso
              </button>
              {cancellationMessage && <span style={{ color: "#16a34a" }}>{cancellationMessage}</span>}
              {cancellationError && <span style={{ color: "#c62828" }}>{cancellationError}</span>}
            </form>
          </section>
        </main>
      </RequireRole>
      <Footer />
    </div>
  );
}

function UploadField({ onUpload }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <span style={{ background: "#2563eb", color: "#fff", borderRadius: 999, padding: "4px 10px" }}>Subir archivo</span>
      <input
        type="file"
        accept="image/*,.pdf"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </label>
  );
}
