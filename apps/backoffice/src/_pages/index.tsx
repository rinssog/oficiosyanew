import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import styles from "./Home.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

const FALLBACK_CATEGORIES = [
  {
    name: "Plomería completa",
    description: "Instalaciones sanitarias, gas y urgencias 24/7",
    href: "/client/buscar?category=Plomeria",
    badge: "Urgencias",
  },
  {
    name: "Electricidad segura",
    description: "Tableros, cableado certificado y mantenimiento",
    href: "/client/buscar?category=Electricidad",
    badge: "Matriculados",
  },
  {
    name: "Climatización y calefacción",
    description: "Instalación y service de AA, calderas y radiadores",
    href: "/client/buscar?category=Climatizacion",
  },
  {
    name: "Obras y refacciones",
    description: "Construcción liviana, pintura y arreglos del hogar",
    href: "/client/buscar?category=Obras",
  },
  {
    name: "Servicios rápidos",
    description: "Cerrajería, vidrios, limpieza y mantenimiento express",
    href: "/client/buscar?category=Servicios",
  },
  {
    name: "Gestión administrativa",
    description: "Consorcios, administración de edificios y seguros",
    href: "/client/buscar?category=Administracion",
  },
];

const PROVINCE_ZONES = [
  {
    province: "Ciudad de Buenos Aires",
    focus: "Cobertura total en las 15 comunas",
  },
  { province: "GBA Norte", focus: "Vicente López, San Isidro, Tigre y más" },
  {
    province: "GBA Oeste",
    focus: "Tres de Febrero, Morón, Ituzaingó, Hurlingham",
  },
  {
    province: "GBA Sur",
    focus: "Avellaneda, Lomas, Quilmes, Esteban Echeverría",
  },
  { province: "Córdoba", focus: "Capital, Villa Carlos Paz y Sierras Chicas" },
  { province: "Santa Fe", focus: "Rosario, Santa Fe y corredor industrial" },
];

const FEATURED_PROVIDERS = [
  {
    id: "pro_demo_lucia",
    name: "Lucia Pereyra",
    role: "Electricista matriculada",
    avatar: "/assets/user1.svg",
    rating: 4.9,
    reviews: 85,
    services: [
      "Tableros domiciliarios",
      "Bocas de iluminación",
      "Certificación IRAM",
    ],
    verified: true,
    response: "Responde en 18 min",
  },
  {
    id: "pro_demo_ramon",
    name: "Ramón Ibáñez",
    role: "Plomero integral",
    avatar: "/assets/user2.svg",
    rating: 4.8,
    reviews: 120,
    services: ["Destapaciones", "Termotanques", "Urgencias"],
    verified: true,
    response: "Urgencias en 35 min",
  },
  {
    id: "pro_demo_javier",
    name: "Javier Loreti",
    role: "Carpintero",
    avatar: "/assets/user3.svg",
    rating: 4.7,
    reviews: 58,
    services: ["Muebles a medida", "Restauraciones", "Decks exteriores"],
    verified: true,
    response: "Visita programada en 24 h",
  },
];

const CLIENT_PLANS = [
  {
    name: "Plan Esencial",
    price: "$0",
    summary: "Solicitá prestadores verificados cuando lo necesites.",
    perks: [
      "Calendario compartido",
      "Evaluaciones y reseñas",
      "Soporte por chat",
    ],
    accent: styles.planEssential,
    savings: "Sin costo mensual",
  },
  {
    name: "Plan Plus",
    price: "$3.200",
    summary: "Pensado para hogares y oficinas con prioridad de atención.",
    perks: [
      "Visita preventiva anual",
      "Garantía extendida",
      "Línea de ayuda 7x24",
    ],
    accent: styles.planPlus,
    highlight: true,
    savings: "Ahorro 12% en urgencias",
  },
  {
    name: "Plan Premium",
    price: "$6.900",
    summary: "Ideal para consorcios y empresas con múltiples locaciones.",
    perks: [
      "Gestor asignado",
      "Reportes mensuales",
      "Cobertura multi-propiedad",
    ],
    accent: styles.planPremium,
    savings: "Incluye agenda ejecutiva",
  },
];

const FAQ_ITEMS = [
  {
    question: "¿Dónde puedo consultar los documentos legales completos?",
    answer:
      "Revisá Términos y Condiciones, Política de Privacidad y el resto de políticas oficiales en el Centro de ayuda. OficiosYa SAS (CUIT 30-71914721-2) mantiene actualizadas esas versiones.",
  },
  {
    question: "¿Cómo se valida un prestador?",
    answer:
      "Revisamos documentación legal, matrícula y antecedentes. Solo publicamos perfiles verificados por el equipo de cumplimiento.",
  },
  {
    question: "¿Los clientes deben registrarse?",
    answer:
      "Sí, el registro es obligatorio para reservar turnos, seguir trabajos y calificar prestadores.",
  },
  {
    question: "¿Cómo funciona el pago y la garantía?",
    answer:
      "Los pagos se liberan cuando confirmás la conformidad. Si surge un reclamo, nuestra mesa de ayuda intercede y coordina una nueva visita.",
  },
  {
    question: "¿Puedo sumar a mi consorcio o empresa?",
    answer:
      "Claro, contamos con onboarding asistido y planes para administrar varias locaciones desde una misma cuenta.",
  },
];

const QUICK_FILTERS = [
  { label: "Urgencias 24/7", href: "/client/buscar?urgencias=true" },
  { label: "Verificados OficiosYa", href: "/client/buscar?verificados=true" },
  { label: "Servicios virtuales", href: "/client/buscar?modalidad=virtual" },
  { label: "Visitas a domicilio", href: "/client/buscar?modalidad=presencial" },
  { label: "Planes con agenda", href: "/planes" },
];

export default function Home() {
  const [catalog, setCatalog] = useState(FALLBACK_CATEGORIES);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/catalog`)
      .then((res) => res.json())
      .then((payload) => {
        if (cancelled) return;
        if (
          payload?.ok !== false &&
          Array.isArray(payload?.catalog) &&
          payload.catalog.length > 0
        ) {
          setCatalog(
            payload.catalog.map((item) => ({
              name: item.nombre || item.categoria || "Servicio",
              description:
                item.descripcion ||
                item.resumen ||
                "Prestador especializado con documentación vigente",
              href: `/client/buscar?category=${encodeURIComponent(item.categoria || item.nombre || "")}`,
              badge: item.permiteUrgencias ? "Urgencias" : undefined,
            })),
          );
        }
      })
      .catch(() => undefined)
      .finally(() => setLoadingCatalog(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const topCategories = useMemo(() => catalog.slice(0, 6), [catalog]);

  const toggleFaq = (index) => {
    setActiveFaq((current) => (current === index ? null : index));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>
          OficiosYa | Profesionales verificados para tu hogar y empresa
        </title>
      </Head>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.badge}>
              Plataforma integral de oficios y servicios
            </span>
            <h1>
              Registrate y gestioná todos tus prestadores desde un solo lugar
            </h1>
            <p className={styles.subtitle}>
              Ingresá como cliente para solicitar trabajos, coordinar agenda,
              seguir evidencias y calificar a profesionales con documentación
              validada por nuestro backoffice.
            </p>
            <div className={styles.heroActions}>
              <Link href="/auth/register" className={styles.ctaPrimary}>
                Crear cuenta
              </Link>
              <Link
                href="/auth/login?role=provider"
                className={styles.ctaSecondary}
              >
                Soy prestador verificado
              </Link>
              <Link
                href="/soporte#validacion-identidad"
                className={styles.ctaOutline}
              >
                Ver cómo verificamos prestadores
              </Link>
            </div>
            <ul className={styles.heroHighlights}>
              <li>Documentación y matrículas validadas por humanos</li>
              <li>Retención operativa del 50 % — sin señas ni letra chica</li>
              <li>Urgencias 24/7 con tiempos controlados y trazabilidad</li>
            </ul>
            <div className={styles.heroTrust}>
              <span>
                Backoffice 9–19 hs · Evidencias digitales · Cumplimiento Defensa
                del Consumidor
              </span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <img src="/assets/hero-illustration.svg" alt="Panel OficiosYa" />
          </div>
        </section>

        <section className={styles.quickFilters}>
          {QUICK_FILTERS.map((filter) => (
            <Link key={filter.label} href={filter.href}>
              {filter.label}
            </Link>
          ))}
        </section>

        <section className={styles.catalogSection}>
          <header className={styles.sectionHeader}>
            <div>
              <h2>Buscá por rubro</h2>
              <p>
                Elegí el servicio que necesitás y recibí presupuestos de
                prestadores verificados.
              </p>
            </div>
            <Link href="/client/buscar" className={styles.sectionLink}>
              Ver buscador completo
            </Link>
          </header>
          <div className={styles.catalogGrid}>
            {(loadingCatalog ? FALLBACK_CATEGORIES : topCategories).map(
              (item) => (
                <article key={item.name} className={styles.catalogCard}>
                  <div>
                    {item.badge ? (
                      <span className={styles.catalogBadge}>{item.badge}</span>
                    ) : null}
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                  </div>
                  <Link href={item.href}>Explorar rubro</Link>
                </article>
              ),
            )}
          </div>
        </section>

        <section className={styles.trustSection} id="validacion">
          <div className={styles.trustCopy}>
            <h2>Verificación documental y seguridad legal</h2>
            <p>
              El equipo de OficiosYa valida cada credencial antes de habilitar
              un perfil. Todas las aceptaciones de términos generan hash, IP y
              timestamp para auditoría, cumpliendo con la Ley de Defensa del
              Consumidor.
            </p>
            <ul>
              <li>DNI frente y dorso + antecedentes penales GEDO</li>
              <li>Matrículas y seguros obligatorios por rubro</li>
              <li>Retención operativa del 50 % para urgencias (no seña)</li>
            </ul>
            <Link
              href="/soporte#validacion-identidad"
              className={styles.ctaOutline}
            >
              Checklist completo de verificación
            </Link>
          </div>
          <div className={styles.trustCards}>
            <article>
              <h3>Backoffice dedicado</h3>
              <p>
                Operamos lunes a viernes de 9 a 19 hs y atendemos urgencias
                críticas fuera de horario.
              </p>
            </article>
            <article>
              <h3>Agenda auditada</h3>
              <p>
                Cancelaciones y reprogramaciones quedan registradas con
                trazabilidad y notificación automática.
              </p>
            </article>
            <article>
              <h3>Denuncias y soporte</h3>
              <p>
                Canal exclusivo para reportar irregularidades y suspender
                cuentas de forma preventiva.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.zonesSection}>
          <header className={styles.sectionHeader}>
            <div>
              <h2>Cobertura federal</h2>
              <p>
                Sumamos cuadrillas en las provincias y cordones urbanos con
                mayor demanda.
              </p>
            </div>
          </header>
          <div className={styles.zonesGrid}>
            {PROVINCE_ZONES.map((zone) => (
              <div key={zone.province} className={styles.zoneCard}>
                <strong>{zone.province}</strong>
                <span>{zone.focus}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.urgencySection}>
          <div className={styles.urgencyContent}>
            <span className={styles.urgencyIcon}>🚨</span>
            <div>
              <h3>Asistencia rápida cuando la necesitás</h3>
              <p>
                Prestadores con habilitaciones vigentes listos para resolver
                urgencias domiciliarias, asegurar instalaciones y dejar registro
                del trabajo.
              </p>
            </div>
            <Link href="/client/urgencias" className={styles.urgencyBtn}>
              Conocer el servicio
            </Link>
          </div>
        </section>

        <section className={styles.featuredSection}>
          <header className={styles.sectionHeader}>
            <div>
              <h2>Prestadores destacados</h2>
              <p>
                Perfiles con documentación completa, agenda activa y métricas de
                respuesta controladas.
              </p>
            </div>
          </header>
          <div className={styles.cardsGrid}>
            {FEATURED_PROVIDERS.map((provider) => (
              <article key={provider.id} className={styles.providerCard}>
                <div className={styles.providerHeader}>
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    width={56}
                    height={56}
                  />
                  <div>
                    <strong>{provider.name}</strong>
                    <span>{provider.role}</span>
                    <span className={styles.cardRating}>
                      Rating {provider.rating.toFixed(1)} ({provider.reviews})
                    </span>
                  </div>
                  {provider.verified ? (
                    <span className={styles.verifiedBadge}>Verificado</span>
                  ) : null}
                </div>
                <ul className={styles.serviceList}>
                  {provider.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
                <div className={styles.providerMeta}>
                  <span>{provider.response}</span>
                  <span>Agenda digital</span>
                </div>
                <div className={styles.providerActions}>
                  <Link
                    href={`/providers/${provider.id}`}
                    className={styles.cardPrimary}
                  >
                    Ver perfil
                  </Link>
                  <Link
                    href={`/providers/${provider.id}?tab=evidencias`}
                    className={styles.cardSecondary}
                  >
                    Evidencias
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.plansSection}>
          <header className={styles.sectionHeader}>
            <div>
              <h2>Suscripciones para clientes</h2>
              <p>
                Elegí el plan que te permite delegar tareas y recibir soporte a
                medida.
              </p>
            </div>
            <Link href="/planes" className={styles.sectionLink}>
              Comparar planes
            </Link>
          </header>
          <div className={styles.tiersGrid}>
            {CLIENT_PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ""} ${plan.accent}`}
              >
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planPrice}>
                    {plan.price} <span>por mes</span>
                  </p>
                  {plan.savings ? (
                    <span className={styles.planSavings}>{plan.savings}</span>
                  ) : null}
                  <p className={styles.planDescription}>{plan.summary}</p>
                </div>
                <ul>
                  {plan.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <Link href="/planes">Solicitar información</Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.faqSection}>
          <header className={styles.sectionHeader}>
            <div>
              <h2>Preguntas frecuentes</h2>
              <p>
                Desplegá cada punto para conocer cómo trabajamos y qué esperamos
                de prestadores y clientes.
              </p>
            </div>
          </header>
          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={item.question}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                >
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <span className={styles.faqIcon}>{isOpen ? "-" : "+"}</span>
                  </button>
                  {isOpen ? (
                    <p className={styles.faqAnswer}>{item.answer}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
