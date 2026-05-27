import Link from "next/link";
import { useRouter } from "next/router";

/* ── Bottom nav icons ──────────────────────────────────────── */
function IconHome()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconSearch()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function IconChat()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function IconFile()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function IconDollar()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function IconAlert()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function IconGrid()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconUrgent()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

/* Assign icon by label/href keywords */
function resolveIcon(item) {
  const s = (item.href + " " + item.label).toLowerCase();
  if (s.includes("urgencia") || s.includes("24"))    return <IconUrgent />;
  if (s.includes("chat") || s.includes("mensaje"))   return <IconChat />;
  if (s.includes("buscar") || s.includes("search"))  return <IconSearch />;
  if (s.includes("factura") || s.includes("pago") || s.includes("escrow")) return <IconDollar />;
  if (s.includes("contrato") || s.includes("seguro") || s.includes("doc")) return <IconFile />;
  if (s.includes("reclamo") || s.includes("alerta") || s.includes("alert")) return <IconAlert />;
  return <IconGrid />;
}

export default function DashboardShell({ title, subtitle, navItems = [], active, rightSlot, children, mobileTitle }) {
  const router = useRouter();
  const currentActive = active || router.pathname;

  /* ── Mobile bottom nav: pick first 5 items ─────────────────── */
  const bottomItems = navItems.slice(0, 5);

  return (
    <>
      <div className="dashboard-grid">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.10em", color: "var(--text-muted)", fontWeight: 700, marginBottom: 4 }}>
              Navegación
            </span>
            <strong style={{ fontSize: "1.15rem", color: "var(--green-900)", lineHeight: 1.2 }}>{title}</strong>
            {subtitle && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 2 }}>{subtitle}</span>}
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidenav-link${item.href === currentActive ? " active" : ""}`}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {resolveIcon(item)}
                  </span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span style={{
                    background: "linear-gradient(135deg,var(--primary),var(--green-900))",
                    color: "#fff", borderRadius: 999, padding: "2px 8px", fontSize: "0.7rem", fontWeight: 700,
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <section className="dashboard-main">
          <header style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: 16,
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "var(--green-900)", fontWeight: 800 }}>
                {mobileTitle || title}
              </h1>
              {subtitle && <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>{subtitle}</p>}
            </div>
            {rightSlot}
          </header>

          {children}
        </section>
      </div>

      {/* Mobile Bottom Navigation */}
      {bottomItems.length > 0 && (
        <nav className="bottom-nav" aria-label="Navegación principal">
          {bottomItems.map((item) => {
            const isActive = item.href === currentActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`bottom-nav-item${isActive ? " active" : ""}`}
              >
                <span style={{
                  color: isActive ? "var(--primary)" : "var(--gray-400)",
                  transition: "color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {resolveIcon(item)}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--primary)" : "var(--gray-400)",
                  maxWidth: 64,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}>
                  {item.label.replace("Urgencias 24/7", "Urgencias").replace("Contratos y seguros", "Contratos").replace("Pagos y facturas", "Pagos")}
                </span>
                {item.badge && isActive && (
                  <span style={{
                    position: "absolute", top: 6, right: "calc(50% - 20px)",
                    background: "var(--danger)", color: "#fff",
                    width: 8, height: 8, borderRadius: "50%",
                    border: "2px solid #fff",
                  }} />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
