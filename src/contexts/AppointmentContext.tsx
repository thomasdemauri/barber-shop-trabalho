import React, { createContext, useContext, useEffect, useState } from 'react';
import { lsGet, lsSet } from '../services/storage';
import { acquireLock, releaseLock } from '../services/concurrency';
import { useAuth } from './AuthContext';

export type Appointment = {
  id: string;
  usuario_id: string;
  servico_id: string;
  data_hora: string; // ISO
  status: 'pending' | 'confirmed' | 'canceled';
  data_criacao: string;
};

type AppointmentCtx = {
  appointments: Appointment[];
  create: (svcId: string, iso: string) => Promise<{ ok: boolean; reason?: string; appointment?: Appointment }>;
  cancel: (id: string) => void;
  reload: () => void;
};

const Ctx = createContext<AppointmentCtx | undefined>(undefined);

const APPT_KEY = 'appointments';

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => lsGet<Appointment[]>(APPT_KEY, []));
  const { user } = useAuth();

  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key && ev.key.startsWith('barbershop_')) setAppointments(lsGet<Appointment[]>(APPT_KEY, []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const reload = () => setAppointments(lsGet<Appointment[]>(APPT_KEY, []));

  const create = async (svcId: string, iso: string) => {
    if (!user) return { ok: false, reason: 'unauthenticated' };
    // lock by slot (date_time)
    const slotKey = `slot_${iso}`;
    const owner = user.id + '_' + Date.now();
    const locked = acquireLock(slotKey, owner, 5000);
    if (!locked) return { ok: false, reason: 'locked' };

    try {
      const curr = lsGet<Appointment[]>(APPT_KEY, []);
      // check conflict
      const conflict = curr.some(a => a.data_hora === iso && a.status !== 'canceled');
      if (conflict) return { ok: false, reason: 'conflict' };

      const ap: Appointment = {
        id: Date.now().toString(36),
        usuario_id: user.id,
        servico_id: svcId,
        data_hora: iso,
        status: 'confirmed',
        data_criacao: new Date().toISOString(),
      };
      const next = [...curr, ap];
      lsSet(APPT_KEY, next);
      setAppointments(next);
      return { ok: true, appointment: ap };
    } finally {
      releaseLock(slotKey, owner);
    }
  };

  const cancel = (id: string) => {
    const curr = lsGet<Appointment[]>(APPT_KEY, []);
    const next = curr.map(a => a.id === id ? { ...a, status: 'canceled' as const } : a);
    lsSet(APPT_KEY, next);
    setAppointments(next as Appointment[]);
  };

  return (
    <Ctx.Provider value={{ appointments, create, cancel, reload }}>
      {children}
    </Ctx.Provider>
  );
};

export function useAppointments(){
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppointments must be used inside AppointmentProvider');
  return ctx;
}
