import { ConflictError, NotFoundError } from '../../../shared/domain/errors.js';
import type { Appointment } from '../domain/appointment.js';
import type { AppointmentRepository } from '../domain/repositories.js';
import type { AppointmentQueries, ServiceCatalog } from './ports.js';

export const slotUnavailable = () => new ConflictError('SLOT_UNAVAILABLE', 'Horário indisponível');

export async function requireBookableService(catalog: ServiceCatalog, serviceId: string) {
  const service = await catalog.findService(serviceId);
  if (!service || !service.active) throw new NotFoundError('Serviço');
  return service;
}

export async function requireAppointment(appointments: AppointmentRepository, id: string) {
  const appointment = await appointments.findById(id);
  if (!appointment) throw new NotFoundError('Agendamento');
  return appointment;
}

export async function requireView(queries: AppointmentQueries, id: string) {
  const view = await queries.findById(id);
  if (!view) throw new NotFoundError('Agendamento');
  return view;
}

/** Must run inside `BookingUnitOfWork.runExclusively` for the appointment's barber. */
export async function saveIfSlotFree(appointments: AppointmentRepository, appointment: Appointment) {
  const sameBarber = await appointments.findActiveForBarbers([appointment.barberId], appointment.startsAt, appointment.endsAt);
  const clash = sameBarber.some(other => other.id !== appointment.id && other.overlaps(appointment.startsAt, appointment.endsAt));
  if (clash) return false;
  await appointments.save(appointment);
  return true;
}
