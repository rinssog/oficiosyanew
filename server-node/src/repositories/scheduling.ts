import { readJson, writeJson, pushItem } from "../storage.js";
import { prismaRepos } from "./prisma.js";
import type { StorageDriver } from "./factory.js";

export function schedulingRepos(driver: StorageDriver = (process.env.STORAGE_DRIVER as StorageDriver) || "prisma") {
  if (driver === "prisma") {
    const prisma = prismaRepos();
    return {
      async listRules(providerId: string) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        return client.availabilityRule.findMany({ where: { providerId }, orderBy: { createdAt: "asc" } });
      },
      async upsertRules(providerId: string, rules: any[]) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        // replace strategy for simplicity now
        await client.$transaction(async (tx) => {
          await tx.availabilityRule.deleteMany({ where: { providerId } });
          for (const r of rules) {
            await tx.availabilityRule.create({
              data: {
                id: r.id,
                providerId,
                daysOfWeek: Array.isArray(r.daysOfWeek) ? r.daysOfWeek.join(",") : String(r.daysOfWeek || ""),
                startTime: r.startTime,
                endTime: r.endTime,
                slotMinutes: Number(r.slotMinutes) || 60,
                bufferMinutes: Number(r.bufferMinutes) || 0,
                maxPerSlot: Number(r.maxPerSlot) || 1,
                maxPerDay: Number(r.maxPerDay) || 8,
                urgent: Boolean(r.urgent),
                active: r.active !== false,
                timezone: r.timezone || "America/Argentina/Buenos_Aires",
              },
            });
          }
        });
      },
      async listBlackouts(providerId: string) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        return client.availabilityBlackout.findMany({ where: { providerId }, orderBy: { start: "asc" } });
      },
      async addBlackout(data: any) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        return client.availabilityBlackout.create({ data });
      },
      async removeBlackout(providerId: string, id: string) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        await client.availabilityBlackout.deleteMany({ where: { id, providerId } });
      },
      async listManualSlots(providerId: string) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        return client.manualSlot.findMany({ where: { providerId }, orderBy: { start: "asc" } });
      },
      async addManualSlot(data: any) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        return client.manualSlot.create({ data });
      },
      async removeManualSlot(providerId: string, id: string) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        await client.manualSlot.deleteMany({ where: { id, providerId } });
      },
    };
  }

  // JSON fallback
  return {
    async listRules(providerId: string) {
      const all = readJson<any[]>("availability_rules", []);
      return all.filter((r) => r.providerId === providerId);
    },
    async upsertRules(providerId: string, rules: any[]) {
      const all = readJson<any[]>("availability_rules", []);
      const others = all.filter((r) => r.providerId !== providerId);
      writeJson("availability_rules", [...others, ...rules]);
    },
    async listBlackouts(providerId: string) {
      const all = readJson<any[]>("availability_blackouts", []);
      return all.filter((b) => b.providerId === providerId);
    },
    async addBlackout(data: any) {
      const all = readJson<any[]>("availability_blackouts", []);
      all.push(data);
      writeJson("availability_blackouts", all);
    },
    async removeBlackout(providerId: string, id: string) {
      const all = readJson<any[]>("availability_blackouts", []);
      writeJson("availability_blackouts", all.filter((b) => !(b.providerId === providerId && b.id === id)));
    },
    async listManualSlots(providerId: string) {
      const all = readJson<any[]>("manual_slots", []);
      return all.filter((s) => s.providerId === providerId);
    },
    async addManualSlot(data: any) {
      const all = readJson<any[]>("manual_slots", []);
      all.push(data);
      writeJson("manual_slots", all);
    },
    async removeManualSlot(providerId: string, id: string) {
      const all = readJson<any[]>("manual_slots", []);
      writeJson("manual_slots", all.filter((s) => !(s.providerId === providerId && s.id === id)));
    },
  };
}

