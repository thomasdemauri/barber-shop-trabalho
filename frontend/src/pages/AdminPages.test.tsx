import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HttpResponseError, mockApi } from '../test/api-mock';
import { admin, apiAppointment, barberUser, client, corte } from '../test/fixtures';
import { renderPage } from '../test/render';
import AdminAgenda from './AdminAgenda';
import AdminClientes from './AdminClientes';
import AdminConfig from './AdminConfig';
import AdminDashboard from './AdminDashboard';

const todayAt = (hour: number) => { const d = new Date(); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
const inDaysAt = (days: number, hour: number) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return d.toISOString(); };

describe('AdminDashboard', () => {
  it('confirms a pending appointment through the staff endpoint', async () => {
    const user = userEvent.setup();
    const pending = apiAppointment({ id: 'p-1', startsAt: inDaysAt(2, 10) });
    const api = mockApi({
      'GET /auth/me': barberUser,
      'GET /appointments': [pending],
      'PATCH /admin/appointments/p-1': { ...pending, status: 'CONFIRMED' },
    });
    renderPage(<AdminDashboard />, { path: '/admin', loggedInAs: barberUser });

    const section = (await screen.findByText('Aguardando confirmação')).closest('div')!.parentElement!;
    await user.click(within(section).getByRole('button', { name: /Corte Clássico/ }));
    await user.click(within(section).getByRole('button', { name: /Confirmar/ }));

    await waitFor(() => expect(api.callsTo('PATCH', '/admin/appointments/p-1')).toHaveLength(1));
    expect(api.callsTo('PATCH', '/admin/appointments/p-1')[0].body).toEqual({ status: 'CONFIRMED' });
    await waitFor(() => expect(screen.queryByText('Aguardando confirmação')).not.toBeInTheDocument());
  });

  it('computes today stats from API prices', async () => {
    mockApi({
      'GET /auth/me': barberUser,
      'GET /appointments': [
        apiAppointment({ id: 'done', startsAt: todayAt(0), status: 'CONFIRMED' }),
        apiAppointment({ id: 'gone', startsAt: todayAt(0), status: 'CANCELED' }),
      ],
    });
    renderPage(<AdminDashboard />, { path: '/admin', loggedInAs: barberUser });
    expect(await screen.findByText('R$ 40,00', { selector: '.font-serif' })).toBeInTheDocument();
  });
});

describe('AdminAgenda', () => {
  it('filters the day by status and refuses through the staff endpoint', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /auth/me': barberUser,
      'GET /appointments': [
        apiAppointment({ id: 'a', startsAt: todayAt(23), status: 'PENDING' }),
        apiAppointment({ id: 'b', startsAt: todayAt(22), status: 'CONFIRMED', client: { ...apiAppointment().client, name: 'Bruno' } }),
      ],
      'PATCH /admin/appointments/a': apiAppointment({ id: 'a', startsAt: todayAt(23), status: 'CANCELED' }),
    });
    renderPage(<AdminAgenda />, { path: '/admin/agenda', loggedInAs: barberUser });

    expect(await screen.findByRole('button', { name: 'Todos (2)' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirmados (1)' }));
    expect(screen.getByText('Bruno')).toBeInTheDocument();
    expect(screen.queryByText('Ana Cliente')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pendentes (1)' }));
    await user.click(screen.getByRole('button', { name: /Ana Cliente/ }));
    await user.click(screen.getByRole('button', { name: /Cancelar/ }));
    await waitFor(() => expect(api.callsTo('PATCH', '/admin/appointments/a')[0]?.body).toEqual({ status: 'CANCELED' }));
    expect(await screen.findByRole('button', { name: 'Cancelados (1)' })).toBeInTheDocument();
  });

  it('moves between days', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /auth/me': barberUser, 'GET /appointments': [apiAppointment({ startsAt: inDaysAt(1, 10) })] });
    renderPage(<AdminAgenda />, { path: '/admin/agenda', loggedInAs: barberUser });

    expect(await screen.findByText('Nenhum agendamento neste dia')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(await screen.findByText('Corte Clássico')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hoje' }));
    expect(screen.getByText('Nenhum agendamento neste dia')).toBeInTheDocument();
  });
});

describe('AdminClientes', () => {
  it('lists clients from the API with their history and totals', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /auth/me': barberUser,
      'GET /admin/clients': [client, { ...client, id: 'u-2', name: 'Bruno Souza', email: 'bruno@test.com' }],
      'GET /appointments': [apiAppointment(), apiAppointment({ id: 'x', status: 'CANCELED' })],
    });
    renderPage(<AdminClientes />, { path: '/admin/clientes', loggedInAs: barberUser });

    await user.type(await screen.findByPlaceholderText(/Buscar/), 'ana');
    expect(screen.queryByText('Bruno Souza')).not.toBeInTheDocument();
    await user.click(screen.getByText('Ana Cliente'));
    expect(screen.getByText('Total gasto: R$ 40,00')).toBeInTheDocument();
    expect(screen.getAllByText('Corte Clássico')).toHaveLength(2);
  });
});

describe('AdminConfig', () => {
  it('lets admins rename the shop and manage services', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /auth/me': admin,
      'GET /schedules/me': () => { throw new HttpResponseError(404, { error: 'NOT_FOUND', message: 'Perfil de barbeiro não encontrado' }); },
      'PUT /admin/shop/settings': ({ body }) => body,
      'GET /admin/services': [corte],
      'PATCH /admin/services/corte-C': ({ body }) => ({ ...corte, ...(body as object) }),
      'POST /admin/services': ({ body }) => ({ ...(body as object), id: 'new', active: true }),
    });
    renderPage(<AdminConfig />, { path: '/admin/config', loggedInAs: admin });

    expect(await screen.findByText(/não possui perfil de barbeiro/)).toBeInTheDocument();

    const shopName = await screen.findByDisplayValue('Navalha de Ouro');
    await user.clear(shopName);
    await user.type(shopName, 'Barbearia Central');
    await user.click(within(shopName.closest('section')!).getByRole('button', { name: /Salvar/ }));
    await waitFor(() => expect(api.callsTo('PUT', '/admin/shop/settings')[0]?.body).toEqual({ name: 'Barbearia Central' }));

    const price = await screen.findByLabelText('Preço de Corte Clássico');
    await user.clear(price);
    await user.type(price, '45');
    await user.click(within(price.closest('section')!).getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(api.callsTo('PATCH', '/admin/services/corte-C')[0]?.body).toEqual({ price: 45 }));

    await user.type(screen.getByLabelText('Nome do novo serviço'), 'Pigmentação');
    await user.click(screen.getByRole('button', { name: /Adicionar/ }));
    await waitFor(() => expect(api.callsTo('POST', '/admin/services')[0]?.body).toEqual({
      name: 'Pigmentação', description: null, icon: null, category: 'corte', price: 0, durationMinutes: 30,
    }));
  });

  it('lets barbers edit their own schedule but not the shop or services', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /auth/me': barberUser,
      'GET /catalog/services': [corte],
      'GET /schedules/me': { barberId: 'b-joao', days: [{ weekday: 1, openTime: '08:00', closeTime: '18:00' }] },
      'PUT /schedules/me': ({ body }) => ({ barberId: 'b-joao', ...(body as object) }),
    });
    renderPage(<AdminConfig />, { path: '/admin/config', loggedInAs: barberUser });

    await user.click(await screen.findByRole('button', { name: 'Sáb' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Fechamento' }), '12:00');
    await user.click(within(screen.getByText('Minha Escala').closest('section')!).getByRole('button', { name: /Salvar/ }));

    await waitFor(() => expect(api.callsTo('PUT', '/schedules/me')).toHaveLength(1));
    expect(api.callsTo('PUT', '/schedules/me')[0].body).toEqual({
      days: [{ weekday: 1, openTime: '08:00', closeTime: '12:00' }, { weekday: 6, openTime: '08:00', closeTime: '12:00' }],
    });
    expect(screen.queryByText('Barbearia')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Preço de Corte Clássico')).not.toBeInTheDocument();
    expect(screen.getByText('Corte Clássico')).toBeInTheDocument();
  });

  it('rejects an opening time after closing', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /auth/me': barberUser,
      'GET /schedules/me': { barberId: 'b-joao', days: [{ weekday: 1, openTime: '08:00', closeTime: '18:00' }] },
    });
    renderPage(<AdminConfig />, { path: '/admin/config', loggedInAs: barberUser });

    await user.selectOptions(await screen.findByRole('combobox', { name: 'Abertura' }), '19:00');
    await user.click(within(screen.getByText('Minha Escala').closest('section')!).getByRole('button', { name: /Salvar/ }));
    expect(api.callsTo('PUT', '/schedules/me')).toHaveLength(0);
  });
});
