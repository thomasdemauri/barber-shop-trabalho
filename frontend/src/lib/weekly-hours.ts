import type { BarberSchedule } from '../api/types';

/** Every half hour from 06:00 to 22:00. */
export const TIME_OPTIONS = Array.from({ length: 33 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

/** The screen edits one opening window applied to every selected weekday. */
export type WeeklyHours = { weekdays: number[]; openTime: string; closeTime: string };

export function toWeeklyHours(schedule: BarberSchedule): WeeklyHours {
  const [first] = schedule.days;
  return {
    weekdays: schedule.days.map(day => day.weekday),
    openTime: first?.openTime ?? '08:00',
    closeTime: first?.closeTime ?? '18:00',
  };
}

export const toWorkingDays = ({ weekdays, openTime, closeTime }: WeeklyHours) =>
  [...weekdays].sort((a, b) => a - b).map(weekday => ({ weekday, openTime, closeTime }));
