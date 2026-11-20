import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';
import { ShopTimeZone } from '../src/modules/scheduling/domain/shop-time-zone.js';
import { buildDemoAppointments, DEMO_CLIENTS, mulberry32 } from './demo-data.js';

const db = new PrismaClient();

const SERVICES = [
  { id: 'corte-C', name: 'Corte Clássico', description: 'Tesoura ou máquina', icon: 'C', category: 'corte', price: 40, durationMinutes: 40 },
  { id: 'combo-CB', name: 'Corte + Barba', description: 'Combo premium', icon: 'CB', category: 'combo', price: 65, durationMinutes: 70 },
  { id: 'barba-B', name: 'Barba Completa', description: 'Navalha profissional', icon: 'B', category: 'barba', price: 35, durationMinutes: 30 },
  { id: 'trat-H', name: 'Hidratação Capilar', description: 'Tratamento profundo', icon: 'H', category: 'trat', price: 30, durationMinutes: 20 },
  { id: 'trat-D', name: 'Design de Sobrancelha', description: 'Modelagem precisa', icon: 'D', category: 'trat', price: 20, durationMinutes: 15 },
  { id: 'trat-Co', name: 'Coloração', description: 'Platinado, luzes, ombré', icon: 'Co', category: 'trat', price: 120, durationMinutes: 90 },
];

const USERS = [
  { name: 'Admin Barbeiro', email: 'admin@example.com', phone: '11900000000', role: Role.ADMIN, password: '1234' },
  { name: 'João Silva', email: 'joao@test.com', phone: '11999999999', role: Role.CLIENT, password: '123456' },
];

const BARBERS = [
  { name: 'João Mestre', email: 'joao.mestre@barbershop.com', phone: '11988888888', experience: '12 anos', bio: 'Cortes clássicos e degradê' },
  { name: 'Pedro Silva', email: 'pedro@barbershop.com', phone: '11977777777', experience: '7 anos', bio: 'Barba e tratamentos capilares' },
  { name: 'Carlos Barbosa', email: 'carlos@barbershop.com', phone: '11966666666', experience: '10 anos', bio: 'Cortes modernos e coloração' },
];

const WEEKDAYS = [1, 2, 3, 4, 5];
const BARBER_PASSWORD = '123456';

/** Seed runs on every container start, so existing rows are left alone to keep admin edits. */
async function seedServices() {
  for (const service of SERVICES) {
    await db.service.upsert({ where: { id: service.id }, create: service, update: {} });
  }
}

type SeedUser = { name: string; email: string; phone: string; role: Role; password: string };

/**
 * Creates a seed account unless it already exists. Matching on e-mail or phone keeps accounts whose
 * e-mail (or phone) was changed after seeding, instead of failing on the other unique field.
 */
async function findOrCreateUser({ password, ...user }: SeedUser) {
  const existing = await db.user.findFirst({ where: { OR: [{ email: user.email }, { phone: user.phone }] } });
  if (existing) return existing;
  return db.user.create({ data: { ...user, passwordHash: await argon2.hash(password), preferences: { create: {} } } });
}

async function seedUsers() {
  for (const user of USERS) await findOrCreateUser(user);
}

async function seedBarbers() {
  for (const { experience, bio, ...user } of BARBERS) {
    const account = await findOrCreateUser({ ...user, role: Role.BARBER, password: BARBER_PASSWORD });
    const barber = await db.barber.upsert({
      where: { userId: account.id },
      create: { userId: account.id, experience, bio },
      update: { experience, bio },
    });
    for (const weekday of WEEKDAYS) {
      await db.schedule.upsert({
        where: { barberId_weekday: { barberId: barber.id, weekday } },
        create: { barberId: barber.id, weekday, openTime: '08:00', closeTime: '18:00' },
        update: {},
      });
    }
  }
}

async function seedShopSettings() {
  await db.shopSettings.upsert({ where: { id: 1 }, create: { id: 1, name: 'Navalha de Ouro' }, update: {} });
}

const DEMO_RANDOM_SEED = 20261120;

/** Brazilian demo clients plus their agenda (Nov 2026 – Jan 2027). Safe to rerun: existing rows are left untouched. */
async function seedDemoData() {
  const clientIds: string[] = [];
  for (const client of DEMO_CLIENTS) {
    const user = await findOrCreateUser({ ...client, role: Role.CLIENT });
    clientIds.push(user.id);
  }

  // Generated once: a changed catalog would shift the random sequence and create overlapping bookings.
  if (await db.appointment.count({ where: { id: { startsWith: 'demo-' } } }) > 0) {
    console.log('Demo data: appointments already seeded, skipping.');
    return;
  }

  const barbers = await db.barber.findMany({ include: { user: true } });
  const services = await db.service.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
  const appointments = buildDemoAppointments({
    clientIds,
    barberIds: barbers.sort((a, b) => a.user.name.localeCompare(b.user.name, 'pt-BR')).map(barber => barber.id),
    services,
    timeZone: new ShopTimeZone(process.env.SHOP_TIMEZONE ?? 'America/Sao_Paulo'),
    random: mulberry32(DEMO_RANDOM_SEED),
  });

  await db.appointment.createMany({
    data: appointments.map(appointment => ({
      ...appointment,
      createdAt: new Date(appointment.startsAt.getTime() - 2 * 24 * 60 * 60_000),
    })),
  });
  console.log(`Demo data: ${DEMO_CLIENTS.length} clients, ${appointments.length} appointments.`);
}

async function main() {
  await seedServices();
  await seedUsers();
  await seedBarbers();
  await seedShopSettings();
  if (process.env.SEED_DEMO_DATA === 'true') await seedDemoData();
}

main().finally(() => db.$disconnect());
