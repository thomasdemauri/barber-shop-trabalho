import { execFileSync } from 'node:child_process';
import { expect, type Page } from '@playwright/test';

export const BARBER = { name: 'Carlos Barbosa', email: 'carlos@barbershop.com', password: '123456' };

export function uniqueClient() {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    name: `Cliente E2E ${id.slice(-4)}`,
    email: `e2e.${id}@exemplo.test`,
    phone: `119${id.slice(-8)}`,
    password: 'Senha@2026',
  };
}

export async function login(page: Page, email: string, password: string, mode: 'Cliente' | 'Barbeiro') {
  await page.goto('/login');
  await page.getByRole('button', { name: mode, exact: true }).click();
  await page.getByPlaceholder('nome@email.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(mode === 'Barbeiro' ? /\/admin$/ : /\/home$/);
}

/** Days from today to `dateKey` (YYYY-MM-DD), both as calendar dates. */
export function daysUntil(dateKey: string, today = new Date()) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - start) / 86_400_000);
}

/** Simulated e-mails the worker logged (EMAIL_PROVIDER=memory), read from docker compose. */
export function simulatedEmails(): { to: string; subject: string; category: string }[] {
  const logs = execFileSync('docker', ['compose', 'logs', '--no-log-prefix', 'notification-worker'], {
    cwd: new URL('../..', import.meta.url),
    encoding: 'utf8',
  });
  return logs
    .split('\n')
    .filter(line => line.startsWith('{'))
    .map(line => JSON.parse(line))
    .filter(entry => entry.msg === 'simulated e-mail (not sent)');
}
