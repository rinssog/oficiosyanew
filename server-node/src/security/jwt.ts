import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const DEFAULT_TTL = process.env.JWT_TTL || "7d";

export interface JwtPayload {
  sub: string; // user id
  role: string;
  staffRole?: string | null; // solo para ADMIN: MANAGER | SENIOR | TEAM | IT | SALES
}

export function signToken(payload: JwtPayload, ttl: string = DEFAULT_TTL) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ttl });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

