import type { NotificationEvent } from '../domain/notification-event.js';
import type { EmailProvider, EmailReceipt } from './email-provider.js';
import { emailFor, type TemplateOptions } from './notification-templates.js';

/** Worker use case: deliver one event to its recipient. */
export class DispatchNotification {
  constructor(private readonly provider: EmailProvider, private readonly templates: TemplateOptions) {}

  execute(event: NotificationEvent): Promise<EmailReceipt> {
    return this.provider.send(emailFor(event, this.templates));
  }
}
