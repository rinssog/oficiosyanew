import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateId, pushItem, readJson, writeJson } from "../storage.js";
import { ensureProviderProfile } from "../services/providerProfile.js";
import { ensureJsonArray } from "../utils/persistence.js";
import { z } from "zod";
import { LoginSchema, RegisterSchema } from "../validation/schemas.js";
import { signToken } from "../security/jwt.js";
import { getRepos } from "../repositories/factory.js";

const router = Router();

router.post("/users/register", async (req, res) => {
  const parse = RegisterSchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ ok: false, error: "Datos de registro inválidos" });
  const { email, password, name, role } = parse.data;

  const repos = getRepos();
  const exists = Boolean(await repos.users.findByEmail(email));
  if (exists) return res.status(400).json({ ok: false, error: "Email ya registrado" });

  const hash = await bcrypt.hash(password, 10);
  const normalizedRole = (role || "CLIENT").toUpperCase();
  const user = {
    id: generateId("usr_"),
    email,
    name: name || "",
    role: normalizedRole,
    passwordHash: hash,
    createdAt: Date.now(),
  };

  await repos.users.create(user);

  let provider: any = null;
  if (normalizedRole === "PROVIDER") {
    provider = {
      id: generateId("pro_"),
      userId: user.id,
      companyName: "",
      verified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    pushItem("providers", provider);
    ensureProviderProfile(provider.id);
  }

  const token = signToken({ sub: user.id, role: user.role });
  res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role }, provider });
});

router.post("/users/login", async (req, res) => {
  const result = LoginSchema.safeParse(req.body || {});
  if (!result.success) return res.status(400).json({ ok: false, error: "Datos inválidos" });
  const { email, password } = result.data;
  const repos = getRepos();
  const user = await repos.users.findByEmail(email);
  if (!user) return res.status(401).json({ ok: false, error: "Credenciales invalidas" });

  const valid = await bcrypt.compare(password || "", user.passwordHash);
  if (!valid) return res.status(401).json({ ok: false, error: "Credenciales invalidas" });

  const token = signToken({ sub: user.id, role: user.role });
  const providers = readJson<any[]>("providers", []);
  const provider = providers.find((p) => p.userId === user.id) || null;

  res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role }, provider });
});

export default router;
