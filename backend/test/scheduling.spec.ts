import {
  calculateEndTime,
  hasAppointmentConflict,
  intervalsOverlap,
  isScheduleAvailable,
  isTimeWithinRange,
} from '../src/domain/scheduling.js';

describe('scheduling rules', () => {
  it('accepts times inside an inclusive schedule window', () => {
    expect(isTimeWithinRange('08:00', '08:00', '18:00')).toBeTrue();
    expect(isTimeWithinRange('18:00', '08:00', '18:00')).toBeTrue();
    expect(isTimeWithinRange('18:30', '08:00', '18:00')).toBeFalse();
  });

  it('checks weekday, active state, and time together', () => {
    const schedule = { weekday: 1, openTime: '08:00', closeTime: '18:00' };

    expect(isScheduleAvailable(schedule, 1, '10:00')).toBeTrue();
    expect(isScheduleAvailable(schedule, 0, '10:00')).toBeFalse();
    expect(isScheduleAvailable({ ...schedule, active: false }, 1, '10:00')).toBeFalse();
  });

  it('calculates appointment end times from service duration', () => {
    const start = new Date('2026-11-10T10:00:00.000Z');

    expect(calculateEndTime(start, 70).toISOString()).toBe('2026-11-10T11:10:00.000Z');
    expect(() => calculateEndTime(start, 0)).toThrowError();
  });

  it('detects overlapping half-open intervals', () => {
    const start = new Date('2026-11-10T10:00:00.000Z');
    const end = new Date('2026-11-10T11:00:00.000Z');

    expect(intervalsOverlap(start, end, new Date('2026-11-10T10:30:00.000Z'), new Date('2026-11-10T11:30:00.000Z'))).toBeTrue();
    expect(intervalsOverlap(start, end, end, new Date('2026-11-10T12:00:00.000Z'))).toBeFalse();
  });

  it('only conflicts with active appointments for the same barber', () => {
    const candidate = {
      barberId: 'barber-1',
      startsAt: new Date('2026-11-10T10:30:00.000Z'),
      endsAt: new Date('2026-11-10T11:30:00.000Z'),
    };
    const existing = [
      { barberId: 'barber-1', startsAt: new Date('2026-11-10T10:00:00.000Z'), endsAt: new Date('2026-11-10T11:00:00.000Z'), status: 'PENDING' },
      { barberId: 'barber-1', startsAt: new Date('2026-11-10T10:00:00.000Z'), endsAt: new Date('2026-11-10T11:00:00.000Z'), status: 'CANCELED' },
      { barberId: 'barber-2', startsAt: new Date('2026-11-10T10:00:00.000Z'), endsAt: new Date('2026-11-10T11:00:00.000Z'), status: 'CONFIRMED' },
    ];

    expect(hasAppointmentConflict(candidate, existing)).toBeTrue();
    expect(hasAppointmentConflict(candidate, existing.slice(1))).toBeFalse();
  });
});
