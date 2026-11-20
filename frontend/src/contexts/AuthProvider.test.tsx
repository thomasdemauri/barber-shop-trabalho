import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenStore } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { HttpResponseError, mockApi } from '../test/api-mock';
import { admin, client, session } from '../test/fixtures';
import { AuthProvider } from './AuthProvider';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider', () => {
  it('is ready immediately without a stored session', () => {
    mockApi();
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.status).toBe('ready');
    expect(result.current.user).toBeNull();
  });

  it('restores a stored session before reporting ready', async () => {
    mockApi({ 'GET /auth/me': client });
    tokenStore.set('stored');
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.user).toEqual({
      id: client.id, nome: 'Ana Cliente', email: 'ana@test.com', telefone: '11999990000', role: 'CLIENT', tipo: 'cliente',
    });
  });

  it('drops an expired stored token', async () => {
    mockApi({ 'GET /auth/me': () => { throw new HttpResponseError(401, { error: 'UNAUTHORIZED', message: 'x' }); } });
    tokenStore.set('expired');
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.user).toBeNull();
    expect(tokenStore.get()).toBeNull();
  });

  it('logs in only through the portal matching the role', async () => {
    mockApi({ 'POST /auth/login': session(admin) });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => expect(await result.current.login('admin@test.com', '1234', 'client')).toBe(false));
    expect(tokenStore.get()).toBeNull();

    await act(async () => expect(await result.current.login('admin@test.com', '1234', 'admin')).toBe(true));
    expect(result.current.user?.tipo).toBe('barbeiro');
    expect(tokenStore.get()).toBe(`token-${admin.id}`);
  });

  it('returns false for invalid credentials', async () => {
    mockApi({ 'POST /auth/login': () => { throw new HttpResponseError(401, { error: 'INVALID_CREDENTIALS', message: 'x' }); } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => expect(await result.current.login('a@b.co', 'bad')).toBe(false));
  });

  it('registers, updates the profile and logs out', async () => {
    const api = mockApi({
      'POST /auth/register': session(client),
      'PATCH /profile': ({ body }) => ({ ...client, name: (body as { name: string }).name }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => { await result.current.register({ nome: 'Ana Cliente', email: 'ana@test.com', telefone: '11', senha: 'secret1' }); });
    expect(api.callsTo('POST', '/auth/register')[0].body).toEqual({ name: 'Ana Cliente', email: 'ana@test.com', phone: '11', password: 'secret1' });

    await act(async () => { await result.current.updateProfile({ name: 'Ana Maria' }); });
    expect(result.current.user?.nome).toBe('Ana Maria');

    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(tokenStore.get()).toBeNull();
  });
});
