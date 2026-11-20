import { buildTestApp, json, type TestApp } from '../support/test-app.js';
import { tuesdayAt } from '../support/fixtures.js';

describe('HTTP API', () => {
  let ctx: TestApp;

  beforeEach(async () => { ctx = await buildTestApp(); });
  afterEach(async () => { await ctx.app.close(); });

  describe('health', () => {
    it('reports ok', async () => {
      const response = await ctx.app.inject({ method: 'GET', url: '/health' });
      expect(json(response).status).toBe('ok');
    });
  });

  describe('auth', () => {
    it('registers, logs in and returns the current user', async () => {
      const registered = await ctx.app.inject({
        method: 'POST', url: '/api/auth/register',
        payload: { name: 'Carla', email: 'carla@test.com', phone: '11 95555-0000', password: 'secret123' },
      });
      expect(registered.statusCode).toBe(201);
      expect(json(registered).user).toEqual(jasmine.objectContaining({ name: 'Carla', email: 'carla@test.com', phone: '11955550000', role: 'CLIENT' }));
      expect(json(registered).user.passwordHash).toBeUndefined();

      const login = await ctx.app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'carla@test.com', password: 'secret123' } });
      const me = await ctx.app.inject({ method: 'GET', url: '/api/auth/me', headers: { authorization: `Bearer ${json(login).token}` } });
      expect(json(me).email).toBe('carla@test.com');
    });

    it('maps domain errors to HTTP status codes', async () => {
      const badCredentials = await ctx.app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'ana@test.com', password: 'nope' } });
      expect(badCredentials.statusCode).toBe(401);
      expect(json(badCredentials).error).toBe('INVALID_CREDENTIALS');

      const duplicate = await ctx.app.inject({ method: 'POST', url: '/api/auth/register', payload: { name: 'Ana', email: 'ana@test.com', password: 'secret123' } });
      expect(duplicate.statusCode).toBe(409);
      expect(json(duplicate).error).toBe('EMAIL_IN_USE');

      const invalid = await ctx.app.inject({ method: 'POST', url: '/api/auth/register', payload: { name: 'Ana', email: 'not-email' } });
      expect(invalid.statusCode).toBe(400);
      expect(json(invalid).error).toBe('VALIDATION_ERROR');
    });

    it('requires a valid token', async () => {
      const response = await ctx.app.inject({ method: 'GET', url: '/api/auth/me', headers: { authorization: 'Bearer forged' } });
      expect(response.statusCode).toBe(401);
    });

    it('runs the password reset flow without revealing unknown emails', async () => {
      const unknown = await ctx.app.inject({ method: 'POST', url: '/api/auth/password/forgot', payload: { email: 'nobody@test.com' } });
      expect(unknown.statusCode).toBe(202);

      await ctx.app.inject({ method: 'POST', url: '/api/auth/password/forgot', payload: { email: 'ana@test.com' } });
      const event = ctx.infra.notifications.published[0];
      if (event.event !== 'password.reset_requested') throw new Error('expected reset event');

      const reset = await ctx.app.inject({ method: 'POST', url: '/api/auth/password/reset', payload: { token: event.token, newPassword: 'novaSenha1' } });
      expect(reset.statusCode).toBe(204);
      const login = await ctx.app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'ana@test.com', password: 'novaSenha1' } });
      expect(login.statusCode).toBe(200);
    });
  });

  describe('profile', () => {
    it('updates the profile and preferences of the logged user', async () => {
      const headers = ctx.auth(ctx.client);
      const profile = await ctx.app.inject({ method: 'PATCH', url: '/api/profile', headers, payload: { name: 'Ana Maria' } });
      expect(json(profile).name).toBe('Ana Maria');

      const haircut = { style: 'Degradê', beard: 'Curta', notes: 'Sem máquina 0' };
      await ctx.app.inject({ method: 'PATCH', url: '/api/profile/preferences', headers, payload: { haircut } });
      const preferences = await ctx.app.inject({ method: 'GET', url: '/api/profile/preferences', headers });
      expect(json(preferences)).toEqual({ haircut, notifications: null, payment: null });
    });

    it('rejects unknown preference sections', async () => {
      const response = await ctx.app.inject({ method: 'PATCH', url: '/api/profile/preferences', headers: ctx.auth(ctx.client), payload: { theme: 'light' } });
      expect(response.statusCode).toBe(400);
    });

    it('rejects a password change with the wrong current password', async () => {
      const response = await ctx.app.inject({
        method: 'PATCH', url: '/api/profile', headers: ctx.auth(ctx.client), payload: { currentPassword: 'wrong', newPassword: 'novaSenha1' },
      });
      expect(response.statusCode).toBe(401);
      expect(json(response).error).toBe('INVALID_PASSWORD');
    });
  });

  describe('catalog and shop', () => {
    it('serves public catalog data', async () => {
      const services = json(await ctx.app.inject({ method: 'GET', url: '/api/catalog/services' }));
      const barbers = json(await ctx.app.inject({ method: 'GET', url: '/api/catalog/barbers' }));
      expect(services.map((s: { id: string }) => s.id)).toEqual(['combo', 'corte']);
      expect(services[1]).toEqual(jasmine.objectContaining({ price: 40, durationMinutes: 40, active: true }));
      expect(barbers.map((b: { name: string }) => b.name)).toEqual(['João Mestre', 'Pedro Silva']);
      expect(barbers[0].userId).toBeUndefined();
    });

    it('restricts service management to admins', async () => {
      const payload = { name: 'Pigmentação', description: null, icon: 'P', category: 'barba', price: 50, durationMinutes: 30 };
      const asClient = await ctx.app.inject({ method: 'POST', url: '/api/admin/services', headers: ctx.auth(ctx.client), payload });
      expect(asClient.statusCode).toBe(403);

      const created = await ctx.app.inject({ method: 'POST', url: '/api/admin/services', headers: ctx.auth(ctx.admin), payload });
      expect(created.statusCode).toBe(201);
      const updated = await ctx.app.inject({
        method: 'PATCH', url: `/api/admin/services/${json(created).id}`, headers: ctx.auth(ctx.admin), payload: { active: false },
      });
      expect(json(updated).active).toBeFalse();

      const all = json(await ctx.app.inject({ method: 'GET', url: '/api/admin/services', headers: ctx.auth(ctx.admin) }));
      expect(all.length).toBe(3);
    });

    it('returns 404 for unknown services', async () => {
      const response = await ctx.app.inject({ method: 'PATCH', url: '/api/admin/services/missing', headers: ctx.auth(ctx.admin), payload: { price: 10 } });
      expect(response.statusCode).toBe(404);
    });

    it('reads and updates shop settings', async () => {
      expect(json(await ctx.app.inject({ method: 'GET', url: '/api/shop/settings' })).name).toBe('Navalha de Ouro');
      const forbidden = await ctx.app.inject({ method: 'PUT', url: '/api/admin/shop/settings', headers: ctx.auth(ctx.joao.user), payload: { name: 'X Shop' } });
      expect(forbidden.statusCode).toBe(403);
      const updated = await ctx.app.inject({ method: 'PUT', url: '/api/admin/shop/settings', headers: ctx.auth(ctx.admin), payload: { name: 'Barbearia Central' } });
      expect(json(updated).name).toBe('Barbearia Central');
    });

    it('lists clients for staff only', async () => {
      const forbidden = await ctx.app.inject({ method: 'GET', url: '/api/admin/clients', headers: ctx.auth(ctx.client) });
      expect(forbidden.statusCode).toBe(403);
      const clients = json(await ctx.app.inject({ method: 'GET', url: '/api/admin/clients', headers: ctx.auth(ctx.joao.user) }));
      expect(clients.map((c: { email: string }) => c.email)).toEqual(['ana@test.com', 'bruno@test.com']);
    });
  });

  describe('scheduling', () => {
    const book = (payload: object) => ctx.app.inject({ method: 'POST', url: '/api/appointments', headers: ctx.auth(ctx.client), payload });

    it('returns slots with shop time and UTC instant', async () => {
      const response = await ctx.app.inject({ method: 'GET', url: `/api/availability?date=2026-11-17&serviceId=corte&barberId=${ctx.joao.barber.id}` });
      const body = json(response);
      expect(body.date).toBe('2026-11-17');
      expect(body.slots[0]).toEqual({ time: '08:00', startsAt: '2026-11-17T11:00:00.000Z', available: true });
    });

    it('validates availability queries', async () => {
      const response = await ctx.app.inject({ method: 'GET', url: '/api/availability?date=17/11/2026&serviceId=corte' });
      expect(response.statusCode).toBe(400);
    });

    it('books, lists, reschedules and cancels an appointment', async () => {
      const created = await book({ serviceId: 'corte', startsAt: tuesdayAt('10:00').toISOString(), barberId: ctx.joao.barber.id });
      expect(created.statusCode).toBe(201);
      const appointment = json(created);
      expect(appointment.barber.name).toBe('João Mestre');

      const mine = json(await ctx.app.inject({ method: 'GET', url: '/api/appointments', headers: ctx.auth(ctx.client) }));
      expect(mine.map((a: { id: string }) => a.id)).toEqual([appointment.id]);

      const moved = await ctx.app.inject({
        method: 'PATCH', url: `/api/appointments/${appointment.id}`, headers: ctx.auth(ctx.client),
        payload: { startsAt: tuesdayAt('15:00').toISOString() },
      });
      expect(json(moved).startsAt).toBe(tuesdayAt('15:00').toISOString());

      const canceled = await ctx.app.inject({ method: 'DELETE', url: `/api/appointments/${appointment.id}`, headers: ctx.auth(ctx.client) });
      expect(canceled.statusCode).toBe(204);
    });

    it('returns 409 for a taken slot', async () => {
      const payload = { serviceId: 'corte', startsAt: tuesdayAt('10:00').toISOString(), barberId: ctx.joao.barber.id };
      await book(payload);
      const second = await ctx.app.inject({ method: 'POST', url: '/api/appointments', headers: ctx.auth(ctx.otherClient), payload });
      expect(second.statusCode).toBe(409);
      expect(json(second).error).toBe('SLOT_UNAVAILABLE');
    });

    it('requires a time zone in booking timestamps', async () => {
      const response = await book({ serviceId: 'corte', startsAt: '2026-11-17T10:00:00' });
      expect(response.statusCode).toBe(400);
    });

    it('only lets clients book', async () => {
      const response = await ctx.app.inject({
        method: 'POST', url: '/api/appointments', headers: ctx.auth(ctx.joao.user),
        payload: { serviceId: 'corte', startsAt: tuesdayAt('10:00').toISOString() },
      });
      expect(response.statusCode).toBe(403);
    });

    it('lets the barber confirm through the admin endpoint', async () => {
      const appointment = json(await book({ serviceId: 'corte', startsAt: tuesdayAt('10:00').toISOString(), barberId: ctx.joao.barber.id }));
      const forbidden = await ctx.app.inject({
        method: 'PATCH', url: `/api/admin/appointments/${appointment.id}`, headers: ctx.auth(ctx.pedro.user), payload: { status: 'CONFIRMED' },
      });
      expect(forbidden.statusCode).toBe(403);

      const confirmed = await ctx.app.inject({
        method: 'PATCH', url: `/api/admin/appointments/${appointment.id}`, headers: ctx.auth(ctx.joao.user), payload: { status: 'CONFIRMED' },
      });
      expect(json(confirmed).status).toBe('CONFIRMED');
    });

    it('rejects PENDING as a staff decision', async () => {
      const appointment = json(await book({ serviceId: 'corte', startsAt: tuesdayAt('10:00').toISOString() }));
      const response = await ctx.app.inject({
        method: 'PATCH', url: `/api/admin/appointments/${appointment.id}`, headers: ctx.auth(ctx.admin), payload: { status: 'PENDING' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('serves and updates barber schedules', async () => {
      const all = json(await ctx.app.inject({ method: 'GET', url: '/api/schedules' }));
      expect(all[0].days[0]).toEqual({ weekday: 1, openTime: '08:00', closeTime: '18:00' });

      const days = [{ weekday: 2, openTime: '09:00', closeTime: '12:00' }];
      const updated = await ctx.app.inject({ method: 'PUT', url: '/api/schedules/me', headers: ctx.auth(ctx.joao.user), payload: { days } });
      expect(json(updated)).toEqual({ barberId: ctx.joao.barber.id, days });
      const mine = await ctx.app.inject({ method: 'GET', url: '/api/schedules/me', headers: ctx.auth(ctx.joao.user) });
      expect(json(mine).days).toEqual(days);

      const invalid = await ctx.app.inject({
        method: 'PUT', url: '/api/schedules/me', headers: ctx.auth(ctx.joao.user), payload: { days: [{ weekday: 2, openTime: '9h', closeTime: '12:00' }] },
      });
      expect(invalid.statusCode).toBe(400);

      const byAdmin = await ctx.app.inject({ method: 'PUT', url: `/api/admin/schedules/${ctx.pedro.barber.id}`, headers: ctx.auth(ctx.admin), payload: { days: [] } });
      expect(json(byAdmin).days).toEqual([]);
    });

    it('returns 404 for staff without a barber profile', async () => {
      const response = await ctx.app.inject({ method: 'GET', url: '/api/schedules/me', headers: ctx.auth(ctx.admin) });
      expect(response.statusCode).toBe(404);
    });
  });
});
