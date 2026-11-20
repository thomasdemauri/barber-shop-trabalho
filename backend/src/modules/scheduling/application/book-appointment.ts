import type { Actor } from '../../../shared/application/actor.js';
import type { Clock } from '../../../shared/domain/clock.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { Appointment } from '../domain/appointment.js';
import type { BookingUnitOfWork, ScheduleRepository } from '../domain/repositories.js';
import type { ShopTimeZone } from '../domain/shop-time-zone.js';
import type { AppointmentNotifier } from './appointment-notifier.js';
import type { AppointmentQueries, BarberDirectory, ServiceCatalog } from './ports.js';
import { requireBookableService, requireView, saveIfSlotFree, slotUnavailable } from './shared.js';

export type BookAppointmentInput = { serviceId: string; startsAt: Date; barberId?: string; notes?: string };

export class BookAppointment {
  constructor(
    private readonly catalog: ServiceCatalog,
    private readonly barbers: BarberDirectory,
    private readonly schedules: ScheduleRepository,
    private readonly unitOfWork: BookingUnitOfWork,
    private readonly queries: AppointmentQueries,
    private readonly notifier: AppointmentNotifier,
    private readonly timeZone: ShopTimeZone,
    private readonly clock: Clock,
  ) {}

  /** Without a preferred barber, the first barber who works at that time and is free gets the booking. */
  async execute(actor: Actor, input: BookAppointmentInput) {
    const service = await requireBookableService(this.catalog, input.serviceId);
    const { date, time } = this.timeZone.toLocal(input.startsAt);
    const now = this.clock.now();

    for (const barberId of await this.candidateBarbers(input.barberId)) {
      const schedule = await this.schedules.findByBarberId(barberId);
      if (!schedule?.covers(date.weekday, time, service.durationMinutes)) continue;

      const appointment = Appointment.book({
        clientId: actor.userId,
        barberId,
        serviceId: service.id,
        durationMinutes: service.durationMinutes,
        startsAt: input.startsAt,
        notes: input.notes,
        now,
      });
      const reserved = await this.unitOfWork.runExclusively(barberId, repo => saveIfSlotFree(repo, appointment));
      if (!reserved) continue;

      await this.notifier.notify('appointment.booked', appointment.id);
      return requireView(this.queries, appointment.id);
    }

    throw slotUnavailable();
  }

  private async candidateBarbers(barberId: string | undefined) {
    if (!barberId) return this.barbers.listBarberIds();
    if (!(await this.barbers.exists(barberId))) throw new NotFoundError('Barbeiro');
    return [barberId];
  }
}
