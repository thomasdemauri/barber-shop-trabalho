import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HttpResponseError, mockApi } from '../test/api-mock';
import { renderPage } from '../test/render';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

describe('ForgotPassword page', () => {
  it('requests a reset link', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'POST /auth/password/forgot': undefined });
    renderPage(<ForgotPassword />, { path: '/forgot' });

    await user.type(screen.getByPlaceholderText('nome@email.com'), 'ana@test.com');
    await user.click(screen.getByRole('button', { name: 'Enviar Link' }));

    expect(await screen.findByText('Link Enviado')).toBeInTheDocument();
    expect(api.callsTo('POST', '/auth/password/forgot')[0].body).toEqual({ email: 'ana@test.com' });
  });
});

describe('ResetPassword page', () => {
  it('validates the new password before sending it with the token', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'POST /auth/password/reset': undefined });
    renderPage(<ResetPassword />, { path: '/reset-password', url: '/reset-password?token=abc123' });

    const [password, confirmation] = screen.getAllByDisplayValue('');
    await user.type(password, 'nova123');
    await user.type(confirmation, 'nova12');
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redefinir senha' })).toBeDisabled();

    await user.type(confirmation, '3');
    await user.click(screen.getByRole('button', { name: 'Redefinir senha' }));

    expect(await screen.findByText('Senha redefinida')).toBeInTheDocument();
    expect(api.callsTo('POST', '/auth/password/reset')[0].body).toEqual({ token: 'abc123', newPassword: 'nova123' });
  });

  it('reports invalid links', async () => {
    const user = userEvent.setup();
    mockApi({ 'POST /auth/password/reset': () => { throw new HttpResponseError(400, { error: 'INVALID_RESET_TOKEN', message: 'Link de recuperação inválido ou expirado' }); } });
    renderPage(<ResetPassword />, { path: '/reset-password', url: '/reset-password?token=old' });

    const [password, confirmation] = screen.getAllByDisplayValue('');
    await user.type(password, 'nova123');
    await user.type(confirmation, 'nova123');
    await user.click(screen.getByRole('button', { name: 'Redefinir senha' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Redefinir senha' })).not.toHaveAttribute('aria-busy'));
    expect(screen.queryByText('Senha redefinida')).not.toBeInTheDocument();
  });

  it('rejects a link without token', () => {
    mockApi();
    renderPage(<ResetPassword />, { path: '/reset-password' });
    expect(screen.getByText('Link de recuperação inválido.')).toBeInTheDocument();
  });
});
