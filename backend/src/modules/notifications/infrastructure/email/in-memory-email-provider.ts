import type { EmailMessage, EmailProvider, EmailReceipt } from '../../application/email-provider.js';

type Logger = (message: EmailMessage, receipt: EmailReceipt) => void;

/**
 * Simulates an e-mail provider: keeps every message in memory and logs it instead of sending.
 * Like real providers, it ignores a repeated idempotency key.
 */
export class InMemoryEmailProvider implements EmailProvider {
  readonly name = 'memory';
  private readonly messages: EmailMessage[] = [];
  private readonly receipts = new Map<string, EmailReceipt>();
  private pendingFailures: Error[] = [];

  constructor(private readonly log: Logger = () => undefined) {}

  get sent(): readonly EmailMessage[] {
    return this.messages;
  }

  async verify() {}

  async send(message: EmailMessage) {
    const failure = this.pendingFailures.shift();
    if (failure) throw failure;

    const existing = this.receipts.get(message.idempotencyKey);
    if (existing) return existing;

    const receipt = { provider: this.name, messageId: `memory-${this.messages.length + 1}` };
    this.messages.push(message);
    this.receipts.set(message.idempotencyKey, receipt);
    this.log(message, receipt);
    return receipt;
  }

  /** Makes the next `count` sends fail, to exercise retries. */
  failNext(count: number, error = new Error('simulated provider outage')) {
    this.pendingFailures = Array.from({ length: count }, () => error);
  }

  clear() {
    this.messages.length = 0;
    this.receipts.clear();
    this.pendingFailures = [];
  }
}
