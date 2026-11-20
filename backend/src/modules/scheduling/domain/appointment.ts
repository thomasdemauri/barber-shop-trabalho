import { ConflictError, ValidationError } from '../../../shared/domain/errors.js';
import { newId } from '../../../shared/domain/id.js';

export const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentProps = {
  id: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
};

export type ServiceSlot = { serviceId: string; durationMinutes: number; startsAt: Date };

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['CANCELED', 'COMPLETED'],
  CANCELED: [],
  COMPLETED: [],
};

function timing(slot: ServiceSlot, now: Date) {
  if (!Number.isInteger(slot.durationMinutes) || slot.durationMinutes <= 0) {
    throw new ValidationError('Duração deve ser um número inteiro positivo de minutos');
  }
  if (slot.startsAt <= now) throw new ValidationError('Não é possível agendar no passado', 'PAST_APPOINTMENT');
  return {
    serviceId: slot.serviceId,
    startsAt: slot.startsAt,
    endsAt: new Date(slot.startsAt.getTime() + slot.durationMinutes * 60_000),
  };
}

export class Appointment {
  private constructor(private props: AppointmentProps) {}

  static book(input: ServiceSlot & { clientId: string; barberId: string; notes?: string | null; now: Date }) {
    return new Appointment({
      id: newId(),
      clientId: input.clientId,
      barberId: input.barberId,
      ...timing(input, input.now),
      status: 'PENDING',
      notes: input.notes?.trim() || null,
      createdAt: input.now,
    });
  }

  static restore(props: AppointmentProps) {
    return new Appointment({ ...props });
  }

  get id() { return this.props.id; }
  get clientId() { return this.props.clientId; }
  get barberId() { return this.props.barberId; }
  get serviceId() { return this.props.serviceId; }
  get startsAt() { return this.props.startsAt; }
  get endsAt() { return this.props.endsAt; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }

  /** Pending and confirmed appointments hold their time slot. */
  get isActive() {
    return this.props.status === 'PENDING' || this.props.status === 'CONFIRMED';
  }

  overlaps(startsAt: Date, endsAt: Date) {
    return this.props.startsAt < endsAt && this.props.endsAt > startsAt;
  }

  /** Changing service or time needs the barber to approve again. */
  reschedule(slot: ServiceSlot, now: Date) {
    if (!this.isActive) throw new ConflictError('APPOINTMENT_CLOSED', 'Agendamento não pode mais ser alterado');
    this.props = { ...this.props, ...timing(slot, now), status: 'PENDING' };
  }

  confirm() { this.transitionTo('CONFIRMED'); }
  cancel() { this.transitionTo('CANCELED'); }
  complete() { this.transitionTo('COMPLETED'); }

  transitionTo(status: AppointmentStatus) {
    if (!ALLOWED_TRANSITIONS[this.props.status].includes(status)) {
      throw new ConflictError('INVALID_STATUS_TRANSITION', `Não é possível mudar de ${this.props.status} para ${status}`);
    }
    this.props.status = status;
  }

  toSnapshot(): AppointmentProps {
    return { ...this.props };
  }
}
