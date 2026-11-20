import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { tokenStore } from '../api/client';
import { authApi, profileApi, type ProfileChanges } from '../api/endpoints';
import { toUser, type User } from '../lib/user';
import { AuthContext, type LoginMode, type RegisterInput } from './auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>(() => (tokenStore.get() ? 'loading' : 'ready'));

  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi.me()
      .then(me => setUser(toUser(me)))
      .catch(() => tokenStore.set(null))
      .finally(() => setStatus('ready'));
  }, []);

  const login = useCallback(async (email: string, password: string, mode: LoginMode = 'client') => {
    try {
      const session = await authApi.login(email, password);
      const isStaff = session.user.role !== 'CLIENT';
      if ((mode === 'admin') !== isStaff) return false;
      tokenStore.set(session.token);
      setUser(toUser(session.user));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authApi.register({ name: input.nome, email: input.email, phone: input.telefone, password: input.senha });
    tokenStore.set(session.token);
    const next = toUser(session.user);
    setUser(next);
    return next;
  }, []);

  const updateProfile = useCallback(async (changes: ProfileChanges) => {
    const next = toUser(await profileApi.update(changes));
    setUser(next);
    return next;
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, register, updateProfile }),
    [user, status, login, logout, register, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
