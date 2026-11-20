import { ValidationError } from '../../../shared/domain/errors.js';

const MINUTES_PER_DAY = 24 * 60;
const pad = (value: number) => String(value).padStart(2, '0');

/** Wall-clock time of day ("HH:MM"), independent of any date or time zone. */
export class LocalTime {
  private constructor(readonly minutesOfDay: number) {}

  static parse(value: string) {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    const hours = Number(match?.[1]);
    const minutes = Number(match?.[2]);
    if (!match || hours > 23 || minutes > 59) throw new ValidationError(`Horário inválido: ${value}`);
    return new LocalTime(hours * 60 + minutes);
  }

  /** Accepts 24:00 so that a working day can end at midnight. */
  static ofMinutes(minutesOfDay: number) {
    if (!Number.isInteger(minutesOfDay) || minutesOfDay < 0 || minutesOfDay > MINUTES_PER_DAY) {
      throw new ValidationError('Horário fora do dia');
    }
    return new LocalTime(minutesOfDay);
  }

  plusMinutes(minutes: number) {
    return LocalTime.ofMinutes(this.minutesOfDay + minutes);
  }

  isBefore(other: LocalTime) {
    return this.minutesOfDay < other.minutesOfDay;
  }

  isAfter(other: LocalTime) {
    return this.minutesOfDay > other.minutesOfDay;
  }

  toString() {
    return `${pad(Math.floor(this.minutesOfDay / 60))}:${pad(this.minutesOfDay % 60)}`;
  }
}

/** A day in the calendar ("YYYY-MM-DD") without time or zone. */
export class CalendarDate {
  private constructor(readonly year: number, readonly month: number, readonly day: number) {}

  static parse(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) throw new ValidationError(`Data inválida: ${value}`);
    return CalendarDate.of(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  static of(year: number, month: number, day: number) {
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
      throw new ValidationError(`Data inválida: ${year}-${month}-${day}`);
    }
    return new CalendarDate(year, month, day);
  }

  /** 0 = Sunday … 6 = Saturday. */
  get weekday() {
    return new Date(Date.UTC(this.year, this.month - 1, this.day)).getUTCDay();
  }

  toString() {
    return `${this.year}-${pad(this.month)}-${pad(this.day)}`;
  }
}
