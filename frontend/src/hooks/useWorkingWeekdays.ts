import { useEffect, useMemo, useState } from 'react';
import { schedulingApi } from '../api/endpoints';
import type { BarberSchedule } from '../api/types';

/** Weekdays (0 = Sunday) on which the barber — or, with no barber, anyone — works. */
export function useWorkingWeekdays(barberId?: string) {
  const [schedules, setSchedules] = useState<BarberSchedule[] | null>(null);

  useEffect(() => {
    schedulingApi.schedules().then(setSchedules).catch(() => setSchedules([]));
  }, []);

  const weekdays = useMemo(() => {
    const relevant = (schedules ?? []).filter(schedule => !barberId || schedule.barberId === barberId);
    return new Set(relevant.flatMap(schedule => schedule.days.map(day => day.weekday)));
  }, [schedules, barberId]);

  return { weekdays, loading: schedules === null };
}
