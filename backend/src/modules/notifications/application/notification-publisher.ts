import type { NotificationEvent } from '../domain/notification-event.js';

export type {
  AppointmentEventName,
  AppointmentNotification,
  NotificationEvent,
  PasswordResetNotification,
} from '../domain/notification-event.js';

/** Port used by the API to hand events to the message broker. */
export interface NotificationPublisher {
  publish(event: NotificationEvent): Promise<void>;
  close(): Promise<void>;
}
