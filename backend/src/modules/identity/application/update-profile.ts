import { AuthenticationError, ConflictError, NotFoundError } from '../../../shared/domain/errors.js';
import { assertStrongEnough } from '../domain/password-policy.js';
import type { PasswordHasher } from '../domain/password-hasher.js';
import type { UserRepository } from '../domain/user-repository.js';

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
};

export class UpdateProfile {
  constructor(private readonly users: UserRepository, private readonly hasher: PasswordHasher) {}

  async execute(userId: string, input: UpdateProfileInput) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('Usuário');

    user.updateContact({ name: input.name, email: input.email, phone: input.phone });
    await this.assertUnique(userId, user.email, user.phone);

    if (input.newPassword !== undefined) {
      const currentMatches = input.currentPassword !== undefined
        && await this.hasher.verify(user.passwordHash, input.currentPassword);
      if (!currentMatches) throw new AuthenticationError('INVALID_PASSWORD', 'Senha atual incorreta');
      assertStrongEnough(input.newPassword);
      user.changePasswordHash(await this.hasher.hash(input.newPassword));
    }

    await this.users.save(user);
    return user;
  }

  private async assertUnique(userId: string, email: string, phone: string | null) {
    const byEmail = await this.users.findByEmail(email);
    if (byEmail && byEmail.id !== userId) throw new ConflictError('EMAIL_IN_USE', 'Email já cadastrado');
    const byPhone = phone ? await this.users.findByPhone(phone) : null;
    if (byPhone && byPhone.id !== userId) throw new ConflictError('PHONE_IN_USE', 'Telefone já cadastrado');
  }
}
