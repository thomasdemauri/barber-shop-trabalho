import { ValidationError } from '../../../shared/domain/errors.js';
import { LocalTime } from './time.js';

export type WorkingDay = { weekday: number; opensAt: LocalTime; closesAt: LocalTime };
export type WorkingDayInput = { weekday: number; openTime: string; closeTime: string };

function workingDay(input: WorkingDayInput): WorkingDay {
  if (!Number.isInteger(input.weekday) || input.weekday < 0 || input.weekday > 6) {
    throw new ValidationError('Dia da semana deve estar entre 0 (domingo) e 6 (sábado)');
  }
  const opensAt = LocalTime.parse(input.openTime);
  const closesAt = LocalTime.parse(input.closeTime);
  if (!opensAt.isBefore(closesAt)) throw new ValidationError('Horário de abertura deve ser anterior ao de fechamento');
  return { weekday: input.weekday, opensAt, closesAt };
}

/** The days and hours a barber accepts appointments. Days not listed are days off. */
export class WeeklySchedule {
  private constructor(readonly barberId: string, private readonly days: ReadonlyMap<number, WorkingDay>) {}

  static create(barberId: string, days: WorkingDayInput[]) {
    const byWeekday = new Map<number, WorkingDay>();
    for (const day of days.map(workingDay)) {
      if (byWeekday.has(day.weekday)) throw new ValidationError('Dia da semana repetido na escala');
      byWeekday.set(day.weekday, day);
    }
    return new WeeklySchedule(barberId, byWeekday);
  }

  get workingDays(): WorkingDay[] {
    return [...this.days.values()].sort((a, b) => a.weekday - b.weekday);
  }

  workingDayFor(weekday: number) {
    return this.days.get(weekday);
  }

  /** True when a service of the given duration fits entirely inside that day's hours. */
  covers(weekday: number, start: LocalTime, durationMinutes: number) {
    const day = this.days.get(weekday);
    if (!day || start.isBefore(day.opensAt)) return false;
    return start.minutesOfDay + durationMinutes <= day.closesAt.minutesOfDay;
  }
}
