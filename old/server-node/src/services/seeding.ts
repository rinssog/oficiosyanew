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
    rubro: "Niñera",
    subrubro: "Turnos",
    nombre: "Servicio de niñera 4 horas",
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

export const seedInitialUser = () => {
  const users = ensureJsonArray<any>("users");
  if (users.length === 0) {
    const admin = {
      id: generateId("usr_"),
      email: "admin@oficiosya.com",
      name: "OficiosYa Admin",
      role: "ADMIN",
      passwordHash: "",
      createdAt: Date.now(),
    };
    users.push(admin);
    writeJson("users", users);
  }
};
