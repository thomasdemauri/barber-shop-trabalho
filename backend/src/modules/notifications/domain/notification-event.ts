import { z } from 'zod';

/**
 * Contract between the API (publisher) and the notification worker (consumer).
 * Events are self-contained so the worker never needs database access.
 */
const person = z.object({ id: z.string(), name: z.string(), email: z.string().email() });

export const APPOINTMENT_EVENTS = [
  'appointment.booked',
  'appointment.canceled_by_client',
  'appointment.confirmed',
  'appointment.canceled_by_barber',
] as const;
export type AppointmentEventName = (typeof APPOINTMENT_EVENTS)[number];

/** Who must be told about each appointment event. */
export const RECIPIENT_OF: Record<AppointmentEventName, 'barber' | 'client'> = {
  'appointment.booked': 'barber',
  'appointment.canceled_by_client': 'barber',
  'appointment.confirmed': 'client',
  'appointment.canceled_by_barber': 'client',
};

export const appointmentNotificationSchema = z.object({
  event: z.enum(APPOINTMENT_EVENTS),
  appointmentId: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  service: z.object({ name: z.string(), price: z.number() }),
  client: person,
  barber: person,
  occurredAt: z.string().datetime(),
});

export const passwordResetNotificationSchema = z.object({
  event: z.literal('password.reset_requested'),
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  token: z.string(),
  expiresAt: z.string().datetime(),
});

export const notificationEventSchema = z.discriminatedUnion('event', [
  appointmentNotificationSchema,
  passwordResetNotificationSchema,
]);

export type AppointmentNotification = z.infer<typeof appointmentNotificationSchema>;
export type PasswordResetNotification = z.infer<typeof passwordResetNotificationSchema>;
export type NotificationEvent = z.infer<typeof notificationEventSchema>;
