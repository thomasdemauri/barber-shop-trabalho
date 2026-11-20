import type { PrismaClient } from '@prisma/client';
import { PasswordReset, type PasswordResetRepository } from '../domain/password-reset.js';

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByTokenHash(tokenHash: string) {
    const row = await this.db.passwordResetToken.findUnique({ where: { tokenHash } });
    return row && PasswordReset.restore({
      tokenHash: row.tokenHash,
      userId: row.userId,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
    });
  }

  async save(reset: PasswordReset) {
    const { tokenHash, ...data } = reset.toSnapshot();
    await this.db.passwordResetToken.upsert({ where: { tokenHash }, create: { tokenHash, ...data }, update: data });
  }
}
