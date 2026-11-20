import type { Channel } from 'amqplib';
import { APPOINTMENT_EVENTS, RECIPIENT_OF, type NotificationEvent } from '../domain/notification-event.js';

export const EXCHANGE = 'barbershop.notifications';
export const QUEUES = {
  barber: 'notifications.barber',
  client: 'notifications.client',
  email: 'notifications.email',
  /** Messages that failed every delivery attempt, kept for inspection. */
  dead: 'notifications.dead',
} as const;
export const CONSUMED_QUEUES = [QUEUES.barber, QUEUES.client, QUEUES.email];

export function routingKeyFor(event: NotificationEvent) {
  if (event.event === 'password.reset_requested') return `password.reset_requested.user.${event.userId}`;
  const recipient = RECIPIENT_OF[event.event];
  return `${event.event}.${recipient}.${event[recipient].id}`;
}

export const messageIdFor = (event: NotificationEvent) =>
  event.event === 'password.reset_requested' ? `${event.userId}:${event.expiresAt}` : `${event.appointmentId}:${event.event}`;

/** Idempotent: publisher and worker both declare it, whichever starts first. */
export async function assertTopology(channel: Channel) {
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  for (const queue of Object.values(QUEUES)) await channel.assertQueue(queue, { durable: true });
  for (const event of APPOINTMENT_EVENTS) {
    const queue = RECIPIENT_OF[event] === 'barber' ? QUEUES.barber : QUEUES.client;
    await channel.bindQueue(queue, EXCHANGE, `${event}.#`);
  }
  await channel.bindQueue(QUEUES.email, EXCHANGE, 'password.reset_requested.#');
}
