import { Appointment } from '../../src/modules/scheduling/domain/appointment.js';
import { ConflictError, ValidationError } from '../../src/shared/domain/errors.js';

const now = new Date('2026-11-16T12:00:00.000Z');
const startsAt = new Date('2026-11-17T11:00:00.000Z');
const book = () => Appointment.book({ clientId: 'c1', barberId: 'b1', serviceId: 's1', durationMinutes: 40, startsAt, notes: '  ', now });

describe('Appointment', () => {
  it('is booked as pending with an end time derived from the service duration', () => {
    const appointment = book();
    expect(appointment.status).toBe('PENDING');
    expect(appointment.endsAt.toISOString()).toBe('2026-11-17T11:40:00.000Z');
    expect(appointment.toSnapshot().notes).toBeNull();
    expect(appointment.isActive).toBeTrue();
  });

  it('cannot be booked in the past or with an invalid duration', () => {
    expect(() => Appointment.book({ clientId: 'c', barberId: 'b', serviceId: 's', durationMinutes: 40, startsAt: now, now }))
      .toThrowError(ValidationError);
    expect(() => Appointment.book({ clientId: 'c', barberId: 'b', serviceId: 's', durationMinutes: 0, startsAt, now }))
      .toThrowError(ValidationError);
  });

  it('detects overlap using half-open intervals', () => {
    const appointment = book();
    expect(appointment.overlaps(new Date('2026-11-17T11:30:00.000Z'), new Date('2026-11-17T12:00:00.000Z'))).toBeTrue();
    expect(appointment.overlaps(new Date('2026-11-17T11:40:00.000Z'), new Date('2026-11-17T12:00:00.000Z'))).toBeFalse();
  });

  it('follows the status lifecycle', () => {
    const appointment = book();
    appointment.confirm();
    expect(appointment.status).toBe('CONFIRMED');
    appointment.complete();
    expect(appointment.status).toBe('COMPLETED');
    expect(appointment.isActive).toBeFalse();
    expect(() => appointment.cancel()).toThrowError(ConflictError);
  });

  it('cannot complete an appointment that was never confirmed', () => {
    expect(() => book().complete()).toThrowError(ConflictError);
  });

  it('goes back to pending when rescheduled', () => {
    const appointment = book();
    appointment.confirm();
    appointment.reschedule({ serviceId: 's2', durationMinutes: 70, startsAt: new Date('2026-11-18T11:00:00.000Z') }, now);
    expect(appointment.status).toBe('PENDING');
    expect(appointment.serviceId).toBe('s2');
    expect(appointment.endsAt.toISOString()).toBe('2026-11-18T12:10:00.000Z');
  });

  it('cannot be rescheduled once canceled', () => {
    const appointment = book();
    appointment.cancel();
    expect(() => appointment.reschedule({ serviceId: 's1', durationMinutes: 40, startsAt }, now)).toThrowError(ConflictError);
  });
});
