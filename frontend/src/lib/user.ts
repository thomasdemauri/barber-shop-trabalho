import type { ApiUser, Role } from '../api/types';

/** The logged user as the screens use it. */
export type User = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: Role;
  tipo: 'cliente' | 'barbeiro';
};

export const toUser = (user: ApiUser): User => ({
  id: user.id,
  nome: user.name,
  email: user.email,
  telefone: user.phone ?? '',
  role: user.role,
  tipo: user.role === 'CLIENT' ? 'cliente' : 'barbeiro',
});
