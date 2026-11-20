import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { shopApi } from '../api/endpoints';
import type { ShopSettings } from '../api/types';
import { DEFAULT_SHOP_NAME, ShopContext } from './shop';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shopName, setShopName] = useState(DEFAULT_SHOP_NAME);

  useEffect(() => {
    shopApi.settings().then(settings => setShopName(settings.name)).catch(() => undefined);
  }, []);

  const saveSettings = useCallback(async (settings: ShopSettings) => {
    setShopName((await shopApi.updateSettings(settings)).name);
  }, []);

  const value = useMemo(() => ({ shopName, saveSettings }), [shopName, saveSettings]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
