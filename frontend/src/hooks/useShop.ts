import { useContext } from 'react';
import { ShopContext } from '../contexts/shop';

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
