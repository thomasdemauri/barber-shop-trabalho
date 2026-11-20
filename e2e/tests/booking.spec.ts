import { expect, test } from '@playwright/test';
import { BARBER, daysUntil, login, simulatedEmails, uniqueClient } from './support';

test('client books with Carlos, the barber confirms and the client is e-mailed', async ({ browser }) => {
  const client = uniqueClient();

  // --- Client: sign up, then book "Corte Clássico" with Carlos next month ---
  const clientPage = await (await browser.newContext()).newPage();
  await clientPage.goto('/register');
  await clientPage.getByPlaceholder('Seu nome completo').fill(client.name);
  await clientPage.getByPlaceholder('nome@email.com').fill(client.email);
  await clientPage.getByPlaceholder('(11) 9 0000-0000').fill(client.phone);
  await clientPage.getByPlaceholder('Mínimo 8 caracteres').fill(client.password);
  await clientPage.getByPlaceholder('Repita a senha').fill(client.password);
  await clientPage.getByRole('button', { name: 'Finalizar Cadastro' }).click();
  await expect(clientPage).toHaveURL(/\/home$/);

  await clientPage.goto('/services');
  await clientPage.getByRole('button', { name: /Corte Clássico/ }).click();
  await clientPage.getByRole('button', { name: /Continuar/ }).click();

  await clientPage.getByRole('button', { name: /Carlos/ }).click();
  await clientPage.getByRole('button', { name: 'Escolher Horário' }).click();

  // Next month always has open working days, whatever today's date and time are.
  await clientPage.getByRole('button', { name: 'Próximo mês' }).click();
  const day = clientPage.locator('button[aria-label^="20"]:not([disabled])').first();
  const dateKey = (await day.getAttribute('aria-label'))!;
  await day.click();
  const slot = clientPage.locator('button:not([disabled])').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
  const time = (await slot.textContent())!.trim();
  await slot.click();
  await clientPage.getByRole('button', { name: /Confirmar Horário/ }).click();
  await clientPage.getByRole('button', { name: 'Confirmar Agendamento' }).click();
  await expect(clientPage).toHaveURL(/\/success$/);

  // The barber hears about the booking.
  await expect.poll(() => simulatedEmails().some(email => email.category === 'appointment.booked' && email.to === BARBER.email))
    .toBe(true);

  // --- Barber: open that day in the agenda and confirm ---
  const barberPage = await (await browser.newContext()).newPage();
  await login(barberPage, BARBER.email, BARBER.password, 'Barbeiro');
  await barberPage.goto('/admin/agenda');
  for (let i = daysUntil(dateKey); i > 0; i--) await barberPage.getByRole('button', { name: /Próximo/ }).click();

  const card = barberPage.locator('button[aria-expanded]').filter({ hasText: client.name });
  await expect(card).toContainText(time);
  await card.click();
  await barberPage.getByRole('button', { name: 'Confirmar', exact: true }).click();

  // --- The client sees it confirmed and gets the e-mail ---
  await expect.poll(() => simulatedEmails().find(email => email.category === 'appointment.confirmed' && email.to === client.email)?.subject)
    .toContain('Agendamento confirmado');

  await clientPage.goto('/appointments');
  await expect(clientPage.getByText('Confirmado').first()).toBeVisible();
});
