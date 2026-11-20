import type { PrismaClient, Service as ServiceRow } from '@prisma/client';
import { ServiceOffering, type ServiceOfferingRepository } from '../domain/service-offering.js';

const toDomain = (row: ServiceRow) => ServiceOffering.restore({
  id: row.id,
  name: row.name,
  description: row.description,
  icon: row.icon,
  category: row.category,
  price: Number(row.price),
  durationMinutes: row.durationMinutes,
  active: row.active,
});

export class PrismaServiceOfferingRepository implements ServiceOfferingRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.service.findUnique({ where: { id } });
    return row && toDomain(row);
  }

  async list({ includeInactive }: { includeInactive: boolean }) {
    const rows = await this.db.service.findMany({ where: includeInactive ? {} : { active: true } });
    return rows.map(toDomain);
  }

  async save(service: ServiceOffering) {
    const { id, ...data } = service.toSnapshot();
    await this.db.service.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
}
