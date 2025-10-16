import { DayCode, ProviderDocument, ServiceModality, CollaboratorDocument } from "../types.js";

export const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";

export const DAY_LABELS: DayCode[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const CABA_BARRIOS = [
  "Almagro",
  "Belgrano",
  "Caballito",
  "Colegiales",
  "Nunez",
  "Palermo",
  "Recoleta",
  "Saavedra",
  "Villa Devoto",
  "Villa Urquiza",
  "Boedo",
  "Chacarita",
  "Flores",
  "Villa Crespo",
  "San Telmo",
];

export const DEFAULT_DOCUMENTS: Array<Pick<ProviderDocument, "type" | "label" | "required">> = [
  { type: "dni_front", label: "DNI (frente)", required: true },
  { type: "dni_back", label: "DNI (dorso)", required: true },
  { type: "cap", label: "Certificado de antecedentes penales", required: true },
  { type: "matricula", label: "Matricula habilitante (si corresponde)", required: false },
  { type: "afip", label: "Constancia AFIP / CUIT", required: true },
];

export const COLLABORATOR_DEFAULT_DOCUMENTS: Array<Pick<CollaboratorDocument, "type" | "label" | "required">> = DEFAULT_DOCUMENTS.map((doc) => ({ ...doc }));

export const COLLABORATOR_ROLES = [
  "FIELD_SPECIALIST",
  "ADMIN_SUPPORT",
  "APPRENTICE",
];

export const COLLABORATOR_PERMISSION_SET = [
  "requests:read",
  "requests:update",
  "quotes:manage",
  "schedule:manage",
  "evidence:upload",
  "chat:access",
  "payments:view",
];

export const AVAILABLE_REGIONS = [
  "CABA",
  "GBA Norte",
  "GBA Sur",
  "Cordoba",
  "Rosario",
];

export const SERVICE_MODALITIES: ServiceModality[] = ["PRESENCIAL", "VIRTUAL", "MOVIL"];

export const SERVICE_CATEGORIES = [
  {
    id: "HOGAR_MANTENIMIENTO",
    label: "Hogar / Mantenimiento",
    subcategorias: [
      "Plomeria",
      "Electricidad",
      "Pintura",
      "Cerrajeria",
      "Gas",
      "Carpinteria",
      "Vidrieria",
      "Albanileria",
      "Fumigacion",
      "Limpieza",
    ],
  },
  {
    id: "MOVILIDAD_AUXILIO",
    label: "Movilidad / Auxilio",
    subcategorias: [
      "Cadeteria",
      "Fletes y Mudanzas",
      "Remolques",
      "Gomeria movil",
      "Mecanica movil",
      "Chofer privado",
    ],
  },
  {
    id: "EDUCACION_CAPACITACION",
    label: "Educacion / Capacitacion",
    subcategorias: ["Idiomas", "Musica", "Clases particulares", "Cursos"],
  },
  {
    id: "PROFESIONALES_COLEGIADOS",
    label: "Profesionales colegiados",
    subcategorias: ["Abogacia", "Contabilidad", "Psicologia", "Arquitectura", "Traductorado", "Medicina"],
  },
  {
    id: "BIENESTAR_ESTETICA",
    label: "Bienestar / Estetica",
    subcategorias: ["Peluqueria", "Manicuria", "Masajes", "Personal trainer", "Nutricion"],
  },
  {
    id: "MASCOTAS",
    label: "Mascotas",
    subcategorias: ["Veterinaria", "Paseo", "Peluqueria", "Adiestramiento"],
  },
  {
    id: "NINOS_FAMILIA",
    label: "Ninos / Familia",
    subcategorias: ["Nineras", "Cuidadores", "Animaciones"],
  },
  {
    id: "TECNOLOGIA_SOPORTE",
    label: "Tecnologia / Soporte",
    subcategorias: ["Soporte informatico", "Redes", "Desarrollo", "Diseno"],
  },
  {
    id: "EVENTOS",
    label: "Eventos",
    subcategorias: ["Mozo", "Bartender", "DJ", "Iluminacion", "Catering", "Sonido"],
  },
  {
    id: "SERVICIOS_ESPECIALES",
    label: "Servicios especializados",
    subcategorias: ["Limpieza de tanques", "Lavado de tapizados", "Warehouse", "Seguros"],
  },
];

export const SERVICE_SUBFILTERS = [
  { id: "PRESENCIAL", label: "Presencial" },
  { id: "VIRTUAL", label: "Virtual" },
  { id: "MOVIL", label: "Movil" },
  { id: "URGENCIA", label: "Urgencias 24hs" },
];

export const SERVICE_SYNONYMS: Record<string, string[]> = {
  enchufe: ["toma", "tomacorriente", "toma corriente"],
  canilla: ["grifo", "griferia", "cuerito"],
  cerrajero: ["cerradura", "cerrajeria"],
  gasista: ["gas", "perdida de gas"],
  plomero: ["plomeria", "cañeria", "banio"],
  pintura: ["pintor", "pintura interior", "pintura exterior"],
  electricista: ["electricidad", "tablero", "cableado"],
  fumigacion: ["plagas", "insectos"],
  remolque: ["grua", "auxilio", "traslado vehiculo"],
  cadeteria: ["mensajeria", "delivery", "envios"],
  flete: ["mudanza", "traslado"],
  gomeria: ["cambio de cubierta", "auxilio vehicular"],
  mecanico: ["mecanica", "motor", "diagnostico auto"],
  veterinario: ["mascota", "perro", "gato"],
  paseador: ["dogwalker", "paseo perro"],
  profesor: ["docente", "clases", "capacitacion"],
  abogado: ["estudio juridico", "consulta legal", "uma"],
  contador: ["contable", "balances"],
  psicologo: ["terapia", "salud mental"],
  arquitecto: ["planos", "obra", "proyecto"],
  electricista_urgencia: ["corte luz", "salta disyuntor", "tablero quemado"],
  gas_urgencia: ["perdida gas", "olor gas"],
  plomeria_urgencia: ["fuga agua", "rotura caño"],
};

