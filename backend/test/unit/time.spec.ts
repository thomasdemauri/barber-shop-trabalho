import { CalendarDate, LocalTime } from '../../src/modules/scheduling/domain/time.js';
import { ValidationError } from '../../src/shared/domain/errors.js';

describe('LocalTime', () => {
  it('parses and formats HH:MM', () => {
    expect(LocalTime.parse('08:30').minutesOfDay).toBe(510);
    expect(LocalTime.parse('08:30').toString()).toBe('08:30');
  });

  it('rejects malformed or out-of-range times', () => {
    for (const value of ['8:30', '24:00', '12:60', 'noon']) {
      expect(() => LocalTime.parse(value)).toThrowError(ValidationError);
    }
  });

  it('adds minutes and allows ending the day at 24:00', () => {
    expect(LocalTime.parse('23:30').plusMinutes(30).toString()).toBe('24:00');
    expect(() => LocalTime.parse('23:30').plusMinutes(31)).toThrowError(ValidationError);
  });

  it('compares times', () => {
    const morning = LocalTime.parse('09:00');
    const evening = LocalTime.parse('18:00');
    expect(morning.isBefore(evening)).toBeTrue();
    expect(evening.isAfter(morning)).toBeTrue();
    expect(morning.isBefore(morning)).toBeFalse();
  });
});

describe('CalendarDate', () => {
  it('parses a date and knows its weekday', () => {
    const date = CalendarDate.parse('2026-11-16');
    expect(date.toString()).toBe('2026-11-16');
    expect(date.weekday).toBe(1);
  });

  it('rejects impossible dates', () => {
    expect(() => CalendarDate.parse('2026-02-30')).toThrowError(ValidationError);
    expect(() => CalendarDate.parse('16/11/2026')).toThrowError(ValidationError);
  });
});
