import Head from "next/head";
import NavBar from "../../_components/NavBar";
import Footer from "../../_components/Footer";
import DashboardShell from "../../_components/DashboardShell";

const navItems = [
  { href: "/client/dashboard", label: "Panel general" },
  { href: "/client/urgencias", label: "Urgencias 24/7", badge: "nuevo" },
  { href: "/client/contratos", label: "Contratos y seguros" },
  { href: "/client/facturacion", label: "Pagos y facturas" },
];

const steps = [
  {
    title: "1. Selecciona el tipo de urgencia",
    detail:
      "Gasista matriculado, electricista, cerrajero, remolque, gomeria o medico domiciliario.",
  },
  {
    title: "2. Confirma direccion y evidencia",
    detail:
      "Se valida la geolocalizacion, fotos opcionales y se bloquea la agenda del prestador.",
  },
  {
    title: "3. Pago seguro y seguimiento",
    detail:
      "El pago queda en custodia hasta que el usuario aprueba desde la app / web con evidencia.",
  },
];

const prestadores = [
  {
    name: "Gasista Express",
    eta: "15 min",
    coverage: "Nuñez, Belgrano, Palermo",
    matricula: "Matricula GN 54123",
  },
  {
    name: "Cerrajeria 24 hs",
    eta: "20 min",
    coverage: "CABA centro",
    matricula: "Registro CRA 88771",
  },
  {
    name: "Remolque Urbano",
    eta: "35 min",
    coverage: "CABA + Zona Norte",
    matricula: "Seguro RC vig.",
  },
];

export default function ClientUrgencias() {
  return (
    <>
      <Head>
        <title>OficiosYa | Urgencias cliente</title>
      </Head>
      <NavBar />
      <DashboardShell
        title="Urgencias 24/7"
        subtitle="Visualiza como funciona la seleccion de prestadores habilitados para urgencias."
        navItems={navItems}
        active="/client/urgencias"
      >
        <section
          style={{
            display: "grid",
            gap: "18px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {steps.map((step) => (
            <div
              key={step.title}
              style={{
                background: "#fff",
                borderRadius: "18px",
                border: "1px solid var(--border)",
                padding: "20px",
                boxShadow: "rgba(22, 101, 52, 0.05) 0 12px 26px",
              }}
            >
              <strong style={{ color: "var(--primary-700)" }}>
                {step.title}
              </strong>
              <p style={{ margin: "8px 0 0", color: "var(--text-soft)" }}>
                {step.detail}
              </p>
            </div>
          ))}
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "22px",
            border: "1px solid var(--border)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
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
            Prestadores disponibles ahora
          </h2>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {prestadores.map((item) => (
              <li
                key={item.name}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "grid",
                  gap: "6px",
                }}
              >
                <strong style={{ color: "var(--primary-700)" }}>
                  {item.name}
                </strong>
                <span style={{ color: "var(--text-soft)" }}>
                  ETA estimado: {item.eta}
                </span>
                <span style={{ color: "var(--text-soft)" }}>
                  Cobertura: {item.coverage}
                </span>
                <span
                  style={{
                    background: "rgba(22, 101, 52, 0.12)",
                    color: "var(--primary-700)",
                    borderRadius: "12px",
                    padding: "4px 8px",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    alignSelf: "flex-start",
                  }}
                >
                  {item.matricula}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "22px",
            border: "1px solid var(--border)",
            padding: "24px",
            display: "grid",
            gap: "14px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.3rem",
              color: "var(--primary-700)",
            }}
          >
            Alertas y SLA
          </h2>
          <p style={{ margin: 0, color: "var(--text-soft)" }}>
            Cada urgencia se monitorea con SLA especificos. Si el prestador no
            acepta en 2 minutos, se reenvia a otros verificados. El backoffice
            puede forzar asignaciones y generar reportes de respuesta.
          </p>
        </section>
      </DashboardShell>
      <Footer />
    </>
  );
}
