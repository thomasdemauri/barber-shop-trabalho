import type { User } from './user.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  listByRole(role: User['role']): Promise<User[]>;
  save(user: User): Promise<void>;
}
