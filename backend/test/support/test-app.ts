import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import type { User } from '../../src/modules/identity/domain/user.js';
import { seedShop } from './fixtures.js';

export async function buildTestApp() {
  const shop = await seedShop();
  const app = await buildApp({ useCases: shop.useCases, jwtSecret: 'test-secret', corsOrigin: true });
  const tokenFor = (user: User) => app.jwt.sign({ id: user.id, role: user.role, email: user.email });
  const auth = (user: User) => ({ authorization: `Bearer ${tokenFor(user)}` });
  return { ...shop, app, auth };
}

export const json = <T = any>(response: { body: string }) => JSON.parse(response.body) as T;

export type TestApp = Awaited<ReturnType<typeof buildTestApp>> & { app: FastifyInstance };
