import type { BarberRepository } from '../../catalog/domain/barber.js';
import type { ServiceOfferingRepository } from '../../catalog/domain/service-offering.js';
import type { BarberDirectory, ServiceCatalog } from '../application/ports.js';

/** Anti-corruption layer: exposes only what scheduling needs from the catalog context. */
export class CatalogServiceAdapter implements ServiceCatalog {
  constructor(private readonly services: ServiceOfferingRepository) {}

  async findService(id: string) {
    const service = await this.services.findById(id);
    return service && { id: service.id, durationMinutes: service.durationMinutes, active: service.active };
  }
}

export class CatalogBarberAdapter implements BarberDirectory {
  constructor(private readonly barbers: BarberRepository) {}

  /** Ordered by name so "first available barber" is deterministic. */
  async listBarberIds() {
    const barbers = await this.barbers.list();
    return barbers.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(barber => barber.id);
  }

  async exists(barberId: string) {
    return (await this.barbers.findById(barberId)) !== null;
  }

  async findBarberIdByUserId(userId: string) {
    return (await this.barbers.findByUserId(userId))?.id ?? null;
  }
}
