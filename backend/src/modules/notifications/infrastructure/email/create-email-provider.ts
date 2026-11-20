import type { EmailMessage, EmailProvider, EmailReceipt } from '../../application/email-provider.js';
import { BrevoEmailProvider } from './brevo-email-provider.js';
import { InMemoryEmailProvider } from './in-memory-email-provider.js';

export const EMAIL_PROVIDERS = ['memory', 'brevo'] as const;
export type EmailProviderName = (typeof EMAIL_PROVIDERS)[number];

export type EmailProviderConfig = {
  provider: EmailProviderName;
  from: string;
  apiKey: string | undefined;
  logSimulated: (message: EmailMessage, receipt: EmailReceipt) => void;
};

export function createEmailProvider(config: EmailProviderConfig): EmailProvider {
  switch (config.provider) {
    case 'memory':
      return new InMemoryEmailProvider(config.logSimulated);
    case 'brevo':
      return new BrevoEmailProvider({ apiKey: config.apiKey, from: config.from });
  }
}
