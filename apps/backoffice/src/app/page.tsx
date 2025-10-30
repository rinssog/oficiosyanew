import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import QuickFilters from "@/components/landing/quick-filters";
import Catalog from "@/components/landing/catalog";
import Trust from "@/components/landing/trust";
import Zones from "@/components/landing/zones";
import Urgency from "@/components/landing/urgency";
import Featured from "@/components/landing/featured";
import Faq from "@/components/landing/faq";
import Plans from "@/components/landing/plans";

export const metadata = {
  title: "OficiosYa | Profesionales verificados para tu hogar y empresa",
};

const CATEGORIES = [
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
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <Hero />
        <QuickFilters items={QUICK_FILTERS} />
        <Catalog items={CATEGORIES} />

        <Trust />

        <Zones items={PROVINCE_ZONES} />

        <Urgency />

        <Featured items={FEATURED_PROVIDERS} />

        <Plans items={CLIENT_PLANS} />

        <Faq items={FAQ_ITEMS} />
      </main>

      <Footer />
    </>
  );
}
