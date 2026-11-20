import { hashResetToken, PasswordReset, RESET_TOKEN_TTL_MINUTES } from '../../src/modules/identity/domain/password-reset.js';
import { assertStrongEnough } from '../../src/modules/identity/domain/password-policy.js';
import { User } from '../../src/modules/identity/domain/user.js';
import { ValidationError } from '../../src/shared/domain/errors.js';

const now = new Date('2026-11-16T12:00:00.000Z');

describe('User', () => {
  it('registers clients with normalised contact data', () => {
    const user = User.register({ name: '  Ana  ', email: ' Ana@Test.COM ', phone: '(11) 99999-0000', passwordHash: 'h', now });
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@test.com');
    expect(user.phone).toBe('11999990000');
    expect(user.role).toBe('CLIENT');
  });

  it('rejects invalid names and emails', () => {
    expect(() => User.register({ name: 'A', email: 'a@b.co', passwordHash: 'h', now })).toThrowError(ValidationError);
    expect(() => User.register({ name: 'Ana', email: 'not-an-email', passwordHash: 'h', now })).toThrowError(ValidationError);
  });

  it('updates only the provided contact fields and clears an empty phone', () => {
    const user = User.register({ name: 'Ana', email: 'ana@test.com', phone: '11999990000', passwordHash: 'h', now });
    user.updateContact({ name: 'Ana Maria', phone: '' });
    expect(user.name).toBe('Ana Maria');
    expect(user.email).toBe('ana@test.com');
    expect(user.phone).toBeNull();
  });
});

describe('password policy', () => {
  it('requires at least six characters', () => {
    expect(() => assertStrongEnough('12345')).toThrowError(ValidationError);
    expect(() => assertStrongEnough('123456')).not.toThrow();
  });
});

describe('PasswordReset', () => {
  it('stores only the hash of a random token', () => {
    const { token, reset } = PasswordReset.issue('u1', now);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(reset.toSnapshot().tokenHash).toBe(hashResetToken(token));
    expect(reset.toSnapshot().tokenHash).not.toBe(token);
    expect(reset.expiresAt.getTime() - now.getTime()).toBe(RESET_TOKEN_TTL_MINUTES * 60_000);
  });

  it('can be redeemed once before expiry', () => {
    const { reset } = PasswordReset.issue('u1', now);
    reset.redeem(now);
    expect(() => reset.redeem(now)).toThrowError(ValidationError);
  });

  it('cannot be redeemed after expiry', () => {
    const { reset } = PasswordReset.issue('u1', now);
    expect(() => reset.redeem(reset.expiresAt)).toThrowError(ValidationError);
  });
});
