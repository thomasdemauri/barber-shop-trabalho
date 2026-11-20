import fp from 'fastify-plugin';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Role } from '../domain/role.js';
import type { Actor } from '../application/actor.js';

export type TokenPayload = { id: string; role: Role; email: string };

declare module '@fastify/jwt' {
  interface FastifyJWT { payload: TokenPayload; user: TokenPayload }
}

type PreHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: PreHandler;
    requireRoles(...roles: Role[]): PreHandler;
  }
}

export const actorOf = (request: FastifyRequest): Actor => ({ userId: request.user.id, role: request.user.role });

export const authPlugin = fp(async app => {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      await reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Autenticação necessária' });
    }
  });

  app.decorate('requireRoles', (...roles: Role[]): PreHandler => async (request, reply) => {
    await app.authenticate(request, reply);
    if (reply.sent) return;
    if (!roles.includes(request.user.role)) {
      await reply.code(403).send({ error: 'FORBIDDEN', message: 'Permissão insuficiente' });
    }
  });
});
