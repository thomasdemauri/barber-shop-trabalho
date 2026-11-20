import type { AppointmentStatus } from '../domain/appointment.js';

/** What scheduling needs to know about the catalog context. */
export type BookableService = { id: string; durationMinutes: number; active: boolean };

export interface ServiceCatalog {
  findService(id: string): Promise<BookableService | null>;
}

export interface BarberDirectory {
  listBarberIds(): Promise<string[]>;
  exists(barberId: string): Promise<boolean>;
  findBarberIdByUserId(userId: string): Promise<string | null>;
}

export type AppointmentView = {
  id: string;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  notes: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string; phone: string | null };
  barber: { id: string; name: string };
  service: { id: string; name: string; price: number; durationMinutes: number };
};

export type AppointmentScope = { kind: 'all' } | { kind: 'client'; clientId: string } | { kind: 'barber'; barberId: string };

type Contact = { id: string; name: string; email: string };

/** Everything a notification about an appointment needs, including the barber's contact. */
export type AppointmentParticipants = {
  appointmentId: string;
  startsAt: string;
  endsAt: string;
  service: { name: string; price: number };
  client: Contact;
  barber: Contact;
};

/** Read side: denormalised views for listing screens and notifications. */
export interface AppointmentQueries {
  findById(id: string): Promise<AppointmentView | null>;
  list(scope: AppointmentScope): Promise<AppointmentView[]>;
  findParticipants(id: string): Promise<AppointmentParticipants | null>;
}

export type SchedulingSettings = { slotIntervalMinutes: number };
