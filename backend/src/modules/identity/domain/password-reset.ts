import { createHash, randomBytes } from 'node:crypto';
import { ValidationError } from '../../../shared/domain/errors.js';

export const RESET_TOKEN_TTL_MINUTES = 60;

export const hashResetToken = (token: string) => createHash('sha256').update(token).digest('hex');

export type PasswordResetProps = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

/** Only the token hash is stored, so a database leak does not expose usable reset links. */
export class PasswordReset {
  private constructor(private props: PasswordResetProps) {}

  static issue(userId: string, now: Date) {
    const token = randomBytes(32).toString('hex');
    const reset = new PasswordReset({
      tokenHash: hashResetToken(token),
      userId,
      expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60_000),
      usedAt: null,
    });
    return { token, reset };
  }

  static restore(props: PasswordResetProps) {
    return new PasswordReset({ ...props });
  }

  get userId() { return this.props.userId; }
  get expiresAt() { return this.props.expiresAt; }

  redeem(now: Date) {
    if (this.props.usedAt || now >= this.props.expiresAt) {
      throw new ValidationError('Link de recuperação inválido ou expirado', 'INVALID_RESET_TOKEN');
    }
    this.props.usedAt = now;
  }

  toSnapshot(): PasswordResetProps {
    return { ...this.props };
  }
}

export interface PasswordResetRepository {
  findByTokenHash(tokenHash: string): Promise<PasswordReset | null>;
  save(reset: PasswordReset): Promise<void>;
}
