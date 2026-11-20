import type { EmailAddress } from '../../application/email-provider.js';

const NAMED = /^\s*"?([^"<]*?)"?\s*<\s*([^<>\s]+@[^<>\s]+)\s*>\s*$/;
const BARE = /^\s*([^<>\s]+@[^<>\s]+)\s*$/;

/** Parses `Name <email>` or a bare `email` (the EMAIL_FROM format). */
export function parseAddress(value: string): EmailAddress {
  const named = NAMED.exec(value);
  if (named) return { name: named[1].trim(), email: named[2] };
  const bare = BARE.exec(value);
  if (bare) return { name: '', email: bare[1] };
  throw new Error(`Invalid e-mail address "${value}": use "Name <email@example.com>" or "email@example.com"`);
}
