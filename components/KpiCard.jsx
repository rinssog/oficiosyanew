export default function KpiCard({ title, value, helper, icon, trend, color }) {
  const accent = color || "var(--primary)";
  return (
    <div className="kpi-card" style={{ "--kpi-accent": accent }}>
      <style>{`
        .kpi-card::before { background: linear-gradient(90deg, var(--kpi-accent, var(--primary)), transparent) !important; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="kpi-title">{title}</span>
        {icon && (
          <span style={{
            fontSize: 20, width: 36, height: 36,
            background: `${accent}15`,
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {icon}
          </span>
        )}
      </div>

      <strong className="kpi-value" style={{ color: "var(--green-900)" }}>
        {value}
      </strong>

      {helper && (
        <span className="kpi-helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {trend === "up"   && <span style={{ color: "var(--primary)", fontSize: 12 }}>↑</span>}
          {trend === "down" && <span style={{ color: "var(--danger)", fontSize: 12 }}>↓</span>}
          {helper}
        </span>
      )}
    </div>
  );
}
