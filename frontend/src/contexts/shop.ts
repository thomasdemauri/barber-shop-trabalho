import { createContext } from 'react';
import type { ShopSettings } from '../api/types';

export const DEFAULT_SHOP_NAME = 'Navalha de Ouro';

export type ShopContextValue = {
  shopName: string;
  saveSettings: (settings: ShopSettings) => Promise<void>;
};

export const ShopContext = createContext<ShopContextValue | undefined>(undefined);
