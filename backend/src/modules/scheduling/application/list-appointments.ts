import type { Actor } from '../../../shared/application/actor.js';
import type { AppointmentAccess } from './appointment-access.js';
import type { AppointmentQueries } from './ports.js';

export class ListAppointments {
  constructor(private readonly queries: AppointmentQueries, private readonly access: AppointmentAccess) {}

  async execute(actor: Actor) {
    return this.queries.list(await this.access.scopeFor(actor));
  }
}
