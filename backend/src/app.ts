import Fastify, { type FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import type { UseCases } from './container.js';
import { authPlugin } from './shared/http/auth-plugin.js';
import { registerErrorHandler } from './shared/http/error-handler.js';
import { identityRoutes } from './modules/identity/http/identity-routes.js';
import { catalogRoutes } from './modules/catalog/http/catalog-routes.js';
import { shopRoutes } from './modules/shop/http/shop-routes.js';
import { schedulingRoutes } from './modules/scheduling/http/scheduling-routes.js';

export type AppOptions = {
  useCases: UseCases;
  jwtSecret: string;
  corsOrigin: string[] | true;
  logger?: FastifyServerOptions['logger'];
};

export async function buildApp({ useCases, jwtSecret, corsOrigin, logger = false }: AppOptions) {
  const app = Fastify({ logger });
  await app.register(cors, { origin: corsOrigin, credentials: true });
  await app.register(jwt, { secret: jwtSecret, sign: { expiresIn: '8h' } });
  await app.register(authPlugin);
  registerErrorHandler(app);

  await app.register(async api => {
    await api.register(identityRoutes(useCases.identity));
    await api.register(catalogRoutes(useCases.catalog));
    await api.register(shopRoutes(useCases.shop));
    await api.register(schedulingRoutes(useCases.scheduling));
  }, { prefix: '/api' });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
  return app;
}
