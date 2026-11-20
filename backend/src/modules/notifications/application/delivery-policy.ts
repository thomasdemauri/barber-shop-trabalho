import { notificationEventSchema } from '../domain/notification-event.js';
import type { DispatchNotification } from './dispatch-notification.js';
import { PermanentEmailError } from './email-provider.js';

export type DeliveryOutcome =
  | { action: 'ack' }
  | { action: 'retry'; attempt: number; delayMs: number; reason: string }
  | { action: 'dead-letter'; reason: string };

export type DeliveryPolicy = { maxAttempts: number; baseDelayMs: number };

/** Exponential back-off: 1×, 2×, 4×… the base delay. */
export const retryDelay = (attempt: number, baseDelayMs: number) => baseDelayMs * 2 ** (attempt - 1);

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Decides what happens to one broker message. Malformed messages can never succeed, so they go
 * straight to the dead-letter queue, as do messages the provider rejects outright; other delivery
 * failures (outages, rate limits) are retried until `maxAttempts`.
 */
export async function processDelivery(
  content: string,
  attemptsSoFar: number,
  dispatch: DispatchNotification,
  policy: DeliveryPolicy,
): Promise<DeliveryOutcome> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { action: 'dead-letter', reason: 'invalid JSON' };
  }
  const event = notificationEventSchema.safeParse(parsed);
  if (!event.success) return { action: 'dead-letter', reason: `invalid event: ${event.error.issues[0]?.message ?? 'unknown'}` };

  try {
    await dispatch.execute(event.data);
    return { action: 'ack' };
  } catch (error) {
    if (error instanceof PermanentEmailError) return { action: 'dead-letter', reason: reasonOf(error) };
    const attempt = attemptsSoFar + 1;
    if (attempt >= policy.maxAttempts) return { action: 'dead-letter', reason: reasonOf(error) };
    return { action: 'retry', attempt, delayMs: retryDelay(attempt, policy.baseDelayMs), reason: reasonOf(error) };
  }
}
