import type { PrismaClient } from '@prisma/client';
import type { ShopSettings, ShopSettingsRepository } from '../domain/shop-settings.js';

/** Single-row table: the shop has exactly one settings record. */
const SETTINGS_ID = 1;

export class PrismaShopSettingsRepository implements ShopSettingsRepository {
  constructor(private readonly db: PrismaClient) {}

  async find() {
    const row = await this.db.shopSettings.findUnique({ where: { id: SETTINGS_ID } });
    return row && { name: row.name };
  }

  async save(settings: ShopSettings) {
    await this.db.shopSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...settings },
      update: settings,
    });
  }
}
