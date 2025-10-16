import fs from "fs";
import path from "path";
import { describe, expect, it, afterEach, beforeEach } from "vitest";

import { ensureProviderProfile, sanitizeAreas } from "../services/providerProfile.js";

const dataFile = path.resolve(process.cwd(), 'data', 'provider_profiles.json');

describe('providerProfile service', () => {
  let snapshot: string | null = null;

  beforeEach(() => {
    snapshot = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf8') : null;
    if (!snapshot) {
      fs.writeFileSync(dataFile, '[]', 'utf8');
    }
  });

  afterEach(() => {
    if (snapshot !== null) {
      fs.writeFileSync(dataFile, snapshot, 'utf8');
    } else if (fs.existsSync(dataFile)) {
      fs.unlinkSync(dataFile);
    }
  });

  it('crea un perfil con documentos por defecto para nuevos prestadores', () => {
    const profile = ensureProviderProfile('pro_test_doc');
    expect(profile.providerId).toBe('pro_test_doc');
    expect(profile.documents.length).toBeGreaterThan(0);
    expect(profile.documents.every((doc) => doc.status === 'PENDING')).toBe(true);
  });

  it('sanitiza barrios evitando duplicados e invalidos', () => {
    const result = sanitizeAreas(['Palermo', 'belgrano', 'NoExiste', 'Palermo']);
    expect(result).toEqual(['Palermo']);
  });
});
