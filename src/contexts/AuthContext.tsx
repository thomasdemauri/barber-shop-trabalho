import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeTestData } from '../services/seed';
import { store, retrieve, remove, purgeExpired } from '../services/storage';

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
  login: (identifier: string, senha: string, mode?: string) => boolean;
  logout: () => void;
  register: (u: Partial<User>) => User;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'barbershop_users';
const SESSION_KEY = 'barbershop_session';

function readUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    initializeTestData();
    purgeExpired(); // Clean up any expired data on load
    return retrieve<User>(SESSION_KEY);
  });

  useEffect(() => {
    if (user) {
      store(SESSION_KEY, user); // Save with 8h TTL
    } else {
      remove(SESSION_KEY);
    }
  }, [user]);

  const login = (identifier: string, senha: string, mode = 'client') => {
    const users = readUsers();
    const found = users.find(u =>
      (u.email === identifier || u.telefone === identifier) &&
      u.senha === senha &&
      (mode === 'client' ? u.tipo !== 'barbeiro' : u.tipo === 'barbeiro')
    );
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const register = (u: Partial<User>) => {
    const users = readUsers();
    const newUser: User = {
      id: Date.now().toString(36),
      nome: u.nome || 'Usuário',
      email: u.email || '',
      telefone: u.telefone || '',
      senha: u.senha || '',
      tipo: (u.tipo as 'cliente' | 'barbeiro') || 'cliente',
      data_criacao: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsers(users);
    setUser(newUser);
    return newUser;
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
