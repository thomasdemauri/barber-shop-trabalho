import { createUseCases } from '../../src/container.js';
import type { Actor } from '../../src/shared/application/actor.js';
import type { Role } from '../../src/shared/domain/role.js';
import { User } from '../../src/modules/identity/domain/user.js';
import { ServiceOffering } from '../../src/modules/catalog/domain/service-offering.js';
import { WeeklySchedule } from '../../src/modules/scheduling/domain/weekly-schedule.js';
import { createTestInfrastructure, type TestInfrastructure } from './in-memory.js';

/** Shop time zone used by every test: UTC-3 all year round. */
export const TIME_ZONE = 'America/Sao_Paulo';
/** Monday 2026-11-16, 09:00 in the shop. */
export const NOW = new Date('2026-11-16T12:00:00.000Z');
/** Tuesday 2026-11-17 at the given shop wall-clock time. */
export const tuesdayAt = (time: string) => new Date(`2026-11-17T${time}:00.000-03:00`);

export const SCHEDULING_CONFIG = { shopTimeZone: TIME_ZONE, slotIntervalMinutes: 30 };
const WEEKDAYS = [1, 2, 3, 4, 5].map(weekday => ({ weekday, openTime: '08:00', closeTime: '18:00' }));

export async function addUser(infra: TestInfrastructure, input: { name: string; email: string; role?: Role; password?: string }) {
  const user = User.restore({
    id: `user-${input.email.split('@')[0]}`,
    name: input.name,
    email: input.email,
    phone: null,
    passwordHash: `hashed:${input.password ?? 'secret123'}`,
    role: input.role ?? 'CLIENT',
    createdAt: NOW,
  });
  await infra.users.save(user);
  return user;
}

export async function addBarber(infra: TestInfrastructure, name: string, email: string, days = WEEKDAYS) {
  const user = await addUser(infra, { name, email, role: 'BARBER' });
  const barber = { id: `barber-${email.split('@')[0]}`, userId: user.id, name, experience: '5 anos', bio: null, rating: 4.8, reviews: 10 };
  infra.barbers.rows.push(barber);
  await infra.schedules.save(WeeklySchedule.create(barber.id, days));
  return { user, barber };
}

export async function seedShop(now = NOW) {
  const infra = createTestInfrastructure(now);
  await infra.services.save(ServiceOffering.create({
    id: 'corte', name: 'Corte Clássico', description: null, icon: 'C', category: 'corte', price: 40, durationMinutes: 40,
  }));
  await infra.services.save(ServiceOffering.create({
    id: 'combo', name: 'Corte + Barba', description: null, icon: 'CB', category: 'combo', price: 65, durationMinutes: 70,
  }));
  const client = await addUser(infra, { name: 'Ana Cliente', email: 'ana@test.com' });
  const otherClient = await addUser(infra, { name: 'Bruno Cliente', email: 'bruno@test.com' });
  const admin = await addUser(infra, { name: 'Admin', email: 'admin@test.com', role: 'ADMIN' });
  const joao = await addBarber(infra, 'João Mestre', 'joao@shop.com');
  const pedro = await addBarber(infra, 'Pedro Silva', 'pedro@shop.com');

  const useCases = createUseCases(infra, SCHEDULING_CONFIG);
  const actor = (user: User): Actor => ({ userId: user.id, role: user.role });

  return { infra, useCases, client, otherClient, admin, joao, pedro, actor };
}
