import 'dotenv/config';
import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { createUseCases } from './container.js';
import { createPrismaInfrastructure } from './infrastructure.js';
import { prisma } from './shared/infrastructure/prisma.js';
import { RabbitMqNotificationPublisher } from './modules/notifications/infrastructure/rabbitmq-notification-publisher.js';
import { ResilientNotificationPublisher } from './modules/notifications/infrastructure/resilient-notification-publisher.js';

const config = loadConfig();
let logError: (error: unknown, event: unknown) => void = error => console.error(error);
const notifications = new ResilientNotificationPublisher(
  new RabbitMqNotificationPublisher(config.rabbitMqUrl),
  (error, event) => logError(error, event),
);

const useCases = createUseCases(createPrismaInfrastructure(prisma, notifications), config);
const app = await buildApp({ useCases, jwtSecret: config.jwtSecret, corsOrigin: config.corsOrigin, logger: true });
logError = (error, event) => app.log.error({ err: error, event }, 'failed to publish notification');

await app.listen({ port: config.port, host: '0.0.0.0' });

const shutdown = async () => {
  await app.close();
  await notifications.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
