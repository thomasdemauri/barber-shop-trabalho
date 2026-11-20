const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** "R$ 40,00" (Intl uses a non-breaking space; normalised for predictable rendering and tests). */
export const formatPrice = (value: number) => currency.format(value).replace(/\s/g, ' ');

export const formatDuration = (minutes: number) => `${minutes} min`;

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');

export const firstName = (name: string | undefined, fallback: string) => name?.trim().split(/\s+/)[0] || fallback;

/** "40 min · Tesoura ou máquina" */
export const serviceSummary = (service: { durationMinutes: number; description: string | null }) =>
  [formatDuration(service.durationMinutes), service.description].filter(Boolean).join(' · ');
