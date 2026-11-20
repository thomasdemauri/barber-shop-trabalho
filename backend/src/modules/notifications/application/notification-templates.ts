import type { AppointmentNotification, NotificationEvent, PasswordResetNotification } from '../domain/notification-event.js';
import { RECIPIENT_OF } from '../domain/notification-event.js';
import type { EmailMessage } from './email-provider.js';

export type TemplateOptions = { shopName: string; frontendUrl: string; timeZone: string };

type Content = { subject: string; paragraphs: string[]; action?: { label: string; url: string } };

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const firstName = (name: string) => name.trim().split(/\s+/)[0];

function when(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(iso));
}

const price = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value).replace(/\s/g, ' ');

function appointmentContent(event: AppointmentNotification, options: TemplateOptions): Content {
  const date = when(event.startsAt, options.timeZone);
  const service = `${event.service.name} (${price(event.service.price)})`;
  const agenda = { label: 'Abrir agenda', url: `${options.frontendUrl}/admin/agenda` };
  const myAppointments = { label: 'Ver meus agendamentos', url: `${options.frontendUrl}/appointments` };

  switch (event.event) {
    case 'appointment.booked':
      return {
        subject: `Novo agendamento: ${event.service.name} em ${date}`,
        paragraphs: [`${event.client.name} agendou ${service} para ${date}.`, 'Confirme ou cancele o horário pelo painel.'],
        action: agenda,
      };
    case 'appointment.canceled_by_client':
      return {
        subject: `Agendamento cancelado pelo cliente: ${date}`,
        paragraphs: [`${event.client.name} cancelou ${service} marcado para ${date}.`, 'O horário voltou a ficar disponível.'],
        action: agenda,
      };
    case 'appointment.confirmed':
      return {
        subject: `Agendamento confirmado: ${date}`,
        paragraphs: [`${event.barber.name} confirmou seu ${service} para ${date}.`, 'Até lá!'],
        action: myAppointments,
      };
    case 'appointment.canceled_by_barber':
      return {
        subject: `Agendamento cancelado: ${date}`,
        paragraphs: [`Seu ${service} com ${event.barber.name} para ${date} foi cancelado pela barbearia.`, 'Escolha outro horário quando quiser.'],
        action: { label: 'Agendar novamente', url: `${options.frontendUrl}/services` },
      };
  }
}

function passwordResetContent(event: PasswordResetNotification, options: TemplateOptions): Content {
  return {
    subject: 'Redefinição de senha',
    paragraphs: [
      'Recebemos um pedido para redefinir a sua senha.',
      `O link vale até ${when(event.expiresAt, options.timeZone)}. Se não foi você, ignore este e-mail.`,
    ],
    action: { label: 'Redefinir senha', url: `${options.frontendUrl}/reset-password?token=${encodeURIComponent(event.token)}` },
  };
}

function render(greetingName: string, content: Content, shopName: string) {
  const greeting = `Olá, ${firstName(greetingName)}!`;
  const text = [greeting, '', ...content.paragraphs, ...(content.action ? ['', `${content.action.label}: ${content.action.url}`] : []), '', `— ${shopName}`].join('\n');
  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    ...content.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`),
    content.action ? `<p><a href="${escapeHtml(content.action.url)}">${escapeHtml(content.action.label)}</a></p>` : '',
    `<p>— ${escapeHtml(shopName)}</p>`,
  ].join('\n');
  return { text, html };
}

/** Builds the e-mail for an event: who receives it and what it says (Portuguese). */
export function emailFor(event: NotificationEvent, options: TemplateOptions): EmailMessage {
  if (event.event === 'password.reset_requested') {
    const content = passwordResetContent(event, options);
    return {
      to: { name: event.name, email: event.email },
      subject: content.subject,
      ...render(event.name, content, options.shopName),
      idempotencyKey: `${event.event}:${event.userId}:${event.expiresAt}`,
      category: event.event,
    };
  }

  const recipient = event[RECIPIENT_OF[event.event]];
  const content = appointmentContent(event, options);
  return {
    to: { name: recipient.name, email: recipient.email },
    subject: content.subject,
    ...render(recipient.name, content, options.shopName),
    idempotencyKey: `${event.event}:${event.appointmentId}:${event.occurredAt}`,
    category: event.event,
  };
}
