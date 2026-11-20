import { DEFAULT_SHOP_SETTINGS, shopSettings, type ShopSettings, type ShopSettingsRepository } from '../domain/shop-settings.js';

export class GetShopSettings {
  constructor(private readonly settings: ShopSettingsRepository) {}

  async execute() {
    return (await this.settings.find()) ?? DEFAULT_SHOP_SETTINGS;
  }
}

export class UpdateShopSettings {
  constructor(private readonly settings: ShopSettingsRepository) {}

  async execute(input: ShopSettings) {
    const next = shopSettings(input);
    await this.settings.save(next);
    return next;
  }
}
