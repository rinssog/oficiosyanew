import { toNextJsHandler } from "better-auth/next-js";
import { authServer } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(authServer);

// Ensure Prisma runs in the Node.js runtime (not Edge)
export const runtime = "nodejs";
