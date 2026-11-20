import type { Actor } from '../../../shared/application/actor.js';
import type { AppointmentRepository, BookingUnitOfWork } from '../domain/repositories.js';
import type { AppointmentAccess } from './appointment-access.js';
import type { AppointmentNotifier } from './appointment-notifier.js';
import { requireAppointment } from './shared.js';

/** A client cancelling tells the barber; staff cancelling tells the client. */
export class CancelAppointment {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly unitOfWork: BookingUnitOfWork,
    private readonly access: AppointmentAccess,
    private readonly notifier: AppointmentNotifier,
  ) {}

  async execute(actor: Actor, id: string) {
    const { barberId } = await requireAppointment(this.appointments, id);
    await this.unitOfWork.runExclusively(barberId, async repo => {
      const appointment = await requireAppointment(repo, id);
      await this.access.assertCanAccess(actor, appointment);
      appointment.cancel();
      await repo.save(appointment);
    });
    await this.notifier.notify(actor.role === 'CLIENT' ? 'appointment.canceled_by_client' : 'appointment.canceled_by_barber', id);
  }
}
