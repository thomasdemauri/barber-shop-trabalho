import { ConflictError } from '../../../shared/domain/errors.js';
import type { Clock } from '../../../shared/domain/clock.js';
import { assertStrongEnough } from '../domain/password-policy.js';
import type { PasswordHasher } from '../domain/password-hasher.js';
import { normalizeEmail, User } from '../domain/user.js';
import type { UserRepository } from '../domain/user-repository.js';

export type RegisterUserInput = { name: string; email: string; phone?: string; password: string };

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly clock: Clock,
  ) {}

  async execute(input: RegisterUserInput) {
    assertStrongEnough(input.password);
    if (await this.users.findByEmail(normalizeEmail(input.email))) {
      throw new ConflictError('EMAIL_IN_USE', 'Email já cadastrado');
    }

    const user = User.register({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: await this.hasher.hash(input.password),
      now: this.clock.now(),
    });
    if (user.phone && await this.users.findByPhone(user.phone)) {
      throw new ConflictError('PHONE_IN_USE', 'Telefone já cadastrado');
    }

    await this.users.save(user);
    return user;
  }
}
