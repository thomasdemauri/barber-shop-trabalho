import 'dotenv/config';
import { loadWorkerConfig } from './config.js';
import { DispatchNotification } from './modules/notifications/application/dispatch-notification.js';
import { createEmailProvider } from './modules/notifications/infrastructure/email/create-email-provider.js';
import { RabbitMqNotificationConsumer } from './modules/notifications/infrastructure/rabbitmq-notification-consumer.js';
import { jsonLogger as log } from './shared/infrastructure/json-logger.js';

/** Notification worker: consumes broker events and e-mails the people involved. */
const config = loadWorkerConfig();

const provider = createEmailProvider({
  provider: config.emailProvider,
  from: config.emailFrom,
  apiKey: config.emailApiKey,
  logSimulated: (message, receipt) => log.info(
    { to: message.to.email, subject: message.subject, category: message.category, messageId: receipt.messageId, text: message.text },
    'simulated e-mail (not sent)',
  ),
});
await provider.verify();

const dispatch = new DispatchNotification(provider, {
  shopName: config.shopName,
  frontendUrl: config.frontendUrl,
  timeZone: config.shopTimeZone,
});
const consumer = new RabbitMqNotificationConsumer(
  config.rabbitMqUrl,
  dispatch,
  { maxAttempts: config.maxAttempts, baseDelayMs: config.retryBaseDelayMs },
  log,
  () => process.exit(1),
);
await consumer.start();
log.info({ provider: provider.name }, 'notification worker started');

const shutdown = async () => {
  await consumer.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
