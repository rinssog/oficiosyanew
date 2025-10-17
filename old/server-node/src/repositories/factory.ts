export type StorageDriver = "json" | "prisma";

export interface Repos {
  users: {
    findByEmail(email: string): Promise<any | null>;
    create(data: any): Promise<any>;
  };
  requests: {
    create(data: any): Promise<any>;
    listByClient(clientId: string): Promise<any[]>;
  };
  quotes: {
    create(data: any): Promise<any>;
    listByRequest(requestId: string): Promise<any[]>;
  };
  services?: {
    create(data: any): Promise<any>;
    listByProvider(providerId: string): Promise<any[]>;
    update(providerId: string, serviceId: string, patch: any): Promise<any>;
    remove(providerId: string, serviceId: string): Promise<boolean>;
  };
  materials: {
    create(data: any): Promise<any>;
    listByProvider(providerId: string): Promise<any[]>;
    listByRequest(requestId: string): Promise<any[]>;
  };
  audit: {
    write(entry: any): Promise<void>;
  };
  plans?: {
    list(): Promise<any[]>;
    update(planId: string, data: any): Promise<any>;
  };
  terms?: {
    listUser(userId: string, contractType: string): Promise<any[]>;
    accept(data: any): Promise<any>;
  };
  documents?: {
    listPending(): Promise<any[]>;
    setStatus(id: string, status: string, notes?: string): Promise<any>;
  };
}

// JSON implementation using existing helpers
import { readJson, writeJson, pushItem } from "../storage.js";
import { prismaRepos } from "./prisma.js";

function jsonRepos(): Repos {
  return {
    users: {
      async findByEmail(email) {
        const users = readJson<any[]>("users", []);
        return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
      },
      async create(data) {
        const users = readJson<any[]>("users", []);
        users.push(data);
        writeJson("users", users);
        return data;
      },
    },
    services: {
      async create(data) {
        pushItem("provider_services", data);
        return data;
      },
      async listByProvider(providerId) {
        const items = readJson<any[]>("provider_services", []);
        return items.filter((s) => s.providerId === providerId);
      },
      async update(providerId, serviceId, patch) {
        const items = readJson<any[]>("provider_services", []);
        const idx = items.findIndex((s) => s.providerId === providerId && s.id === serviceId);
        if (idx < 0) throw new Error("Servicio no encontrado");
        items[idx] = { ...items[idx], ...patch };
        writeJson("provider_services", items);
        return items[idx];
      },
      async remove(providerId, serviceId) {
        const items = readJson<any[]>("provider_services", []);
        const filtered = items.filter((s) => !(s.providerId === providerId && s.id === serviceId));
        writeJson("provider_services", filtered);
        return filtered.length !== items.length;
      },
    },
    requests: {
      async create(data) {
        pushItem("requests", data);
        return data;
      },
      async listByClient(clientId) {
        const items = readJson<any[]>("requests", []);
        return items.filter((r) => r.clientId === clientId);
      },
    },
    quotes: {
      async create(data) {
        pushItem("quotes", data);
        return data;
      },
      async listByRequest(requestId) {
        const items = readJson<any[]>("quotes", []);
        return items.filter((q) => q.requestId === requestId);
      },
    },
    materials: {
      async create(data) {
        pushItem("provider_materials", data);
        return data;
      },
      async listByProvider(providerId) {
        const items = readJson<any[]>("provider_materials", []);
        return items.filter((m) => m.providerId === providerId);
      },
      async listByRequest(requestId) {
        const items = readJson<any[]>("provider_materials", []);
        return items.filter((m) => m.requestId === requestId);
      },
    },
    audit: {
      async write(entry) {
        const items = readJson<any[]>("audit_log", []);
        items.push({ ...entry, createdAt: entry.createdAt || new Date().toISOString() });
        writeJson("audit_log", items);
      },
    },
    plans: {
      async list() {
        return readJson<any[]>("subscription_plans", []);
      },
      async update(planId, data) {
        const plans = readJson<any[]>("subscription_plans", []);
        const idx = plans.findIndex((p) => p.id === planId);
        if (idx >= 0) {
          plans[idx] = { ...plans[idx], ...data };
          writeJson("subscription_plans", plans);
          return plans[idx];
        }
        throw new Error("Plan no encontrado");
      },
    },
    terms: {
      async listUser(userId, contractType) {
        const items = readJson<any[]>("terms", []);
        return items
          .filter((t) => t.userId === userId && t.contractType === contractType)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      async accept(data) {
        pushItem("terms", data);
        return data;
      },
    },
    documents: {
      async listPending() {
        const profiles = readJson<any[]>("provider_profiles", []);
        return profiles.flatMap((profile) =>
          (profile.documents || [])
            .filter((doc: any) => doc.status === "PENDING" || doc.status === "SUBMITTED")
            .map((doc: any) => ({ id: doc.id || `${profile.providerId}-${doc.type}`, providerId: profile.providerId, type: doc.type, label: doc.label, status: doc.status, uploadedAt: doc.uploadedAt }))
        );
      },
      async setStatus(id: string, status: string) {
        // JSON fallback (best-effort): find by type in profiles and set status
        const profiles = readJson<any[]>("provider_profiles", []);
        for (const p of profiles) {
          for (const d of p.documents || []) {
            const docId = d.id || `${p.providerId}-${d.type}`;
            if (docId === id) {
              d.status = status;
              writeJson("provider_profiles", profiles);
              return d;
            }
          }
        }
        throw new Error("Documento no encontrado");
      },
    },
  };
}

export function getRepos(driver: StorageDriver = (process.env.STORAGE_DRIVER as StorageDriver) || "json"): Repos {
  if (driver === "prisma") {
    return prismaRepos();
  }
  return jsonRepos();
}
