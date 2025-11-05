"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "../../_components/NavBar";
import Footer from "../../_components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

async function fetchQuotes(requestId) {
  const res = await fetch(`${API_BASE}/api/quotes/by-request/${requestId}`);
  const data = await res.json();
  if (!res.ok || data.ok === false)
    throw new Error(data.error || "No se pudieron obtener los presupuestos");
  return data.quotes || [];
}

const priceFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});
const resolveAttachmentUrl = (path) =>
  path && (path.startsWith("http") ? path : `${API_BASE}${path}`);

export default function RequestPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [quotes, setQuotes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materialsError, setMaterialsError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchQuotes(id)
      .then(setQuotes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    fetch(`${API_BASE}/api/requests/${id}/materials`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.ok === false)
          throw new Error(
            payload.error || "No se pudieron cargar los materiales",
          );
        setMaterials(payload.materials || []);
        setMaterialsError(null);
      })
      .catch((e) => setMaterialsError(e.message));
  }, [id]);

  const accept = async (qid) => {
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/quotes/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: qid }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false)
        throw new Error(data.error || "No se pudo aceptar");
      setMessage("Presupuesto aceptado");
      setQuotes((prev) =>
        prev.map((q) => (q.id === qid ? { ...q, status: "ACCEPTED" } : q)),
      );
    } catch (e) {
      setMessage(e.message);
    }
  };

  const sortedMaterials = useMemo(
    () =>
      materials
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
    [materials],
  );

  return (
    <div>
      <Head>
        <title>Solicitud {id} | OficiosYa</title>
      </Head>
      <NavBar />
      <main
        style={{
          maxWidth: 960,
          margin: "24px auto",
          padding: "0 16px 72px",
          display: "grid",
          gap: 24,
        }}
      >
        <h1>Solicitud {id}</h1>
        {loading && <p>Cargando presupuestos</p>}
        {error && <p style={{ color: "#c62828" }}>{error}</p>}

        {!loading && !error && (
          <section style={{ display: "grid", gap: 16 }}>
            <h2 style={{ margin: 0 }}>Presupuestos recibidos</h2>
            {quotes.length === 0 && (
              <p>No hay presupuestos aún. Compartí este ID con tu prestador.</p>
            )}
            {quotes.map((q) => (
              <article
                key={q.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 16,
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
                    <strong>Presupuesto {q.id}</strong>
                    <div style={{ color: "#555", fontSize: 13 }}>
                      Estado: {q.status}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    Actualizado{" "}
                    {new Date(q.updatedAt || q.createdAt).toLocaleString(
                      "es-AR",
                    )}
                  </div>
                </header>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Cant.</th>
                      <th>Unit.</th>
                      <th>Total</th>
                      <th>Adjunto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.items.map((it, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                        <td>{it.kind}</td>
                        <td>{it.description}</td>
                        <td>{it.qty || 1}</td>
                        <td>{priceFmt.format((it.unit || 0) / 100)}</td>
                        <td>{priceFmt.format((it.total || 0) / 100)}</td>
                        <td>
                          {it.attachmentUrl ? (
                            <AttachmentViewer
                              url={resolveAttachmentUrl(it.attachmentUrl)}
                            />
                          ) : (
                            <span style={{ color: "#999", fontSize: 12 }}>
                              Sin adjunto
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <strong>
                    Mano de obra: {priceFmt.format((q.laborTotal || 0) / 100)}
                  </strong>
                  <strong>
                    Materiales y repuestos:{" "}
                    {priceFmt.format((q.materialsTotal || 0) / 100)}
                  </strong>
                </div>
                {q.status !== "ACCEPTED" && (
                  <button
                    type="button"
                    onClick={() => accept(q.id)}
                    style={{
                      alignSelf: "flex-start",
                      background: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Aceptar presupuesto
                  </button>
                )}
              </article>
            ))}
            {message && <p style={{ color: "#16a34a" }}>{message}</p>}
          </section>
        )}

        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 16,
            display: "grid",
            gap: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Materiales registrados</h2>
          {materialsError && (
            <p style={{ color: "#c62828" }}>{materialsError}</p>
          )}
          {sortedMaterials.length === 0 && (
            <p style={{ color: "#777" }}>
              El prestador aún no registró materiales para esta solicitud.
            </p>
          )}
          {sortedMaterials.map((material) => (
            <div
              key={material.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                display: "grid",
                gap: 6,
                background: "#f9fafb",
              }}
            >
              <strong>{material.description}</strong>
              <span style={{ color: "#555", fontSize: 13 }}>
                Importe: {priceFmt.format((material.amount || 0) / 100)}{" "}
                {material.currency}
              </span>
              <span style={{ color: "#777", fontSize: 12 }}>
                Registrado:{" "}
                {new Date(material.createdAt).toLocaleString("es-AR")}
              </span>
              {material.attachmentUrl ? (
                <AttachmentViewer
                  url={resolveAttachmentUrl(material.attachmentUrl)}
                  label="Ver comprobante"
                />
              ) : (
                <span style={{ fontSize: 12, color: "#999" }}>
                  Sin comprobante adjunto.
                </span>
              )}
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function AttachmentViewer({ url, label = "Ver adjunto" }) {
  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return (
      <div style={{ display: "grid", gap: 4 }}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--primary)", fontSize: 13 }}
        >
          {label}
        </a>
        <object
          data={url}
          type="application/pdf"
          width="100%"
          height="200"
          style={{ border: "1px solid var(--border)", borderRadius: 8 }}
        >
          <a href={url} target="_blank" rel="noreferrer">
            Descargar PDF
          </a>
        </object>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ color: "var(--primary)", fontSize: 13 }}
      >
        {label}
      </a>
      <img
        src={url}
        alt="Adjunto"
        style={{
          maxWidth: 180,
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      />
    </div>
  );
}
