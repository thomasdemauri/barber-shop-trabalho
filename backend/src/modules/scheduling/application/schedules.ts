import type { Actor } from '../../../shared/application/actor.js';
import { ForbiddenError, NotFoundError } from '../../../shared/domain/errors.js';
import type { ScheduleRepository } from '../domain/repositories.js';
import { WeeklySchedule, type WorkingDayInput } from '../domain/weekly-schedule.js';
import type { BarberDirectory } from './ports.js';

export class ListSchedules {
  constructor(private readonly schedules: ScheduleRepository) {}

  execute() {
    return this.schedules.list();
  }
}

export class GetMySchedule {
  constructor(private readonly schedules: ScheduleRepository, private readonly barbers: BarberDirectory) {}

  async execute(actor: Actor) {
    const barberId = await this.barbers.findBarberIdByUserId(actor.userId);
    if (!barberId) throw new NotFoundError('Perfil de barbeiro');
    return (await this.schedules.findByBarberId(barberId)) ?? WeeklySchedule.create(barberId, []);
  }
}

/** Admins edit any barber's schedule; barbers edit only their own. */
export class UpdateBarberSchedule {
  constructor(private readonly schedules: ScheduleRepository, private readonly barbers: BarberDirectory) {}

  async execute(actor: Actor, barberId: string, days: WorkingDayInput[]) {
    if (!(await this.barbers.exists(barberId))) throw new NotFoundError('Barbeiro');
    if (actor.role !== 'ADMIN' && await this.barbers.findBarberIdByUserId(actor.userId) !== barberId) {
      throw new ForbiddenError();
    }
    const schedule = WeeklySchedule.create(barberId, days);
    await this.schedules.save(schedule);
    return schedule;
  }

  async executeForSelf(actor: Actor, days: WorkingDayInput[]) {
    const barberId = await this.barbers.findBarberIdByUserId(actor.userId);
    if (!barberId) throw new NotFoundError('Perfil de barbeiro');
    return this.execute(actor, barberId, days);
  }
}
