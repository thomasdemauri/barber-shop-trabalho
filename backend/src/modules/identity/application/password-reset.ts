import type { Clock } from '../../../shared/domain/clock.js';
import type { NotificationPublisher } from '../../notifications/application/notification-publisher.js';
import { hashResetToken, PasswordReset, type PasswordResetRepository } from '../domain/password-reset.js';
import { assertStrongEnough } from '../domain/password-policy.js';
import type { PasswordHasher } from '../domain/password-hasher.js';
import { normalizeEmail } from '../domain/user.js';
import type { UserRepository } from '../domain/user-repository.js';
import { ValidationError } from '../../../shared/domain/errors.js';

/** Always completes silently so the endpoint cannot be used to discover registered emails. */
export class RequestPasswordReset {
  constructor(
    private readonly users: UserRepository,
    private readonly resets: PasswordResetRepository,
    private readonly notifications: NotificationPublisher,
    private readonly clock: Clock,
  ) {}

  async execute(email: string) {
    const user = await this.users.findByEmail(normalizeEmail(email));
    if (!user) return;

    const { token, reset } = PasswordReset.issue(user.id, this.clock.now());
    await this.resets.save(reset);
    await this.notifications.publish({
      event: 'password.reset_requested',
      userId: user.id,
      email: user.email,
      name: user.name,
      token,
      expiresAt: reset.expiresAt.toISOString(),
    });
  }
}

export class ResetPassword {
  constructor(
    private readonly users: UserRepository,
    private readonly resets: PasswordResetRepository,
    private readonly hasher: PasswordHasher,
    private readonly clock: Clock,
  ) {}

  async execute(input: { token: string; newPassword: string }) {
    assertStrongEnough(input.newPassword);
    const reset = await this.resets.findByTokenHash(hashResetToken(input.token));
    const user = reset ? await this.users.findById(reset.userId) : null;
    if (!reset || !user) throw new ValidationError('Link de recuperação inválido ou expirado', 'INVALID_RESET_TOKEN');

    reset.redeem(this.clock.now());
    user.changePasswordHash(await this.hasher.hash(input.newPassword));
    await this.users.save(user);
    await this.resets.save(reset);
  }
}
