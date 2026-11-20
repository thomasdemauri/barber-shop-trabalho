import amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { processDelivery, type DeliveryOutcome, type DeliveryPolicy } from '../application/delivery-policy.js';
import type { DispatchNotification } from '../application/dispatch-notification.js';
import { assertTopology, CONSUMED_QUEUES, QUEUES } from './rabbitmq-topology.js';

export const ATTEMPTS_HEADER = 'x-delivery-attempts';
const PREFETCH = 10;

export type ConsumerLogger = {
  info(data: object, message: string): void;
  warn(data: object, message: string): void;
  error(data: object, message: string): void;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Reads the notification queues and hands each event to the dispatcher (at-least-once delivery). */
export class RabbitMqNotificationConsumer {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private inFlight = new Set<Promise<void>>();
  private stopping = false;

  constructor(
    private readonly url: string,
    private readonly dispatch: DispatchNotification,
    private readonly policy: DeliveryPolicy,
    private readonly log: ConsumerLogger,
    /** Called when the broker connection drops unexpectedly; the process supervisor should restart us. */
    private readonly onConnectionLost: () => void = () => undefined,
  ) {}

  async start() {
    this.connection = await amqp.connect(this.url);
    this.connection.on('close', () => {
      if (this.stopping) return;
      this.log.error({}, 'RabbitMQ connection lost');
      this.onConnectionLost();
    });
    const channel = await this.connection.createChannel();
    await assertTopology(channel);
    await channel.prefetch(PREFETCH);
    for (const queue of CONSUMED_QUEUES) {
      await channel.consume(queue, message => { if (message) this.track(this.handle(channel, queue, message)); });
    }
    this.channel = channel;
    this.log.info({ queues: CONSUMED_QUEUES }, 'notification worker consuming');
  }

  /** Stops taking new messages and waits for the ones being processed. */
  async stop() {
    this.stopping = true;
    await this.channel?.close().catch(() => undefined);
    await Promise.allSettled(this.inFlight);
    await this.connection?.close().catch(() => undefined);
    this.channel = null;
    this.connection = null;
  }

  private track(work: Promise<void>) {
    this.inFlight.add(work);
    void work.finally(() => this.inFlight.delete(work));
  }

  private async handle(channel: Channel, queue: string, message: ConsumeMessage) {
    const attempts = Number(message.properties.headers?.[ATTEMPTS_HEADER] ?? 0);
    const outcome = await processDelivery(message.content.toString('utf8'), attempts, this.dispatch, this.policy);
    const context = { queue, messageId: message.properties.messageId, type: message.properties.type };
    try {
      await this.apply(channel, queue, message, outcome, context);
    } catch (error) {
      // Channel gone (shutdown/reconnect): leave the message unacked so the broker redelivers it.
      this.log.error({ ...context, err: error }, 'could not settle notification message');
    }
  }

  private async apply(channel: Channel, queue: string, message: ConsumeMessage, outcome: DeliveryOutcome, context: object) {
    switch (outcome.action) {
      case 'ack':
        this.log.info(context, 'notification delivered');
        break;
      case 'retry':
        this.log.warn({ ...context, attempt: outcome.attempt, reason: outcome.reason }, 'notification failed, retrying');
        await sleep(outcome.delayMs);
        channel.sendToQueue(queue, message.content, {
          ...message.properties,
          headers: { ...message.properties.headers, [ATTEMPTS_HEADER]: outcome.attempt },
        });
        break;
      case 'dead-letter':
        this.log.error({ ...context, reason: outcome.reason }, 'notification moved to dead-letter queue');
        channel.sendToQueue(QUEUES.dead, message.content, {
          ...message.properties,
          headers: { ...message.properties.headers, 'x-dead-letter-reason': outcome.reason, 'x-original-queue': queue },
        });
        break;
    }
    channel.ack(message);
  }
}
