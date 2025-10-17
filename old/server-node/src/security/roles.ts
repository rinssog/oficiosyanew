import type { Request, Response, NextFunction } from "express";

export type Role = "CLIENT" | "PROVIDER" | "ADMIN";

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as { sub: string; role: Role } | undefined;
    if (!auth) return res.status(401).json({ ok: false, error: "Auth requerida" });
    if (!roles.includes(auth.role)) return res.status(403).json({ ok: false, error: "Permisos insuficientes" });
    return next();
  };
}

export function getAuth(req: Request) {
  return (req as any).auth as { sub: string; role: Role } | undefined;
}

