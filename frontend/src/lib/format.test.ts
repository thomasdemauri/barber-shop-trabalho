import { describe, expect, it } from 'vitest';
import { firstName, formatDuration, formatPrice, initials, serviceSummary } from './format';

describe('format', () => {
  it('formats prices as Brazilian reais', () => {
    expect(formatPrice(40)).toBe('R$ 40,00');
    expect(formatPrice(1234.5)).toBe('R$ 1.234,50');
  });

  it('summarises a service', () => {
    expect(formatDuration(40)).toBe('40 min');
    expect(serviceSummary({ durationMinutes: 40, description: 'Tesoura' })).toBe('40 min · Tesoura');
    expect(serviceSummary({ durationMinutes: 15, description: null })).toBe('15 min');
  });

  it('derives initials and first names', () => {
    expect(initials('joão mestre silva')).toBe('JM');
    expect(firstName('  Ana Maria ', 'Cliente')).toBe('Ana');
    expect(firstName(undefined, 'Cliente')).toBe('Cliente');
  });
});
