import { PrismaClient } from '@prisma/client';
import { createUseCases, type UseCases } from '../../src/container.js';
import { createPrismaInfrastructure } from '../../src/infrastructure.js';
import type { Actor } from '../../src/shared/application/actor.js';
import { FixedClock, RecordingNotificationPublisher } from '../support/in-memory.js';
import { NOW, SCHEDULING_CONFIG, tuesdayAt } from '../support/fixtures.js';

/**
 * Exercises the Prisma adapters against a real PostgreSQL database (migrated, may be empty).
 * Skipped unless TEST_DATABASE_URL is set, e.g.
 *   TEST_DATABASE_URL=postgresql://postgres:test@localhost:55432/barbershop_test npm test
 */
const databaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : xdescribe;

describeWithDatabase('Prisma infrastructure (PostgreSQL)', () => {
  let db: PrismaClient;
  let useCases: UseCases;
  let notifications: RecordingNotificationPublisher;
  let client: Actor;
  let barberActor: Actor;
  let barberId: string;

  beforeAll(async () => {
    db = new PrismaClient({ datasourceUrl: databaseUrl });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  beforeEach(async () => {
    await db.$transaction([
      db.appointment.deleteMany(),
      db.passwordResetToken.deleteMany(),
      db.schedule.deleteMany(),
      db.barber.deleteMany(),
      db.userPreference.deleteMany(),
      db.user.deleteMany(),
      db.service.deleteMany(),
      db.shopSettings.deleteMany(),
    ]);
    await db.service.create({ data: { id: 'corte', name: 'Corte', category: 'corte', price: 40, durationMinutes: 40 } });
    const barberUser = await db.user.create({ data: { name: 'João Mestre', email: 'joao@shop.com', passwordHash: 'x', role: 'BARBER' } });
    const barber = await db.barber.create({ data: { userId: barberUser.id } });
    barberId = barber.id;
    barberActor = { userId: barberUser.id, role: 'BARBER' };

    notifications = new RecordingNotificationPublisher();
    const infra = { ...createPrismaInfrastructure(db, notifications), clock: new FixedClock(NOW) };
    useCases = createUseCases(infra, SCHEDULING_CONFIG);

    await useCases.scheduling.updateBarberSchedule.execute(
      { userId: 'admin', role: 'ADMIN' }, barberId, [{ weekday: 2, openTime: '08:00', closeTime: '18:00' }],
    );
    const user = await useCases.identity.registerUser.execute({ name: 'Ana', email: 'ana@test.com', password: 'secret123' });
    client = { userId: user.id, role: user.role };
  });

  it('persists users and preferences', async () => {
    await useCases.identity.updatePreferences.execute(client.userId, { payment: { preferredMethod: 'pix', pixKey: 'k' } });
    expect(await useCases.identity.getPreferences.execute(client.userId))
      .toEqual({ haircut: null, notifications: null, payment: { preferredMethod: 'pix', pixKey: 'k' } });
    expect((await useCases.identity.authenticateUser.execute({ email: 'ana@test.com', password: 'secret123' })).id).toBe(client.userId);
  });

  it('replaces a weekly schedule', async () => {
    await useCases.scheduling.updateBarberSchedule.executeForSelf(barberActor, [{ weekday: 3, openTime: '09:00', closeTime: '12:00' }]);
    const schedule = await useCases.scheduling.getMySchedule.execute(barberActor);
    expect(schedule.workingDays.map(day => day.weekday)).toEqual([3]);
  });

  it('books with a denormalised view and computes availability from stored appointments', async () => {
    const view = await useCases.scheduling.bookAppointment.execute(client, { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
    expect(view.barber.id).toBe(barberId);
    expect(view.service.price).toBe(40);

    const { slots } = await useCases.scheduling.getAvailability.execute({ date: '2026-11-17', serviceId: 'corte' });
    expect(slots.find(slot => slot.time.toString() === '10:00')?.available).toBeFalse();
    expect(slots.find(slot => slot.time.toString() === '11:00')?.available).toBeTrue();
  });

  it('serialises concurrent bookings for the same barber', async () => {
    const other = await useCases.identity.registerUser.execute({ name: 'Bruno', email: 'bruno@test.com', password: 'secret123' });
    const input = { serviceId: 'corte', startsAt: tuesdayAt('10:00'), barberId };
    const results = await Promise.allSettled([
      useCases.scheduling.bookAppointment.execute(client, input),
      useCases.scheduling.bookAppointment.execute({ userId: other.id, role: 'CLIENT' }, input),
    ]);
    expect(results.filter(result => result.status === 'fulfilled').length).toBe(1);
    expect(await db.appointment.count()).toBe(1);
  });

  it('stores status changes and password reset tokens', async () => {
    const view = await useCases.scheduling.bookAppointment.execute(client, { serviceId: 'corte', startsAt: tuesdayAt('10:00') });
    await useCases.scheduling.changeAppointmentStatus.execute(barberActor, view.id, 'CONFIRMED');
    expect((await db.appointment.findUniqueOrThrow({ where: { id: view.id } })).status).toBe('CONFIRMED');

    await useCases.identity.requestPasswordReset.execute('ana@test.com');
    const event = notifications.published.at(-1);
    if (event?.event !== 'password.reset_requested') throw new Error('expected reset event');
    await useCases.identity.resetPassword.execute({ token: event.token, newPassword: 'novaSenha1' });
    expect((await db.passwordResetToken.findFirstOrThrow()).usedAt).not.toBeNull();
  });

  it('persists shop settings and service changes', async () => {
    await useCases.shop.updateShopSettings.execute({ name: 'Barbearia Central' });
    expect(await useCases.shop.getShopSettings.execute()).toEqual({ name: 'Barbearia Central' });
    await useCases.catalog.updateServiceOffering.execute('corte', { price: 45.5 });
    expect((await useCases.catalog.listServiceOfferings.execute())[0].price).toBe(45.5);
  });
});
