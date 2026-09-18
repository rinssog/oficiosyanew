/**
 * RBAC de staff (personal interno de OficiosYa).
 * El rol de sistema sigue siendo ADMIN; dentro de ADMIN hay sub-roles de staff
 * que definen qué secciones y acciones puede usar cada persona del equipo.
 *
 * Fuente de verdad compartida: mantener sincronizado con lib/adminRbac.js (frontend).
 */
import type { Request, Response, NextFunction } from "express";

export type StaffRole = "MANAGER" | "SENIOR" | "TEAM" | "IT" | "SALES";

export const STAFF_ROLES: StaffRole[] = ["MANAGER", "SENIOR", "TEAM", "IT", "SALES"];

/** Secciones del backoffice. */
export type AdminSection =
  | "dashboard"
  | "verificaciones"
  | "documentacion"
  | "users"
  | "solicitudes"
  | "escrow"
  | "ratings"
  | "reclamos"
  | "chat-alerts"
  | "reportes"
  | "facturacion"
  | "logs";

/** Qué sub-roles pueden ACCEDER a cada sección. MANAGER siempre puede todo. */
export const SECTION_ACCESS: Record<AdminSection, StaffRole[]> = {
  dashboard:       ["MANAGER", "SENIOR", "TEAM", "IT", "SALES"],
  verificaciones:  ["MANAGER", "SENIOR", "TEAM"],
  documentacion:   ["MANAGER", "SENIOR", "TEAM"],
  users:           ["MANAGER", "SENIOR", "TEAM", "SALES"],
  solicitudes:     ["MANAGER", "SENIOR", "TEAM", "SALES"],
  escrow:          ["MANAGER", "SENIOR"],
  ratings:         ["MANAGER", "SENIOR", "TEAM"],
  reclamos:        ["MANAGER", "SENIOR", "TEAM"],
  "chat-alerts":   ["MANAGER", "SENIOR", "TEAM", "IT"],
  reportes:        ["MANAGER", "IT", "SALES"],
  facturacion:     ["MANAGER", "SALES"],
  logs:            ["MANAGER", "IT"],
};

/**
 * Acciones sensibles → qué sub-roles pueden ejecutarlas.
 * (Se usa para endurecer endpoints puntuales; el frontend además oculta los botones.)
 */
export type AdminAction =
  | "escrow.release"
  | "kyc.approve"
  | "kyc.reject"
  | "users.suspend"
  | "claims.resolve"
  | "team.manage";

export const ACTION_ACCESS: Record<AdminAction, StaffRole[]> = {
  "escrow.release": ["MANAGER"],
  "kyc.approve":    ["MANAGER", "SENIOR"],
  "kyc.reject":     ["MANAGER", "SENIOR"],
  "users.suspend":  ["MANAGER", "SENIOR"],
  "claims.resolve": ["MANAGER", "SENIOR"],
  "team.manage":    ["MANAGER"],
};

export function normalizeStaffRole(value: any): StaffRole {
  const v = (value || "").toString().toUpperCase();
  return (STAFF_ROLES as string[]).includes(v) ? (v as StaffRole) : "MANAGER";
}

export function canAccessSection(staffRole: any, section: AdminSection): boolean {
  const role = normalizeStaffRole(staffRole);
  return SECTION_ACCESS[section]?.includes(role) ?? false;
}

export function canDoAction(staffRole: any, action: AdminAction): boolean {
  const role = normalizeStaffRole(staffRole);
  return ACTION_ACCESS[action]?.includes(role) ?? false;
}

/** Middleware: exige que el ADMIN tenga acceso a la sección indicada. */
export function requireSection(section: AdminSection) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as { role?: string; staffRole?: string } | undefined;
    if (auth?.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Acceso de administrador requerido" });
    }
    if (!canAccessSection(auth.staffRole, section)) {
      return res.status(403).json({ ok: false, error: "Tu rol de staff no tiene acceso a esta sección" });
    }
    return next();
  };
}

/** Middleware: exige permiso para una acción sensible. */
export function requireAction(action: AdminAction) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as { role?: string; staffRole?: string } | undefined;
    if (auth?.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Acceso de administrador requerido" });
    }
    if (!canDoAction(auth.staffRole, action)) {
      return res.status(403).json({ ok: false, error: "Tu rol de staff no puede realizar esta acción" });
    }
    return next();
  };
}
