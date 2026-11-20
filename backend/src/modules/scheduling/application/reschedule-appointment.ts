import type { Actor } from '../../../shared/application/actor.js';
import type { Clock } from '../../../shared/domain/clock.js';
import type { AppointmentRepository, BookingUnitOfWork, ScheduleRepository } from '../domain/repositories.js';
import type { ShopTimeZone } from '../domain/shop-time-zone.js';
import type { AppointmentAccess } from './appointment-access.js';
import type { AppointmentQueries, ServiceCatalog } from './ports.js';
import { requireAppointment, requireBookableService, requireView, saveIfSlotFree, slotUnavailable } from './shared.js';

export type RescheduleInput = { serviceId?: string; startsAt?: Date };

export class RescheduleAppointment {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly catalog: ServiceCatalog,
    private readonly schedules: ScheduleRepository,
    private readonly unitOfWork: BookingUnitOfWork,
    private readonly queries: AppointmentQueries,
    private readonly access: AppointmentAccess,
    private readonly timeZone: ShopTimeZone,
    private readonly clock: Clock,
  ) {}

  async execute(actor: Actor, id: string, input: RescheduleInput) {
    const { barberId } = await requireAppointment(this.appointments, id);

    const reserved = await this.unitOfWork.runExclusively(barberId, async repo => {
      const appointment = await requireAppointment(repo, id);
      await this.access.assertCanAccess(actor, appointment);

      const service = await requireBookableService(this.catalog, input.serviceId ?? appointment.serviceId);
      const startsAt = input.startsAt ?? appointment.startsAt;
      const { date, time } = this.timeZone.toLocal(startsAt);
      const schedule = await this.schedules.findByBarberId(barberId);
      if (!schedule?.covers(date.weekday, time, service.durationMinutes)) return false;

      appointment.reschedule({ serviceId: service.id, durationMinutes: service.durationMinutes, startsAt }, this.clock.now());
      return saveIfSlotFree(repo, appointment);
    });

    if (!reserved) throw slotUnavailable();
    return requireView(this.queries, id);
  }
}
