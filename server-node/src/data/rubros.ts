export interface Servicio{id:string;nombre:string;descripcion:string;urgenciaDisponible:boolean;requiereMatricula:boolean;}
export interface Rubro{id:string;nombre:string;icon:string;color:string;categoria:string;servicios:Servicio[];}
export const RUBROS_COMPLETOS:Rubro[]=[
{id:"albanileria",nombre:"Albañilería",icon:"🏗️",color:"#78716C",categoria:"Construcción",servicios:[
{id:"alb-1",nombre:"Reparación de paredes y revoques",descripcion:"Grietas, humedad y revoques caídos",urgenciaDisponible:false,requiereMatricula:false},
{id:"alb-2",nombre:"Construcción de tabiques",descripcion:"Ladrillos o durlock",urgenciaDisponible:false,requiereMatricula:false},
{id:"alb-3",nombre:"Impermeabilización de terrazas",descripcion:"Membrana y pintura hidrófuga",urgenciaDisponible:false,requiereMatricula:false},
{id:"alb-4",nombre:"Contrapiso y nivelación",descripcion:"Hormigón y autonivelante",urgenciaDisponible:false,requiereMatricula:false},
{id:"alb-5",nombre:"Cerámicos y porcelanato",descripcion:"Pisos y paredes",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"pintura",nombre:"Pintura",icon:"🖌️",color:"#7C3AED",categoria:"Construcción",servicios:[
{id:"pin-1",nombre:"Pintura interior",descripcion:"Paredes y cielorrasos",urgenciaDisponible:false,requiereMatricula:false},
{id:"pin-2",nombre:"Pintura exterior y frentes",descripcion:"Fachadas",urgenciaDisponible:false,requiereMatricula:false},
{id:"pin-3",nombre:"Pintura de rejas y metales",descripcion:"Antióxido y esmalte",urgenciaDisponible:false,requiereMatricula:false},
{id:"pin-4",nombre:"Pintura decorativa",descripcion:"Veteados y técnicas especiales",urgenciaDisponible:false,requiereMatricula:false},
{id:"pin-5",nombre:"Laqueado de muebles",descripcion:"Madera y MDF",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"carpinteria",nombre:"Carpintería",icon:"🪚",color:"#92400E",categoria:"Construcción",servicios:[
{id:"car-1",nombre:"Reparación de puertas y ventanas",descripcion:"Bisagras, cerraduras y marcos",urgenciaDisponible:true,requiereMatricula:false},
{id:"car-2",nombre:"Muebles a medida",descripcion:"Diseño y fabricación en madera",urgenciaDisponible:false,requiereMatricula:false},
{id:"car-3",nombre:"Colocación de pisos de madera",descripcion:"Parquet y laminados",urgenciaDisponible:false,requiereMatricula:false},
{id:"car-4",nombre:"Placards y vestidores",descripcion:"Diseño y montaje",urgenciaDisponible:false,requiereMatricula:false},
{id:"car-5",nombre:"Pérgolas y decks",descripcion:"Estructuras de madera exteriores",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"herreria",nombre:"Herrería",icon:"⚙️",color:"#374151",categoria:"Construcción",servicios:[
{id:"her-1",nombre:"Rejas y portones",descripcion:"Fabricación e instalación",urgenciaDisponible:false,requiereMatricula:false},
{id:"her-2",nombre:"Escaleras y pasamanos",descripcion:"Hierro y aluminio",urgenciaDisponible:false,requiereMatricula:false},
{id:"her-3",nombre:"Soldadura",descripcion:"MIG/TIG reparaciones y estructuras",urgenciaDisponible:false,requiereMatricula:false},
{id:"her-4",nombre:"Portones automáticos",descripcion:"Instalación y reparación",urgenciaDisponible:true,requiereMatricula:false}]},
{id:"techista",nombre:"Techista",icon:"🏠",color:"#B45309",categoria:"Construcción",servicios:[
{id:"tec-h1",nombre:"Reparación de tejas y chapas",descripcion:"Sellado de goteras",urgenciaDisponible:true,requiereMatricula:false},
{id:"tec-h2",nombre:"Cielorrasos",descripcion:"Durlock, yeso y PVC",urgenciaDisponible:false,requiereMatricula:false},
{id:"tec-h3",nombre:"Impermeabilización de techos",descripcion:"Membrana y poliuretano",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"vidrieria",nombre:"Vidriería",icon:"🔲",color:"#0891B2",categoria:"Construcción",servicios:[
{id:"vid-1",nombre:"Colocación de vidrios",descripcion:"Reemplazo en ventanas y puertas",urgenciaDisponible:true,requiereMatricula:false},
{id:"vid-2",nombre:"DVH y doble vidriado",descripcion:"Aislación térmica y acústica",urgenciaDisponible:false,requiereMatricula:false},
{id:"vid-3",nombre:"Mamparas de baño",descripcion:"Box de ducha y mamparas",urgenciaDisponible:false,requiereMatricula:false},
{id:"vid-4",nombre:"Espejos decorativos",descripcion:"Colocación de espejos",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"electricidad",nombre:"Electricista",icon:"⚡",color:"#D97706",categoria:"Instalaciones",servicios:[
{id:"ele-1",nombre:"Instalación eléctrica",descripcion:"Cableado, tomacorrientes y llaves",urgenciaDisponible:true,requiereMatricula:true},
{id:"ele-2",nombre:"Tablero eléctrico",descripcion:"Llaves térmicas y diferencial",urgenciaDisponible:true,requiereMatricula:true},
{id:"ele-3",nombre:"Luces LED y luminarias",descripcion:"Downlights y tiras LED",urgenciaDisponible:false,requiereMatricula:true},
{id:"ele-4",nombre:"Domótica y automatización",descripcion:"Llaves inteligentes y sensores",urgenciaDisponible:false,requiereMatricula:true},
{id:"ele-5",nombre:"Puesta a tierra",descripcion:"Jabalinas y sistema de tierra",urgenciaDisponible:false,requiereMatricula:true},
{id:"ele-6",nombre:"Generadores y UPS",descripcion:"Sistemas de respaldo eléctrico",urgenciaDisponible:true,requiereMatricula:true}]},
{id:"plomeria",nombre:"Plomería",icon:"🔧",color:"#0284C7",categoria:"Instalaciones",servicios:[
{id:"plo-1",nombre:"Destapaciones",descripcion:"Cañerías, desagotes y cámara",urgenciaDisponible:true,requiereMatricula:false},
{id:"plo-2",nombre:"Reparación de pérdidas",descripcion:"Detección y reparación",urgenciaDisponible:true,requiereMatricula:false},
{id:"plo-3",nombre:"Instalación sanitaria",descripcion:"Inodoros, lavabos y duchas",urgenciaDisponible:false,requiereMatricula:false},
{id:"plo-4",nombre:"Calentadores de agua",descripcion:"Termotanques y calefones",urgenciaDisponible:true,requiereMatricula:false},
{id:"plo-5",nombre:"Sistemas de riego",descripcion:"Goteo y aspersión en jardines",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"gas",nombre:"Gasista",icon:"🔥",color:"#DC2626",categoria:"Instalaciones",servicios:[
{id:"gas-1",nombre:"Instalación de gas natural",descripcion:"Habilitación y extensión de redes",urgenciaDisponible:true,requiereMatricula:true},
{id:"gas-2",nombre:"Artefactos a gas",descripcion:"Cocinas, calefones y estufas",urgenciaDisponible:false,requiereMatricula:true},
{id:"gas-3",nombre:"Detección de fugas",descripcion:"Emergencia por olor a gas",urgenciaDisponible:true,requiereMatricula:true},
{id:"gas-4",nombre:"Certificado GAS",descripcion:"Habilitación para alquiler/venta",urgenciaDisponible:false,requiereMatricula:true},
{id:"gas-5",nombre:"Caldera y radiadores",descripcion:"Instalación y mantenimiento",urgenciaDisponible:false,requiereMatricula:true}]},
{id:"climatizacion",nombre:"Climatización",icon:"❄️",color:"#0891B2",categoria:"Instalaciones",servicios:[
{id:"cli-1",nombre:"Instalación de aires acondicionados",descripcion:"Split e inverter",urgenciaDisponible:false,requiereMatricula:true},
{id:"cli-2",nombre:"Mantenimiento de AA",descripcion:"Filtros y gas refrigerante",urgenciaDisponible:false,requiereMatricula:true},
{id:"cli-3",nombre:"Calefacción central",descripcion:"Instalación y mantenimiento",urgenciaDisponible:false,requiereMatricula:true},
{id:"cli-4",nombre:"Estufas y caloventores",descripcion:"Eléctricas y a gas",urgenciaDisponible:false,requiereMatricula:false},
{id:"cli-5",nombre:"Ventilación y campanas",descripcion:"Extractor y sistemas de ventilación",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"cerrajeria",nombre:"Cerrajería",icon:"🔑",color:"#4338CA",categoria:"Seguridad",servicios:[
{id:"cer-1",nombre:"Apertura de emergencia",descripcion:"Apertura sin daño de puertas",urgenciaDisponible:true,requiereMatricula:false},
{id:"cer-2",nombre:"Cambio de cerradura",descripcion:"Cerraduras de seguridad",urgenciaDisponible:true,requiereMatricula:false},
{id:"cer-3",nombre:"Duplicado de llaves",descripcion:"Simples y con chip",urgenciaDisponible:false,requiereMatricula:false},
{id:"cer-4",nombre:"Cerraduras electrónicas",descripcion:"Smart locks y digital",urgenciaDisponible:false,requiereMatricula:false},
{id:"cer-5",nombre:"Cajas fuertes",descripcion:"Apertura, reparación y anclaje",urgenciaDisponible:true,requiereMatricula:false}]},
{id:"alarmas",nombre:"Alarmas y CCTV",icon:"📷",color:"#1D4ED8",categoria:"Seguridad",servicios:[
{id:"ala-1",nombre:"Cámaras de seguridad",descripcion:"IP, analógicas y NVR/DVR",urgenciaDisponible:false,requiereMatricula:false},
{id:"ala-2",nombre:"Alarmas perimetrales",descripcion:"Detectores de movimiento",urgenciaDisponible:false,requiereMatricula:false},
{id:"ala-3",nombre:"Control de acceso",descripcion:"RFID, biometría y portones",urgenciaDisponible:false,requiereMatricula:false},
{id:"ala-4",nombre:"Porteros y videoporteros",descripcion:"Instalación de portero eléctrico",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"jardineria",nombre:"Jardinería",icon:"🌿",color:"#16A34A",categoria:"Jardín",servicios:[
{id:"jar-1",nombre:"Diseño de jardín",descripcion:"Proyecto paisajístico",urgenciaDisponible:false,requiereMatricula:false},
{id:"jar-2",nombre:"Mantenimiento mensual",descripcion:"Corte de pasto y podas",urgenciaDisponible:false,requiereMatricula:false},
{id:"jar-3",nombre:"Instalación de césped",descripcion:"Natural y sintético",urgenciaDisponible:false,requiereMatricula:false},
{id:"jar-4",nombre:"Riego automático",descripcion:"Goteo y aspersión",urgenciaDisponible:false,requiereMatricula:false},
{id:"jar-5",nombre:"Huerta orgánica",descripcion:"Diseño e instalación",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"paisajista",nombre:"Paisajista",icon:"🌳",color:"#15803D",categoria:"Jardín",servicios:[
{id:"pai-1",nombre:"Diseño paisajístico integral",descripcion:"Proyecto completo de espacios verdes",urgenciaDisponible:false,requiereMatricula:false},
{id:"pai-2",nombre:"Jardines verticales",descripcion:"Muros verdes interiores y exteriores",urgenciaDisponible:false,requiereMatricula:false},
{id:"pai-3",nombre:"Diseño de terrazas y balcones",descripcion:"Deck, canteros y vegetación",urgenciaDisponible:false,requiereMatricula:false},
{id:"pai-4",nombre:"Asesoría en plantas",descripcion:"Selección y cuidado de especies",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"poda-altura",nombre:"Poda en Altura",icon:"🌲",color:"#166534",categoria:"Jardín",servicios:[
{id:"pod-1",nombre:"Poda de árboles de gran porte",descripcion:"Con arnés y cuerdas",urgenciaDisponible:false,requiereMatricula:false},
{id:"pod-2",nombre:"Extracción de árboles",descripcion:"Tala controlada y retiro",urgenciaDisponible:false,requiereMatricula:false},
{id:"pod-3",nombre:"Poda de palmeras",descripcion:"Limpieza y mantenimiento",urgenciaDisponible:false,requiereMatricula:false},
{id:"pod-4",nombre:"Extracción de tocones",descripcion:"Fresado y extracción",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"piletero",nombre:"Piletero",icon:"🏊",color:"#0284C7",categoria:"Jardín",servicios:[
{id:"pil-1",nombre:"Mantenimiento semanal",descripcion:"Limpieza, química y succión",urgenciaDisponible:false,requiereMatricula:false},
{id:"pil-2",nombre:"Apertura de temporada",descripcion:"Preparación para el verano",urgenciaDisponible:false,requiereMatricula:false},
{id:"pil-3",nombre:"Cierre de temporada",descripcion:"Conservación para el invierno",urgenciaDisponible:false,requiereMatricula:false},
{id:"pil-4",nombre:"Reparación de piletas",descripcion:"Impermeabilización y fisuras",urgenciaDisponible:false,requiereMatricula:false},
{id:"pil-5",nombre:"Instalación de piletas",descripcion:"Fibra y acero prefabricadas",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"tecnologia",nombre:"Técnico Informático",icon:"💻",color:"#6366F1",categoria:"Tecnología",servicios:[
{id:"ti-1",nombre:"Reparación de PCs y notebooks",descripcion:"Hardware, formateo y recuperación",urgenciaDisponible:true,requiereMatricula:false},
{id:"ti-2",nombre:"Redes Wi-Fi y LAN",descripcion:"Instalación y configuración",urgenciaDisponible:false,requiereMatricula:false},
{id:"ti-3",nombre:"Instalación de software",descripcion:"Windows, Office, antivirus",urgenciaDisponible:false,requiereMatricula:false},
{id:"ti-4",nombre:"Soporte remoto",descripcion:"Asistencia online sin visita",urgenciaDisponible:true,requiereMatricula:false},
{id:"ti-5",nombre:"Seguridad informática",descripcion:"Virus, backup y protección",urgenciaDisponible:false,requiereMatricula:false},
{id:"ti-6",nombre:"Smart TV y dispositivos",descripcion:"Configuración de smart TVs",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"redes",nombre:"Redes y Cableado",icon:"🌐",color:"#0891B2",categoria:"Tecnología",servicios:[
{id:"red-1",nombre:"Cableado estructurado",descripcion:"Redes de datos en empresas",urgenciaDisponible:false,requiereMatricula:false},
{id:"red-2",nombre:"Fibra óptica",descripcion:"Empalme y tendido",urgenciaDisponible:false,requiereMatricula:false},
{id:"red-3",nombre:"CCTV y redes IP",descripcion:"Cableado y configuración de cámaras",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"electrodomesticos",nombre:"Técnico en Electrodomésticos",icon:"🔌",color:"#0369A1",categoria:"Electrodomésticos",servicios:[
{id:"ed-1",nombre:"Heladeras y freezers",descripcion:"Reparación y mantenimiento",urgenciaDisponible:false,requiereMatricula:false},
{id:"ed-2",nombre:"Lavarropas y secarropas",descripcion:"Automáticos y de tambor",urgenciaDisponible:false,requiereMatricula:false},
{id:"ed-3",nombre:"Lavavajillas",descripcion:"Reparación e instalación",urgenciaDisponible:false,requiereMatricula:false},
{id:"ed-4",nombre:"Hornos y cocinas",descripcion:"Eléctricos, microondas y a gas",urgenciaDisponible:false,requiereMatricula:false},
{id:"ed-5",nombre:"Pequeños electrodomésticos",descripcion:"Planchas, aspiradoras, calefactores",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"limpieza",nombre:"Limpieza del Hogar",icon:"🧹",color:"#0891B2",categoria:"Limpieza",servicios:[
{id:"lim-1",nombre:"Limpieza general o profunda",descripcion:"Por hora o por ambientes",urgenciaDisponible:false,requiereMatricula:false},
{id:"lim-2",nombre:"Limpieza post-obra",descripcion:"Con retiro de escombros pequeños",urgenciaDisponible:false,requiereMatricula:false},
{id:"lim-3",nombre:"Limpieza de oficinas",descripcion:"Espacios de trabajo",urgenciaDisponible:false,requiereMatricula:false},
{id:"lim-4",nombre:"Limpieza de fin de mudanza",descripcion:"Antes o después de mudarse",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"fumigacion",nombre:"Fumigación",icon:"🐛",color:"#65A30D",categoria:"Limpieza",servicios:[
{id:"fum-1",nombre:"Control de cucarachas y hormigas",descripcion:"Gel, cebo y aspersión",urgenciaDisponible:false,requiereMatricula:true},
{id:"fum-2",nombre:"Control de roedores",descripcion:"Cebos y trampas",urgenciaDisponible:false,requiereMatricula:true},
{id:"fum-3",nombre:"Desinfección completa",descripcion:"Nebulización o aspersión",urgenciaDisponible:false,requiereMatricula:true},
{id:"fum-4",nombre:"Control de termitas",descripcion:"Preventivo y correctivo",urgenciaDisponible:false,requiereMatricula:true}]},
{id:"lavado-tapizados",nombre:"Lavado de Tapizados",icon:"🛋️",color:"#7C3AED",categoria:"Limpieza",servicios:[
{id:"tap-1",nombre:"Limpieza de alfombras",descripcion:"Seco y húmedo",urgenciaDisponible:false,requiereMatricula:false},
{id:"tap-2",nombre:"Lavado de sillones y sofás",descripcion:"Aspirado y lavado profundo",urgenciaDisponible:false,requiereMatricula:false},
{id:"tap-3",nombre:"Lavado de colchones",descripcion:"Aspirado y desodorizado",urgenciaDisponible:false,requiereMatricula:false},
{id:"tap-4",nombre:"Limpieza de cortinas",descripcion:"Seco sin descolgarlas",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"mudanzas",nombre:"Mudanzas",icon:"🚛",color:"#D97706",categoria:"Logística",servicios:[
{id:"mud-1",nombre:"Mudanza de departamento",descripcion:"Con embalaje y traslado",urgenciaDisponible:false,requiereMatricula:false},
{id:"mud-2",nombre:"Mudanza de casa",descripcion:"Flete y operarios",urgenciaDisponible:false,requiereMatricula:false},
{id:"mud-3",nombre:"Mudanza de oficina",descripcion:"Mobiliario y equipos",urgenciaDisponible:false,requiereMatricula:false},
{id:"mud-4",nombre:"Transporte de muebles",descripcion:"Flete de muebles sueltos",urgenciaDisponible:false,requiereMatricula:false},
{id:"mud-5",nombre:"Guarda muebles",descripcion:"Almacenamiento mensual",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"flete",nombre:"Flete y Cadetería",icon:"📦",color:"#B45309",categoria:"Logística",servicios:[
{id:"fle-1",nombre:"Flete urbano",descripcion:"Paquetes y materiales en la ciudad",urgenciaDisponible:true,requiereMatricula:false},
{id:"fle-2",nombre:"Cadetería en moto",descripcion:"Envíos urgentes CABA y GBA",urgenciaDisponible:true,requiereMatricula:false},
{id:"fle-3",nombre:"Distribución de mercadería",descripcion:"Reparto a múltiples puntos",urgenciaDisponible:false,requiereMatricula:false},
{id:"fle-4",nombre:"Transporte de materiales de obra",descripcion:"Arena, piedras y materiales",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"mecanica",nombre:"Mecánico a Domicilio",icon:"🚗",color:"#374151",categoria:"Automotor",servicios:[
{id:"mec-1",nombre:"Diagnóstico electrónico",descripcion:"Escaneo OBD de fallas",urgenciaDisponible:true,requiereMatricula:false},
{id:"mec-2",nombre:"Cambio de batería",descripcion:"A domicilio",urgenciaDisponible:true,requiereMatricula:false},
{id:"mec-3",nombre:"Cambio de aceite y filtros",descripcion:"Service a domicilio",urgenciaDisponible:false,requiereMatricula:false},
{id:"mec-4",nombre:"Frenos y neumáticos",descripcion:"Pastillas, discos y cubiertas",urgenciaDisponible:false,requiereMatricula:false},
{id:"mec-5",nombre:"Auxilio en ruta",descripcion:"Arranque y cambio de rueda",urgenciaDisponible:true,requiereMatricula:false}]},
{id:"cerrajeria-auto",nombre:"Cerrajero de Autos",icon:"🚘",color:"#4338CA",categoria:"Automotor",servicios:[
{id:"ca-1",nombre:"Apertura de autos",descripcion:"Sin daño",urgenciaDisponible:true,requiereMatricula:false},
{id:"ca-2",nombre:"Duplicado de llaves de auto",descripcion:"Con chip y control remoto",urgenciaDisponible:true,requiereMatricula:false},
{id:"ca-3",nombre:"Programación de transponder",descripcion:"Inmovilizador y llave codificada",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"enfermeria",nombre:"Enfermería a Domicilio",icon:"🩺",color:"#0891B2",categoria:"Salud",servicios:[
{id:"enf-1",nombre:"Inyectables y sueros",descripcion:"Colocación a domicilio",urgenciaDisponible:true,requiereMatricula:true},
{id:"enf-2",nombre:"Cuidado de adultos mayores",descripcion:"Acompañamiento y cuidado",urgenciaDisponible:false,requiereMatricula:true},
{id:"enf-3",nombre:"Curación de heridas",descripcion:"Seguimiento quirúrgico",urgenciaDisponible:false,requiereMatricula:true},
{id:"enf-4",nombre:"Kinesiología a domicilio",descripcion:"Rehabilitación física",urgenciaDisponible:false,requiereMatricula:true}]},
{id:"veterinaria",nombre:"Veterinaria a Domicilio",icon:"🐾",color:"#65A30D",categoria:"Salud",servicios:[
{id:"vet-1",nombre:"Consulta veterinaria",descripcion:"Revisión en tu hogar",urgenciaDisponible:true,requiereMatricula:true},
{id:"vet-2",nombre:"Vacunación y desparasitación",descripcion:"Plan sanitario para mascotas",urgenciaDisponible:false,requiereMatricula:true},
{id:"vet-3",nombre:"Peluquería canina",descripcion:"Baño, corte y estética",urgenciaDisponible:false,requiereMatricula:false},
{id:"vet-4",nombre:"Paseador de perros",descripcion:"Paseos individuales o grupales",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"fotografo",nombre:"Fotógrafo / Videógrafo",icon:"📸",color:"#7C3AED",categoria:"Eventos",servicios:[
{id:"foto-1",nombre:"Fotografía de eventos",descripcion:"Casamientos, cumpleaños, corporativos",urgenciaDisponible:false,requiereMatricula:false},
{id:"foto-2",nombre:"Fotografía inmobiliaria",descripcion:"Para publicaciones de propiedades",urgenciaDisponible:false,requiereMatricula:false},
{id:"foto-3",nombre:"Video corporativo",descripcion:"Institucionales y publicitarios",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"contabilidad",nombre:"Contador / Gestor",icon:"📊",color:"#0369A1",categoria:"Servicios profesionales",servicios:[
{id:"con-1",nombre:"Monotributo y autónomos",descripcion:"Alta, recategorización y baja",urgenciaDisponible:false,requiereMatricula:true},
{id:"con-2",nombre:"Liquidación de sueldos",descripcion:"Mensual y cargas sociales",urgenciaDisponible:false,requiereMatricula:true},
{id:"con-3",nombre:"Gestoría vehicular",descripcion:"Transferencias y patentamiento",urgenciaDisponible:false,requiereMatricula:false},
{id:"con-4",nombre:"Habilitaciones comerciales",descripcion:"Habilitaciones municipales",urgenciaDisponible:false,requiereMatricula:false}]},
{id:"planchado-costura",nombre:"Planchado y Costura",icon:"👗",color:"#DB2777",categoria:"Otros",servicios:[
{id:"cos-1",nombre:"Servicio de planchado",descripcion:"Por prenda o por kilo",urgenciaDisponible:false,requiereMatricula:false},
{id:"cos-2",nombre:"Arreglos de ropa",descripcion:"Ruedos, entallados y reparaciones",urgenciaDisponible:false,requiereMatricula:false},
{id:"cos-3",nombre:"Confección a medida",descripcion:"Ropa y uniformes",urgenciaDisponible:false,requiereMatricula:false}]},
];
export const RUBROS_FLAT=RUBROS_COMPLETOS.map(r=>({id:r.id,nombre:r.nombre,icon:r.icon,color:r.color,categoria:r.categoria}));
export const RUBROS_DESTACADOS=[
{id:"electricidad",nombre:"Electricista",icon:"⚡",href:"/client/buscar?rubro=electricidad"},
{id:"plomeria",nombre:"Plomero",icon:"🔧",href:"/client/buscar?rubro=plomeria"},
{id:"pintura",nombre:"Pintor",icon:"🖌️",href:"/client/buscar?rubro=pintura"},
{id:"gas",nombre:"Gasista",icon:"🔥",href:"/client/buscar?rubro=gas"},
{id:"cerrajeria",nombre:"Cerrajero",icon:"🔑",href:"/client/buscar?rubro=cerrajeria"},
{id:"albanileria",nombre:"Albañil",icon:"🏗️",href:"/client/buscar?rubro=albanileria"},
{id:"carpinteria",nombre:"Carpintero",icon:"🪚",href:"/client/buscar?rubro=carpinteria"},
{id:"climatizacion",nombre:"Técnico AA",icon:"❄️",href:"/client/buscar?rubro=climatizacion"},
{id:"piletero",nombre:"Piletero",icon:"🏊",href:"/client/buscar?rubro=piletero"},
{id:"paisajista",nombre:"Paisajista",icon:"🌳",href:"/client/buscar?rubro=paisajista"},
{id:"poda-altura",nombre:"Poda en Altura",icon:"🌲",href:"/client/buscar?rubro=poda-altura"},
{id:"mudanzas",nombre:"Mudanzas",icon:"🚛",href:"/client/buscar?rubro=mudanzas"},
{id:"flete",nombre:"Flete / Cadete",icon:"📦",href:"/client/buscar?rubro=flete"},
{id:"tecnologia",nombre:"Técnico IT",icon:"💻",href:"/client/buscar?rubro=tecnologia"},
{id:"limpieza",nombre:"Limpieza",icon:"🧹",href:"/client/buscar?rubro=limpieza"},
{id:"fumigacion",nombre:"Fumigación",icon:"🐛",href:"/client/buscar?rubro=fumigacion"},
];
export const CATEGORIAS=["Construcción","Instalaciones","Seguridad","Jardín","Tecnología","Electrodomésticos","Limpieza","Logística","Automotor","Salud","Eventos","Servicios profesionales","Otros"];
export default RUBROS_COMPLETOS;
