import { AuthenticationError } from '../../../shared/domain/errors.js';
import type { PasswordHasher } from '../domain/password-hasher.js';
import { normalizeEmail } from '../domain/user.js';
import type { UserRepository } from '../domain/user-repository.js';

export class AuthenticateUser {
  constructor(private readonly users: UserRepository, private readonly hasher: PasswordHasher) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(normalizeEmail(input.email));
    if (!user || !(await this.hasher.verify(user.passwordHash, input.password))) {
      throw new AuthenticationError();
    }
    return user;
  }
}
