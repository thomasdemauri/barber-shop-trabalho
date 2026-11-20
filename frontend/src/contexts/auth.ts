import { createContext } from 'react';
import type { ProfileChanges } from '../api/endpoints';
import type { User } from '../lib/user';

export type LoginMode = 'client' | 'admin';
export type RegisterInput = { nome: string; email: string; telefone?: string; senha: string };

export type AuthContextValue = {
  user: User | null;
  /** `loading` while a stored session is being restored; guards must wait for `ready`. */
  status: 'loading' | 'ready';
  login: (email: string, password: string, mode?: LoginMode) => Promise<boolean>;
  logout: () => void;
  register: (input: RegisterInput) => Promise<User>;
  updateProfile: (changes: ProfileChanges) => Promise<User>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
