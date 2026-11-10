/**
 * Brazilian phone mask: (XX) X XXXX-XXXX
 */
export function maskPhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3)}`;
  return `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/**
 * Strip mask, returning only digits.
 */
export function unmaskPhone(masked: string): string {
  return masked.replace(/\D/g, '');
}
