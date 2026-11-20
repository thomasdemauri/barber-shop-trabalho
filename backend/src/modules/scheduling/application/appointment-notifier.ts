import type { Clock } from '../../../shared/domain/clock.js';
import type { AppointmentEventName, NotificationPublisher } from '../../notifications/application/notification-publisher.js';
import type { AppointmentQueries } from './ports.js';

/** Turns appointment changes into self-contained notification events. */
export class AppointmentNotifier {
  constructor(
    private readonly queries: AppointmentQueries,
    private readonly publisher: NotificationPublisher,
    private readonly clock: Clock,
  ) {}

  async notify(event: AppointmentEventName, appointmentId: string) {
    const participants = await this.queries.findParticipants(appointmentId);
    if (!participants) return;
    await this.publisher.publish({ event, ...participants, occurredAt: this.clock.now().toISOString() });
  }
}
