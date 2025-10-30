import Head from "next/head";
import NavBar from "../../_components/NavBar";
import Footer from "../../_components/Footer";
import DashboardShell from "../../_components/DashboardShell";
import KpiCard from "../../_components/KpiCard";

const navItems = [
  { href: "/client/dashboard", label: "Panel general" },
  { href: "/client/urgencias", label: "Urgencias 24/7", badge: "nuevo" },
  { href: "/client/contratos", label: "Contratos y seguros" },
  { href: "/client/facturacion", label: "Pagos y facturas" },
];

const movements = [
  {
    id: "mov1",
    concept: "Servicio - Electricidad Lucia",
    amount: "$32.000",
    status: "Pagado",
    date: "18/09",
  },
  {
    id: "mov2",
    concept: "Seguro RC obra",
    amount: "$4.500",
    status: "Pagado",
    date: "18/09",
  },
  {
    id: "mov3",
    concept: "Urgencia Cerrajeria",
    amount: "$12.000",
    status: "En custodia",
    date: "10/09",
  },
];

export default function ClientBilling() {
  return (
    <>
      <Head>
        <title>OficiosYa | Pagos y facturas</title>
      </Head>
      <NavBar />
      <DashboardShell
        title="Pagos y facturas"
        subtitle="Visualiza facturacion doble y estados de custodia."
        navItems={navItems}
        active="/client/facturacion"
      >
        <section
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <KpiCard
            title="Pagos del mes"
            value="$48.500"
            helper="2 pendientes de liberar"
          />
          <KpiCard
            title="Seguro activo"
            value="$5.000.000"
            helper="Cobertura RC hogar"
          />
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "22px",
            border: "1px solid var(--border)",
            padding: "24px",
            display: "grid",
            gap: "16px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.4rem",
              color: "var(--primary-700)",
            }}
          >
            Movimientos recientes
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-soft)" }}>
                <th style={{ padding: "12px" }}>Concepto</th>
                <th style={{ padding: "12px" }}>Importe</th>
                <th style={{ padding: "12px" }}>Estado</th>
                <th style={{ padding: "12px" }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr
                  key={mov.id}
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "12px", color: "var(--primary-700)" }}>
                    {mov.concept}
                  </td>
                  <td style={{ padding: "12px" }}>{mov.amount}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        background:
                          mov.status === "Pagado"
                            ? "rgba(22, 101, 52, 0.12)"
                            : "rgba(246, 110, 91, 0.16)",
                        color:
                          mov.status === "Pagado"
                            ? "var(--primary-700)"
                            : "var(--danger)",
                        borderRadius: "12px",
                        padding: "4px 10px",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {mov.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{mov.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </DashboardShell>
      <Footer />
    </>
  );
}
