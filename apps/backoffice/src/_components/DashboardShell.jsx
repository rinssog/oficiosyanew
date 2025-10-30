import Link from "next/link";

const shellStyle = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  gap: "32px",
  padding: "48px clamp(20px, 5vw, 64px) 80px",
};

const navStyle = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid var(--border)",
  boxShadow: "rgba(22, 101, 52, 0.05) 0 14px 28px",
  padding: "28px 24px",
  display: "flex",
  flexDirection: "column",
  gap: "22px",
  position: "sticky",
  top: "96px",
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
};

const headerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const linkListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const linkStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  borderRadius: "14px",
  color: "var(--text-soft)",
  textDecoration: "none",
  background: "rgba(22, 101, 52, 0.04)",
};

const activeLinkStyle = {
  ...linkStyle,
  background: "rgba(22, 101, 52, 0.14)",
  color: "var(--primary-700)",
  fontWeight: 600,
};

const mainStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "28px",
};

const mainHeaderStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
};

export default function DashboardShell({ title, subtitle, navItems = [], active, rightSlot, children }) {
  return (
    <div style={shellStyle}>
      <aside style={navStyle}>
        <div style={headerStyle}>
          <span style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--text-soft)" }}>
            Panel
          </span>
          <strong style={{ fontSize: "1.3rem", color: "var(--primary-700)" }}>{title}</strong>
          {subtitle && <span style={{ color: "var(--text-soft)", fontSize: "0.95rem" }}>{subtitle}</span>}
        </div>
        <nav style={linkListStyle}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={item.href === active ? activeLinkStyle : linkStyle}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span style={{ background: "var(--primary-700)", color: "#fff", borderRadius: "999px", padding: "2px 10px", fontSize: "0.75rem" }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <section style={mainStyle}>
        <header style={mainHeaderStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", color: "var(--primary-700)" }}>{title}</h1>
            {subtitle && <p style={{ margin: "4px 0 0", color: "var(--text-soft)" }}>{subtitle}</p>}
          </div>
          {rightSlot}
        </header>
        {children}
      </section>
    </div>
  );
}

