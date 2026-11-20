import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { appointmentsApi } from '../api/endpoints';
import type { Appointment } from '../api/types';
import { useAuth } from '../hooks/useAuth';
import { AppointmentContext, type BookingRequest, type StaffDecision } from './appointments';

const fetchList = () => appointmentsApi.list().catch((): Appointment[] => []);

const replace = (list: Appointment[], next: Appointment) => list.map(item => (item.id === next.id ? next : item));

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState<Appointment[]>([]);
  // Nothing from a previous session is ever shown after logout.
  const appointments = useMemo(() => (user ? loaded : []), [user, loaded]);

  const reload = useCallback(async () => {
    setLoaded(await fetchList());
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchList().then(list => { if (active) setLoaded(list); });
    return () => { active = false; };
  }, [user]);

  const book = useCallback(async (request: BookingRequest) => {
    const created = await appointmentsApi.book(request);
    setLoaded(current => [...current, created]);
    return created;
  }, []);

  const reschedule = useCallback(async (id: string, changes: { serviceId?: string; startsAt?: string }) => {
    const updated = await appointmentsApi.reschedule(id, changes);
    setLoaded(current => replace(current, updated));
    return updated;
  }, []);

  const cancel = useCallback(async (id: string) => {
    await appointmentsApi.cancel(id);
    setLoaded(current => current.map(item => (item.id === id ? { ...item, status: 'canceled' } : item)));
  }, []);

  const decide = useCallback(async (id: string, status: StaffDecision) => {
    const updated = await appointmentsApi.decide(id, status);
    setLoaded(current => replace(current, updated));
    return updated;
  }, []);

  const value = useMemo(
    () => ({ appointments, reload, book, reschedule, cancel, decide }),
    [appointments, reload, book, reschedule, cancel, decide],
  );
  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>;
};
