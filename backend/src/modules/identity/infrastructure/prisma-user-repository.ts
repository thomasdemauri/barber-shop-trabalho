import type { PrismaClient, User as UserRow } from '@prisma/client';
import { ConflictError } from '../../../shared/domain/errors.js';
import { isUniqueConstraintViolation } from '../../../shared/infrastructure/prisma.js';
import { User } from '../domain/user.js';
import type { UserRepository } from '../domain/user-repository.js';

const toDomain = (row: UserRow) => User.restore({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  passwordHash: row.passwordHash,
  role: row.role,
  createdAt: row.createdAt,
});

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.user.findUnique({ where: { id } });
    return row && toDomain(row);
  }

  async findByEmail(email: string) {
    const row = await this.db.user.findUnique({ where: { email } });
    return row && toDomain(row);
  }

  async findByPhone(phone: string) {
    const row = await this.db.user.findUnique({ where: { phone } });
    return row && toDomain(row);
  }

  async listByRole(role: User['role']) {
    const rows = await this.db.user.findMany({ where: { role } });
    return rows.map(toDomain);
  }

  async save(user: User) {
    const { id, ...data } = user.toSnapshot();
    try {
      await this.db.user.upsert({ where: { id }, create: { id, ...data }, update: data });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) throw new ConflictError('USER_ALREADY_EXISTS', 'Email ou telefone já cadastrado');
      throw error;
    }
  }
}
