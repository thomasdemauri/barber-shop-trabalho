import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from '../../src/shared/domain/errors.js';
import { seedShop } from '../support/fixtures.js';

describe('identity use cases', () => {
  describe('RegisterUser', () => {
    it('registers a client with a hashed password', async () => {
      const { useCases, infra } = await seedShop();
      const user = await useCases.identity.registerUser.execute({ name: 'Carla', email: 'Carla@Test.com', password: 'secret123' });

      const stored = await infra.users.findById(user.id);
      expect(stored?.email).toBe('carla@test.com');
      expect(stored?.passwordHash).toBe('hashed:secret123');
      expect(stored?.role).toBe('CLIENT');
    });

    it('rejects a duplicated email regardless of case', async () => {
      const { useCases } = await seedShop();
      await expectAsync(useCases.identity.registerUser.execute({ name: 'Ana', email: 'ANA@test.com', password: 'secret123' }))
        .toBeRejectedWith(jasmine.any(ConflictError));
    });

    it('rejects a duplicated phone', async () => {
      const { useCases } = await seedShop();
      await useCases.identity.registerUser.execute({ name: 'Carla', email: 'carla@test.com', phone: '11 98888-0000', password: 'secret123' });
      await expectAsync(useCases.identity.registerUser.execute({ name: 'Dani', email: 'dani@test.com', phone: '11988880000', password: 'secret123' }))
        .toBeRejectedWith(jasmine.any(ConflictError));
    });

    it('rejects weak passwords', async () => {
      const { useCases } = await seedShop();
      await expectAsync(useCases.identity.registerUser.execute({ name: 'Carla', email: 'carla@test.com', password: '123' }))
        .toBeRejectedWith(jasmine.any(ValidationError));
    });
  });

  describe('AuthenticateUser', () => {
    it('returns the user for valid credentials', async () => {
      const { useCases, client } = await seedShop();
      const user = await useCases.identity.authenticateUser.execute({ email: 'ANA@test.com', password: 'secret123' });
      expect(user.id).toBe(client.id);
    });

    it('rejects an unknown email or a wrong password with the same error', async () => {
      const { useCases } = await seedShop();
      await expectAsync(useCases.identity.authenticateUser.execute({ email: 'nobody@test.com', password: 'secret123' }))
        .toBeRejectedWith(jasmine.any(AuthenticationError));
      await expectAsync(useCases.identity.authenticateUser.execute({ email: 'ana@test.com', password: 'wrong' }))
        .toBeRejectedWith(jasmine.any(AuthenticationError));
    });
  });

  describe('GetUser', () => {
    it('fails for unknown users', async () => {
      const { useCases } = await seedShop();
      await expectAsync(useCases.identity.getUser.execute('missing')).toBeRejectedWith(jasmine.any(NotFoundError));
    });
  });

  describe('UpdateProfile', () => {
    it('updates contact details', async () => {
      const { useCases, client } = await seedShop();
      const user = await useCases.identity.updateProfile.execute(client.id, { name: 'Ana Maria', phone: '11 97777-0000' });
      expect(user.name).toBe('Ana Maria');
      expect(user.phone).toBe('11977770000');
    });

    it('does not allow taking another user email', async () => {
      const { useCases, client } = await seedShop();
      await expectAsync(useCases.identity.updateProfile.execute(client.id, { email: 'bruno@test.com' }))
        .toBeRejectedWith(jasmine.any(ConflictError));
    });

    it('allows keeping the same email', async () => {
      const { useCases, client } = await seedShop();
      await expectAsync(useCases.identity.updateProfile.execute(client.id, { email: 'ana@test.com' })).toBeResolved();
    });

    it('changes the password only when the current one matches', async () => {
      const { useCases, client, infra } = await seedShop();
      await expectAsync(useCases.identity.updateProfile.execute(client.id, { currentPassword: 'wrong', newPassword: 'novaSenha1' }))
        .toBeRejectedWith(jasmine.any(AuthenticationError));
      await expectAsync(useCases.identity.updateProfile.execute(client.id, { newPassword: 'novaSenha1' }))
        .toBeRejectedWith(jasmine.any(AuthenticationError));

      await useCases.identity.updateProfile.execute(client.id, { currentPassword: 'secret123', newPassword: 'novaSenha1' });
      expect((await infra.users.findById(client.id))?.passwordHash).toBe('hashed:novaSenha1');
    });
  });

  describe('preferences', () => {
    it('returns empty preferences for a new user', async () => {
      const { useCases, client } = await seedShop();
      expect(await useCases.identity.getPreferences.execute(client.id)).toEqual({ haircut: null, notifications: null, payment: null });
    });

    it('merges partial updates section by section', async () => {
      const { useCases, client } = await seedShop();
      const haircut = { style: 'Degradê', beard: 'Curta', notes: '' };
      const payment = { preferredMethod: 'pix', pixKey: 'ana@test.com' };
      await useCases.identity.updatePreferences.execute(client.id, { haircut });
      const result = await useCases.identity.updatePreferences.execute(client.id, { payment });

      expect(result).toEqual({ haircut, notifications: null, payment });
      expect(await useCases.identity.getPreferences.execute(client.id)).toEqual(result);
    });
  });

  describe('ListClients', () => {
    it('lists only clients ordered by name', async () => {
      const { useCases } = await seedShop();
      const clients = await useCases.identity.listClients.execute();
      expect(clients.map(user => user.name)).toEqual(['Ana Cliente', 'Bruno Cliente']);
    });
  });

  describe('password reset', () => {
    it('publishes a reset token for a known email and lets the user set a new password once', async () => {
      const { useCases, client, infra } = await seedShop();
      await useCases.identity.requestPasswordReset.execute('Ana@test.com');

      const event = infra.notifications.published[0];
      expect(event.event).toBe('password.reset_requested');
      if (event.event !== 'password.reset_requested') return;
      expect(event.email).toBe('ana@test.com');

      await useCases.identity.resetPassword.execute({ token: event.token, newPassword: 'novaSenha1' });
      expect((await infra.users.findById(client.id))?.passwordHash).toBe('hashed:novaSenha1');
      await expectAsync(useCases.identity.resetPassword.execute({ token: event.token, newPassword: 'outraSenha1' }))
        .toBeRejectedWith(jasmine.any(ValidationError));
    });

    it('silently ignores unknown emails', async () => {
      const { useCases, infra } = await seedShop();
      await expectAsync(useCases.identity.requestPasswordReset.execute('nobody@test.com')).toBeResolved();
      expect(infra.notifications.published).toEqual([]);
    });

    it('rejects unknown or expired tokens', async () => {
      const { useCases, infra } = await seedShop();
      await expectAsync(useCases.identity.resetPassword.execute({ token: 'bogus', newPassword: 'novaSenha1' }))
        .toBeRejectedWith(jasmine.any(ValidationError));

      await useCases.identity.requestPasswordReset.execute('ana@test.com');
      const event = infra.notifications.published[0];
      if (event.event !== 'password.reset_requested') throw new Error('unexpected event');
      infra.clock.set(new Date(event.expiresAt));
      await expectAsync(useCases.identity.resetPassword.execute({ token: event.token, newPassword: 'novaSenha1' }))
        .toBeRejectedWith(jasmine.any(ValidationError));
    });
  });
});
