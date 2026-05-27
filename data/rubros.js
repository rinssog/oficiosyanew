/**
 * data/rubros.js — Catálogo completo OficiosYa (frontend)
 * 55 rubros, 17 categorías, 250+ servicios
 * Fuente de verdad compartida entre frontend y backend
 */

export const RUBROS_COMPLETOS = [

  /* ──────────────────────────────────────────── CONSTRUCCIÓN */
  { id:"albanileria", nombre:"Albañilería", icon:"🏗️", color:"#78716C", categoria:"Construcción", servicios:[
    {id:"alb-1",nombre:"Reparación de paredes y revoques",descripcion:"Grietas, humedad y revoques caídos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"alb-2",nombre:"Construcción de tabiques",descripcion:"Ladrillos comunes y ladrillos cerámicos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"alb-3",nombre:"Impermeabilización de terrazas",descripcion:"Membrana y pintura hidrófuga",urgenciaDisponible:false,requiereMatricula:false},
    {id:"alb-4",nombre:"Contrapiso y nivelación",descripcion:"Hormigón y autonivelante",urgenciaDisponible:false,requiereMatricula:false},
    {id:"alb-5",nombre:"Colocación de cerámicos y porcelanato",descripcion:"Pisos y paredes interiores y exteriores",urgenciaDisponible:false,requiereMatricula:false},
    {id:"alb-6",nombre:"Ampliación y construcción de ambientes",descripcion:"Habitaciones, cocheras y galpones",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"pintura", nombre:"Pintura", icon:"🖌️", color:"#7C3AED", categoria:"Construcción", servicios:[
    {id:"pin-1",nombre:"Pintura interior",descripcion:"Paredes y cielorrasos látex y acrílico",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pin-2",nombre:"Pintura exterior y frentes",descripcion:"Fachadas con preparación de superficie",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pin-3",nombre:"Pintura de rejas y metales",descripcion:"Antióxido y esmalte convertidor",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pin-4",nombre:"Pintura decorativa",descripcion:"Veteados, estuco y técnicas especiales",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pin-5",nombre:"Laqueado de muebles",descripcion:"Laca en madera, MDF y melamina",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pin-6",nombre:"Microcemento",descripcion:"Pisos y paredes con microcemento",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"carpinteria", nombre:"Carpintería", icon:"🪚", color:"#92400E", categoria:"Construcción", servicios:[
    {id:"car-1",nombre:"Reparación de puertas y ventanas",descripcion:"Bisagras, cerraduras y marcos",urgenciaDisponible:true,requiereMatricula:false},
    {id:"car-2",nombre:"Muebles a medida",descripcion:"Diseño y fabricación en madera maciza y melamina",urgenciaDisponible:false,requiereMatricula:false},
    {id:"car-3",nombre:"Colocación de pisos de madera",descripcion:"Parquet, machimbre y pisos flotantes",urgenciaDisponible:false,requiereMatricula:false},
    {id:"car-4",nombre:"Placards y vestidores",descripcion:"Diseño y montaje a medida",urgenciaDisponible:false,requiereMatricula:false},
    {id:"car-5",nombre:"Pérgolas y decks",descripcion:"Estructuras de madera exterior",urgenciaDisponible:false,requiereMatricula:false},
    {id:"car-6",nombre:"Escaleras de madera",descripcion:"Diseño y construcción",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"durlock", nombre:"Durlock y Construcción Seca", icon:"🧱", color:"#A16207", categoria:"Construcción", servicios:[
    {id:"dur-1",nombre:"Tabiques de durlock",descripcion:"Divisorias de ambiente en seco",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dur-2",nombre:"Cielorrasos de durlock",descripcion:"Liso, suspendido e inclinado",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dur-3",nombre:"Revestimientos interiores",descripcion:"Paredes en seco",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dur-4",nombre:"Drywall y sistemas Steel Frame",descripcion:"Construcción en acero liviano",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dur-5",nombre:"Aislamiento acústico y térmico",descripcion:"Lana de vidrio y mineral",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"herreria", nombre:"Herrería y Metalúrgica", icon:"⚙️", color:"#374151", categoria:"Construcción", servicios:[
    {id:"her-1",nombre:"Rejas y portones",descripcion:"Fabricación e instalación de hierro y aluminio",urgenciaDisponible:false,requiereMatricula:false},
    {id:"her-2",nombre:"Escaleras y pasamanos",descripcion:"Hierro y acero inoxidable",urgenciaDisponible:false,requiereMatricula:false},
    {id:"her-3",nombre:"Soldadura",descripcion:"MIG/TIG para reparaciones estructurales",urgenciaDisponible:false,requiereMatricula:false},
    {id:"her-4",nombre:"Portones automáticos",descripcion:"Instalación y reparación de motores",urgenciaDisponible:true,requiereMatricula:false},
    {id:"her-5",nombre:"Estructuras metálicas",descripcion:"Galpones, cobertizos y tinglados",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"techista", nombre:"Techista", icon:"🏠", color:"#B45309", categoria:"Construcción", servicios:[
    {id:"tec-h1",nombre:"Reparación de tejas y chapas",descripcion:"Goteras y reemplazo de piezas",urgenciaDisponible:true,requiereMatricula:false},
    {id:"tec-h2",nombre:"Colocación de chapas",descripcion:"Zinc, galvanizada y chapa perfil",urgenciaDisponible:false,requiereMatricula:false},
    {id:"tec-h3",nombre:"Cielorrasos",descripcion:"Durlock, yeso y PVC",urgenciaDisponible:false,requiereMatricula:false},
    {id:"tec-h4",nombre:"Impermeabilización de techos",descripcion:"Membrana asfáltica y poliuretano",urgenciaDisponible:false,requiereMatricula:false},
    {id:"tec-h5",nombre:"Techos de policarbonato",descripcion:"Cobertizos y aleros",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"vidrieria", nombre:"Vidriería y Aberturas", icon:"🔲", color:"#0891B2", categoria:"Construcción", servicios:[
    {id:"vid-1",nombre:"Colocación de vidrios",descripcion:"Ventanas, puertas y fachadas",urgenciaDisponible:true,requiereMatricula:false},
    {id:"vid-2",nombre:"DVH doble vidriado",descripcion:"Aislación térmica y acústica",urgenciaDisponible:false,requiereMatricula:false},
    {id:"vid-3",nombre:"Mamparas de baño",descripcion:"Box de ducha y mamparas templadas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"vid-4",nombre:"Espejos",descripcion:"Colocación y biselado",urgenciaDisponible:false,requiereMatricula:false},
    {id:"vid-5",nombre:"Aberturas de aluminio",descripcion:"Ventanas, balcones y frentes de vidrio",urgenciaDisponible:false,requiereMatricula:false},
    {id:"vid-6",nombre:"Frente de vidrio / local",descripcion:"Puertas y vitrinas comerciales",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"marmoleria", nombre:"Marmolería y Granito", icon:"🪨", color:"#6B7280", categoria:"Construcción", servicios:[
    {id:"mar-1",nombre:"Mesadas de cocina",descripcion:"Mármol, granito y silestone",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mar-2",nombre:"Mesadas de baño",descripcion:"Diseño y colocación",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mar-3",nombre:"Pisos de mármol",descripcion:"Colocación y lustrado",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mar-4",nombre:"Lustrado y pulido",descripcion:"Restauración de mármol y granito",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mar-5",nombre:"Zócalos y revestimientos",descripcion:"En piedras naturales",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"cortinas", nombre:"Cortinas, Persianas y Roller", icon:"🪟", color:"#EC4899", categoria:"Construcción", servicios:[
    {id:"cor-1",nombre:"Cortinas roller",descripcion:"Black out, screen y traslúcidas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cor-2",nombre:"Persianas de aluminio",descripcion:"Interior y exterior",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cor-3",nombre:"Cortinados y cenefas",descripcion:"Instalación con rieles y accesorios",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cor-4",nombre:"Toldos y parasoles",descripcion:"Retráctiles y fijos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cor-5",nombre:"Venezianas y estores",descripcion:"Madera, aluminio y PVC",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"tapiceria", nombre:"Tapicería y Restauración", icon:"🛋️", color:"#BE185D", categoria:"Construcción", servicios:[
    {id:"tap-1",nombre:"Tapizado de sillones y sofás",descripcion:"Telas, cuero y ecocuero",urgenciaDisponible:false,requiereMatricula:false},
    {id:"tap-2",nombre:"Restauración de muebles",descripcion:"Madera, lustrado y pintura",urgenciaDisponible:false,requiereMatricula:false},
    {id:"tap-3",nombre:"Tapizado de cabeceras",descripcion:"Camas y sommiers",urgenciaDisponible:false,requiereMatricula:false},
    {id:"tap-4",nombre:"Reparación de colchones",descripcion:"Limpieza y higienización",urgenciaDisponible:false,requiereMatricula:false},
    {id:"tap-5",nombre:"Tapizado de autos",descripcion:"Interiores y techos",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"demolicion", nombre:"Demolición y Escombros", icon:"⛏️", color:"#57534E", categoria:"Construcción", servicios:[
    {id:"dem-1",nombre:"Demolición parcial",descripcion:"Tabiques, pisos y revestimientos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dem-2",nombre:"Retiro de escombros",descripcion:"Con contenedor o volquete",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dem-3",nombre:"Rotura de pisos y paredes",descripcion:"Preparación para reforma",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dem-4",nombre:"Limpieza de terreno",descripcion:"Baldíos y preparación de obra",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── INSTALACIONES */
  { id:"electricidad", nombre:"Electricista", icon:"⚡", color:"#D97706", categoria:"Instalaciones", servicios:[
    {id:"ele-1",nombre:"Instalación eléctrica",descripcion:"Cableado, tomacorrientes y llaves",urgenciaDisponible:true,requiereMatricula:true},
    {id:"ele-2",nombre:"Tablero eléctrico",descripcion:"Llaves térmicas y diferencial",urgenciaDisponible:true,requiereMatricula:true},
    {id:"ele-3",nombre:"Luces LED y luminarias",descripcion:"Downlights, tiras LED y dicroicas",urgenciaDisponible:false,requiereMatricula:true},
    {id:"ele-4",nombre:"Domótica y automatización",descripcion:"Llaves inteligentes y App",urgenciaDisponible:false,requiereMatricula:true},
    {id:"ele-5",nombre:"Puesta a tierra",descripcion:"Jabalinas y sistema de tierra",urgenciaDisponible:false,requiereMatricula:true},
    {id:"ele-6",nombre:"Generadores y UPS",descripcion:"Sistemas de respaldo eléctrico",urgenciaDisponible:true,requiereMatricula:true},
    {id:"ele-7",nombre:"Instalación trifásica",descripcion:"Para talleres e industrias",urgenciaDisponible:false,requiereMatricula:true},
  ]},

  { id:"plomeria", nombre:"Plomería", icon:"🔧", color:"#0284C7", categoria:"Instalaciones", servicios:[
    {id:"plo-1",nombre:"Destapaciones",descripcion:"Cañerías, desagotes y baños",urgenciaDisponible:true,requiereMatricula:false},
    {id:"plo-2",nombre:"Reparación de pérdidas",descripcion:"Detección y reparación de pérdidas ocultas",urgenciaDisponible:true,requiereMatricula:false},
    {id:"plo-3",nombre:"Instalación sanitaria",descripcion:"Inodoros, lavabos y duchas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"plo-4",nombre:"Termotanques y calefones",descripcion:"Instalación y reparación",urgenciaDisponible:true,requiereMatricula:false},
    {id:"plo-5",nombre:"Sistemas de riego",descripcion:"Riego automático por goteo y aspersión",urgenciaDisponible:false,requiereMatricula:false},
    {id:"plo-6",nombre:"Tanque y bomba de agua",descripcion:"Colocación y reparación",urgenciaDisponible:true,requiereMatricula:false},
    {id:"plo-7",nombre:"Cámara séptica y pozo ciego",descripcion:"Construcción y vaciado",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"gas", nombre:"Gasista", icon:"🔥", color:"#DC2626", categoria:"Instalaciones", servicios:[
    {id:"gas-1",nombre:"Instalación de gas natural",descripcion:"Habilitación y extensión de redes",urgenciaDisponible:true,requiereMatricula:true},
    {id:"gas-2",nombre:"Artefactos a gas",descripcion:"Cocinas, calefones, salamandras y estufas",urgenciaDisponible:false,requiereMatricula:true},
    {id:"gas-3",nombre:"Detección de fugas",descripcion:"Emergencia por olor a gas",urgenciaDisponible:true,requiereMatricula:true},
    {id:"gas-4",nombre:"Certificado GAS para alquiler",descripcion:"Habilitación y certificado obligatorio",urgenciaDisponible:false,requiereMatricula:true},
    {id:"gas-5",nombre:"Caldera y radiadores",descripcion:"Calefacción central a gas",urgenciaDisponible:false,requiereMatricula:true},
    {id:"gas-6",nombre:"Gas envasado (GLP)",descripcion:"Instalación de garrafas y tuberías",urgenciaDisponible:false,requiereMatricula:true},
  ]},

  { id:"climatizacion", nombre:"Climatización", icon:"❄️", color:"#0891B2", categoria:"Instalaciones", servicios:[
    {id:"cli-1",nombre:"Instalación de AA",descripcion:"Split, inverter y multihead",urgenciaDisponible:false,requiereMatricula:true},
    {id:"cli-2",nombre:"Mantenimiento de AA",descripcion:"Limpieza de filtros y carga de gas",urgenciaDisponible:false,requiereMatricula:true},
    {id:"cli-3",nombre:"Calefacción central",descripcion:"Radiadores, piso radiante y fan coil",urgenciaDisponible:false,requiereMatricula:true},
    {id:"cli-4",nombre:"Estufas y caloventores",descripcion:"Eléctricos y a gas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cli-5",nombre:"Campanas y ventilación",descripcion:"Extractores industriales y domésticos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cli-6",nombre:"Cortinas de aire",descripcion:"Instalación en locales comerciales",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"energia-solar", nombre:"Energía Solar", icon:"☀️", color:"#EAB308", categoria:"Instalaciones", servicios:[
    {id:"sol-1",nombre:"Instalación de paneles fotovoltaicos",descripcion:"Sistema autónomo y On-Grid",urgenciaDisponible:false,requiereMatricula:true},
    {id:"sol-2",nombre:"Calefón solar",descripcion:"Termosifón y forzado",urgenciaDisponible:false,requiereMatricula:true},
    {id:"sol-3",nombre:"Mantenimiento de sistemas solares",descripcion:"Limpieza y verificación",urgenciaDisponible:false,requiereMatricula:false},
    {id:"sol-4",nombre:"Baterías de almacenamiento",descripcion:"Litio y AGM",urgenciaDisponible:false,requiereMatricula:true},
    {id:"sol-5",nombre:"Asesoría solar",descripcion:"Dimensionamiento y presupuesto",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"antenas", nombre:"Antenas y Redes", icon:"📡", color:"#0369A1", categoria:"Instalaciones", servicios:[
    {id:"ant-1",nombre:"Instalación de antena digital TDA",descripcion:"TV digital abierta gratuita",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ant-2",nombre:"Cableado estructurado",descripcion:"Red de datos categoría 6",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ant-3",nombre:"Instalación de fibra óptica",descripcion:"Para empresas y edificios",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ant-4",nombre:"Portero eléctrico",descripcion:"Instalación y reparación",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ant-5",nombre:"WiFi Mesh y repetidores",descripcion:"Cobertura total del hogar",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── SEGURIDAD */
  { id:"cerrajeria", nombre:"Cerrajería", icon:"🔑", color:"#4338CA", categoria:"Seguridad", servicios:[
    {id:"cer-1",nombre:"Apertura de emergencia",descripcion:"Sin daño a la puerta",urgenciaDisponible:true,requiereMatricula:false},
    {id:"cer-2",nombre:"Cambio de cerradura",descripcion:"Cerraduras de seguridad Mul-T-Lock y Yale",urgenciaDisponible:true,requiereMatricula:false},
    {id:"cer-3",nombre:"Duplicado de llaves",descripcion:"Simples, chip y proximidad",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cer-4",nombre:"Cerraduras electrónicas",descripcion:"Smart locks con huella y PIN",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cer-5",nombre:"Cajas fuertes",descripcion:"Apertura y anclaje a pared",urgenciaDisponible:true,requiereMatricula:false},
    {id:"cer-6",nombre:"Cerrajería de autos",descripcion:"Apertura y programación de llaves",urgenciaDisponible:true,requiereMatricula:false},
  ]},

  { id:"alarmas", nombre:"Alarmas y CCTV", icon:"📷", color:"#1D4ED8", categoria:"Seguridad", servicios:[
    {id:"ala-1",nombre:"Cámaras de seguridad",descripcion:"IP, analógicas y NVR/DVR 4K",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ala-2",nombre:"Alarmas perimetrales",descripcion:"Detectores de movimiento y apertura",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ala-3",nombre:"Control de acceso",descripcion:"RFID, biometría y reconocimiento facial",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ala-4",nombre:"Porteros y videoporteros",descripcion:"Instalación y configuración",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ala-5",nombre:"Monitoreo y central de alarmas",descripcion:"Conexión a empresa de monitoreo",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── JARDÍN */
  { id:"jardineria", nombre:"Jardinería", icon:"🌿", color:"#16A34A", categoria:"Jardín", servicios:[
    {id:"jar-1",nombre:"Diseño de jardín",descripcion:"Proyecto paisajístico integral",urgenciaDisponible:false,requiereMatricula:false},
    {id:"jar-2",nombre:"Mantenimiento mensual",descripcion:"Corte, podas y limpieza general",urgenciaDisponible:false,requiereMatricula:false},
    {id:"jar-3",nombre:"Instalación de césped",descripcion:"Césped natural y sintético",urgenciaDisponible:false,requiereMatricula:false},
    {id:"jar-4",nombre:"Riego automático",descripcion:"Goteo y aspersión programable",urgenciaDisponible:false,requiereMatricula:false},
    {id:"jar-5",nombre:"Huerta orgánica",descripcion:"Diseño e instalación de huertas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"jar-6",nombre:"Poda de árboles",descripcion:"Poda en altura y tala",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"paisajista", nombre:"Paisajista", icon:"🌳", color:"#15803D", categoria:"Jardín", servicios:[
    {id:"pai-1",nombre:"Diseño paisajístico integral",descripcion:"Proyecto completo con planos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pai-2",nombre:"Jardines verticales",descripcion:"Muros verdes interiores y exteriores",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pai-3",nombre:"Diseño de terrazas y balcones",descripcion:"Deck, canteros y iluminación",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pai-4",nombre:"Asesoría en plantas",descripcion:"Selección y cuidado de especies",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pai-5",nombre:"Jardines acuáticos",descripcion:"Estanques y fuentes decorativas",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"piletero", nombre:"Piletero", icon:"🏊", color:"#0284C7", categoria:"Jardín", servicios:[
    {id:"pil-1",nombre:"Mantenimiento semanal",descripcion:"Química, limpieza y succión de fondo",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pil-2",nombre:"Apertura de temporada",descripcion:"Preparación para el verano",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pil-3",nombre:"Cierre de temporada",descripcion:"Conservación para el invierno",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pil-4",nombre:"Reparación de piletas",descripcion:"Impermeabilización y fisuras",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pil-5",nombre:"Instalación de piletas",descripcion:"Fibra y acero prefabricadas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pil-6",nombre:"Jacuzzi y spa",descripcion:"Instalación y mantenimiento",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── TECNOLOGÍA */
  { id:"tecnologia", nombre:"Técnico Informático", icon:"💻", color:"#6366F1", categoria:"Tecnología", servicios:[
    {id:"ti-1",nombre:"Reparación de PCs y notebooks",descripcion:"Hardware, formateo y recuperación de datos",urgenciaDisponible:true,requiereMatricula:false},
    {id:"ti-2",nombre:"Redes Wi-Fi y LAN",descripcion:"Instalación y configuración domiciliaria",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ti-3",nombre:"Instalación de software",descripcion:"Windows, Office y antivirus",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ti-4",nombre:"Soporte remoto",descripcion:"Asistencia online sin visita",urgenciaDisponible:true,requiereMatricula:false},
    {id:"ti-5",nombre:"Smart TV y dispositivos",descripcion:"Configuración de smart TVs y Chromecast",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ti-6",nombre:"Impresoras y periféricos",descripcion:"Instalación y reparación",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ti-7",nombre:"Seguridad informática",descripcion:"Virus, ransomware y protección",urgenciaDisponible:true,requiereMatricula:false},
  ]},

  { id:"electrodomesticos", nombre:"Técnico Electrodomésticos", icon:"🔌", color:"#0369A1", categoria:"Tecnología", servicios:[
    {id:"ed-1",nombre:"Heladeras y freezers",descripcion:"Reparación y carga de gas refrigerante",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ed-2",nombre:"Lavarropas y secarropas",descripcion:"Automáticos de carga frontal y superior",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ed-3",nombre:"Lavavajillas",descripcion:"Reparación e instalación",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ed-4",nombre:"Hornos y cocinas eléctricas",descripcion:"Resistencias y controles",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ed-5",nombre:"Microondas y hornos eléctricos",descripcion:"Reparación de magnetrón",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ed-6",nombre:"Pequeños electrodomésticos",descripcion:"Planchas, aspiradoras y batidoras",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── LIMPIEZA */
  { id:"limpieza", nombre:"Limpieza del Hogar", icon:"🧹", color:"#0891B2", categoria:"Limpieza", servicios:[
    {id:"lim-1",nombre:"Limpieza general",descripcion:"Mantenimiento semanal o mensual",urgenciaDisponible:false,requiereMatricula:false},
    {id:"lim-2",nombre:"Limpieza profunda",descripcion:"Con desengrasado y sanitización",urgenciaDisponible:false,requiereMatricula:false},
    {id:"lim-3",nombre:"Limpieza post-obra",descripcion:"Con retiro de polvo y escombros finos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"lim-4",nombre:"Limpieza de oficinas y comercios",descripcion:"Diaria, semanal o mensual",urgenciaDisponible:false,requiereMatricula:false},
    {id:"lim-5",nombre:"Limpieza fin de mudanza",descripcion:"Antes o después del traslado",urgenciaDisponible:false,requiereMatricula:false},
    {id:"lim-6",nombre:"Lavado de tapizados y alfombras",descripcion:"Seco y húmedo a domicilio",urgenciaDisponible:false,requiereMatricula:false},
    {id:"lim-7",nombre:"Limpieza de vidrios en altura",descripcion:"Con equipo de trabajos en altura",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"fumigacion", nombre:"Fumigación y Control", icon:"🐛", color:"#65A30D", categoria:"Limpieza", servicios:[
    {id:"fum-1",nombre:"Control de cucarachas y hormigas",descripcion:"Gel, cebo y aspersión",urgenciaDisponible:false,requiereMatricula:true},
    {id:"fum-2",nombre:"Control de roedores",descripcion:"Cebos y trampas mecánicas",urgenciaDisponible:false,requiereMatricula:true},
    {id:"fum-3",nombre:"Desinfección y sanitización",descripcion:"Nebulización ULV",urgenciaDisponible:false,requiereMatricula:true},
    {id:"fum-4",nombre:"Control de termitas",descripcion:"Preventivo y correctivo",urgenciaDisponible:false,requiereMatricula:true},
    {id:"fum-5",nombre:"Control de pulgas y garrapatas",descripcion:"Tratamiento de mascotas y hogar",urgenciaDisponible:false,requiereMatricula:true},
    {id:"fum-6",nombre:"Control de palomas",descripcion:"Disuasores y trampas",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── LOGÍSTICA */
  { id:"mudanzas", nombre:"Mudanzas", icon:"🚛", color:"#D97706", categoria:"Logística", servicios:[
    {id:"mud-1",nombre:"Mudanza de departamento",descripcion:"Con embalaje, carga y traslado",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mud-2",nombre:"Mudanza de casa",descripcion:"Flete, operarios y desarmado",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mud-3",nombre:"Mudanza de oficina",descripcion:"Mobiliario, equipos y archivos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mud-4",nombre:"Transporte de muebles",descripcion:"Flete de uno o dos muebles",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mud-5",nombre:"Guarda muebles",descripcion:"Almacenamiento mensual cubierto",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mud-6",nombre:"Embalaje profesional",descripcion:"Cajas, film y materiales",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"flete", nombre:"Flete y Cadetería", icon:"📦", color:"#B45309", categoria:"Logística", servicios:[
    {id:"fle-1",nombre:"Flete urbano",descripcion:"Paquetes en la ciudad",urgenciaDisponible:true,requiereMatricula:false},
    {id:"fle-2",nombre:"Cadetería en moto",descripcion:"Urgentes CABA y GBA",urgenciaDisponible:true,requiereMatricula:false},
    {id:"fle-3",nombre:"Distribución de mercadería",descripcion:"Reparto a múltiples puntos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"fle-4",nombre:"Materiales de obra",descripcion:"Arena, piedras y materiales pesados",urgenciaDisponible:false,requiereMatricula:false},
    {id:"fle-5",nombre:"Transporte de mascotas",descripcion:"Con jaula y cuidado especializado",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── AUTOMOTOR */
  { id:"mecanica", nombre:"Mecánico a Domicilio", icon:"🚗", color:"#374151", categoria:"Automotor", servicios:[
    {id:"mec-1",nombre:"Diagnóstico electrónico",descripcion:"Escaneo OBD y reset de testigos",urgenciaDisponible:true,requiereMatricula:false},
    {id:"mec-2",nombre:"Cambio de batería",descripcion:"A domicilio con garantía",urgenciaDisponible:true,requiereMatricula:false},
    {id:"mec-3",nombre:"Cambio de aceite y filtros",descripcion:"Service básico a domicilio",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mec-4",nombre:"Frenos y neumáticos",descripcion:"Pastillas, discos y cubiertas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mec-5",nombre:"Auxilio en ruta",descripcion:"Arranque, cambio de rueda y combustible",urgenciaDisponible:true,requiereMatricula:false},
    {id:"mec-6",nombre:"Revisión previa VTV",descripcion:"Pre-inspección domiciliaria",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"chaperia", nombre:"Chapa y Pintura Automotriz", icon:"🚘", color:"#1E3A5F", categoria:"Automotor", servicios:[
    {id:"cha-1",nombre:"Chapa y pintura completa",descripcion:"Reparación de carrocería",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cha-2",nombre:"Abolladuras y rayones",descripcion:"PDR y retoque de pintura",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cha-3",nombre:"Detailing profesional",descripcion:"Pulido, encerado y ceramic coating",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cha-4",nombre:"Lavado y encerado",descripcion:"A domicilio sin agua a presión",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cha-5",nombre:"Tapizado de autos",descripcion:"Cuero y tela",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── SALUD */
  { id:"enfermeria", nombre:"Enfermería a Domicilio", icon:"🩺", color:"#0891B2", categoria:"Salud", servicios:[
    {id:"enf-1",nombre:"Inyectables y sueros",descripcion:"Medicación a domicilio",urgenciaDisponible:true,requiereMatricula:true},
    {id:"enf-2",nombre:"Cuidado de adultos mayores",descripcion:"Acompañamiento diurno y nocturno",urgenciaDisponible:false,requiereMatricula:true},
    {id:"enf-3",nombre:"Curación de heridas",descripcion:"Heridas quirúrgicas y crónicas",urgenciaDisponible:false,requiereMatricula:true},
    {id:"enf-4",nombre:"Kinesiología y rehabilitación",descripcion:"Física y respiratoria",urgenciaDisponible:false,requiereMatricula:true},
    {id:"enf-5",nombre:"Control de presión y glucemia",descripcion:"Monitoreo preventivo",urgenciaDisponible:false,requiereMatricula:true},
  ]},

  { id:"veterinaria", nombre:"Veterinaria a Domicilio", icon:"🐾", color:"#65A30D", categoria:"Salud", servicios:[
    {id:"vet-1",nombre:"Consulta veterinaria",descripcion:"Revisión general en tu hogar",urgenciaDisponible:true,requiereMatricula:true},
    {id:"vet-2",nombre:"Vacunación y desparasitación",descripcion:"Plan sanitario anual",urgenciaDisponible:false,requiereMatricula:true},
    {id:"vet-3",nombre:"Peluquería canina y felina",descripcion:"Baño, corte y estética",urgenciaDisponible:false,requiereMatricula:false},
    {id:"vet-4",nombre:"Paseador de perros",descripcion:"Individual, grupal y diario",urgenciaDisponible:false,requiereMatricula:false},
    {id:"vet-5",nombre:"Pet sitter",descripcion:"Cuidado en tu casa o en la del cuidador",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── BIENESTAR */
  { id:"personal-trainer", nombre:"Personal Trainer", icon:"🏋️", color:"#EA580C", categoria:"Bienestar", servicios:[
    {id:"pt-1",nombre:"Entrenamiento funcional",descripcion:"A domicilio o al aire libre",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pt-2",nombre:"Plan de nutrición y ejercicio",descripcion:"Personalizado según objetivos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pt-3",nombre:"Yoga y pilates",descripcion:"Individual y en pareja",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pt-4",nombre:"Rehabilitación deportiva",descripcion:"Post-lesión y recovery",urgenciaDisponible:false,requiereMatricula:false},
    {id:"pt-5",nombre:"Entrenamiento para adultos mayores",descripcion:"Movilidad y equilibrio",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"masajista", nombre:"Masajes a Domicilio", icon:"💆", color:"#7C3AED", categoria:"Bienestar", servicios:[
    {id:"mas-1",nombre:"Masaje relajante",descripcion:"Sueco y aromaterapia",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mas-2",nombre:"Masaje descontracturante",descripcion:"Tejido profundo",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mas-3",nombre:"Masaje prenatal",descripcion:"Para embarazadas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mas-4",nombre:"Reflexología",descripcion:"Puntos de presión",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mas-5",nombre:"Spa a domicilio",descripcion:"Experiencia completa en casa",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"nutricionista", nombre:"Nutricionista", icon:"🥗", color:"#16A34A", categoria:"Bienestar", servicios:[
    {id:"nut-1",nombre:"Plan alimentario personalizado",descripcion:"Presencial o por videollamada",urgenciaDisponible:false,requiereMatricula:true},
    {id:"nut-2",nombre:"Nutrición deportiva",descripcion:"Para rendimiento y recuperación",urgenciaDisponible:false,requiereMatricula:true},
    {id:"nut-3",nombre:"Nutrición clínica",descripcion:"Diabetes, celiaquía y patologías",urgenciaDisponible:false,requiereMatricula:true},
    {id:"nut-4",nombre:"Nutrición infantil",descripcion:"Alimentación complementaria y primera infancia",urgenciaDisponible:false,requiereMatricula:true},
  ]},

  /* ──────────────────────────────────────────── EDUCACIÓN */
  { id:"clases-particulares", nombre:"Clases Particulares", icon:"📚", color:"#0369A1", categoria:"Educación", servicios:[
    {id:"cp-1",nombre:"Matemáticas y física",descripcion:"Primaria, secundaria y CBC",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cp-2",nombre:"Lengua y literatura",descripcion:"Ortografía y redacción",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cp-3",nombre:"Química y biología",descripcion:"Hasta nivel universitario",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cp-4",nombre:"Apoyo escolar integral",descripcion:"Todas las materias primaria",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cp-5",nombre:"Preparación para exámenes",descripcion:"Ingreso, PISA y universitario",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"idiomas", nombre:"Idiomas y Conversación", icon:"🌍", color:"#6366F1", categoria:"Educación", servicios:[
    {id:"idi-1",nombre:"Inglés",descripcion:"Principiante a avanzado",urgenciaDisponible:false,requiereMatricula:false},
    {id:"idi-2",nombre:"Portugués",descripcion:"Conversación y gramática",urgenciaDisponible:false,requiereMatricula:false},
    {id:"idi-3",nombre:"Francés",descripcion:"Del A1 al C1",urgenciaDisponible:false,requiereMatricula:false},
    {id:"idi-4",nombre:"Preparación FCE / IELTS / TOEFL",descripcion:"Certificaciones internacionales",urgenciaDisponible:false,requiereMatricula:false},
    {id:"idi-5",nombre:"Español para extranjeros",descripcion:"ELE presencial y online",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"musica", nombre:"Clases de Música", icon:"🎸", color:"#7C3AED", categoria:"Educación", servicios:[
    {id:"mus-1",nombre:"Guitarra",descripcion:"Acústica, eléctrica y clásica",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mus-2",nombre:"Piano y teclado",descripcion:"Clásico y contemporáneo",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mus-3",nombre:"Canto y técnica vocal",descripcion:"Pop, lírico y folklore",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mus-4",nombre:"Batería y percusión",descripcion:"A domicilio con kit eléctrico",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mus-5",nombre:"Producción musical",descripcion:"DAW, mezcla y masterización",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── EVENTOS */
  { id:"fotografo", nombre:"Fotógrafo / Videógrafo", icon:"📸", color:"#7C3AED", categoria:"Eventos", servicios:[
    {id:"foto-1",nombre:"Fotografía de eventos",descripcion:"Casamientos, 15 años y corporativos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"foto-2",nombre:"Fotografía inmobiliaria",descripcion:"Para portales y alquileres",urgenciaDisponible:false,requiereMatricula:false},
    {id:"foto-3",nombre:"Video corporativo",descripcion:"Institucionales y publicidad",urgenciaDisponible:false,requiereMatricula:false},
    {id:"foto-4",nombre:"Fotografía de producto",descripcion:"E-commerce y catálogos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"foto-5",nombre:"Drone y aéreo",descripcion:"Filmación y fotografía aérea",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"dj", nombre:"DJ y Sonido", icon:"🎧", color:"#6D28D9", categoria:"Eventos", servicios:[
    {id:"dj-1",nombre:"DJ para eventos",descripcion:"Cumpleaños, casamientos y fiestas corporativas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dj-2",nombre:"Alquiler de sonido",descripcion:"PA, subwoofer y microfonía",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dj-3",nombre:"Iluminación para eventos",descripcion:"Luces de escenario y efectos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dj-4",nombre:"Transmisión en vivo",descripcion:"Streaming de eventos",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"catering", nombre:"Catering y Gastronomía", icon:"🍽️", color:"#D97706", categoria:"Eventos", servicios:[
    {id:"cat-1",nombre:"Catering para eventos",descripcion:"Empresarial y social",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cat-2",nombre:"Chef a domicilio",descripcion:"Cenas privadas y degustaciones",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cat-3",nombre:"Servicio de meseros",descripcion:"Por hora para eventos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cat-4",nombre:"Barra de tragos",descripcion:"Bartender y coctelería",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cat-5",nombre:"Tortas y repostería",descripcion:"Personalizadas y eventos",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"animacion", nombre:"Animación Infantil", icon:"🎪", color:"#EC4899", categoria:"Eventos", servicios:[
    {id:"ani-1",nombre:"Animación de cumpleaños",descripcion:"Personajes y shows",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ani-2",nombre:"Payasos y magos",descripcion:"Shows de magia e ilusionismo",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ani-3",nombre:"Shows de títeres",descripcion:"Teatro de marionetas",urgenciaDisponible:false,requiereMatricula:false},
    {id:"ani-4",nombre:"Inflables y juegos",descripcion:"Alquiler y coordinación",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"decoracion-eventos", nombre:"Decoración de Eventos", icon:"🎊", color:"#DB2777", categoria:"Eventos", servicios:[
    {id:"dec-1",nombre:"Ambientación de fiestas",descripcion:"Globos, guirnaldas y centros",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dec-2",nombre:"Decoración de casamientos",descripcion:"Floral y mobiliario",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dec-3",nombre:"Photocall y backdrop",descripcion:"Fondos para fotos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dec-4",nombre:"Alquiler de mobiliario",descripcion:"Sillas, mesas y mantelería",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── MASCOTAS */
  { id:"mascotas", nombre:"Cuidado de Mascotas", icon:"🐶", color:"#F59E0B", categoria:"Mascotas", servicios:[
    {id:"mas-a1",nombre:"Guardería de mascotas",descripcion:"Día o noche en casa del cuidador",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mas-a2",nombre:"Adiestramiento canino",descripcion:"Obediencia básica y avanzada",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mas-a3",nombre:"Paseador profesional",descripcion:"Individual con GPS y fotos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mas-a4",nombre:"Transporte de mascotas",descripcion:"Veterinarias y viajes",urgenciaDisponible:false,requiereMatricula:false},
    {id:"mas-a5",nombre:"Peluquería a domicilio",descripcion:"Baño, corte y desparasitación",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── HOGAR PERSONAL */
  { id:"niñera", nombre:"Niñera y Babysitter", icon:"👶", color:"#EC4899", categoria:"Hogar", servicios:[
    {id:"nin-1",nombre:"Niñera por horas",descripcion:"Cuidado de bebés y niños",urgenciaDisponible:true,requiereMatricula:false},
    {id:"nin-2",nombre:"Niñera fija",descripcion:"Lunes a viernes o días hábiles",urgenciaDisponible:false,requiereMatricula:false},
    {id:"nin-3",nombre:"Cuidado nocturno",descripcion:"Overnight y viajes",urgenciaDisponible:false,requiereMatricula:false},
    {id:"nin-4",nombre:"Acompañante terapéutico infantil",descripcion:"Apoyo en tratamientos",urgenciaDisponible:false,requiereMatricula:true},
  ]},

  { id:"cocinero", nombre:"Cocinero a Domicilio", icon:"👨‍🍳", color:"#B45309", categoria:"Hogar", servicios:[
    {id:"coc-1",nombre:"Viandas semanales",descripcion:"Preparación de comidas para la semana",urgenciaDisponible:false,requiereMatricula:false},
    {id:"coc-2",nombre:"Cena privada",descripcion:"Chef en casa para parejas o grupos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"coc-3",nombre:"Cocina saludable y especial",descripcion:"Sin TACC, vegano y diabético",urgenciaDisponible:false,requiereMatricula:false},
    {id:"coc-4",nombre:"Asado y parrilla",descripcion:"Asador para eventos y reuniones",urgenciaDisponible:false,requiereMatricula:false},
    {id:"coc-5",nombre:"Clases de cocina",descripcion:"Presenciales en tu casa",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"planchado-costura", nombre:"Planchado y Costura", icon:"👗", color:"#DB2777", categoria:"Hogar", servicios:[
    {id:"cos-1",nombre:"Servicio de planchado",descripcion:"Por prenda o por kilo a domicilio",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cos-2",nombre:"Arreglos de ropa",descripcion:"Ruedos, entallados y cierres",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cos-3",nombre:"Confección a medida",descripcion:"Ropa, uniformes y disfraces",urgenciaDisponible:false,requiereMatricula:false},
    {id:"cos-4",nombre:"Bordado y personalización",descripcion:"Bordado en tela y cuero",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── DISEÑO Y ARQUITECTURA */
  { id:"arquitecto", nombre:"Arquitecto y Planificación", icon:"📐", color:"#0F172A", categoria:"Diseño", servicios:[
    {id:"arq-1",nombre:"Planos y permisos de obra",descripcion:"Municipales y profesionales",urgenciaDisponible:false,requiereMatricula:true},
    {id:"arq-2",nombre:"Diseño de reforma integral",descripcion:"Cocina, baño y ambientes",urgenciaDisponible:false,requiereMatricula:true},
    {id:"arq-3",nombre:"Dirección de obra",descripcion:"Supervisión y control de calidad",urgenciaDisponible:false,requiereMatricula:true},
    {id:"arq-4",nombre:"Asesoría técnica",descripcion:"Consulta puntual de arquitectura",urgenciaDisponible:false,requiereMatricula:true},
    {id:"arq-5",nombre:"Renders y visualización 3D",descripcion:"Presentación del proyecto",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"decoracion", nombre:"Decoración de Interiores", icon:"🛋️", color:"#4F46E5", categoria:"Diseño", servicios:[
    {id:"deco-1",nombre:"Asesoría de decoración",descripcion:"Presencial o virtual",urgenciaDisponible:false,requiereMatricula:false},
    {id:"deco-2",nombre:"Diseño de interiores",descripcion:"Proyecto completo con planos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"deco-3",nombre:"Gestión de compras",descripcion:"Muebles, textiles y accesorios",urgenciaDisponible:false,requiereMatricula:false},
    {id:"deco-4",nombre:"Home staging",descripcion:"Para venta o alquiler rápido",urgenciaDisponible:false,requiereMatricula:false},
    {id:"deco-5",nombre:"Organización del hogar",descripcion:"KonMari y orden funcional",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  { id:"diseno-grafico", nombre:"Diseño y Marketing Digital", icon:"🎨", color:"#7C3AED", categoria:"Diseño", servicios:[
    {id:"dig-1",nombre:"Diseño de logo e identidad",descripcion:"Manual de marca completo",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dig-2",nombre:"Redes sociales",descripcion:"Community manager y contenidos",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dig-3",nombre:"Diseño web",descripcion:"Landing pages y tiendas online",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dig-4",nombre:"Fotografía de productos",descripcion:"Para e-commerce y redes",urgenciaDisponible:false,requiereMatricula:false},
    {id:"dig-5",nombre:"Publicidad digital",descripcion:"Google Ads y Meta Ads",urgenciaDisponible:false,requiereMatricula:false},
  ]},

  /* ──────────────────────────────────────────── SERVICIOS PROFESIONALES */
  { id:"contabilidad", nombre:"Contador / Gestor", icon:"📊", color:"#0369A1", categoria:"Servicios profesionales", servicios:[
    {id:"con-1",nombre:"Monotributo y autónomos",descripcion:"Alta, recategorización y baja AFIP",urgenciaDisponible:false,requiereMatricula:true},
    {id:"con-2",nombre:"Liquidación de sueldos",descripcion:"Mensual, aguinaldo y cargas sociales",urgenciaDisponible:false,requiereMatricula:true},
    {id:"con-3",nombre:"Gestoría vehicular",descripcion:"Transferencias y patentamiento",urgenciaDisponible:false,requiereMatricula:false},
    {id:"con-4",nombre:"Habilitaciones comerciales",descripcion:"Municipales y AFIP",urgenciaDisponible:false,requiereMatricula:false},
    {id:"con-5",nombre:"Declaración Jurada AFIP",descripcion:"Persona física y jurídica",urgenciaDisponible:false,requiereMatricula:true},
    {id:"con-6",nombre:"Constitución de SRL/SA",descripcion:"Sociedades comerciales",urgenciaDisponible:false,requiereMatricula:true},
  ]},

  { id:"abogado", nombre:"Asesor Legal", icon:"⚖️", color:"#1E293B", categoria:"Servicios profesionales", servicios:[
    {id:"leg-1",nombre:"Consulta legal",descripcion:"Presencial o videollamada",urgenciaDisponible:false,requiereMatricula:true},
    {id:"leg-2",nombre:"Contratos y acuerdos",descripcion:"Redacción y revisión",urgenciaDisponible:false,requiereMatricula:true},
    {id:"leg-3",nombre:"Derecho laboral",descripcion:"Liquidaciones y despidos",urgenciaDisponible:false,requiereMatricula:true},
    {id:"leg-4",nombre:"Defensa del consumidor",descripcion:"Reclamos y mediación",urgenciaDisponible:false,requiereMatricula:true},
    {id:"leg-5",nombre:"Alquileres y locaciones",descripcion:"Contratos y desalojos",urgenciaDisponible:false,requiereMatricula:true},
  ]},

];

/* ─────────────────────────────────────────────────────── Exports de conveniencia */

export const RUBROS_FLAT = RUBROS_COMPLETOS.map(r => ({
  id: r.id, nombre: r.nombre, icon: r.icon, color: r.color, categoria: r.categoria
}));

export const RUBROS_DESTACADOS = [
  {id:"electricidad",      nombre:"Electricista",    icon:"⚡"},
  {id:"plomeria",          nombre:"Plomero",          icon:"🔧"},
  {id:"pintura",           nombre:"Pintor",           icon:"🖌️"},
  {id:"gas",               nombre:"Gasista",          icon:"🔥"},
  {id:"cerrajeria",        nombre:"Cerrajero",        icon:"🔑"},
  {id:"albanileria",       nombre:"Albañil",          icon:"🏗️"},
  {id:"carpinteria",       nombre:"Carpintero",       icon:"🪚"},
  {id:"climatizacion",     nombre:"Técnico AA",       icon:"❄️"},
  {id:"piletero",          nombre:"Piletero",         icon:"🏊"},
  {id:"jardineria",        nombre:"Jardinero",        icon:"🌿"},
  {id:"mudanzas",          nombre:"Mudanzas",         icon:"🚛"},
  {id:"tecnologia",        nombre:"Técnico IT",       icon:"💻"},
  {id:"limpieza",          nombre:"Limpieza",         icon:"🧹"},
  {id:"fumigacion",        nombre:"Fumigación",       icon:"🐛"},
  {id:"mecanica",          nombre:"Mecánico",         icon:"🚗"},
  {id:"enfermeria",        nombre:"Enfermería",       icon:"🩺"},
  {id:"energia-solar",     nombre:"Solar",            icon:"☀️"},
  {id:"personal-trainer",  nombre:"Trainer",          icon:"🏋️"},
  {id:"masajista",         nombre:"Masajes",          icon:"💆"},
  {id:"clases-particulares",nombre:"Clases",          icon:"📚"},
  {id:"catering",          nombre:"Catering",         icon:"🍽️"},
  {id:"fotografo",         nombre:"Fotógrafo",        icon:"📸"},
  {id:"niñera",            nombre:"Niñera",           icon:"👶"},
  {id:"decoracion",        nombre:"Decoración",       icon:"🛋️"},
];

export const CATEGORIAS = [
  "Construcción",
  "Instalaciones",
  "Seguridad",
  "Jardín",
  "Tecnología",
  "Limpieza",
  "Logística",
  "Automotor",
  "Salud",
  "Bienestar",
  "Educación",
  "Eventos",
  "Mascotas",
  "Hogar",
  "Diseño",
  "Servicios profesionales",
];

export default RUBROS_COMPLETOS;
