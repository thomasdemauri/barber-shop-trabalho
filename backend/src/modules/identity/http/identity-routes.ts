import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { actorOf } from '../../../shared/http/auth-plugin.js';
import { parse } from '../../../shared/http/validation.js';
import type { AuthenticateUser } from '../application/authenticate-user.js';
import type { GetUser } from '../application/get-user.js';
import type { ListClients } from '../application/list-clients.js';
import type { RequestPasswordReset, ResetPassword } from '../application/password-reset.js';
import type { GetPreferences, UpdatePreferences } from '../application/preferences.js';
import type { RegisterUser } from '../application/register-user.js';
import type { UpdateProfile } from '../application/update-profile.js';
import type { User } from '../domain/user.js';
import { presentUser } from './presenters.js';

export type IdentityUseCases = {
  registerUser: RegisterUser;
  authenticateUser: AuthenticateUser;
  getUser: GetUser;
  updateProfile: UpdateProfile;
  getPreferences: GetPreferences;
  updatePreferences: UpdatePreferences;
  listClients: ListClients;
  requestPasswordReset: RequestPasswordReset;
  resetPassword: ResetPassword;
};

const registerBody = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string(),
});
const loginBody = z.object({ email: z.string().email(), password: z.string().min(1) });
const profileBody = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});
const preferencesBody = z.object({
  haircut: z.object({ style: z.string().max(60), beard: z.string().max(60), notes: z.string().max(500) }).nullable().optional(),
  notifications: z.object({
    confirmation: z.boolean(),
    reminder: z.boolean(),
    promotions: z.boolean(),
    cancellation: z.boolean(),
    news: z.boolean(),
  }).nullable().optional(),
  payment: z.object({ preferredMethod: z.string().max(30), pixKey: z.string().max(140) }).nullable().optional(),
}).strict();
const forgotBody = z.object({ email: z.string().email() });
const resetBody = z.object({ token: z.string().min(1), newPassword: z.string() });

export function identityRoutes(useCases: IdentityUseCases) {
  return async (app: FastifyInstance) => {
    const session = (user: User) => ({
      token: app.jwt.sign({ id: user.id, role: user.role, email: user.email }),
      user: presentUser(user),
    });

    app.post('/auth/register', async (request, reply) => {
      const user = await useCases.registerUser.execute(parse(registerBody, request.body));
      return reply.code(201).send(session(user));
    });

    app.post('/auth/login', async request => {
      const user = await useCases.authenticateUser.execute(parse(loginBody, request.body));
      return session(user);
    });

    app.post('/auth/password/forgot', async (request, reply) => {
      await useCases.requestPasswordReset.execute(parse(forgotBody, request.body).email);
      return reply.code(202).send();
    });

    app.post('/auth/password/reset', async (request, reply) => {
      await useCases.resetPassword.execute(parse(resetBody, request.body));
      return reply.code(204).send();
    });

    app.get('/auth/me', { preHandler: app.authenticate }, async request =>
      presentUser(await useCases.getUser.execute(actorOf(request).userId)));

    app.patch('/profile', { preHandler: app.authenticate }, async request =>
      presentUser(await useCases.updateProfile.execute(actorOf(request).userId, parse(profileBody, request.body))));

    app.get('/profile/preferences', { preHandler: app.authenticate }, async request =>
      useCases.getPreferences.execute(actorOf(request).userId));

    app.patch('/profile/preferences', { preHandler: app.authenticate }, async request =>
      useCases.updatePreferences.execute(actorOf(request).userId, parse(preferencesBody, request.body)));

    app.get('/admin/clients', { preHandler: app.requireRoles('ADMIN', 'BARBER') }, async () =>
      (await useCases.listClients.execute()).map(presentUser));
  };
}
