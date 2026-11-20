import { processDelivery, retryDelay } from '../../src/modules/notifications/application/delivery-policy.js';
import { DispatchNotification } from '../../src/modules/notifications/application/dispatch-notification.js';
import { EmailProviderNotConfiguredError, PermanentEmailError } from '../../src/modules/notifications/application/email-provider.js';
import { emailFor } from '../../src/modules/notifications/application/notification-templates.js';
import type { AppointmentEventName, NotificationEvent } from '../../src/modules/notifications/application/notification-publisher.js';
import { BrevoEmailProvider } from '../../src/modules/notifications/infrastructure/email/brevo-email-provider.js';
import { parseAddress } from '../../src/modules/notifications/infrastructure/email/email-address.js';
import { createEmailProvider } from '../../src/modules/notifications/infrastructure/email/create-email-provider.js';
import { InMemoryEmailProvider } from '../../src/modules/notifications/infrastructure/email/in-memory-email-provider.js';

const OPTIONS = { shopName: 'Navalha de Ouro', frontendUrl: 'http://localhost:5173', timeZone: 'America/Sao_Paulo' };

const appointment = (event: AppointmentEventName): NotificationEvent => ({
  event,
  appointmentId: 'a1',
  startsAt: '2026-11-17T13:00:00.000Z',
  endsAt: '2026-11-17T13:40:00.000Z',
  service: { name: 'Corte Clássico', price: 40 },
  client: { id: 'c1', name: 'Lucas Oliveira', email: 'lucas.oliveira@exemplo.test' },
  barber: { id: 'b1', name: 'João Mestre', email: 'joao.mestre@barbershop.com' },
  occurredAt: '2026-11-16T12:00:00.000Z',
});

const reset: NotificationEvent = {
  event: 'password.reset_requested',
  userId: 'u1',
  email: 'lucas.oliveira@exemplo.test',
  name: 'Lucas Oliveira',
  token: 'abc/123',
  expiresAt: '2026-11-16T13:00:00.000Z',
};

describe('notification templates', () => {
  it('tells the barber about new bookings and client cancellations', () => {
    const booked = emailFor(appointment('appointment.booked'), OPTIONS);
    expect(booked.to).toEqual({ name: 'João Mestre', email: 'joao.mestre@barbershop.com' });
    expect(booked.subject).toContain('Novo agendamento: Corte Clássico');
    expect(booked.text).toContain('Olá, João!');
    expect(booked.text).toContain('Lucas Oliveira agendou Corte Clássico (R$ 40,00)');
    expect(booked.text).toContain('http://localhost:5173/admin/agenda');

    const canceled = emailFor(appointment('appointment.canceled_by_client'), OPTIONS);
    expect(canceled.to.email).toBe('joao.mestre@barbershop.com');
    expect(canceled.subject).toContain('cancelado pelo cliente');
  });

  it('tells the client about confirmations and barber cancellations', () => {
    const confirmed = emailFor(appointment('appointment.confirmed'), OPTIONS);
    expect(confirmed.to.email).toBe('lucas.oliveira@exemplo.test');
    expect(confirmed.text).toContain('João Mestre confirmou');

    const canceled = emailFor(appointment('appointment.canceled_by_barber'), OPTIONS);
    expect(canceled.to.email).toBe('lucas.oliveira@exemplo.test');
    expect(canceled.text).toContain('foi cancelado pela barbearia');
  });

  it('writes dates in Portuguese in the shop time zone', () => {
    // 13:00 UTC is 10:00 in São Paulo.
    expect(emailFor(appointment('appointment.confirmed'), OPTIONS).subject).toContain('terça-feira, 17 de novembro de 2026 às 10:00');
  });

  it('sends the reset link with an encoded token', () => {
    const email = emailFor(reset, OPTIONS);
    expect(email.to.email).toBe('lucas.oliveira@exemplo.test');
    expect(email.text).toContain('http://localhost:5173/reset-password?token=abc%2F123');
    expect(email.category).toBe('password.reset_requested');
  });

  it('escapes user-provided text in HTML', () => {
    const event = { ...appointment('appointment.booked'), client: { id: 'c', name: '<script>x</script>', email: 'x@exemplo.test' } } as NotificationEvent;
    const email = emailFor(event, OPTIONS);
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
  });

  it('derives a stable idempotency key per event occurrence', () => {
    expect(emailFor(appointment('appointment.booked'), OPTIONS).idempotencyKey)
      .toBe(emailFor(appointment('appointment.booked'), OPTIONS).idempotencyKey);
    expect(emailFor(appointment('appointment.booked'), OPTIONS).idempotencyKey)
      .not.toBe(emailFor(appointment('appointment.confirmed'), OPTIONS).idempotencyKey);
  });
});

describe('processDelivery', () => {
  const policy = { maxAttempts: 3, baseDelayMs: 100 };
  let provider: InMemoryEmailProvider;
  let dispatch: DispatchNotification;

  beforeEach(() => {
    provider = new InMemoryEmailProvider();
    dispatch = new DispatchNotification(provider, OPTIONS);
  });

  it('acknowledges after sending', async () => {
    await expectAsync(processDelivery(JSON.stringify(appointment('appointment.booked')), 0, dispatch, policy)).toBeResolvedTo({ action: 'ack' });
    expect(provider.sent.length).toBe(1);
  });

  it('dead-letters messages that can never succeed', async () => {
    expect((await processDelivery('{not json', 0, dispatch, policy)).action).toBe('dead-letter');
    const unknown = await processDelivery(JSON.stringify({ event: 'appointment.exploded' }), 0, dispatch, policy);
    expect(unknown.action).toBe('dead-letter');
    expect(provider.sent.length).toBe(0);
  });

  it('retries failed sends with exponential back-off', async () => {
    provider.failNext(1);
    await expectAsync(processDelivery(JSON.stringify(reset), 1, dispatch, policy))
      .toBeResolvedTo({ action: 'retry', attempt: 2, delayMs: 200, reason: 'simulated provider outage' });
    expect(retryDelay(3, 100)).toBe(400);
  });

  it('gives up after the last attempt', async () => {
    provider.failNext(1);
    expect((await processDelivery(JSON.stringify(reset), 2, dispatch, policy)).action).toBe('dead-letter');
  });

  it('dead-letters at once when the provider rejects the message for good', async () => {
    provider.failNext(1, new PermanentEmailError('brevo', '400 invalid_parameter: sender not valid'));
    await expectAsync(processDelivery(JSON.stringify(reset), 0, dispatch, policy)).toBeResolvedTo({
      action: 'dead-letter',
      reason: 'Email provider "brevo" rejected the message: 400 invalid_parameter: sender not valid',
    });
  });
});

describe('email providers', () => {
  const message = emailFor(reset, OPTIONS);

  it('simulates sending in memory, logging and ignoring duplicates', async () => {
    const logged: string[] = [];
    const provider = new InMemoryEmailProvider(sent => logged.push(sent.subject));
    await provider.verify();

    const first = await provider.send(message);
    const again = await provider.send(message);
    expect(again).toEqual(first);
    expect(provider.sent.length).toBe(1);
    expect(logged).toEqual(['Redefinição de senha']);

    provider.clear();
    expect(provider.sent.length).toBe(0);
  });

  it('can simulate outages', async () => {
    const provider = new InMemoryEmailProvider();
    provider.failNext(2);
    await expectAsync(provider.send(message)).toBeRejected();
    await expectAsync(provider.send(message)).toBeRejected();
    await expectAsync(provider.send(message)).toBeResolved();
  });

  it('builds the configured provider', () => {
    const base = { from: 'x', apiKey: undefined, logSimulated: () => undefined };
    expect(createEmailProvider({ ...base, provider: 'memory' }).name).toBe('memory');
    expect(createEmailProvider({ ...base, provider: 'brevo' }).name).toBe('brevo');
  });
});

describe('parseAddress', () => {
  it('reads named and bare addresses', () => {
    expect(parseAddress('Navalha de Ouro <barbearia@gmail.com>')).toEqual({ name: 'Navalha de Ouro', email: 'barbearia@gmail.com' });
    expect(parseAddress('"Navalha" <barbearia@gmail.com>')).toEqual({ name: 'Navalha', email: 'barbearia@gmail.com' });
    expect(parseAddress('barbearia@gmail.com')).toEqual({ name: '', email: 'barbearia@gmail.com' });
    expect(() => parseAddress('Navalha de Ouro')).toThrowError(/Invalid e-mail address/);
  });
});

describe('BrevoEmailProvider', () => {
  const message = emailFor(appointment('appointment.confirmed'), OPTIONS);
  type Call = { url: string; init: RequestInit };

  /** Fake `fetch` answering every call with the given status and JSON body. */
  const fakeFetch = (status: number, body: unknown) => {
    const calls: Call[] = [];
    const fetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    }) as unknown as typeof globalThis.fetch;
    return { calls, fetch };
  };

  const providerWith = (fake: { fetch: typeof fetch }, apiKey = 'xkeysib-test') =>
    new BrevoEmailProvider({ apiKey, from: 'Navalha de Ouro <barbearia@gmail.com>', fetch: fake.fetch });

  it('posts a transactional e-mail with the key, sender and tag', async () => {
    const fake = fakeFetch(201, { messageId: '<id@smtp-relay.mailin.fr>' });
    await expectAsync(providerWith(fake).send(message)).toBeResolvedTo({ provider: 'brevo', messageId: '<id@smtp-relay.mailin.fr>' });

    const [call] = fake.calls;
    expect(call.url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(call.init.method).toBe('POST');
    expect((call.init.headers as Record<string, string>)['api-key']).toBe('xkeysib-test');
    expect(JSON.parse(call.init.body as string)).toEqual({
      sender: { name: 'Navalha de Ouro', email: 'barbearia@gmail.com' },
      to: [{ email: 'lucas.oliveira@exemplo.test', name: 'Lucas Oliveira' }],
      subject: message.subject,
      textContent: message.text,
      htmlContent: message.html,
      tags: ['appointment.confirmed'],
      headers: { 'X-Notification-Id': message.idempotencyKey },
    });
  });

  it('treats request errors as permanent and the rest as retryable', async () => {
    await expectAsync(providerWith(fakeFetch(400, { code: 'invalid_parameter', message: 'sender is not valid' })).send(message))
      .toBeRejectedWithError(PermanentEmailError, /400 invalid_parameter: sender is not valid/);
    for (const status of [402, 429, 500]) {
      const error = await providerWith(fakeFetch(status, { code: 'x', message: 'try later' })).send(message).catch(e => e);
      expect(error).toEqual(jasmine.any(Error));
      expect(error).not.toEqual(jasmine.any(PermanentEmailError));
    }
  });

  it('checks the key at start-up', async () => {
    const ok = fakeFetch(200, { email: 'owner@gmail.com' });
    await expectAsync(providerWith(ok).verify()).toBeResolved();
    expect(ok.calls[0].url).toBe('https://api.brevo.com/v3/account');

    await expectAsync(providerWith(fakeFetch(200, {}), '').verify()).toBeRejectedWithError(EmailProviderNotConfiguredError, /BREVO_API_KEY/);
    await expectAsync(providerWith(fakeFetch(401, { code: 'unauthorized', message: 'unrecognised IP address' })).verify())
      .toBeRejectedWithError(EmailProviderNotConfiguredError, /401 unrecognised IP address/);
  });
});
