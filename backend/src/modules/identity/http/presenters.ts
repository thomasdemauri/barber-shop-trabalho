import type { User } from '../domain/user.js';

export const presentUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
});
