import type { Clock } from '../../../shared/domain/clock.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { mergeSlots, slotsForDay } from '../domain/availability.js';
import type { AppointmentRepository, ScheduleRepository } from '../domain/repositories.js';
import type { ShopTimeZone } from '../domain/shop-time-zone.js';
import { CalendarDate, LocalTime } from '../domain/time.js';
import type { BarberDirectory, SchedulingSettings, ServiceCatalog } from './ports.js';
import { requireBookableService } from './shared.js';

/** `ignoreAppointmentId` lets a client rescheduling see their own current slot as free. */
export type AvailabilityQuery = { date: string; serviceId: string; barberId?: string; ignoreAppointmentId?: string };

export class GetAvailability {
  constructor(
    private readonly catalog: ServiceCatalog,
    private readonly barbers: BarberDirectory,
    private readonly schedules: ScheduleRepository,
    private readonly appointments: AppointmentRepository,
    private readonly timeZone: ShopTimeZone,
    private readonly settings: SchedulingSettings,
    private readonly clock: Clock,
  ) {}

  async execute(query: AvailabilityQuery) {
    const date = CalendarDate.parse(query.date);
    const service = await requireBookableService(this.catalog, query.serviceId);
    const barberIds = await this.candidateBarbers(query.barberId);

    const dayStart = this.timeZone.toInstant(date, LocalTime.ofMinutes(0));
    const dayEnd = this.timeZone.toInstant(date, LocalTime.ofMinutes(24 * 60));
    const [schedules, busy] = await Promise.all([
      Promise.all(barberIds.map(id => this.schedules.findByBarberId(id))),
      this.appointments.findActiveForBarbers(barberIds, dayStart, dayEnd),
    ]);

    const now = this.clock.now();
    const slotsPerBarber = barberIds.map((barberId, index) => slotsForDay({
      date,
      workingDay: schedules[index]?.workingDayFor(date.weekday),
      durationMinutes: service.durationMinutes,
      intervalMinutes: this.settings.slotIntervalMinutes,
      busy: busy.filter(appointment => appointment.barberId === barberId && appointment.id !== query.ignoreAppointmentId),
      now,
      timeZone: this.timeZone,
    }));

    return { date: date.toString(), slots: mergeSlots(slotsPerBarber) };
  }

  private async candidateBarbers(barberId: string | undefined) {
    if (!barberId) return this.barbers.listBarberIds();
    if (!(await this.barbers.exists(barberId))) throw new NotFoundError('Barbeiro');
    return [barberId];
  }
}
