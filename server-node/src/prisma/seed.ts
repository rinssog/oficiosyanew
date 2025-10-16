import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminEmail = 'admin@oficiosya.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await bcrypt.hash('Master123!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        role: 'ADMIN',
        name: 'OficiosYa Admin',
        passwordHash,
      },
    });
  }

  // Minimal catalog
  const catalogItems = [
    { codigo: 'HOG-PLO-001', rubro: 'Plomeria', nombre: 'Cambio de canilla', descripcion: 'Grifería básica', categoria: 'HOGAR_MANTENIMIENTO' },
    { codigo: 'HOG-ELE-001', rubro: 'Electricidad', nombre: 'Revisión cortocircuito', descripcion: 'Diagnóstico tablero', categoria: 'HOGAR_MANTENIMIENTO' },
  ];
  for (const item of catalogItems) {
    await prisma.serviceCatalog.upsert({
      where: { codigo: item.codigo },
      update: {},
      create: {
        codigo: item.codigo,
        rubro: item.rubro,
        subrubro: null,
        nombre: item.nombre,
        descripcion: item.descripcion,
        etiquetas: 'hogar',
        habilitado: true,
      },
    });
  }

  // Index catalog in Meilisearch (si está disponible)
  try {
    const items = await prisma.serviceCatalog.findMany();
    const { indexCatalog } = await import('../services/search.js');
    await indexCatalog(items);
  } catch {}

  // Subscription plans
  const plans = [
    { id: 'plan_base', name: 'Base', priceMonthly: 0, commissionPct: 0.15, leadFee: 700, features: ["Marketplace", "Cobro por transacción"], recommended: false, active: true },
    { id: 'plan_pro', name: 'Profesional', priceMonthly: 11900, commissionPct: 0.1, leadFee: 350, features: ["Prioridad", "Urgencias 24/7", "KPI"], recommended: true, active: true },
    { id: 'plan_empresas', name: 'Empresas', priceMonthly: 34900, commissionPct: 0.08, leadFee: 0, features: ["Multi agente", "Reportes"], recommended: false, active: true },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        priceMonthly: p.priceMonthly,
        commissionPct: p.commissionPct,
        leadFee: p.leadFee,
        features: p.features as any,
        recommended: p.recommended,
        active: p.active,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
