import { readJson, writeJson } from "../storage.js";

export const ensureJsonArray = <T>(name: string) => {
  const existing = readJson<T[] | null>(name, null);
  if (Array.isArray(existing)) return existing;
  writeJson(name, [] as T[]);
  return [] as T[];
};
