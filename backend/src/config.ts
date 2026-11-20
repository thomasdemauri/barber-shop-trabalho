import { EMAIL_PROVIDERS, type EmailProviderName } from './modules/notifications/infrastructure/email/create-email-provider.js';

const DEVELOPMENT_JWT_SECRET = 'development-only-secret-change-me';

export type Config = {
  port: number;
  jwtSecret: string;
  corsOrigin: string[] | true;
  rabbitMqUrl: string;
  shopTimeZone: string;
  slotIntervalMinutes: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  if (env.NODE_ENV === 'production' && !env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production');
  }
  return {
    port: Number(env.PORT ?? 3333),
    jwtSecret: env.JWT_SECRET ?? DEVELOPMENT_JWT_SECRET,
    corsOrigin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : true,
    rabbitMqUrl: env.RABBITMQ_URL ?? 'amqp://localhost',
    shopTimeZone: env.SHOP_TIMEZONE ?? 'America/Sao_Paulo',
    slotIntervalMinutes: Number(env.SLOT_INTERVAL_MINUTES ?? 30),
  };
}

export type WorkerConfig = {
  rabbitMqUrl: string;
  emailProvider: EmailProviderName;
  emailFrom: string;
  emailApiKey: string | undefined;
  shopName: string;
  shopTimeZone: string;
  frontendUrl: string;
  maxAttempts: number;
  retryBaseDelayMs: number;
};

export function loadWorkerConfig(env: NodeJS.ProcessEnv = process.env): WorkerConfig {
  const emailProvider = (env.EMAIL_PROVIDER ?? 'memory') as EmailProviderName;
  if (!EMAIL_PROVIDERS.includes(emailProvider)) {
    throw new Error(`EMAIL_PROVIDER must be one of: ${EMAIL_PROVIDERS.join(', ')}`);
  }
  return {
    rabbitMqUrl: env.RABBITMQ_URL ?? 'amqp://localhost',
    emailProvider,
    emailFrom: env.EMAIL_FROM ?? 'Navalha de Ouro <nao-responda@barbearia.test>',
    emailApiKey: env.BREVO_API_KEY || undefined,
    shopName: env.SHOP_NAME ?? 'Navalha de Ouro',
    shopTimeZone: env.SHOP_TIMEZONE ?? 'America/Sao_Paulo',
    frontendUrl: (env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/+$/, ''),
    maxAttempts: Number(env.NOTIFICATION_MAX_ATTEMPTS ?? 5),
    retryBaseDelayMs: Number(env.NOTIFICATION_RETRY_DELAY_MS ?? 2000),
  };
}

