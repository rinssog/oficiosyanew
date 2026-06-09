import bcrypt from "bcryptjs";
import { CatalogItem } from "../types.js";
import { generateId, readJson, writeJson } from "../storage.js";
import { ensureJsonArray } from "../utils/persistence.js";

interface ContractTemplate {
  id: string;
  name: string;
  version: string;
  scope: string;
  category: string;
  lastUpdated: string;
  downloadUrl: string | null;
  description: string;
}

interface InsuranceProduct {
  id: string;
  name: string;
  coverage: number;
  currency: string;
  partner: string;
  status: "ACTIVE" | "EXPIRING" | "INACTIVE";
  renewalDate: string | null;
  notes?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  commissionPct: number;
  leadFee: number;
  urgentIncluded: boolean;
  features: string[];
  recommended?: boolean;
}

interface CmsSection {
  id: string;
  name: string;
  status: "BORRADOR" | "PUBLICADO" | "REVISION";
  lastUpdated: string;
  notes?: string;
}

const catalogSeed: CatalogItem[] = [
  {
    id: "HOG-PLO-001",
    rubro: "Plomeria",
    subrubro: "Instalaciones",
    nombre: "Cambio de canilla monocontrol",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Plomeria",
    etiquetas: ["hogar", "griferia", "cocina"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    sinonimos: ["cambio de grifo", "reemplazo de canilla"],
    tiempoEstimado: 90,
  },
  {
    id: "HOG-PLO-002",
    rubro: "Plomeria",
    subrubro: "Destapaciones",
    nombre: "Destapacion de cloaca",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Plomeria",
    etiquetas: ["hogar", "urgencia", "cloaca"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: true,
    sinonimos: ["destapacion urgente", "cloaca tapada"],
    tiempoEstimado: 60,
  },
  {
    id: "HOG-PLO-003",
    rubro: "Plomeria",
    subrubro: "Instalaciones",
    nombre: "Instalacion de termotanque",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Plomeria",
    etiquetas: ["hogar", "agua caliente"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 180,
  },
  {
    id: "HOG-ELE-001",
    rubro: "Electricidad",
    subrubro: "Diagnostico",
    nombre: "Revision de cortocircuito",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Electricidad",
    etiquetas: ["hogar", "urgencia", "tablero"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: true,
    sinonimos: ["salta disyuntor", "tablero quemado"],
    tiempoEstimado: 60,
  },
  {
    id: "HOG-ELE-002",
    rubro: "Electricidad",
    subrubro: "Instalaciones",
    nombre: "Instalacion de toma corriente",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Electricidad",
    etiquetas: ["hogar", "enchufe"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    sinonimos: ["colocar enchufe", "cambiar toma"],
    tiempoEstimado: 45,
  },
  {
    id: "HOG-GAS-001",
    rubro: "Gasista matriculado",
    subrubro: "Urgencias",
    nombre: "Reparacion de fuga de gas",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Gas",
    etiquetas: ["hogar", "urgencia", "matricula"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: true,
    sinonimos: ["perdida de gas", "gasista urgente"],
    tiempoEstimado: 90,
  },
  {
    id: "HOG-CER-001",
    rubro: "Cerrajeria",
    subrubro: "Urgencias",
    nombre: "Apertura de puerta",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Cerrajeria",
    etiquetas: ["urgencia", "cerrajero"],
    modalidades: ["PRESENCIAL", "MOVIL"],
    permiteUrgencias: true,
    sinonimos: ["abrir puerta", "cerrajero urgente"],
    tiempoEstimado: 45,
  },
  {
    id: "HOG-PIN-001",
    rubro: "Pintura",
    subrubro: "Interior",
    nombre: "Pintura de ambiente hasta 20m2",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Pintura",
    etiquetas: ["hogar", "interior"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 240,
  },
  {
    id: "HOG-FUM-001",
    rubro: "Fumigacion",
    subrubro: "Plagas",
    nombre: "Fumigacion domiciliaria",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Fumigacion",
    etiquetas: ["hogar", "plagas"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    sinonimos: ["fumigar", "control de plagas"],
    tiempoEstimado: 120,
  },
  {
    id: "HOG-VAR-001",
    rubro: "Limpieza",
    subrubro: "Tanques",
    nombre: "Limpieza de tanque de agua",
    categoria: "HOGAR_MANTENIMIENTO",
    subcategoria: "Limpieza",
    etiquetas: ["hogar", "tanque"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 180,
  },
  {
    id: "MOV-CAD-001",
    rubro: "Cadeteria",
    subrubro: "Express",
    nombre: "Cadeteria urbana",
    categoria: "MOVILIDAD_AUXILIO",
    subcategoria: "Cadeteria",
    etiquetas: ["movilidad", "envio"],
    modalidades: ["MOVIL"],
    permiteUrgencias: true,
    sinonimos: ["delivery urgente", "mensajeria"],
    tiempoEstimado: 60,
  },
  {
    id: "MOV-FLE-001",
    rubro: "Fletes",
    subrubro: "Mudanzas",
    nombre: "Flete local hasta 20km",
    categoria: "MOVILIDAD_AUXILIO",
    subcategoria: "Fletes y Mudanzas",
    etiquetas: ["movilidad", "flete"],
    modalidades: ["MOVIL"],
    permiteUrgencias: false,
    tiempoEstimado: 240,
  },
  {
    id: "MOV-REM-001",
    rubro: "Remolque",
    subrubro: "Vehiculos livianos",
    nombre: "Remolque de vehiculo",
    categoria: "MOVILIDAD_AUXILIO",
    subcategoria: "Remolques",
    etiquetas: ["movilidad", "remolque", "urgencia"],
    modalidades: ["MOVIL"],
    permiteUrgencias: true,
    tiempoEstimado: 90,
  },
  {
    id: "MOV-GOM-001",
    rubro: "Gomeria movil",
    subrubro: "Cambio de neumaticos",
    nombre: "Cambio de neumatico en ruta",
    categoria: "MOVILIDAD_AUXILIO",
    subcategoria: "Gomeria movil",
    etiquetas: ["movilidad", "gomeria", "urgencia"],
    modalidades: ["MOVIL"],
    permiteUrgencias: true,
    tiempoEstimado: 60,
  },
  {
    id: "EDU-IDI-001",
    rubro: "Idiomas",
    subrubro: "Ingles",
    nombre: "Clase de ingles 60 minutos",
    categoria: "EDUCACION_CAPACITACION",
    subcategoria: "Idiomas",
    etiquetas: ["educacion", "ingles", "clase"],
    modalidades: ["VIRTUAL", "PRESENCIAL"],
    permiteUrgencias: false,
    sinonimos: ["profesor ingles", "clase virtual ingles"],
    tiempoEstimado: 60,
  },
  {
    id: "EDU-PAR-001",
    rubro: "Clases particulares",
    subrubro: "Matematica",
    nombre: "Apoyo escolar en matematica",
    categoria: "EDUCACION_CAPACITACION",
    subcategoria: "Clases particulares",
    etiquetas: ["educacion", "apoyo"],
    modalidades: ["VIRTUAL", "PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 90,
  },
  {
    id: "PRO-LEG-001",
    rubro: "Servicios profesionales",
    subrubro: "Legal",
    nombre: "Consulta legal UMA",
    categoria: "PROFESIONALES_COLEGIADOS",
    subcategoria: "Abogacia",
    etiquetas: ["profesionales", "uma", "matricula"],
    modalidades: ["PRESENCIAL", "VIRTUAL"],
    permiteUrgencias: false,
    tiempoEstimado: 45,
  },
  {
    id: "PRO-CON-001",
    rubro: "Servicios profesionales",
    subrubro: "Contable",
    nombre: "Balance trimestral",
    categoria: "PROFESIONALES_COLEGIADOS",
    subcategoria: "Contabilidad",
    etiquetas: ["profesionales", "contable"],
    modalidades: ["VIRTUAL", "PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 240,
  },
  {
    id: "BIO-PTR-001",
    rubro: "Bienestar",
    subrubro: "Personal trainer",
    nombre: "Sesion personal trainer",
    categoria: "BIENESTAR_ESTETICA",
    subcategoria: "Personal trainer",
    etiquetas: ["bienestar", "fitness"],
    modalidades: ["PRESENCIAL", "VIRTUAL"],
    permiteUrgencias: false,
    tiempoEstimado: 60,
  },
  {
    id: "BIO-MAS-001",
    rubro: "Bienestar",
    subrubro: "Masajes",
    nombre: "Masaje descontracturante",
    categoria: "BIENESTAR_ESTETICA",
    subcategoria: "Masajes",
    etiquetas: ["bienestar", "masajes"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 60,
  },
  {
    id: "MASC-VET-001",
    rubro: "Mascotas",
    subrubro: "Veterinaria",
    nombre: "Consulta veterinaria a domicilio",
    categoria: "MASCOTAS",
    subcategoria: "Veterinaria",
    etiquetas: ["mascotas", "veterinaria"],
    modalidades: ["PRESENCIAL", "MOVIL"],
    permiteUrgencias: true,
    tiempoEstimado: 60,
  },
  {
    id: "MASC-PAS-001",
    rubro: "Mascotas",
    subrubro: "Paseo",
    nombre: "Paseo canino 60 minutos",
    categoria: "MASCOTAS",
    subcategoria: "Paseo",
    etiquetas: ["mascotas", "paseo"],
    modalidades: ["MOVIL"],
    permiteUrgencias: false,
    tiempoEstimado: 60,
  },
  {
    id: "TEC-SOP-001",
    rubro: "Tecnologia",
    subrubro: "Soporte",
    nombre: "Reparacion de notebook",
    categoria: "TECNOLOGIA_SOPORTE",
    subcategoria: "Soporte informatico",
    etiquetas: ["tecnologia", "notebook"],
    modalidades: ["PRESENCIAL", "VIRTUAL"],
    permiteUrgencias: false,
    tiempoEstimado: 180,
  },
  {
    id: "TEC-RED-001",
    rubro: "Tecnologia",
    subrubro: "Redes",
    nombre: "Instalacion red wifi hogar",
    categoria: "TECNOLOGIA_SOPORTE",
    subcategoria: "Redes",
    etiquetas: ["tecnologia", "wifi"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 120,
  },
  {
    id: "EVE-BAR-001",
    rubro: "Eventos",
    subrubro: "Bartender",
    nombre: "Servicio de bartender 4 horas",
    categoria: "EVENTOS",
    subcategoria: "Bartender",
    etiquetas: ["eventos", "bartender"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 240,
  },
  {
    id: "EVE-DJ-001",
    rubro: "Eventos",
    subrubro: "DJ",
    nombre: "DJ para evento social",
    categoria: "EVENTOS",
    subcategoria: "DJ",
    etiquetas: ["eventos", "musica"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 300,
  },
  {
    id: "LIM-TEX-001",
    rubro: "Limpieza",
    subrubro: "Tapizados",
    nombre: "Lavado de tapizado de sillones",
    categoria: "SERVICIOS_ESPECIALES",
    subcategoria: "Lavado de tapizados",
    etiquetas: ["limpieza", "tapizado"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 180,
  },
  {
    id: "FAM-NIN-001",
    rubro: "Ni�era",
    subrubro: "Turnos",
    nombre: "Servicio de ni�era 4 horas",
    categoria: "NINOS_FAMILIA",
    subcategoria: "Nineras",
    etiquetas: ["familia", "ninos"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 240,
  },
  {
    id: "FAM-CUI-001",
    rubro: "Cuidadores",
    subrubro: "Adultos mayores",
    nombre: "Cuidadores de adultos mayores turno diurno",
    categoria: "NINOS_FAMILIA",
    subcategoria: "Cuidadores",
    etiquetas: ["familia", "cuidado"],
    modalidades: ["PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 480,
  },
  {
    id: "SAL-NUT-001",
    rubro: "Bienestar",
    subrubro: "Nutricion",
    nombre: "Consulta nutricional inicial",
    categoria: "BIENESTAR_ESTETICA",
    subcategoria: "Nutricion",
    etiquetas: ["bienestar", "salud"],
    modalidades: ["VIRTUAL", "PRESENCIAL"],
    permiteUrgencias: false,
    tiempoEstimado: 60,
  },
  {
    id: "SOP-WAR-001",
    rubro: "Warehouse",
    subrubro: "Materiales",
    nombre: "Suministro materiales plomeria basicos",
    categoria: "SERVICIOS_ESPECIALES",
    subcategoria: "Warehouse",
    etiquetas: ["materiales", "logistica"],
    modalidades: ["MOVIL"],
    permiteUrgencias: false,
    tiempoEstimado: 120,
  },
];

const upsertCatalog = () => {
  const existing = readJson<CatalogItem[]>("catalog", []);
  const map = new Map(existing.map((item) => [item.id, item]));
  catalogSeed.forEach((item) => {
    map.set(item.id, { ...map.get(item.id), ...item });
  });
  writeJson("catalog", Array.from(map.values()));
};

const seedTerms = () => {
  const exists = readJson("terms_content", null);
  if (exists) return;
  const terms = {
    version: "1.0.0",
    title: "Terminos y Condiciones OficiosYa (Demo)",
    content:
      "OficiosYa actua como intermediario digital entre clientes y prestadores. Al usar la plataforma aceptas el rol de intermediacion, las politicas de privacidad y las reglas de uso. Los prestadores son responsables por la calidad de su trabajo y por la documentacion cargada. Esta copia es ilustrativa para pruebas.",
    updatedAt: new Date().toISOString(),
  };
  writeJson("terms_content", terms);
};

const seedRequestsStore = () => {
  ensureJsonArray<any>("requests");
  ensureJsonArray<any>("quotes");
  ensureJsonArray<any>("provider_materials");
};

const seedContractTemplates = () => {
  const existing = readJson<ContractTemplate[] | null>("contract_templates", null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const now = new Date().toISOString();
  const templates: ContractTemplate[] = [
    {
      id: "contract_obra_menor",
      name: "Contrato de obra menor",
      version: "1.2",
      scope: "Hogar",
      category: "HOGAR",
      lastUpdated: now,
      downloadUrl: null,
      description: "Clausulas basicas para trabajos domiciliarios menores, incluye responsabilidades, garantias y plazos de pago.",
    },
    {
      id: "contract_servicio_profesional",
      name: "Servicio profesional UMA",
      version: "0.9",
      scope: "Profesionales",
      category: "PROFESIONALES",
      lastUpdated: now,
      downloadUrl: null,
      description: "Acuerdo marco para consultorias y atencion profesional bajo la ley argentina vigente.",
    },
    {
      id: "checklist_urgencias",
      name: "Checklist entrega urgencia",
      version: "1.0",
      scope: "Urgencias 24/7",
      category: "URGENCIA",
      lastUpdated: now,
      downloadUrl: null,
      description: "Formato para validar finalizacion de trabajos urgentes con evidencia fotografica y firma digital.",
    },
  ];
  writeJson("contract_templates", templates);
};

const seedInsuranceProducts = () => {
  const existing = readJson<InsuranceProduct[] | null>("insurance_products", null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const products: InsuranceProduct[] = [
    {
      id: "insurance_rc_hogar",
      name: "Seguro de responsabilidad civil hogar",
      coverage: 5_000_000,
      currency: "ARS",
      partner: "Aseguradora Demo",
      status: "ACTIVE",
      renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      notes: "Cobertura base para trabajos domiciliarios. Incluye danos a terceros y bienes del cliente.",
    },
    {
      id: "insurance_obra_puntual",
      name: "Seguro de obra puntual",
      coverage: 10_000_000,
      currency: "ARS",
      partner: "Aseguradora Demo",
      status: "EXPIRING",
      renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
      notes: "Aplicable a reformas o trabajos de construccion. Incluye cobertura de ART tercerizada.",
    },
  ];
  writeJson("insurance_products", products);
};

const seedSubscriptionPlans = () => {
  const existing = readJson<SubscriptionPlan[] | null>("subscription_plans", null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const plans: SubscriptionPlan[] = [
    {
      id: "plan_base",
      name: "Base",
      priceMonthly: 0,
      priceYearly: 0,
      commissionPct: 0.15,
      leadFee: 700,
      urgentIncluded: false,
      features: ["Publicacion en marketplace", "Cobro por transaccion", "Verificacion documental basica"],
    },
    {
      id: "plan_pro",
      name: "Profesional",
      priceMonthly: 11900,
      priceYearly: 11900 * 10,
      commissionPct: 0.1,
      leadFee: 350,
      urgentIncluded: true,
      features: ["Prioridad en ranking", "Urgencias 24/7", "Dashboard de KPI", "Atencion preferencial"],
      recommended: true,
    },
    {
      id: "plan_empresas",
      name: "Empresas",
      priceMonthly: 34900,
      priceYearly: 34900 * 10,
      commissionPct: 0.08,
      leadFee: 0,
      urgentIncluded: true,
      features: ["Cuenta multi agente", "Integracion ERP", "Gestor comercial dedicado", "Reportes avanzados"],
    },
  ];
  writeJson("subscription_plans", plans);
};

const seedCmsSections = () => {
  const existing = readJson<CmsSection[] | null>("cms_sections", null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const now = new Date().toISOString();
  const sections: CmsSection[] = [
    { id: "landing", name: "Landing principal", status: "PUBLICADO", lastUpdated: now, notes: "Nueva seccion de testimonios" },
    { id: "planes", name: "Pagina de planes", status: "BORRADOR", lastUpdated: now, notes: "Actualizar precios segun plan" },
    { id: "faq", name: "FAQ chatbot", status: "PUBLICADO", lastUpdated: now, notes: "Agregar tutorial en video" },
  ];
  writeJson("cms_sections", sections);
};

const seedCollaboratorStores = () => {
  ensureJsonArray("collaborators");
  ensureJsonArray("collaborator_profiles");
  ensureJsonArray("collaborator_terms");
  ensureJsonArray("collaborator_metrics");
};

// ─── Demo data seed — 6 prestadores reales para que el buscador funcione ─────
// Solo se ejecuta si provider_services.json está vacío. Password: Demo123!
// Hash pre-computado con bcrypt rounds=10 para "Demo123!"
// Unused placeholder — real hash computed at runtime below
const _DEMO_HASH_UNUSED = "";

export const seedDemoData = async () => {
  const services = readJson<any[]>("provider_services", []);
  if (services.length > 0) return; // ya sembrado

  // Computar hash al vuelo (solo una vez, al primer boot)
  const demoHash = await bcrypt.hash("Demo123!", 10);
  const now = Date.now();

  // ── Usuarios demo ──────────────────────────────────────────────────────────
  const usersArr = readJson<any[]>("users", []);

  const demoUsers = [
    { id: "usr_plo_001",  email: "martin.rodriguez@demo.com",  name: "Martín Rodríguez",   role: "PROVIDER", passwordHash: demoHash, createdAt: now, phone: "+54 9 11 5544-1122" },
    { id: "usr_elec_001", email: "carlos.fernandez@demo.com",  name: "Carlos Fernández",   role: "PROVIDER", passwordHash: demoHash, createdAt: now, phone: "+54 9 11 5544-2233" },
    { id: "usr_gas_001",  email: "roberto.gonzalez@demo.com",  name: "Roberto González",   role: "PROVIDER", passwordHash: demoHash, createdAt: now, phone: "+54 9 11 5544-3344" },
    { id: "usr_cerr_001", email: "diego.lopez@demo.com",       name: "Diego López",        role: "PROVIDER", passwordHash: demoHash, createdAt: now, phone: "+54 9 11 5544-4455" },
    { id: "usr_pin_001",  email: "pablo.martinez@demo.com",    name: "Pablo Martínez",     role: "PROVIDER", passwordHash: demoHash, createdAt: now, phone: "+54 9 11 5544-5566" },
    { id: "usr_carp_001", email: "lucas.garcia@demo.com",      name: "Lucas García",       role: "PROVIDER", passwordHash: demoHash, createdAt: now, phone: "+54 9 11 5544-6677" },
    { id: "usr_client_2", email: "ana.gomez@demo.com",         name: "Ana Gómez",          role: "CLIENT",   passwordHash: demoHash, createdAt: now, phone: "+54 9 11 4433-1122" },
    { id: "usr_client_3", email: "jorge.perez@demo.com",       name: "Jorge Pérez",        role: "CLIENT",   passwordHash: demoHash, createdAt: now, phone: "+54 9 11 4433-2233" },
  ];

  const existingIds = new Set(usersArr.map((u: any) => u.id));
  demoUsers.forEach(u => { if (!existingIds.has(u.id)) usersArr.push(u); });
  writeJson("users", usersArr);

  // ── Prestadores ────────────────────────────────────────────────────────────
  const providersArr = readJson<any[]>("providers", []);
  const existingProvIds = new Set(providersArr.map((p: any) => p.id));

  const demoProviders = [
    { id: "pro_plo_001",  userId: "usr_plo_001",  companyName: "Rodríguez Plomería",      verified: true,  bio: "Plomero matriculado con 15 años de experiencia en CABA. Destapaciones, instalaciones y reparaciones.",  categories: ["Plomería"], rating: 4.8, reviewCount: 47, plan: "plan_pro",     createdAt: now, updatedAt: now, goldLevel: false },
    { id: "pro_elec_001", userId: "usr_elec_001", companyName: "Fernández Electricidad",  verified: true,  bio: "Electricista matriculado M.E.A. Instalaciones trifásicas, tableros, iluminación LED y urgencias 24hs.", categories: ["Electricidad"], rating: 4.9, reviewCount: 83, plan: "plan_pro",     createdAt: now, updatedAt: now, goldLevel: false },
    { id: "pro_gas_001",  userId: "usr_gas_001",  companyName: "González Gas ENARGAS",    verified: true,  bio: "Gasista matriculado ENARGAS GN-54123. Instalaciones de gas, calefones, termotanques y fugas.",          categories: ["Gasista"], rating: 4.7, reviewCount: 31, plan: "plan_base",    createdAt: now, updatedAt: now, goldLevel: false },
    { id: "pro_cerr_001", userId: "usr_cerr_001", companyName: "López Cerrajería 24hs",   verified: true,  bio: "Cerrajero con apertura sin daños. Cambio de bombines, cajas fuertes y puertas blindadas. Disponible 24/7.", categories: ["Cerrajería"], rating: 4.9, reviewCount: 124, plan: "plan_empresas", createdAt: now, updatedAt: now, goldLevel: true },
    { id: "pro_pin_001",  userId: "usr_pin_001",  companyName: "Martínez Pinturas",       verified: false, bio: "Pintor profesional. Interiores, exteriores y frentes de edificios. Trabajo prolijo y puntual.",          categories: ["Pintura"], rating: 4.5, reviewCount: 18, plan: "plan_base",    createdAt: now, updatedAt: now, goldLevel: false },
    { id: "pro_carp_001", userId: "usr_carp_001", companyName: "García Carpintería",      verified: true,  bio: "Carpintero y ebanista. Muebles a medida, reparación de pisos y molduras. Atiendo GBA Norte y CABA.",    categories: ["Carpintería"], rating: 4.6, reviewCount: 22, plan: "plan_base",    createdAt: now, updatedAt: now, goldLevel: false },
  ];

  demoProviders.forEach(p => { if (!existingProvIds.has(p.id)) providersArr.push(p); });
  writeJson("providers", providersArr);

  // ── Perfiles (áreas de cobertura) ──────────────────────────────────────────
  const profilesArr = readJson<any[]>("provider_profiles", []);
  const existingProfIds = new Set(profilesArr.map((p: any) => p.providerId));

  const demoProfiles = [
    { providerId: "pro_plo_001",  areas: ["Palermo", "Recoleta", "Belgrano", "Colegiales"], verificationStatus: "APPROVED", bio: "Plomero matriculado CABA", documents: [], createdAt: now },
    { providerId: "pro_elec_001", areas: ["Belgrano", "Núñez", "Saavedra", "Coghlan", "Palermo"], verificationStatus: "APPROVED", bio: "Electricista matriculado", documents: [], createdAt: now },
    { providerId: "pro_gas_001",  areas: ["Microcentro", "San Nicolás", "Retiro", "Recoleta", "Barrio Norte"], verificationStatus: "APPROVED", bio: "Gasista ENARGAS", documents: [], createdAt: now },
    { providerId: "pro_cerr_001", areas: ["Palermo", "Recoleta", "Belgrano", "Microcentro", "San Telmo", "Caballito", "Flores", "Villa Crespo"], verificationStatus: "APPROVED", bio: "Cerrajería 24hs CABA", documents: [], createdAt: now },
    { providerId: "pro_pin_001",  areas: ["Palermo", "Villa Crespo", "Almagro", "Caballito"], verificationStatus: "PENDING", bio: "Pintor profesional", documents: [], createdAt: now },
    { providerId: "pro_carp_001", areas: ["Tigre", "San Isidro", "Vicente López", "Palermo"], verificationStatus: "APPROVED", bio: "Carpintería y ebanistería", documents: [], createdAt: now },
  ];

  demoProfiles.forEach(p => { if (!existingProfIds.has(p.providerId)) profilesArr.push(p); });
  writeJson("provider_profiles", profilesArr);

  // ── Servicios (provider_services) — precios en CENTAVOS ───────────────────
  // Los precios se almacenan en centavos, se muestran /100 en el front
  const newServices: any[] = [
    // Plomero
    { id: "svc_plo_001", providerId: "pro_plo_001", catalogId: "PLO-001", category: "Plomería", subCategory: "Grifería",       modalities: ["PRESENCIAL"], allowsUrgent: false, price: 1500000,  notes: "Incluye mano de obra. Materiales aparte.", estimatedDuration: 90,  createdAt: now },
    { id: "svc_plo_002", providerId: "pro_plo_001", catalogId: "PLO-002", category: "Plomería", subCategory: "Destapaciones",  modalities: ["PRESENCIAL"], allowsUrgent: true,  price: 2200000,  notes: "Urgencia 24hs con recargo nocturno. Garantía 48hs.", estimatedDuration: 60,  createdAt: now },
    { id: "svc_plo_003", providerId: "pro_plo_001", catalogId: "PLO-003", category: "Plomería", subCategory: "Instalaciones",  modalities: ["PRESENCIAL"], allowsUrgent: false, price: 3500000,  notes: "Instalación completa. No incluye el bidet.", estimatedDuration: 120, createdAt: now },

    // Electricista
    { id: "svc_elec_001", providerId: "pro_elec_001", catalogId: "ELE-001", category: "Electricidad", subCategory: "Iluminación",     modalities: ["PRESENCIAL"], allowsUrgent: false, price: 2000000,  notes: "Instalación punto de luz o boca de tomacorriente. Incluye materiales básicos.", estimatedDuration: 90,  createdAt: now },
    { id: "svc_elec_002", providerId: "pro_elec_001", catalogId: "ELE-002", category: "Electricidad", subCategory: "Tableros",        modalities: ["PRESENCIAL"], allowsUrgent: true,  price: 4500000,  notes: "Diagnóstico, reemplazo de disyuntores y normalización. Con garantía por escrito.", estimatedDuration: 120, createdAt: now },
    { id: "svc_elec_003", providerId: "pro_elec_001", catalogId: "ELE-003", category: "Electricidad", subCategory: "Corte eléctrico", modalities: ["PRESENCIAL"], allowsUrgent: true,  price: 3000000,  notes: "Urgencia 24hs. Llegada en menos de 30 minutos en CABA.", estimatedDuration: 60,  createdAt: now },

    // Gasista
    { id: "svc_gas_001", providerId: "pro_gas_001", catalogId: "GAS-001", category: "Gasista", subCategory: "Calefones",    modalities: ["PRESENCIAL"], allowsUrgent: false, price: 4000000,  notes: "Instalación completa con certificado ENARGAS. No incluye el calefón.", estimatedDuration: 150, createdAt: now },
    { id: "svc_gas_002", providerId: "pro_gas_001", catalogId: "GAS-002", category: "Gasista", subCategory: "Fugas de gas", modalities: ["PRESENCIAL"], allowsUrgent: true,  price: 2500000,  notes: "Urgencia 24hs. Detección y reparación de fuga. Habilitación incluida.", estimatedDuration: 90,  createdAt: now },

    // Cerrajero
    { id: "svc_cerr_001", providerId: "pro_cerr_001", catalogId: "CER-001", category: "Cerrajería", subCategory: "Apertura",        modalities: ["PRESENCIAL"], allowsUrgent: true,  price: 1800000,  notes: "Apertura sin daños en puerta. Sin cargo adicional por nocturnidad.", estimatedDuration: 30,  createdAt: now },
    { id: "svc_cerr_002", providerId: "pro_cerr_001", catalogId: "CER-002", category: "Cerrajería", subCategory: "Bombines",        modalities: ["PRESENCIAL"], allowsUrgent: false, price: 2500000,  notes: "Cambio de bombín con 3 llaves. Marcas seguras disponibles.", estimatedDuration: 45,  createdAt: now },
    { id: "svc_cerr_003", providerId: "pro_cerr_001", catalogId: "CER-003", category: "Cerrajería", subCategory: "Cajas fuertes",   modalities: ["PRESENCIAL"], allowsUrgent: true,  price: 3500000,  notes: "Apertura y reparación de cajas fuertes de todas las marcas.", estimatedDuration: 90,  createdAt: now },

    // Pintor
    { id: "svc_pin_001", providerId: "pro_pin_001", catalogId: "PIN-001", category: "Pintura", subCategory: "Interior",   modalities: ["PRESENCIAL"], allowsUrgent: false, price: 1200000,  notes: "Precio por ambiente. Incluye mano de obra, sellador y pintura látex primera calidad.", estimatedDuration: 480, createdAt: now },
    { id: "svc_pin_002", providerId: "pro_pin_001", catalogId: "PIN-002", category: "Pintura", subCategory: "Exterior",   modalities: ["PRESENCIAL"], allowsUrgent: false, price: 1800000,  notes: "Frente de casa o local. Incluye andamio y pintura extemperie.", estimatedDuration: 600, createdAt: now },

    // Carpintero
    { id: "svc_carp_001", providerId: "pro_carp_001", catalogId: "CAR-001", category: "Carpintería", subCategory: "Pisos",    modalities: ["PRESENCIAL"], allowsUrgent: false, price: 3000000,  notes: "Reparación y lijado de piso de madera. Precio por m². Incluye barniz.", estimatedDuration: 480, createdAt: now },
    { id: "svc_carp_002", providerId: "pro_carp_001", catalogId: "CAR-002", category: "Carpintería", subCategory: "Puertas",  modalities: ["PRESENCIAL"], allowsUrgent: false, price: 2200000,  notes: "Reparación de puerta trabada, ajuste de bisagras y cierre. Incluye materiales.", estimatedDuration: 120, createdAt: now },
  ];

  writeJson("provider_services", newServices);
  console.log("[SEED] Demo data seeded: 6 providers, 15 services ✓");
};

export const seedAll = () => {
  upsertCatalog();
  seedTerms();
  seedRequestsStore();
  seedContractTemplates();
  seedInsuranceProducts();
  seedSubscriptionPlans();
  seedCmsSections();
  seedCollaboratorStores();
};

// Pre-computed bcrypt hash for "Master123!" (rounds=12) — usado solo en seed inicial.
// Cambialo inmediatamente después del primer despliegue desde el panel de admin.
const ADMIN_SEED_HASH = "$2b$12$avgPS2rJvyBUdEJJtyGu8eroxBnVlBp1UtUzc.wIRlY9fMbmM1RyS";

export const seedInitialUser = () => {
  const users = ensureJsonArray<any>("users");
  if (users.length === 0) {
    const admin = {
      id: generateId("usr_"),
      email: "admin@oficiosya.com",
      name: "OficiosYa Admin",
      role: "ADMIN",
      passwordHash: ADMIN_SEED_HASH,
      createdAt: Date.now(),
    };
    users.push(admin);
    writeJson("users", users);
  }
};
