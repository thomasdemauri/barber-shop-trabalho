import {
  EmailProviderNotConfiguredError,
  PermanentEmailError,
  type EmailMessage,
  type EmailProvider,
  type EmailReceipt,
} from '../../application/email-provider.js';
import { parseAddress } from './email-address.js';

export type BrevoConfig = {
  apiKey: string | undefined;
  /** Must be a sender verified in Brevo (Senders, domains & dedicated IPs → Senders), e.g. `Barbearia <you@gmail.com>`. */
  from: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
};

type BrevoError = { code?: string; message?: string };

/** Request errors that retrying cannot fix: bad payload, bad key / unauthorised IP, unverified sender. */
const PERMANENT_STATUSES = new Set([400, 401, 403, 404]);

/**
 * Sends transactional e-mails through the Brevo API (https://developers.brevo.com/reference/sendtransacemail).
 * Brevo only needs a verified sender address, not a domain. It has no idempotency key, so the event's key travels
 * as the `X-Notification-Id` header for tracing; a redelivery after a lost acknowledgement may send twice.
 */
export class BrevoEmailProvider implements EmailProvider {
  readonly name = 'brevo';
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetch: typeof fetch;

  constructor(private readonly config: BrevoConfig) {
    this.baseUrl = (config.baseUrl ?? 'https://api.brevo.com/v3').replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs ?? 10_000;
    this.fetch = config.fetch ?? globalThis.fetch;
  }

  async verify() {
    const apiKey = this.requireApiKey();
    parseAddress(this.config.from);
    const response = await this.request('GET', '/account', apiKey);
    if (response.ok) return;
    const error = await this.errorOf(response);
    throw new EmailProviderNotConfiguredError(this.name, `API key rejected (${response.status} ${error.message ?? error.code ?? ''})`.trim());
  }

  async send(message: EmailMessage): Promise<EmailReceipt> {
    const apiKey = this.requireApiKey();
    const response = await this.request('POST', '/smtp/email', apiKey, {
      sender: parseAddress(this.config.from),
      to: [{ email: message.to.email, ...(message.to.name ? { name: message.to.name } : {}) }],
      subject: message.subject,
      textContent: message.text,
      htmlContent: message.html,
      tags: [message.category],
      headers: { 'X-Notification-Id': message.idempotencyKey },
    });

    if (response.ok) {
      const body = (await response.json()) as { messageId?: string };
      return { provider: this.name, messageId: body.messageId ?? 'unknown' };
    }

    const error = await this.errorOf(response);
    const reason = `${response.status} ${error.code ?? ''}: ${error.message ?? response.statusText}`;
    if (PERMANENT_STATUSES.has(response.status)) throw new PermanentEmailError(this.name, reason);
    // 402 (daily credits used up), 429 (rate limit) and 5xx are worth retrying.
    throw new Error(`Email provider "${this.name}" failed: ${reason}`);
  }

  private requireApiKey() {
    if (!this.config.apiKey) throw new EmailProviderNotConfiguredError(this.name, 'BREVO_API_KEY is missing');
    return this.config.apiKey;
  }

  private request(method: string, path: string, apiKey: string, body?: unknown) {
    return this.fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'api-key': apiKey,
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
  }

  private async errorOf(response: Response): Promise<BrevoError> {
    try {
      return (await response.json()) as BrevoError;
    } catch {
      return {};
    }
  }
}
