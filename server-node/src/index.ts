import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRouter from "./routes/auth.js";
import catalogRouter from "./routes/catalog.js";
import termsRouter from "./routes/terms.js";
import providersRouter from "./routes/providers.js";
import requestsRouter from "./routes/requests.js";
import subscriptionsRouter from "./routes/subscriptions.js";
import clientRouter from "./routes/client.js";
import adminRouter from "./routes/admin.js";
import filesRouter from "./routes/files.js";
import paymentsRouter from "./routes/payments.js";
import searchRouter from "./routes/search.js";
import appointmentsRouter from "./routes/appointments.js";
import chatRouter from "./routes/chat.js";
import teamRouter from "./routes/teamMembers.js";
import photosRouter from "./routes/workPhotos.js";
import { seedAll, seedInitialUser } from "./services/seeding.js";

import { logger } from "./utils/logger";
import { requestLogger } from "./observability/logger.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
const allowed = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(requestLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

app.use("/api", authRouter);
app.use("/api", catalogRouter);
app.use("/api", termsRouter);
app.use("/api", providersRouter);
app.use("/api", requestsRouter);
app.use("/api", subscriptionsRouter);
app.use("/api", clientRouter);
app.use("/api", adminRouter);
app.use("/api", filesRouter);
app.use("/api", paymentsRouter);
app.use("/api", searchRouter);
app.use("/api", appointmentsRouter);
app.use("/api", chatRouter);
app.use("/api", teamRouter);
app.use("/api", photosRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/readyz", (_req, res) => res.status(200).send("ready"));

app.get("/metrics", (_req, res) => {
  res.setHeader("Content-Type", "text/plain; version=0.0.4");
  res.send(`# HELP api_up 1 if the API is up\n# TYPE api_up gauge\napi_up 1`);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("API error", { message: err.message, stack: err.stack });
  res.status(500).json({ ok: false, error: err.message || "Error inesperado" });
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  seedAll();
  seedInitialUser();
  logger.info(`API lista en http://localhost:${PORT}`);
});
