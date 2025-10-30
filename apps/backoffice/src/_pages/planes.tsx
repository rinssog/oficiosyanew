import Head from "next/head";
import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import styles from "./Planes.module.css";

const CLIENT_PLANS = [
  {
    name: "Plan Esencial",
    price: "$0",
    summary: "Solicita prestadores verificados cuando lo necesites.",
    includes: [
      "Agenda compartida",
      "Evaluaciones y resenas",
      "Soporte por chat",
    ],
    accent: styles.planEssential,
  },
  {
    name: "Plan Plus",
    price: "$3.200",
    summary: "Pensado para hogares y oficinas con prioridad de atencion.",
    includes: [
      "Visita preventiva anual",
      "Garantia extendida",
      "Linea de ayuda 7x24",
    ],
    accent: styles.planPlus,
    highlight: true,
  },
  {
    name: "Plan Premium",
    price: "$6.900",
    summary: "Ideal para consorcios y empresas con multiples locaciones.",
    includes: [
      "Gestor asignado",
      "Reportes mensuales",
      "Cobertura multi-propiedad",
    ],
    accent: styles.planPremium,
  },
];

const PROVIDER_BENEFITS = [
  {
    tier: "Basico",
    color: "#9ca3af",
    perks: [
      "Publicacion de servicios",
      "Agenda manual",
      "Cobranza a traves de la plataforma",
    ],
  },
  {
    tier: "Plus",
    color: "#b4c2ff",
    perks: [
      "Prioridad en resultados",
      "Estadisticas de desempeno",
      "Asesoria para licitaciones",
    ],
  },
  {
    tier: "Elite",
    color: "#d4af37",
    perks: [
      "Cuenta ejecutiva",
      "Campanas promocionadas",
      "Mesa de soporte dedicada",
    ],
  },
];

export default function PlanesPage() {
  return (
    <>
      <Head>
        <title>
          Planes OficiosYa | Suscripciones para clientes y prestadores
        </title>
      </Head>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <h1>Suscripciones flexibles para clientes y prestadores</h1>
            <p>
              Desde tu cuenta master podes activar, pausar o personalizar cada
              plan. Ajusta beneficios, limites y precios segun tu estrategia
              comercial.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Planes para clientes</h2>
            <p>
              Elegi como queres delegar la gestion de oficios, mantenimiento y
              urgencias.
            </p>
          </header>
          <div className={styles.cardGrid}>
            {CLIENT_PLANS.map((plan) => (
              <article key={plan.name} className={styles.planCard}>
                <div>
                  <span className={styles.planName}>{plan.name}</span>
                  <strong className={styles.planPrice}>
                    {plan.price} <span>por mes</span>
                  </strong>
                  <p className={styles.planSummary}>{plan.summary}</p>
                </div>
                <ul>
                  {plan.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Beneficios para prestadores</h2>
            <p>
              Configura desde la cuenta master que incluye cada nivel y como se
              acreditan los pagos.
            </p>
          </header>
          <div className={styles.providerGrid}>
            {PROVIDER_BENEFITS.map((plan) => (
              <div
                key={plan.tier}
                className={styles.providerCard}
                style={{ borderTopColor: plan.color }}
              >
                <strong>{plan.tier}</strong>
                <ul>
                  {plan.perks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Como editar los planes?</h2>
          </header>
          <ol className={styles.steps}>
            <li>
              Ingresa con tu cuenta master y abre el panel de administracion.
            </li>
            <li>
              Desde "Planes y beneficios" podes modificar precios, perks y
              cupos.
            </li>
            <li>
              Los cambios impactan de inmediato en la landing y en los paneles
              de clientes y prestadores.
            </li>
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
