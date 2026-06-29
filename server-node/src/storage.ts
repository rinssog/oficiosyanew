import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Json = any;

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function filePath(name: string) {
  return path.join(dataDir, `${name}.json`);
}

export function readJson<T = Json>(name: string, fallback: T): T {
  const p = filePath(name);
  if (!fs.existsSync(p)) return fallback;
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T = Json>(name: string, data: T) {
  const p = filePath(name);
  // Escritura atómica: escribimos a un temporal y renombramos (rename es atómico
  // a nivel OS). Evita que una lectura concurrente vea un archivo a medio escribir
  // o que el archivo quede corrupto si el proceso muere durante la escritura.
  const tmp = `${p}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, p);
}

export function pushItem<T extends { id: string }>(name: string, item: T) {
  const arr = readJson<T[]>(name, []);
  arr.push(item);
  writeJson(name, arr);
  return item;
}

export function replaceItems<T>(name: string, items: T[]) {
  writeJson(name, items);
}

export function upsertItem<T extends { id: string }>(name: string, item: T) {
  const arr = readJson<T[]>(name, []);
  const idx = arr.findIndex((x) => x.id === item.id);
  if (idx >= 0) arr[idx] = item;
  else arr.push(item);
  writeJson(name, arr);
  return item;
}

export function generateId(prefix = '') {
  // randomBytes es criptográficamente seguro y evita colisiones de Math.random
  return `${prefix}${randomBytes(6).toString('hex')}`;
}
