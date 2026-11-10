export type ScheduleWindow = {
  weekday: number;
  openTime: string;
  closeTime: string;
  active?: boolean;
};

export function isTimeWithinRange(time: string, openTime: string, closeTime: string) {
  return time >= openTime && time <= closeTime;
}

export function isScheduleAvailable(schedule: ScheduleWindow | undefined, weekday: number, time: string) {
  return Boolean(
    schedule &&
    schedule.active !== false &&
    schedule.weekday === weekday &&
    isTimeWithinRange(time, schedule.openTime, schedule.closeTime),
  );
}

export function calculateEndTime(startsAt: Date, durationMinutes: number) {
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new Error('Duration must be a positive integer');
  }
  return new Date(startsAt.getTime() + durationMinutes * 60_000);
}

export function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

export function hasAppointmentConflict(
  candidate: { startsAt: Date; endsAt: Date; barberId?: string | null },
  existing: Array<{ startsAt: Date; endsAt: Date; barberId?: string | null; status: string }>,
) {
  return existing.some(appointment =>
    appointment.status !== 'CANCELED' &&
    appointment.status !== 'COMPLETED' &&
    appointment.barberId === candidate.barberId &&
    intervalsOverlap(candidate.startsAt, candidate.endsAt, appointment.startsAt, appointment.endsAt),
  );
}
