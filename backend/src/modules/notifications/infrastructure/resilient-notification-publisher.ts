import type { NotificationEvent, NotificationPublisher } from '../application/notification-publisher.js';

type ErrorLogger = (error: unknown, event: NotificationEvent) => void;

/**
 * Notifications are a side effect: a broker outage must never roll back or fail
 * the business operation that triggered them, so failures are logged and swallowed.
 */
export class ResilientNotificationPublisher implements NotificationPublisher {
  constructor(private readonly inner: NotificationPublisher, private readonly logError: ErrorLogger) {}

  async publish(event: NotificationEvent) {
    try {
      await this.inner.publish(event);
    } catch (error) {
      this.logError(error, event);
    }
  }

  close() {
    return this.inner.close();
  }
}
