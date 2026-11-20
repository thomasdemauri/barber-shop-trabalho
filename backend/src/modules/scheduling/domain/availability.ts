import type { ShopTimeZone } from './shop-time-zone.js';
import type { CalendarDate, LocalTime } from './time.js';
import type { WorkingDay } from './weekly-schedule.js';

export type BusyInterval = { startsAt: Date; endsAt: Date };
export type Slot = { time: LocalTime; startsAt: Date; available: boolean };

export type DaySlotsInput = {
  date: CalendarDate;
  workingDay: WorkingDay | undefined;
  durationMinutes: number;
  intervalMinutes: number;
  busy: BusyInterval[];
  now: Date;
  timeZone: ShopTimeZone;
};

/** Every start time in the working day where the whole service fits before closing. */
export function slotsForDay(input: DaySlotsInput): Slot[] {
  const { workingDay, durationMinutes, intervalMinutes } = input;
  if (!workingDay) return [];

  const slots: Slot[] = [];
  const lastStart = workingDay.closesAt.minutesOfDay - durationMinutes;
  for (let minute = workingDay.opensAt.minutesOfDay; minute <= lastStart; minute += intervalMinutes) {
    const time = workingDay.opensAt.plusMinutes(minute - workingDay.opensAt.minutesOfDay);
    const startsAt = input.timeZone.toInstant(input.date, time);
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
    const free = !input.busy.some(busy => busy.startsAt < endsAt && busy.endsAt > startsAt);
    slots.push({ time, startsAt, available: startsAt > input.now && free });
  }
  return slots;
}

/** Combines barbers' slots: a time is available when at least one barber is free. */
export function mergeSlots(slotsPerBarber: Slot[][]): Slot[] {
  const byTime = new Map<number, Slot>();
  for (const slot of slotsPerBarber.flat()) {
    const existing = byTime.get(slot.time.minutesOfDay);
    if (!existing || (!existing.available && slot.available)) byTime.set(slot.time.minutesOfDay, slot);
  }
  return [...byTime.values()].sort((a, b) => a.time.minutesOfDay - b.time.minutesOfDay);
}
