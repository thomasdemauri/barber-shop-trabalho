import { describe, expect, it } from 'vitest';
import { TIME_OPTIONS, toWeeklyHours, toWorkingDays } from './weekly-hours';

describe('weekly hours', () => {
  it('offers half-hour options from 06:00 to 22:00', () => {
    expect(TIME_OPTIONS[0]).toBe('06:00');
    expect(TIME_OPTIONS[1]).toBe('06:30');
    expect(TIME_OPTIONS.at(-1)).toBe('22:00');
  });

  it('converts between the API week and the uniform editor model', () => {
    const hours = toWeeklyHours({ barberId: 'b', days: [{ weekday: 1, openTime: '09:00', closeTime: '17:00' }, { weekday: 3, openTime: '09:00', closeTime: '17:00' }] });
    expect(hours).toEqual({ weekdays: [1, 3], openTime: '09:00', closeTime: '17:00' });
    expect(toWorkingDays({ ...hours, weekdays: [5, 1] })).toEqual([
      { weekday: 1, openTime: '09:00', closeTime: '17:00' },
      { weekday: 5, openTime: '09:00', closeTime: '17:00' },
    ]);
  });

  it('defaults an empty week to business hours', () => {
    expect(toWeeklyHours({ barberId: 'b', days: [] })).toEqual({ weekdays: [], openTime: '08:00', closeTime: '18:00' });
  });
});
