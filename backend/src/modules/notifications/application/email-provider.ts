export type EmailAddress = { name: string; email: string };

export type EmailMessage = {
  to: EmailAddress;
  subject: string;
  text: string;
  html: string;
  /** Same value for redeliveries of one event, so providers that support it can drop duplicates. */
  idempotencyKey: string;
  /** Event name, useful as a provider tag or for filtering logs. */
  category: string;
};

export type EmailReceipt = { provider: string; messageId: string };

/** Port for whatever actually delivers e-mails (simulation, SMTP, an HTTP API...). */
export interface EmailProvider {
  readonly name: string;
  /** Fails fast at worker start-up when credentials or connectivity are wrong. */
  verify(): Promise<void>;
  send(message: EmailMessage): Promise<EmailReceipt>;
}

export class EmailProviderNotConfiguredError extends Error {
  constructor(provider: string, reason: string) {
    super(`Email provider "${provider}" is not configured: ${reason}`);
    this.name = 'EmailProviderNotConfiguredError';
  }
}

/** The provider refused the message (bad recipient, unverified sender...): retrying cannot help. */
export class PermanentEmailError extends Error {
  constructor(provider: string, reason: string) {
    super(`Email provider "${provider}" rejected the message: ${reason}`);
    this.name = 'PermanentEmailError';
  }
}
