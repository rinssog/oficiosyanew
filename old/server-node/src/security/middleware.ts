import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt.js";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "changeme";

export function adminTokenRequired(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-admin-token"]; // string | string[] | undefined
  if (token !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: "Token invalido" });
  return next();
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
    return res.status(401).json({ ok: false, error: "Token invalido" });
  }
}

