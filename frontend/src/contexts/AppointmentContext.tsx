import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { api, appointmentFromApi, serviceApiId } from '../services/api';

export type Appointment = {
  id: string;
  usuario_id: string;
  cliente_email?: string;
  cliente_nome?: string;
  barbeiro_nome?: string;
  servico_id: string;
  data_hora: string; // ISO
  status: 'pending' | 'confirmed' | 'canceled';
  data_criacao: string;
};

type AppointmentCtx = {
  appointments: Appointment[];
  create: (svcId: string, iso: string, barberName?: string) => Promise<{ ok: boolean; reason?: string; appointment?: Appointment }>;
  edit: (id: string, svcId: string, iso: string) => Promise<{ ok: boolean; reason?: string }>;
  cancel: (id: string) => void;
  reload: () => void;
};

const Ctx = createContext<AppointmentCtx | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) void reload();
  }, [user]);

  const reload = async () => {
    try {
      const result = await api<any[]>('/appointments');
      setAppointments(result.map(appointmentFromApi));
    } catch {
      setAppointments([]);
    }
  };

  const create = async (svcId: string, iso: string, barberName?: string) => {
    if (!user) return { ok: false, reason: 'unauthenticated' };
    try {
      void barberName;
      const result = await api<any>('/appointments', { method: 'POST', body: JSON.stringify({ serviceId: serviceApiId(svcId), startsAt: iso }) });
      const appointment = appointmentFromApi(result);
      setAppointments(current => [...current, appointment]);
      return { ok: true, appointment };
    } catch (error) {
      return { ok: false, reason: error instanceof Error ? error.message : 'request_failed' };
    }
  };

  const edit = async (id: string, svcId: string, iso: string) => {
    if (!user) return { ok: false, reason: 'unauthenticated' };
    try {
      await api(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ serviceId: serviceApiId(svcId), startsAt: iso }) });
      await reload();
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error instanceof Error ? error.message : 'request_failed' };
    }
  };

  const cancel = (id: string) => {
    void api(`/appointments/${id}`, { method: 'DELETE' }).then(() => reload());
  };

  return (
    <Ctx.Provider value={{ appointments, create, edit, cancel, reload }}>
      {children}
    </Ctx.Provider>
  );
};

export function useAppointments() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppointments must be used inside AppointmentProvider');
  return ctx;
}