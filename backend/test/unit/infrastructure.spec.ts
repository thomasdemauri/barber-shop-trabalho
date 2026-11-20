import { Argon2PasswordHasher } from '../../src/modules/identity/infrastructure/argon2-password-hasher.js';
import { messageIdFor, routingKeyFor } from '../../src/modules/notifications/infrastructure/rabbitmq-topology.js';
import { ResilientNotificationPublisher } from '../../src/modules/notifications/infrastructure/resilient-notification-publisher.js';
import type { AppointmentEventName, NotificationEvent } from '../../src/modules/notifications/application/notification-publisher.js';
import { loadConfig, loadWorkerConfig } from '../../src/config.js';

const appointmentEvent = (event: AppointmentEventName): NotificationEvent => ({
  event,
  appointmentId: 'a1',
  startsAt: '2026-11-17T11:00:00.000Z',
  endsAt: '2026-11-17T11:40:00.000Z',
  service: { name: 'Corte', price: 40 },
  client: { id: 'c1', name: 'Ana', email: 'ana@test.com' },
  barber: { id: 'b1', name: 'João', email: 'joao@shop.com' },
  occurredAt: '2026-11-16T12:00:00.000Z',
});

describe('Argon2PasswordHasher', () => {
  const hasher = new Argon2PasswordHasher();

  it('hashes without retaining the plaintext and verifies it', async () => {
    const hash = await hasher.hash('S3cret-password');
    expect(hash.startsWith('$argon2')).toBeTrue();
    await expectAsync(hasher.verify(hash, 'S3cret-password')).toBeResolvedTo(true);
    await expectAsync(hasher.verify(hash, 'wrong-password')).toBeResolvedTo(false);
  });
});

describe('RabbitMQ routing', () => {
  it('routes bookings and client cancellations to the barber', () => {
    expect(routingKeyFor(appointmentEvent('appointment.booked'))).toBe('appointment.booked.barber.b1');
    expect(routingKeyFor(appointmentEvent('appointment.canceled_by_client'))).toBe('appointment.canceled_by_client.barber.b1');
  });

  it('routes barber decisions to the client', () => {
    expect(routingKeyFor(appointmentEvent('appointment.confirmed'))).toBe('appointment.confirmed.client.c1');
    expect(routingKeyFor(appointmentEvent('appointment.canceled_by_barber'))).toBe('appointment.canceled_by_barber.client.c1');
  });

  it('routes password reset requests to the email queue key', () => {
    const event: NotificationEvent = {
      event: 'password.reset_requested', userId: 'u1', email: 'a@b.co', name: 'A', token: 't', expiresAt: '2026-11-16T13:00:00.000Z',
    };
    expect(routingKeyFor(event)).toBe('password.reset_requested.user.u1');
    expect(messageIdFor(event)).toBe('u1:2026-11-16T13:00:00.000Z');
    expect(messageIdFor(appointmentEvent('appointment.booked'))).toBe('a1:appointment.booked');
  });
});

describe('ResilientNotificationPublisher', () => {
  it('logs and swallows broker failures', async () => {
    const failing = { publish: () => Promise.reject(new Error('broker down')), close: () => Promise.resolve() };
    const logged: unknown[] = [];
    const publisher = new ResilientNotificationPublisher(failing, error => logged.push(error));

    await expectAsync(publisher.publish(appointmentEvent('appointment.booked'))).toBeResolved();
    expect((logged[0] as Error).message).toBe('broker down');
  });
});

describe('loadConfig', () => {
  it('applies defaults for local development', () => {
    const config = loadConfig({});
    expect(config.port).toBe(3333);
    expect(config.corsOrigin).toBeTrue();
    expect(config.shopTimeZone).toBe('America/Sao_Paulo');
    expect(config.slotIntervalMinutes).toBe(30);
  });

  it('parses a comma separated CORS list', () => {
    expect(loadConfig({ CORS_ORIGIN: 'http://a.com, http://b.com' }).corsOrigin).toEqual(['http://a.com', 'http://b.com']);
  });

  it('refuses to start in production without a JWT secret', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrowError(/JWT_SECRET/);
  });
});

describe('loadWorkerConfig', () => {
  it('defaults to the simulated provider', () => {
    const config = loadWorkerConfig({});
    expect(config.emailProvider).toBe('memory');
    expect(config.maxAttempts).toBe(5);
    expect(config.frontendUrl).toBe('http://localhost:5173');
  });

  it('normalises the frontend URL and treats an empty API key as missing', () => {
    const config = loadWorkerConfig({ FRONTEND_URL: 'https://barbearia.app/', BREVO_API_KEY: '' });
    expect(config.frontendUrl).toBe('https://barbearia.app');
    expect(config.emailApiKey).toBeUndefined();
  });

  it('rejects unknown providers', () => {
    expect(() => loadWorkerConfig({ EMAIL_PROVIDER: 'pigeon' })).toThrowError(/EMAIL_PROVIDER/);
  });
});
