import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { ApiUser } from '../api/types';
import { tokenStore } from '../api/client';
import { AppointmentProvider } from '../contexts/AppointmentProvider';
import { AuthProvider } from '../contexts/AuthProvider';
import { BookingProvider } from '../contexts/BookingProvider';
import { CatalogProvider } from '../contexts/CatalogProvider';
import { ShopProvider } from '../contexts/ShopProvider';
import { SidebarProvider } from '../ui';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ShopProvider>
        <CatalogProvider>
          <BookingProvider>
            <AppointmentProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </AppointmentProvider>
          </BookingProvider>
        </CatalogProvider>
      </ShopProvider>
    </AuthProvider>
  );
}

/** Shows where the app navigated to, so tests can assert redirects. */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

type Options = {
  /** Path the page is mounted at and the initial URL (unless `url` is given). */
  path?: string;
  url?: string;
  /** Logs this user in through a stored token; the API mock must answer GET /auth/me. */
  loggedInAs?: ApiUser;
  /** Extra screens to render before the page, e.g. to set up booking state. */
  wrapper?: (page: ReactElement) => ReactElement;
  initialState?: unknown;
};

export function renderPage(page: ReactElement, { path = '/', url, loggedInAs, wrapper, initialState }: Options = {}) {
  if (loggedInAs) tokenStore.set(`token-${loggedInAs.id}`);
  const element = wrapper ? wrapper(page) : page;
  const [pathname, search] = (url ?? path).split('?');
  return render(
    <MemoryRouter initialEntries={[{ pathname, search: search ? `?${search}` : '', state: initialState }]}>
      <Providers>
        <Routes>
          <Route path={path} element={element} />
          <Route path="*" element={null} />
        </Routes>
        <LocationProbe />
      </Providers>
    </MemoryRouter>,
  );
}
