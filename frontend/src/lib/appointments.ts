import type { Appointment } from '../api/types';
import { toDateKey } from './dates';

const byStart = (a: Appointment, b: Appointment) => a.startsAt.localeCompare(b.startsAt);

/** Appointments still holding a slot (pending or confirmed). */
export const isActive = (appointment: Appointment) => appointment.status === 'pending' || appointment.status === 'confirmed';

/** Active appointments that have not started yet, soonest first. */
export const upcomingFirst = (appointments: Appointment[], now: Date) =>
  appointments.filter(a => isActive(a) && new Date(a.startsAt) >= now).sort(byStart);

export const newestFirst = (appointments: Appointment[]) => [...appointments].sort((a, b) => byStart(b, a));

/** Past or closed appointments, most recent first. */
export const historyFirst = (appointments: Appointment[], now: Date) =>
  newestFirst(appointments.filter(a => !isActive(a) || new Date(a.startsAt) < now));

/** Appointments starting on a local calendar day, in time order. */
export const onDay = (appointments: Appointment[], dateKey: string) =>
  appointments.filter(a => toDateKey(new Date(a.startsAt)) === dateKey).sort(byStart);

/** Revenue of appointments that were not canceled. */
export const revenue = (appointments: Appointment[]) =>
  appointments.filter(a => a.status !== 'canceled').reduce((sum, a) => sum + a.service.price, 0);
