import { PrismaClient } from "@prisma/client";
import type { Repos } from "./factory.js";

const prisma = new PrismaClient();

export function prismaRepos(): Repos {
  return {
    users: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
      },
      async create(data: any) {
        // If provider role, we create both records transactionally
        if ((data.role || "").toUpperCase() === "PROVIDER") {
          const created = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: {
                id: data.id,
                email: data.email,
                name: data.name || null,
                role: data.role,
                passwordHash: data.passwordHash,
                createdAt: new Date(data.createdAt || Date.now()),
              },
            });
            await tx.provider.create({
              data: {
                id: `pro_${user.id.slice(4)}`,
                userId: user.id,
                companyName: "",
                verified: false,
              },
            });
            return user;
          });
          return created;
        }
        return prisma.user.create({
          data: {
            id: data.id,
            email: data.email,
            name: data.name || null,
            role: data.role,
            passwordHash: data.passwordHash,
            createdAt: new Date(data.createdAt || Date.now()),
          },
        });
      },
    },
    services: {
      async create(data: any) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        const svc = await client.providerService.create({
          data: {
            id: data.id,
            providerId: data.providerId,
            catalogId: data.catalogId,
            pricingType: data.pricingType,
            price: data.price,
            notes: data.notes || null,
            urgent: Boolean(data.urgent),
          },
        });
        return svc;
      },
      async listByProvider(providerId: string) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        return client.providerService.findMany({ where: { providerId }, orderBy: { createdAt: "desc" }, include: { catalog: true } });
      },
      async update(providerId: string, serviceId: string, patch: any) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        // actualizar precio y loguear history si aplica
        const existing = await client.providerService.findUnique({ where: { id: serviceId } });
        if (!existing || existing.providerId !== providerId) throw new Error("Servicio no encontrado");
        const data: any = {};
        if (typeof patch.pricingType === 'string') data.pricingType = patch.pricingType;
        if (typeof patch.notes === 'string') data.notes = patch.notes;
        if (typeof patch.urgent === 'boolean') data.urgent = patch.urgent;
        if (typeof patch.price === 'number' && patch.price !== existing.price) {
          await client.servicePriceHistory.create({ data: { serviceId, oldPrice: existing.price, newPrice: patch.price } });
          data.price = patch.price;
        }
        return client.providerService.update({ where: { id: serviceId }, data });
      },
      async remove(providerId: string, serviceId: string) {
        const { PrismaClient } = await import("@prisma/client");
        const client = new PrismaClient();
        await client.providerService.deleteMany({ where: { id: serviceId, providerId } });
        return true;
      },
    },
    materials: {
    requests: {
      async create(data: any) {
        return prisma.request.create({
          data: {
            id: data.id,
            clientId: data.clientId,
            providerId: data.providerId,
            catalogId: data.serviceId || data.catalogId,
            status: data.status,
            urgent: Boolean(data.schedule?.urgent),
            createdAt: new Date(data.createdAt || Date.now()),
            updatedAt: new Date(data.updatedAt || Date.now()),
          },
        });
      },
      async listByClient(clientId: string) {
        return prisma.request.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } });
      },
    },
    quotes: {
      async create(data: any) {
        return prisma.quote.create({
          data: {
            id: data.id,
            requestId: data.requestId,
            providerId: data.providerId,
            laborTotal: data.laborTotal || 0,
            materialsTotal: data.materialsTotal || 0,
            status: data.status || "PENDING",
            createdAt: new Date(data.createdAt || Date.now()),
            updatedAt: new Date(data.updatedAt || Date.now()),
            items: {
              create: (data.items || []).map((it: any) => ({
                kind: it.kind,
                title: it.description || it.title || "Servicio",
                qty: Number(it.qty) || 1,
                unit: it.unit ? String(it.unit) : null,
                unitPrice: Number(it.unit) || 0,
                total: Number(it.total) || 0,
              })),
            },
          },
        });
      },
      async listByRequest(requestId: string) {
        return prisma.quote.findMany({ where: { requestId }, orderBy: { createdAt: "desc" }, include: { items: true } });
      },
    },
    materials: {
      async create(data: any) {
        return prisma.providerMaterial.create({
          data: {
            id: data.id,
            providerId: data.providerId,
            requestId: data.requestId,
            description: data.description,
            amount: Number(data.amount) || 0,
            currency: data.currency || "ARS",
            attachmentUrl: data.attachmentUrl || null,
            createdAt: new Date(data.createdAt || Date.now()),
          },
        });
      },
      async listByProvider(providerId: string) {
        return prisma.providerMaterial.findMany({ where: { providerId }, orderBy: { createdAt: "desc" } });
      },
      async listByRequest(requestId: string) {
        return prisma.providerMaterial.findMany({ where: { requestId }, orderBy: { createdAt: "desc" } });
      },
    },
    audit: {
      async write(entry: any) {
        await prisma.auditLog.create({
          data: {
            actorId: entry.actorId || null,
            actorRole: entry.actorRole || null,
            action: entry.action,
            entity: entry.entity || null,
            entityId: entry.entityId || null,
            payload: entry.payload || undefined,
            ip: entry.ip || null,
            userAgent: entry.userAgent || null,
            createdAt: new Date(entry.createdAt || Date.now()),
          },
        });
      },
    },
    plans: {
      async list() {
        return prisma.subscriptionPlan.findMany({ orderBy: { createdAt: "asc" } });
      },
      async update(planId: string, data: any) {
        return prisma.subscriptionPlan.update({
          where: { id: planId },
          data: {
            priceMonthly: data.priceMonthly,
            commissionPct: data.commissionPct,
            leadFee: data.leadFee,
            updatedAt: new Date(),
          },
        });
      },
    },
    terms: {
      async listUser(userId: string, contractType: string) {
        return prisma.termsAcceptance.findMany({
          where: { userId, contractType },
          orderBy: { createdAt: "desc" },
        });
      },
      async accept(data: any) {
        return prisma.termsAcceptance.create({
          data: {
            id: data.id,
            userId: data.userId,
            contractType: data.contractType,
            version: data.version,
            nameSigned: data.nameSigned,
            ipAddress: data.ipAddress || null,
            hash: data.signatureHash,
            createdAt: new Date(data.createdAt || Date.now()),
          },
        });
      },
    },
    documents: {
      async listPending() {
        return prisma.document.findMany({
          where: { OR: [ { status: 'PENDING' }, { status: 'SUBMITTED' } ] },
          orderBy: { createdAt: 'desc' },
        });
      },
      async setStatus(id: string, status: string, notes?: string) {
        return prisma.document.update({ where: { id }, data: { status, updatedAt: new Date(), } });
      },
    },
  };
}

export type { PrismaClient };
