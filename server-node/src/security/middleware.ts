import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt.js";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "changeme";

/**
 * Dual admin auth:
 * 1. x-admin-token header matching ADMIN_TOKEN env var (static secret — backend/scripts)
 * 2. Authorization: Bearer <JWT> where decoded payload has role === "ADMIN" (frontend sessions)
 */
export function adminTokenRequired(req: Request, res: Response, next: NextFunction) {
  // Method 1: static admin token header
  const xToken = req.headers["x-admin-token"];
  if (xToken && xToken === ADMIN_TOKEN) return next();

  // Method 2: JWT Bearer token from logged-in ADMIN user
  const auth = req.headers.authorization || "";
  const [, raw] = auth.split(" ");
  if (raw) {
    try {
      const payload = verifyToken(raw) as any;
      if (payload?.role === "ADMIN") {
        (req as any).auth = payload;
        return next();
      }
    } catch {
      // fall through to 401
    }
  }

  return res.status(401).json({ ok: false, error: "Acceso de administrador requerido" });
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  const [, raw] = auth.split(" ");
  if (!raw) return res.status(401).json({ ok: false, error: "Auth requerida" });
  try {
    const payload = verifyToken(raw);
    (req as any).auth = payload; // attach user id/role
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: "Token invalido o expirado" });
  }
}
