import { LocalTime } from '../../src/modules/scheduling/domain/time.js';
import { WeeklySchedule } from '../../src/modules/scheduling/domain/weekly-schedule.js';
import { ValidationError } from '../../src/shared/domain/errors.js';

describe('WeeklySchedule', () => {
  const schedule = WeeklySchedule.create('barber-1', [
    { weekday: 3, openTime: '10:00', closeTime: '16:00' },
    { weekday: 1, openTime: '08:00', closeTime: '18:00' },
  ]);

  it('lists working days ordered by weekday', () => {
    expect(schedule.workingDays.map(day => day.weekday)).toEqual([1, 3]);
    expect(schedule.workingDayFor(3)?.opensAt.toString()).toBe('10:00');
    expect(schedule.workingDayFor(0)).toBeUndefined();
  });

  it('covers a service only when it fits entirely inside working hours', () => {
    expect(schedule.covers(1, LocalTime.parse('08:00'), 40)).toBeTrue();
    expect(schedule.covers(1, LocalTime.parse('17:20'), 40)).toBeTrue();
    expect(schedule.covers(1, LocalTime.parse('17:30'), 40)).toBeFalse();
    expect(schedule.covers(1, LocalTime.parse('07:30'), 40)).toBeFalse();
    expect(schedule.covers(2, LocalTime.parse('10:00'), 40)).toBeFalse();
  });

  it('rejects invalid days', () => {
    expect(() => WeeklySchedule.create('b', [{ weekday: 7, openTime: '08:00', closeTime: '18:00' }])).toThrowError(ValidationError);
    expect(() => WeeklySchedule.create('b', [{ weekday: 1, openTime: '18:00', closeTime: '08:00' }])).toThrowError(ValidationError);
    expect(() => WeeklySchedule.create('b', [
      { weekday: 1, openTime: '08:00', closeTime: '18:00' },
      { weekday: 1, openTime: '09:00', closeTime: '12:00' },
    ])).toThrowError(ValidationError);
  });

  it('allows an empty week (barber on leave)', () => {
    expect(WeeklySchedule.create('b', []).workingDays).toEqual([]);
  });
});
