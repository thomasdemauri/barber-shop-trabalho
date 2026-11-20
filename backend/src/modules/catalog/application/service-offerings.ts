import { NotFoundError } from '../../../shared/domain/errors.js';
import {
  ServiceOffering,
  type ServiceOfferingChanges,
  type ServiceOfferingProps,
  type ServiceOfferingRepository,
} from '../domain/service-offering.js';

const byName = (a: ServiceOffering, b: ServiceOffering) => a.name.localeCompare(b.name, 'pt-BR');

export class ListServiceOfferings {
  constructor(private readonly services: ServiceOfferingRepository) {}

  async execute(options: { includeInactive: boolean } = { includeInactive: false }) {
    return (await this.services.list(options)).sort(byName);
  }
}

export type CreateServiceOfferingInput = Omit<ServiceOfferingProps, 'id' | 'active'>;

export class CreateServiceOffering {
  constructor(private readonly services: ServiceOfferingRepository) {}

  async execute(input: CreateServiceOfferingInput) {
    const service = ServiceOffering.create(input);
    await this.services.save(service);
    return service;
  }
}

export class UpdateServiceOffering {
  constructor(private readonly services: ServiceOfferingRepository) {}

  async execute(id: string, changes: ServiceOfferingChanges) {
    const service = await this.services.findById(id);
    if (!service) throw new NotFoundError('Serviço');
    service.update(changes);
    await this.services.save(service);
    return service;
  }
}
