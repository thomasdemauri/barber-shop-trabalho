import amqp from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';
import type { NotificationEvent, NotificationPublisher } from '../application/notification-publisher.js';
import { assertTopology, EXCHANGE, messageIdFor, routingKeyFor } from './rabbitmq-topology.js';

export class RabbitMqNotificationPublisher implements NotificationPublisher {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(private readonly url: string) {}

  async publish(event: NotificationEvent) {
    const channel = await this.getChannel();
    channel.publish(EXCHANGE, routingKeyFor(event), Buffer.from(JSON.stringify(event)), {
      persistent: true,
      contentType: 'application/json',
      messageId: messageIdFor(event),
      type: event.event,
    });
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
    this.channel = null;
    this.connection = null;
  }

  private async getChannel() {
    if (this.channel) return this.channel;
    this.connection = await amqp.connect(this.url);
    // Forget a dropped connection so the next publish reconnects.
    this.connection.on('close', () => { this.connection = null; this.channel = null; });
    const channel = await this.connection.createChannel();
    await assertTopology(channel);
    this.channel = channel;
    return channel;
  }
}
