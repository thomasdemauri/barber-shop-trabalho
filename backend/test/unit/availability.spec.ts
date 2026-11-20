import { mergeSlots, slotsForDay, type Slot } from '../../src/modules/scheduling/domain/availability.js';
import { ShopTimeZone } from '../../src/modules/scheduling/domain/shop-time-zone.js';
import { CalendarDate, LocalTime } from '../../src/modules/scheduling/domain/time.js';

const timeZone = new ShopTimeZone('America/Sao_Paulo');
const date = CalendarDate.parse('2026-11-17');
const workingDay = { weekday: 2, opensAt: LocalTime.parse('08:00'), closesAt: LocalTime.parse('10:00') };
const base = { date, workingDay, durationMinutes: 40, intervalMinutes: 30, busy: [], now: new Date('2026-11-16T12:00:00.000Z'), timeZone };
const times = (slots: Slot[]) => slots.map(slot => `${slot.time}${slot.available ? '' : '*'}`);

describe('slotsForDay', () => {
  it('offers every interval start where the service ends before closing', () => {
    const slots = slotsForDay(base);
    expect(times(slots)).toEqual(['08:00', '08:30', '09:00']);
    expect(slots[0].startsAt.toISOString()).toBe('2026-11-17T11:00:00.000Z');
  });

  it('returns nothing on a day off', () => {
    expect(slotsForDay({ ...base, workingDay: undefined })).toEqual([]);
  });

  it('marks slots overlapping existing appointments as unavailable', () => {
    const busy = [{ startsAt: new Date('2026-11-17T11:30:00.000Z'), endsAt: new Date('2026-11-17T12:10:00.000Z') }];
    expect(times(slotsForDay({ ...base, busy }))).toEqual(['08:00*', '08:30*', '09:00*']);
  });

  it('marks slots that already started as unavailable', () => {
    expect(times(slotsForDay({ ...base, now: new Date('2026-11-17T11:15:00.000Z') }))).toEqual(['08:00*', '08:30', '09:00']);
  });
});

describe('mergeSlots', () => {
  it('treats a time as available when any barber is free', () => {
    const busyAtEight = [{ startsAt: new Date('2026-11-17T11:00:00.000Z'), endsAt: new Date('2026-11-17T11:30:00.000Z') }];
    const first = slotsForDay({ ...base, busy: busyAtEight });
    const second = slotsForDay({ ...base, workingDay: { ...workingDay, closesAt: LocalTime.parse('11:00') } });
    expect(times(mergeSlots([first, second]))).toEqual(['08:00', '08:30', '09:00', '09:30', '10:00']);
    expect(times(mergeSlots([first]))).toEqual(['08:00*', '08:30', '09:00']);
  });
});
