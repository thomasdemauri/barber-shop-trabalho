import { ValidationError } from '../../../shared/domain/errors.js';

export const MIN_PASSWORD_LENGTH = 6;

export function assertStrongEnough(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(`Senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`, 'WEAK_PASSWORD');
  }
}
