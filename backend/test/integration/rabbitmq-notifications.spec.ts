import amqp from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';
import { DispatchNotification } from '../../src/modules/notifications/application/dispatch-notification.js';
import type { NotificationEvent } from '../../src/modules/notifications/application/notification-publisher.js';
import { InMemoryEmailProvider } from '../../src/modules/notifications/infrastructure/email/in-memory-email-provider.js';
import { RabbitMqNotificationConsumer } from '../../src/modules/notifications/infrastructure/rabbitmq-notification-consumer.js';
import { RabbitMqNotificationPublisher } from '../../src/modules/notifications/infrastructure/rabbitmq-notification-publisher.js';
import { assertTopology, QUEUES } from '../../src/modules/notifications/infrastructure/rabbitmq-topology.js';

/**
 * Publisher → RabbitMQ → worker, end to end. Skipped unless TEST_RABBITMQ_URL is set, e.g.
 *   TEST_RABBITMQ_URL=amqp://guest:guest@localhost:5673 npm test
 * Uses a disposable broker: the notification queues are purged.
 */
const brokerUrl = process.env.TEST_RABBITMQ_URL;
const describeWithBroker = brokerUrl ? describe : xdescribe;

const silent = { info: () => undefined, warn: () => undefined, error: () => undefined };
const booked: NotificationEvent = {
  event: 'appointment.booked',
  appointmentId: 'a1',
  startsAt: '2026-11-17T13:00:00.000Z',
  endsAt: '2026-11-17T13:40:00.000Z',
  service: { name: 'Corte Clássico', price: 40 },
  client: { id: 'c1', name: 'Lucas Oliveira', email: 'lucas.oliveira@exemplo.test' },
  barber: { id: 'b1', name: 'João Mestre', email: 'joao.mestre@barbershop.com' },
  occurredAt: '2026-11-16T12:00:00.000Z',
};

async function eventually(check: () => boolean | Promise<boolean>, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (!(await check())) {
    if (Date.now() > deadline) throw new Error('condition not met in time');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

describeWithBroker('RabbitMQ notifications (broker)', () => {
  let admin: ChannelModel;
  let channel: Channel;
  let publisher: RabbitMqNotificationPublisher;
  let provider: InMemoryEmailProvider;
  let consumer: RabbitMqNotificationConsumer;

  beforeEach(async () => {
    admin = await amqp.connect(brokerUrl!);
    channel = await admin.createChannel();
    await assertTopology(channel);
    for (const queue of Object.values(QUEUES)) await channel.purgeQueue(queue);

    publisher = new RabbitMqNotificationPublisher(brokerUrl!);
    provider = new InMemoryEmailProvider();
    const dispatch = new DispatchNotification(provider, { shopName: 'Navalha de Ouro', frontendUrl: 'http://app', timeZone: 'America/Sao_Paulo' });
    consumer = new RabbitMqNotificationConsumer(brokerUrl!, dispatch, { maxAttempts: 3, baseDelayMs: 10 }, silent);
    await consumer.start();
  });

  afterEach(async () => {
    await consumer.stop();
    await publisher.close();
    await admin.close();
  });

  it('delivers every appointment event to the right person', async () => {
    await publisher.publish(booked);
    await publisher.publish({ ...booked, event: 'appointment.confirmed' });
    await publisher.publish({ ...booked, event: 'appointment.canceled_by_client' });
    await publisher.publish({ ...booked, event: 'appointment.canceled_by_barber' });

    await eventually(() => provider.sent.length === 4);
    const recipients = Object.fromEntries(provider.sent.map(email => [email.category, email.to.email]));
    expect(recipients).toEqual({
      'appointment.booked': 'joao.mestre@barbershop.com',
      'appointment.canceled_by_client': 'joao.mestre@barbershop.com',
      'appointment.confirmed': 'lucas.oliveira@exemplo.test',
      'appointment.canceled_by_barber': 'lucas.oliveira@exemplo.test',
    });
  });

  it('delivers password reset links', async () => {
    await publisher.publish({
      event: 'password.reset_requested', userId: 'u1', email: 'lucas.oliveira@exemplo.test', name: 'Lucas', token: 'tok', expiresAt: '2026-11-16T13:00:00.000Z',
    });
    await eventually(() => provider.sent.length === 1);
    expect(provider.sent[0].text).toContain('http://app/reset-password?token=tok');
  });

  it('retries after a provider outage and sends exactly once', async () => {
    provider.failNext(2);
    await publisher.publish(booked);
    await eventually(() => provider.sent.length === 1);
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(provider.sent.length).toBe(1);
  });

  it('moves undeliverable messages to the dead-letter queue', async () => {
    channel.sendToQueue(QUEUES.barber, Buffer.from('{"event":"nonsense"}'));
    provider.failNext(3);
    await publisher.publish(booked);

    await eventually(async () => (await channel.checkQueue(QUEUES.dead)).messageCount === 2);
    expect(provider.sent.length).toBe(0);
  });
});
