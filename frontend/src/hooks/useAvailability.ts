import { useEffect, useState } from 'react';
import { schedulingApi } from '../api/endpoints';
import type { Slot } from '../api/types';

export type AvailabilityRequest = {
  dateKey?: string;
  serviceId?: string;
  barberId?: string;
  /** While rescheduling, the appointment's own slot should not count as taken. */
  ignoreAppointmentId?: string;
};

type Result = { requestKey: string; slots: Slot[]; error: string | null };

/** Slots for one day; refetches whenever the day, service or barber changes. */
export function useAvailability({ dateKey, serviceId, barberId, ignoreAppointmentId }: AvailabilityRequest) {
  const requestKey = dateKey && serviceId ? [dateKey, serviceId, barberId, ignoreAppointmentId].join('|') : null;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!requestKey || !dateKey || !serviceId) return;
    let active = true;
    schedulingApi.availability({ date: dateKey, serviceId, barberId, ignoreAppointmentId })
      .then(({ slots }) => { if (active) setResult({ requestKey, slots, error: null }); })
      .catch(() => { if (active) setResult({ requestKey, slots: [], error: 'Não foi possível carregar os horários.' }); });
    return () => { active = false; };
  }, [requestKey, dateKey, serviceId, barberId, ignoreAppointmentId]);

  if (!requestKey) return { slots: [], loading: false, error: null };
  if (result?.requestKey !== requestKey) return { slots: [], loading: true, error: null };
  return { slots: result.slots, loading: false, error: result.error };
}
