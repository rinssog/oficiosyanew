/**
 * RBAC de staff (frontend) — espejo de server-node/src/security/staffRoles.ts.
 * Define los sub-roles del equipo interno y qué secciones ve cada uno.
 * Mantener sincronizado con el backend.
 */

export const STAFF_ROLES = ["MANAGER", "SENIOR", "TEAM", "IT", "SALES"];

export const STAFF_ROLE_LABELS = {
  MANAGER: "Manager",
  SENIOR: "Senior",
  TEAM: "Equipo",
  IT: "IT",
  SALES: "Ventas",
};

// Qué sub-roles acceden a cada sección. MANAGER ve todo.
export const SECTION_ACCESS = {
  dashboard:      ["MANAGER", "SENIOR", "TEAM", "IT", "SALES"],
  verificaciones: ["MANAGER", "SENIOR", "TEAM"],
  documentacion:  ["MANAGER", "SENIOR", "TEAM"],
  users:          ["MANAGER", "SENIOR", "TEAM", "SALES"],
  solicitudes:    ["MANAGER", "SENIOR", "TEAM", "SALES"],
  escrow:         ["MANAGER", "SENIOR"],
  ratings:        ["MANAGER", "SENIOR", "TEAM"],
  reclamos:       ["MANAGER", "SENIOR", "TEAM"],
  "chat-alerts":  ["MANAGER", "SENIOR", "TEAM", "IT"],
  reportes:       ["MANAGER", "IT", "SALES"],
  facturacion:    ["MANAGER", "SALES"],
};

export function normalizeStaffRole(value) {
  const v = (value || "").toString().toUpperCase();
  return STAFF_ROLES.includes(v) ? v : "MANAGER";
}

export function canAccessSection(staffRole, section) {
  const role = normalizeStaffRole(staffRole);
  return (SECTION_ACCESS[section] || []).includes(role);
}

// Navegación del backoffice, agrupada. `section` matchea SECTION_ACCESS.
export const ADMIN_NAV_GROUPS = [
  {
    group: "Operación",
    items: [
      { section: "dashboard",      href: "/admin/dashboard",      label: "Dashboard" },
      { section: "verificaciones", href: "/admin/verificaciones", label: "Verificaciones (KYC)" },
      { section: "documentacion",  href: "/admin/documentacion",  label: "Documentos KYC" },
      { section: "solicitudes",    href: "/admin/solicitudes",    label: "Solicitudes" },
    ],
  },
  {
    group: "Confianza y disputas",
    items: [
      { section: "reclamos",     href: "/admin/reclamos",    label: "Reclamos" },
      { section: "escrow",       href: "/admin/escrow",      label: "Escrow" },
      { section: "ratings",      href: "/admin/ratings",     label: "Reseñas" },
      { section: "chat-alerts",  href: "/admin/chat-alerts", label: "Chat / Alertas" },
    ],
  },
  {
    group: "Personas y negocio",
    items: [
      { section: "users",       href: "/admin/users",       label: "Usuarios" },
      { section: "facturacion", href: "/admin/facturacion", label: "Facturación" },
      { section: "reportes",    href: "/admin/reportes",    label: "Reportes" },
    ],
  },
];

// Devuelve los grupos con solo los items accesibles por el staffRole.
export function navForRole(staffRole) {
  return ADMIN_NAV_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((it) => canAccessSection(staffRole, it.section)) }))
    .filter((g) => g.items.length > 0);
}
