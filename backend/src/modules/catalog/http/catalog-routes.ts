import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { idParams, parse } from '../../../shared/http/validation.js';
import type { ListBarbers } from '../application/list-barbers.js';
import type {
  CreateServiceOffering,
  ListServiceOfferings,
  UpdateServiceOffering,
} from '../application/service-offerings.js';
import type { Barber } from '../domain/barber.js';
import type { ServiceOffering } from '../domain/service-offering.js';

export type CatalogUseCases = {
  listServiceOfferings: ListServiceOfferings;
  createServiceOffering: CreateServiceOffering;
  updateServiceOffering: UpdateServiceOffering;
  listBarbers: ListBarbers;
};

export const presentService = (service: ServiceOffering) => service.toSnapshot();

export const presentBarber = ({ id, name, experience, bio, rating, reviews }: Barber) =>
  ({ id, name, experience, bio, rating, reviews });

const serviceFields = {
  name: z.string(),
  description: z.string().max(200).nullable(),
  icon: z.string().max(4).nullable(),
  category: z.string(),
  price: z.number(),
  durationMinutes: z.number().int(),
};
const createServiceBody = z.object(serviceFields);
const updateServiceBody = z.object({ ...serviceFields, active: z.boolean() }).partial().strict();

export function catalogRoutes(useCases: CatalogUseCases) {
  return async (app: FastifyInstance) => {
    app.get('/catalog/services', async () =>
      (await useCases.listServiceOfferings.execute()).map(presentService));

    app.get('/catalog/barbers', async () =>
      (await useCases.listBarbers.execute()).map(presentBarber));

    app.get('/admin/services', { preHandler: app.requireRoles('ADMIN') }, async () =>
      (await useCases.listServiceOfferings.execute({ includeInactive: true })).map(presentService));

    app.post('/admin/services', { preHandler: app.requireRoles('ADMIN') }, async (request, reply) => {
      const service = await useCases.createServiceOffering.execute(parse(createServiceBody, request.body));
      return reply.code(201).send(presentService(service));
    });

    app.patch('/admin/services/:id', { preHandler: app.requireRoles('ADMIN') }, async request => {
      const { id } = parse(idParams, request.params);
      return presentService(await useCases.updateServiceOffering.execute(id, parse(updateServiceBody, request.body)));
    });
  };
}
