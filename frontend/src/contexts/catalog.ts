import { createContext } from 'react';
import type { Barber, Service } from '../api/types';

export type CatalogContextValue = {
  services: Service[];
  barbers: Barber[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);
