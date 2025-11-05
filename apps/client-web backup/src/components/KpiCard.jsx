export default function KpiCard({ title, value, helper }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "22px",
        padding: "22px",
        border: "1px solid var(--border)",
        boxShadow: "rgba(22, 101, 52, 0.05) 0 16px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <span style={{ fontSize: "0.85rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </span>
      <strong style={{ fontSize: "2rem", color: "var(--primary-700)" }}>{value}</strong>
      {helper && <span style={{ color: "var(--text-soft)" }}>{helper}</span>}
    </div>
  );
}

