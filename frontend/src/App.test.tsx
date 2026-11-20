import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { tokenStore } from './api/client';
import type { Slot } from './api/types';
import App from './App';
import { toDateKey } from './lib/dates';
import { HttpResponseError, mockApi } from './test/api-mock';
import { apiAppointment, barba, barberUser, client, corte, joao, pedro } from './test/fixtures';

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6].map(weekday => ({ weekday, openTime: '08:00', closeTime: '18:00' }));
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; };

function startAt(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

/** Picks tomorrow on the booking calendar, moving to the next month when needed. */
async function pickTomorrow(user: ReturnType<typeof userEvent.setup>) {
  const target = tomorrow();
  if (target.getMonth() !== new Date().getMonth()) await user.click(screen.getByRole('button', { name: 'Próximo mês' }));
  const dateKey = toDateKey(target);
  await user.click(await screen.findByRole('button', { name: dateKey }));
  return dateKey;
}

function bookingApi(bookingResponse?: () => unknown) {
  const target = tomorrow();
  const ten = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 10, 0).toISOString();
  const slots: Slot[] = [
    { time: '10:00', startsAt: ten, available: true },
    { time: '10:30', startsAt: new Date(new Date(ten).getTime() + 30 * 60_000).toISOString(), available: false },
  ];
  const booked = apiAppointment({ id: 'new', startsAt: ten });
  const api = mockApi({
    'GET /auth/me': client,
    'GET /catalog/services': [corte, barba],
    'GET /catalog/barbers': [joao, pedro],
    'GET /schedules': [{ barberId: joao.id, days: EVERY_DAY }, { barberId: pedro.id, days: EVERY_DAY }],
    'GET /availability': ({ query }) => ({ date: query.get('date'), slots }),
    'POST /appointments': bookingResponse ?? booked,
  });
  tokenStore.set('stored');
  return { api, ten };
}

describe('booking flow', () => {
  it('books the chosen barber at an available slot and shows the real confirmation', async () => {
    const user = userEvent.setup();
    const { api, ten } = bookingApi();
    startAt('/services');

    await user.click(await screen.findByRole('button', { name: /Corte Clássico/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar → Corte Clássico' }));

    await user.click(await screen.findByRole('button', { name: /João/ }));
    await user.click(screen.getByRole('button', { name: 'Escolher Horário' }));

    const dateKey = await pickTomorrow(user);
    const slot = await screen.findByRole('button', { name: '10:00' });
    expect(screen.getByRole('button', { name: '10:30' })).toBeDisabled();
    const [availability] = api.callsTo('GET', '/availability');
    expect(Object.fromEntries(availability.query)).toEqual({ date: dateKey, serviceId: corte.id, barberId: joao.id });

    await user.click(slot);
    await user.click(screen.getByRole('button', { name: 'Confirmar Horário → 10:00' }));

    expect(await screen.findByText('Resumo do Pedido')).toBeInTheDocument();
    expect(screen.getByText('R$ 40,00')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirmar Agendamento' }));

    expect(await screen.findByText('Agendado!')).toBeInTheDocument();
    expect(api.callsTo('POST', '/appointments')[0].body).toEqual({ serviceId: corte.id, startsAt: ten, barberId: joao.id });
    expect(screen.getByText('João Mestre')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/success');
  });

  it('lets the API pick the barber when the client has no preference', async () => {
    const user = userEvent.setup();
    const { api } = bookingApi();
    startAt('/services');

    await user.click(await screen.findByRole('button', { name: /Barba Completa/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar → Barba Completa' }));
    await user.click(await screen.findByRole('button', { name: /Sem preferência/ }));
    await user.click(screen.getByRole('button', { name: 'Escolher Horário' }));
    await pickTomorrow(user);
    await user.click(await screen.findByRole('button', { name: '10:00' }));

    expect(api.callsTo('GET', '/availability')[0].query.has('barberId')).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Confirmar Horário → 10:00' }));
    expect(screen.getByText('Primeiro disponível')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirmar Agendamento' }));

    await screen.findByText('Agendado!');
    expect(api.callsTo('POST', '/appointments')[0].body).not.toHaveProperty('barberId');
  });

  it('stays on the summary when the slot was taken meanwhile', async () => {
    const user = userEvent.setup();
    bookingApi(() => { throw new HttpResponseError(409, { error: 'SLOT_UNAVAILABLE', message: 'Horário indisponível' }); });
    startAt('/services');

    await user.click(await screen.findByRole('button', { name: /Corte Clássico/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar → Corte Clássico' }));
    await user.click(await screen.findByRole('button', { name: /Sem preferência/ }));
    await user.click(screen.getByRole('button', { name: 'Escolher Horário' }));
    await pickTomorrow(user);
    await user.click(await screen.findByRole('button', { name: '10:00' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar Horário → 10:00' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar Agendamento' }));

    expect(await screen.findByText('Horário indisponível')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/confirm');
  });
});

describe('routing guards', () => {
  it('waits for the stored session instead of bouncing to login', async () => {
    mockApi({ 'GET /auth/me': client });
    tokenStore.set('stored');
    startAt('/home');
    expect(await screen.findByText('Bem-vindo de volta')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/home');
  });

  it('sends anonymous visitors to login', async () => {
    mockApi();
    startAt('/appointments');
    await waitFor(() => expect(window.location.pathname).toBe('/login'));
  });

  it('sends staff to the admin area and shows the configured shop name', async () => {
    mockApi({ 'GET /auth/me': barberUser, 'GET /shop/settings': { name: 'Barbearia Central' } });
    tokenStore.set('stored');
    startAt('/home');
    await waitFor(() => expect(window.location.pathname).toBe('/admin'));
    expect(await screen.findByText('Barbearia Central')).toBeInTheDocument();
  });

  it('skips steps that need an earlier choice', async () => {
    mockApi({ 'GET /auth/me': client });
    tokenStore.set('stored');
    startAt('/confirm');
    await waitFor(() => expect(window.location.pathname).toBe('/services'));
  });

  it('redirects a refreshed success page to the appointment list', async () => {
    mockApi({ 'GET /auth/me': client, 'GET /appointments': [apiAppointment()] });
    tokenStore.set('stored');
    startAt('/success');
    await waitFor(() => expect(window.location.pathname).toBe('/appointments'));
    expect(within(await screen.findByRole('main')).getByText('Corte Clássico')).toBeInTheDocument();
  });
});
