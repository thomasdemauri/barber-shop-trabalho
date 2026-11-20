import type { Appointment } from './appointment.js';
import type { WeeklySchedule } from './weekly-schedule.js';

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findActiveForBarbers(barberIds: string[], from: Date, to: Date): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
}

/**
 * Serialises writes per barber so two clients cannot book the same slot concurrently.
 * The repository handed to `work` must be used for every read and write inside it.
 */
export interface BookingUnitOfWork {
  runExclusively<T>(barberId: string, work: (appointments: AppointmentRepository) => Promise<T>): Promise<T>;
}

export interface ScheduleRepository {
  findByBarberId(barberId: string): Promise<WeeklySchedule | null>;
  list(): Promise<WeeklySchedule[]>;
  save(schedule: WeeklySchedule): Promise<void>;
}
