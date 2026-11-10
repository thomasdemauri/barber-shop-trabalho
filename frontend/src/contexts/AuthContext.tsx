import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setApiToken, toUiUser, type ApiUser, type AuthResponse } from '../services/api';

type User = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo?: 'cliente' | 'barbeiro';
  senha?: string;
  data_criacao?: string;
};

type AuthContextType = {
  user: User | null;
  login: (identifier: string, senha: string, mode?: string) => Promise<boolean>;
  logout: () => void;
  register: (u: Partial<User>) => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('barbershop_token')) return;
    api<ApiUser>('/auth/me').then(value => setUser(toUiUser(value))).catch(() => setApiToken(null));
  }, []);

  const login = async (identifier: string, senha: string, mode = 'client') => {
    try {
      const result = await api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email: identifier, password: senha }) });
      const isBarber = result.user.role !== 'CLIENT';
      if ((mode === 'admin') !== isBarber) return false;
      setApiToken(result.token);
      setUser(toUiUser(result.user));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => { setApiToken(null); setUser(null); };

  const register = async (u: Partial<User>) => {
    const result = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: u.nome, email: u.email, phone: u.telefone, password: u.senha }),
    });
    setApiToken(result.token);
    const next = toUiUser(result.user);
    setUser(next);
    return next;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
