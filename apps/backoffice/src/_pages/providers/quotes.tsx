"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../../_components/NavBar";
import Footer from "../../_components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const kinds = [
  { value: "LABOR", label: "Mano de obra" },
  { value: "MATERIAL", label: "Material" },
  { value: "PART", label: "Repuesto/Pieza" },
  { value: "OTHER", label: "Otro" },
];

async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/files/upload`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json();
  if (!res.ok || data.ok === false)
    throw new Error(data.error || "No se pudo subir archivo");
  return data.url;
}

export default function ProviderQuotesPage() {
  const router = useRouter();
  const { user, provider, refreshProvider, apiRequest, isReady } = useAuth();
  const [requestId, setRequestId] = useState("req_demo_1");
  const [rows, setRows] = useState([
    {
      kind: "LABOR",
      description: "Diagnóstico y reparación",
      qty: 1,
      unit: 0,
      total: 0,
      attachmentUrl: "",
    },
  ]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user) router.replace("/auth/login");
    if (user && user.role !== "PROVIDER") router.replace("/");
    if (user && !provider) refreshProvider(user.id);
  }, [isReady, user, provider, router, refreshProvider]);

  const sumBy = (k) =>
    rows
      .filter((r) => r.kind === k)
      .reduce((a, b) => a + (Number(b.total) || 0), 0);
  const totals = useMemo(
    () => ({
      labor: sumBy("LABOR"),
      materials: sumBy("MATERIAL") + sumBy("PART"),
      grand: rows.reduce((a, b) => a + (Number(b.total) || 0), 0),
    }),
    [rows],
  );

  const updateRow = (idx, patch) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { kind: "LABOR", description: "", qty: 1, unit: 0, total: 0 },
    ]);
  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const handleUpload = async (idx, file) => {
    try {
      const url = await uploadFile(file);
      updateRow(idx, { attachmentUrl: url });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setMessage(null);
    setError(null);
    if (!provider?.id) return setError("Faltan datos del prestador");
    try {
      const items = rows.map((r) => ({
        kind: r.kind,
        description: r.description,
        qty: Number(r.qty) || 1,
        unit: Math.round(Number(r.unit) * 100) || 0,
        total: Math.round(Number(r.total) * 100) || 0,
        attachmentUrl: r.attachmentUrl || undefined,
      }));
      const res = await apiRequest("/api/quotes", {
        method: "POST",
        body: JSON.stringify({ requestId, providerId: provider.id, items }),
      });
      setMessage(`Presupuesto creado: ${res.quote.id}`);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <Head>
        <title>Presupuestos – Prestador · OficiosYa</title>
      </Head>
      <NavBar />
      <main
        style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px 72px" }}
      >
        <h1>Enviar presupuesto</h1>
        <p style={{ color: "#555" }}>
          Asociá el presupuesto a una solicitud (requestId). Para la demo usá{" "}
          <b>req_demo_1</b>.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 16,
          }}
        >
          <label>
            Request ID
            <input
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            />
          </label>

          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 110px 110px 110px 120px",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <select
                  value={row.kind}
                  onChange={(e) => updateRow(idx, { kind: e.target.value })}
                >
                  {kinds.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Descripción"
                  value={row.description}
                  onChange={(e) =>
                    updateRow(idx, { description: e.target.value })
                  }
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Cant."
                  value={row.qty}
                  onChange={(e) => updateRow(idx, { qty: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Unit."
                  value={row.unit}
                  onChange={(e) =>
                    updateRow(idx, {
                      unit: e.target.value,
                      total: Number(e.target.value || 0) * Number(row.qty || 1),
                    })
                  }
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Total"
                  value={row.total}
                  onChange={(e) => updateRow(idx, { total: e.target.value })}
                />
                <label
                  style={{ display: "flex", gap: 6, alignItems: "center" }}
                >
                  Adjuntar
                  <input
                    type="file"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleUpload(idx, e.target.files[0])
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  style={{ gridColumn: "1 / -1", justifySelf: "end" }}
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              style={{ alignSelf: "flex-start" }}
            >
              Añadir ítem
            </button>
          </div>

          <div
            style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 8 }}
          >
            <strong>Mano de obra: ${(totals.labor / 100).toFixed(2)}</strong>
            <strong>
              Materiales/Repuestos: ${(totals.materials / 100).toFixed(2)}
            </strong>
            <strong>Total: ${(totals.grand / 100).toFixed(2)}</strong>
          </div>

          <button
            type="submit"
            style={{
              alignSelf: "flex-start",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Enviar presupuesto
          </button>
          {message && <p style={{ color: "#2e7d32" }}>{message}</p>}
          {error && <p style={{ color: "#c62828" }}>{error}</p>}
        </form>

        <hr
          style={{
            margin: "32px 0",
            border: "none",
            borderTop: "1px solid var(--border)",
          }}
        />
        <p>
          El cliente puede revisar y aceptar presupuestos en{" "}
          <code>/requests/req_demo_1</code>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
