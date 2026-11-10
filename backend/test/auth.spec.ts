import { hashPassword, verifyPassword } from '../src/lib/auth.js';

describe('password authentication', () => {
  it('hashes a password without retaining the plaintext', async () => {
    const hash = await hashPassword('S3cret-password');

    expect(hash).not.toBe('S3cret-password');
    expect(hash.startsWith('$argon2')).toBeTrue();
  });

  it('accepts the original password and rejects an incorrect one', async () => {
    const hash = await hashPassword('S3cret-password');

    await expectAsync(verifyPassword(hash, 'S3cret-password')).toBeResolvedTo(true);
    await expectAsync(verifyPassword(hash, 'wrong-password')).toBeResolvedTo(false);
  });
});
