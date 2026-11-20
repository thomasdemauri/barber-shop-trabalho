import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { toDateKey } from '../lib/dates';
import { mockApi } from '../test/api-mock';
import { apiAppointment, barba, client, corte, joao } from '../test/fixtures';
import { renderPage } from '../test/render';
import Appointments from './Appointments';

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6].map(weekday => ({ weekday, openTime: '08:00', closeTime: '18:00' }));
const inDays = (days: number, hour: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, hour, 0);
};

describe('Appointments page', () => {
  it('splits upcoming and history', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /auth/me': client,
      'GET /appointments': [
        apiAppointment({ id: 'next', startsAt: inDays(3, 10).toISOString() }),
        apiAppointment({ id: 'old', startsAt: inDays(-3, 10).toISOString(), status: 'COMPLETED', service: { ...apiAppointment().service, name: 'Barba Antiga' } }),
      ],
    });
    renderPage(<Appointments />, { path: '/appointments', loggedInAs: client });

    expect(await screen.findByText('Corte Clássico')).toBeInTheDocument();
    expect(screen.queryByText('Barba Antiga')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Histórico' }));
    expect(screen.getByText('Barba Antiga')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('cancels through the API after confirmation', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /auth/me': client,
      'GET /appointments': [apiAppointment({ id: 'a-1', startsAt: inDays(3, 10).toISOString() })],
      'DELETE /appointments/a-1': undefined,
    });
    renderPage(<Appointments />, { path: '/appointments', loggedInAs: client });

    await user.click(await screen.findByTitle('Cancelar agendamento'));
    await user.click(screen.getByRole('button', { name: 'Sim, cancelar agendamento' }));

    await waitFor(() => expect(api.callsTo('DELETE', '/appointments/a-1')).toHaveLength(1));
    expect(await screen.findByText('Nenhum agendamento próximo.')).toBeInTheDocument();
  });

  it('reschedules with live availability that ignores the appointment itself', async () => {
    const user = userEvent.setup();
    const original = inDays(3, 10);
    const newStart = inDays(3, 14).toISOString();
    const api = mockApi({
      'GET /auth/me': client,
      'GET /catalog/services': [corte, barba],
      'GET /schedules': [{ barberId: joao.id, days: EVERY_DAY }],
      'GET /appointments': [apiAppointment({ id: 'a-1', startsAt: original.toISOString() })],
      'GET /availability': { date: toDateKey(original), slots: [{ time: '14:00', startsAt: newStart, available: true }] },
      'PATCH /appointments/a-1': ({ body }) => apiAppointment({ id: 'a-1', startsAt: (body as { startsAt: string }).startsAt, service: { id: barba.id, name: barba.name, price: 35, durationMinutes: 30 } }),
    });
    renderPage(<Appointments />, { path: '/appointments', loggedInAs: client });

    await user.click(await screen.findByText('Corte Clássico'));
    const dialog = screen.getByRole('dialog', { name: 'Editar agendamento' });
    await user.click(within(dialog).getByRole('button', { name: /Barba Completa/ }));
    await user.click(await within(dialog).findByRole('button', { name: '14:00' }));
    await user.click(within(dialog).getByRole('button', { name: 'Revisar alterações' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar alterações' }));

    await waitFor(() => expect(api.callsTo('PATCH', '/appointments/a-1')).toHaveLength(1));
    expect(api.callsTo('PATCH', '/appointments/a-1')[0].body).toEqual({ serviceId: barba.id, startsAt: newStart });
    const lastAvailability = api.callsTo('GET', '/availability').at(-1)!;
    expect(Object.fromEntries(lastAvailability.query)).toEqual({
      date: toDateKey(original), serviceId: barba.id, barberId: joao.id, ignoreAppointmentId: 'a-1',
    });
    expect(await screen.findByText('Barba Completa')).toBeInTheDocument();
  });
});
