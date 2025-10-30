import Head from "next/head";
import NavBar from "../../_components/NavBar";
import Footer from "../../_components/Footer";
import DashboardShell from "../../_components/DashboardShell";
import KpiCard from "../../_components/KpiCard";

const navItems = [
  { href: "/admin/dashboard", label: "KPI generales" },
  { href: "/admin/documentacion", label: "Revision de docs", badge: "6" },
  { href: "/admin/paginas", label: "CMS y landing" },
  { href: "/admin/reportes", label: "Reportes y SLA" },
];

const slaMetrics = [
  { title: "SLA urgencias", value: "19 min", helper: "Objetivo 25 min" },
  { title: "SLA documentos", value: "6 h", helper: "Objetivo 12 h" },
  { title: "Fuga off-platform", value: "4%", helper: "Objetivo < 8%" },
];

export default function AdminReports() {
  return (
    <>
      <Head>
        <title>OficiosYa | Reportes y SLA</title>
      </Head>
      <NavBar />
      <DashboardShell
        title="Reportes"
        subtitle="Monitorea SLA de urgencias, documentacion y leakage off-platform."
        navItems={navItems}
        active="/admin/reportes"
      >
        <section
          style={{
            display: "grid",
            gap: "18px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {slaMetrics.map((metric) => (
            <KpiCard key={metric.title} {...metric} />
          ))}
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "22px",
            border: "1px solid var(--border)",
            padding: "24px",
            display: "grid",
            gap: "12px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.3rem",
              color: "var(--primary-700)",
            }}
          >
            Notas
          </h2>
          <p style={{ margin: 0, color: "var(--text-soft)" }}>
            En la implementacion real integraremos estos indicadores con el
            motor de reglas y el sistema de auditoria. Cada reporte podra
            exportarse a CSV y programarse por correo para administradores
            master.
          </p>
        </section>
      </DashboardShell>
      <Footer />
    </>
  );
}
