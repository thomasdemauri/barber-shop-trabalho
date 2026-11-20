import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '../test/api-mock';
import { client } from '../test/fixtures';
import { renderPage } from '../test/render';
import Profile from './Profile';

const saved = {
  haircut: { style: 'Moderno', beard: 'Curta', notes: 'Sem máquina' },
  notifications: null,
  payment: { preferredMethod: 'pix', pixKey: 'ana@pix' },
};

describe('Profile page', () => {
  it('opens haircut preferences with the saved values and saves changes to the API', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /auth/me': client,
      'GET /profile/preferences': saved,
      'PATCH /profile/preferences': ({ body }) => ({ ...saved, ...(body as object) }),
    });
    renderPage(<Profile />, { path: '/profile', loggedInAs: client });

    await user.click(await screen.findByRole('button', { name: /Preferências de Corte/ }));
    expect(await screen.findByDisplayValue('Sem máquina')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Degradê' }));
    await user.click(screen.getByRole('button', { name: 'Salvar preferências' }));

    await waitFor(() => expect(api.callsTo('PATCH', '/profile/preferences')).toHaveLength(1));
    expect(api.callsTo('PATCH', '/profile/preferences')[0].body).toEqual({ haircut: { style: 'Degradê', beard: 'Curta', notes: 'Sem máquina' } });
  });

  it('saves notification and payment preferences in their own sections', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'GET /auth/me': client, 'GET /profile/preferences': saved, 'PATCH /profile/preferences': saved });
    renderPage(<Profile />, { path: '/profile', loggedInAs: client });

    await user.click(await screen.findByRole('button', { name: /Notificações/ }));
    await user.click(screen.getByRole('button', { name: 'Salvar preferências' }));
    await waitFor(() => expect(api.callsTo('PATCH', '/profile/preferences')).toHaveLength(1));
    expect(api.callsTo('PATCH', '/profile/preferences')[0].body).toEqual({
      notifications: { confirmation: true, reminder: true, promotions: false, cancellation: true, news: false },
    });

    await user.click(screen.getByRole('button', { name: /Formas de Pagamento/ }));
    expect(screen.getByDisplayValue('ana@pix')).toBeInTheDocument();
  });

  it('updates personal data through the profile endpoint', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /auth/me': client,
      'GET /profile/preferences': saved,
      'PATCH /profile': ({ body }) => ({ ...client, name: (body as { name: string }).name }),
    });
    renderPage(<Profile />, { path: '/profile', loggedInAs: client });

    await user.click(await screen.findByRole('button', { name: /Dados Pessoais/ }));
    const name = screen.getByPlaceholderText('Seu nome');
    await user.clear(name);
    await user.type(name, 'Ana Maria');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(api.callsTo('PATCH', '/profile')).toHaveLength(1));
    expect(api.callsTo('PATCH', '/profile')[0].body).toEqual({ name: 'Ana Maria', email: client.email, phone: client.phone });
    expect(await screen.findByText('Ana Maria')).toBeInTheDocument();
  });
});
