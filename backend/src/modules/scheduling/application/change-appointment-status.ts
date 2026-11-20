import type { Actor } from '../../../shared/application/actor.js';
import type { AppointmentStatus } from '../domain/appointment.js';
import type { AppointmentRepository, BookingUnitOfWork } from '../domain/repositories.js';
import type { AppointmentAccess } from './appointment-access.js';
import type { AppointmentNotifier } from './appointment-notifier.js';
import type { AppointmentQueries } from './ports.js';
import { requireAppointment, requireView } from './shared.js';

export type StaffDecision = Exclude<AppointmentStatus, 'PENDING'>;

const EVENT_BY_DECISION = {
  CONFIRMED: 'appointment.confirmed',
  CANCELED: 'appointment.canceled_by_barber',
  COMPLETED: null,
} as const;

/** Barbers and admins confirm, cancel or complete appointments; the client hears about confirmations and cancellations. */
export class ChangeAppointmentStatus {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly unitOfWork: BookingUnitOfWork,
    private readonly queries: AppointmentQueries,
    private readonly access: AppointmentAccess,
    private readonly notifier: AppointmentNotifier,
  ) {}

  async execute(actor: Actor, id: string, status: StaffDecision) {
    const { barberId } = await requireAppointment(this.appointments, id);
    await this.unitOfWork.runExclusively(barberId, async repo => {
      const current = await requireAppointment(repo, id);
      await this.access.assertCanManage(actor, current);
      current.transitionTo(status);
      await repo.save(current);
    });

    const event = EVENT_BY_DECISION[status];
    if (event) await this.notifier.notify(event, id);
    return requireView(this.queries, id);
  }
}
