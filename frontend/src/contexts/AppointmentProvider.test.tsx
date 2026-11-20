import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenStore } from '../api/client';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../test/api-mock';
import { apiAppointment, client } from '../test/fixtures';
import { AppointmentProvider } from './AppointmentProvider';
import { AuthProvider } from './AuthProvider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider><AppointmentProvider>{children}</AppointmentProvider></AuthProvider>
);
const useBoth = () => ({ auth: useAuth(), appointments: useAppointments() });

describe('AppointmentProvider', () => {
  it('loads appointments once the user is known and hides them after logout', async () => {
    mockApi({ 'GET /auth/me': client, 'GET /appointments': [apiAppointment()] });
    tokenStore.set('stored');
    const { result } = renderHook(useBoth, { wrapper });

    await waitFor(() => expect(result.current.appointments.appointments).toHaveLength(1));
    act(() => result.current.auth.logout());
    expect(result.current.appointments.appointments).toEqual([]);
  });

  it('keeps the list in sync with booking, rescheduling, cancelling and staff decisions', async () => {
    const api = mockApi({
      'GET /auth/me': client,
      'POST /appointments': apiAppointment({ id: 'new' }),
      'PATCH /appointments/new': apiAppointment({ id: 'new', service: { id: 'barba-B', name: 'Barba', price: 35, durationMinutes: 30 } }),
      'PATCH /admin/appointments/new': apiAppointment({ id: 'new', status: 'CONFIRMED' }),
      'DELETE /appointments/new': undefined,
    });
    tokenStore.set('stored');
    const { result } = renderHook(useBoth, { wrapper });
    await waitFor(() => expect(result.current.auth.user).not.toBeNull());

    await act(async () => { await result.current.appointments.book({ serviceId: 'corte-C', startsAt: 'iso', barberId: 'b-joao' }); });
    expect(api.callsTo('POST', '/appointments')[0].body).toEqual({ serviceId: 'corte-C', startsAt: 'iso', barberId: 'b-joao' });
    expect(result.current.appointments.appointments.map(a => a.id)).toEqual(['new']);

    await act(async () => { await result.current.appointments.reschedule('new', { serviceId: 'barba-B' }); });
    expect(result.current.appointments.appointments[0].service.name).toBe('Barba');

    await act(async () => { await result.current.appointments.decide('new', 'CONFIRMED'); });
    expect(result.current.appointments.appointments[0].status).toBe('confirmed');

    await act(async () => { await result.current.appointments.cancel('new'); });
    expect(result.current.appointments.appointments[0].status).toBe('canceled');
  });
});
