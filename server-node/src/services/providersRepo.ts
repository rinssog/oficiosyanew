import { readJson } from "../storage.js";

export function findProviderByUserId(userId: string) {
  const providers = readJson<any[]>("providers", []);
  return providers.find((p) => p.userId === userId) || null;
}

