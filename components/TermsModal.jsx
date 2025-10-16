import { useState } from "react";

export default function TermsModal({ open, onConfirm }) {
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17, 24, 39, 0.55)",
        display: "grid",
        placeItems: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "min(640px, 100%)",
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid var(--border)",
          boxShadow: "rgba(22, 101, 52, 0.18) 0 24px 58px",
        }}
      >
        <h2 style={{ margin: 0, color: "var(--primary-700)" }}>Aceptar terminos y condiciones</h2>
        <p style={{ margin: 0, color: "var(--text-soft)" }}>
          Este demo muestra como el usuario debe aceptar los terminos vigentes para continuar. El registro almacena version,
          timestamp, IP y hash de la aceptacion. En produccion, este contenido vendra del backend y quedara guardado para auditoria.
        </p>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "var(--text)" }}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <span>Acepto terminos, condiciones de intermediacion y politicas de privacidad de OficiosYa.</span>
        </label>
        <button
          type="button"
          disabled={!checked}
          onClick={() => onConfirm?.()}
          style={{
            background: checked ? "var(--primary-700)" : "rgba(22, 101, 52, 0.18)",
            color: checked ? "var(--primary-contrast)" : "var(--text-soft)",
            border: "none",
            borderRadius: "14px",
            padding: "12px 18px",
            fontWeight: 600,
            cursor: checked ? "pointer" : "not-allowed",
            alignSelf: "flex-end",
            transition: "background 0.2s ease",
          }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

