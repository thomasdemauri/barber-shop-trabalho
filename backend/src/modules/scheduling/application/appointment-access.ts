import type { Actor } from '../../../shared/application/actor.js';
import { ForbiddenError } from '../../../shared/domain/errors.js';
import type { Appointment } from '../domain/appointment.js';
import type { AppointmentScope, BarberDirectory } from './ports.js';

/** Who may see and change which appointments. */
export class AppointmentAccess {
  constructor(private readonly barbers: BarberDirectory) {}

  async scopeFor(actor: Actor): Promise<AppointmentScope> {
    if (actor.role === 'ADMIN') return { kind: 'all' };
    if (actor.role === 'CLIENT') return { kind: 'client', clientId: actor.userId };
    const barberId = await this.barbers.findBarberIdByUserId(actor.userId);
    if (!barberId) throw new ForbiddenError('Usuário não possui perfil de barbeiro');
    return { kind: 'barber', barberId };
  }

  /** Clients act on their own bookings; staff act on the bookings they are responsible for. */
  async assertCanAccess(actor: Actor, appointment: Appointment) {
    if (actor.role === 'CLIENT') {
      if (appointment.clientId !== actor.userId) throw new ForbiddenError();
      return;
    }
    await this.assertCanManage(actor, appointment);
  }

  async assertCanManage(actor: Actor, appointment: Appointment) {
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'BARBER' && await this.barbers.findBarberIdByUserId(actor.userId) === appointment.barberId) return;
    throw new ForbiddenError();
  }
}
