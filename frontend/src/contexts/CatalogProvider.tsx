import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { catalogApi } from '../api/endpoints';
import type { Barber, Service } from '../api/types';
import { CatalogContext } from './catalog';

type CatalogState = { services: Service[]; barbers: Barber[]; loading: boolean; error: string | null };

async function fetchCatalog(): Promise<CatalogState> {
  try {
    const [services, barbers] = await Promise.all([catalogApi.services(), catalogApi.barbers()]);
    return { services, barbers, loading: false, error: null };
  } catch {
    return { services: [], barbers: [], loading: false, error: 'Não foi possível carregar o catálogo.' };
  }
}

/** Services and barbers are public, so they load once at start-up regardless of login. */
export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CatalogState>({ services: [], barbers: [], loading: true, error: null });

  useEffect(() => {
    let active = true;
    fetchCatalog().then(next => { if (active) setState(next); });
    return () => { active = false; };
  }, []);

  const reload = useCallback(async () => setState(await fetchCatalog()), []);

  const value = useMemo(() => ({ ...state, reload }), [state, reload]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};
