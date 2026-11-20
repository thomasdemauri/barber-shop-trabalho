import { ValidationError } from '../../../shared/domain/errors.js';
import { CalendarDate, LocalTime } from './time.js';

/**
 * Converts between instants (stored in UTC) and the shop's wall-clock time.
 * Working hours such as "08:00" always mean 08:00 in the shop, wherever the server runs.
 */
export class ShopTimeZone {
  private readonly formatter: Intl.DateTimeFormat;

  constructor(readonly id: string) {
    try {
      this.formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: id,
        hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    } catch {
      throw new ValidationError(`Fuso horário inválido: ${id}`);
    }
  }

  toInstant(date: CalendarDate, time: LocalTime) {
    const wallClockAsUtc = Date.UTC(date.year, date.month - 1, date.day) + time.minutesOfDay * 60_000;
    const firstGuess = wallClockAsUtc - this.offsetMs(new Date(wallClockAsUtc));
    // Second pass corrects guesses that land on the other side of a DST transition.
    return new Date(wallClockAsUtc - this.offsetMs(new Date(firstGuess)));
  }

  toLocal(instant: Date) {
    const parts = this.parts(instant);
    return {
      date: CalendarDate.of(parts.year, parts.month, parts.day),
      time: LocalTime.ofMinutes(parts.hour * 60 + parts.minute),
    };
  }

  private offsetMs(instant: Date) {
    const p = this.parts(instant);
    const wallClockAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return wallClockAsUtc - Math.floor(instant.getTime() / 1000) * 1000;
  }

  private parts(instant: Date) {
    const values = Object.fromEntries(
      this.formatter.formatToParts(instant).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]),
    );
    return values as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>;
  }
}
