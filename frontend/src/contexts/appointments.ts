import { createContext } from 'react';
import type { Appointment } from '../api/types';

export type BookingRequest = { serviceId: string; startsAt: string; barberId?: string };
export type StaffDecision = 'CONFIRMED' | 'CANCELED' | 'COMPLETED';

export type AppointmentContextValue = {
  /** Already scoped by the API: a client's own, a barber's agenda, or everything for admins. */
  appointments: Appointment[];
  reload: () => Promise<void>;
  book: (request: BookingRequest) => Promise<Appointment>;
  reschedule: (id: string, changes: { serviceId?: string; startsAt?: string }) => Promise<Appointment>;
  cancel: (id: string) => Promise<void>;
  decide: (id: string, status: StaffDecision) => Promise<Appointment>;
};

export const AppointmentContext = createContext<AppointmentContextValue | undefined>(undefined);
