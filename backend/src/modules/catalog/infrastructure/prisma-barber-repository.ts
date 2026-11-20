import type { Barber as BarberRow, PrismaClient, User } from '@prisma/client';
import type { Barber, BarberRepository } from '../domain/barber.js';

const toDomain = (row: BarberRow & { user: User }): Barber => ({
  id: row.id,
  userId: row.userId,
  name: row.user.name,
  experience: row.experience,
  bio: row.bio,
  rating: row.rating,
  reviews: row.reviews,
});

export class PrismaBarberRepository implements BarberRepository {
  constructor(private readonly db: PrismaClient) {}

  async list() {
    return (await this.db.barber.findMany({ include: { user: true } })).map(toDomain);
  }

  async findById(id: string) {
    const row = await this.db.barber.findUnique({ where: { id }, include: { user: true } });
    return row && toDomain(row);
  }

  async findByUserId(userId: string) {
    const row = await this.db.barber.findUnique({ where: { userId }, include: { user: true } });
    return row && toDomain(row);
  }
}
