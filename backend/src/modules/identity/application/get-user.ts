import { NotFoundError } from '../../../shared/domain/errors.js';
import type { UserRepository } from '../domain/user-repository.js';

export class GetUser {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('Usuário');
    return user;
  }
}
