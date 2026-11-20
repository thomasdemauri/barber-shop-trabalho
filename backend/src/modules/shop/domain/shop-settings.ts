import { ValidationError } from '../../../shared/domain/errors.js';

export type ShopSettings = { name: string };

export const DEFAULT_SHOP_SETTINGS: ShopSettings = { name: 'Navalha de Ouro' };

export function shopSettings(input: ShopSettings): ShopSettings {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) throw new ValidationError('Nome da barbearia deve ter entre 2 e 80 caracteres');
  return { name };
}

export interface ShopSettingsRepository {
  find(): Promise<ShopSettings | null>;
  save(settings: ShopSettings): Promise<void>;
}
