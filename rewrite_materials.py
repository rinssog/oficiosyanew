from pathlib import Path
path = Path("server/src/routes/providers.ts")
text = path.read_text()
old = text.split('router.post("/providers/:providerId/materials"',1)[1]
old_block = 'router.post("/providers/:providerId/materials", upload.single("file"), (req, res) => {\n'
old_block += text.split('router.post("/providers/:providerId/materials"',1)[1].split('});\n\nrouter.get("/requests/:requestId/materials"',1)[0] + '});\n'
remainder = 'router.get("/requests/:requestId/materials"' + text.split('router.get("/requests/:requestId/materials"',1)[1]
new_block = '''router.post("/providers/:providerId/materials", upload.single("file"), (req, res) => {
  const { providerId } = req.params;
  const description = String(req.body?.description || "").trim();
  const requestId = String(req.body?.requestId || "").trim();
  const currency = String(req.body?.currency || "ARS").trim().toUpperCase();
  const amountRaw = Number(req.body?.amount || 0);

  if (!description) return res.status(400).json({ ok: false, error: "Descripcion requerida" });
  if (!requestId) return res.status(400).json({ ok: false, error: "requestId requerido" });
  if (!Number.isFinite(amountRaw) || amountRaw <= 0) {
    return res.status(400).json({ ok: false, error: "Importe invalido" });
  }

  const file = req.file;
  const attachmentUrl = file ? `/uploads/${file.filename}` : undefined;

  const material: ProviderMaterial = {
    id: generateId("mat_"),
    providerId,
    requestId,
    description,
    amount: Math.round(amountRaw * 100),
    currency,
    attachmentUrl,
    createdAt: new Date().toISOString(),
  };

  const existing = readJson<ProviderMaterial[]>("provider_materials", []);
  existing.push(material);
  writeJson("provider_materials", existing);

  res.json({ ok: true, material });
});
'''
text = text.split('router.post("/providers/:providerId/materials"',1)[0] + new_block + remainder
path.write_text(text)
