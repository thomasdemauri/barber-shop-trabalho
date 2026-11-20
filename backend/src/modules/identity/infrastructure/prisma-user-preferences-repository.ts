import { Prisma, type PrismaClient } from '@prisma/client';
import type { UserPreferences, UserPreferencesRepository } from '../domain/user-preferences.js';

const toJson = (value: object | null) => value ?? Prisma.DbNull;

export class PrismaUserPreferencesRepository implements UserPreferencesRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const row = await this.db.userPreference.findUnique({ where: { userId } });
    if (!row) return null;
    return {
      haircut: row.haircutPreferences as UserPreferences['haircut'],
      notifications: row.notificationPreferences as UserPreferences['notifications'],
      payment: row.paymentPreferences as UserPreferences['payment'],
    };
  }

  async save(userId: string, preferences: UserPreferences) {
    const data = {
      haircutPreferences: toJson(preferences.haircut),
      notificationPreferences: toJson(preferences.notifications),
      paymentPreferences: toJson(preferences.payment),
    };
    await this.db.userPreference.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  }
}
