import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HttpResponseError, mockApi } from '../test/api-mock';
import { barba, client, corte } from '../test/fixtures';
import { renderPage } from '../test/render';
import Services from './Services';

describe('Services page', () => {
  it('lists services from the API and filters by category and search', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /auth/me': client, 'GET /catalog/services': [corte, barba] });
    renderPage(<Services />, { path: '/services', loggedInAs: client });

    expect(await screen.findByText('40 min · Tesoura ou máquina')).toBeInTheDocument();
    expect(screen.getByText('R$ 35,00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Barba' }));
    expect(screen.queryByText('Corte Clássico')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Todos' }));
    await user.type(screen.getByPlaceholderText('Buscar serviço...'), 'cort');
    expect(screen.getByText('Corte Clássico')).toBeInTheDocument();
    expect(screen.queryByText('Barba Completa')).not.toBeInTheDocument();
  });

  it('explains when the catalog cannot be loaded', async () => {
    mockApi({ 'GET /catalog/services': () => { throw new HttpResponseError(500, { error: 'INTERNAL_ERROR', message: 'x' }); } });
    renderPage(<Services />, { path: '/services' });
    expect(await screen.findByText('Não foi possível carregar o catálogo.')).toBeInTheDocument();
  });
});
