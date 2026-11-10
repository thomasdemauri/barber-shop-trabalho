import fp from 'fastify-plugin';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Role } from '@prisma/client';

declare module '@fastify/jwt' { interface FastifyJWT { user: { id:string; role:Role; email:string } } }
declare module 'fastify' { interface FastifyInstance { authenticate(request:FastifyRequest, reply:FastifyReply): Promise<void>; requireRoles(...roles:Role[]): (request:FastifyRequest,reply:FastifyReply)=>Promise<void> } }
export default fp(async app => {
 app.decorate('authenticate', async (request, reply) => { try { await request.jwtVerify(); } catch { reply.code(401).send({error:'UNAUTHORIZED',message:'Autenticação necessária'}); } });
 app.decorate('requireRoles', (...roles:Role[]) => async (request, reply) => { await app.authenticate(request,reply); if (reply.sent) return; if (!roles.includes(request.user.role)) return reply.code(403).send({error:'FORBIDDEN',message:'Permissão insuficiente'}); });
});
