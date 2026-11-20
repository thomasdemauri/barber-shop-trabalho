import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parse } from '../../../shared/http/validation.js';
import type { GetShopSettings, UpdateShopSettings } from '../application/shop-settings.js';

export type ShopUseCases = { getShopSettings: GetShopSettings; updateShopSettings: UpdateShopSettings };

const settingsBody = z.object({ name: z.string() });

export function shopRoutes(useCases: ShopUseCases) {
  return async (app: FastifyInstance) => {
    app.get('/shop/settings', async () => useCases.getShopSettings.execute());

    app.put('/admin/shop/settings', { preHandler: app.requireRoles('ADMIN') }, async request =>
      useCases.updateShopSettings.execute(parse(settingsBody, request.body)));
  };
}
