import { ShopTimeZone } from '../src/modules/scheduling/domain/shop-time-zone.js';
import { CalendarDate, LocalTime } from '../src/modules/scheduling/domain/time.js';

/**
 * Demo data for local development and presentations.
 * Emails use the reserved `.test` domain so no message can ever reach a real inbox.
 * Keep `prisma/DEMO_USERS.md` in sync when changing this list.
 */
export type DemoClient = { name: string; email: string; phone: string; password: string };

export const DEMO_CLIENTS: DemoClient[] = [
  { name: 'Lucas Oliveira', email: 'lucas.oliveira@exemplo.test', phone: '11987654321', password: 'Lucas@2026' },
  { name: 'Gabriel Santos', email: 'gabriel.santos@exemplo.test', phone: '11976543210', password: 'Gabriel@2026' },
  { name: 'Matheus Souza', email: 'matheus.souza@exemplo.test', phone: '11965432109', password: 'Matheus@2026' },
  { name: 'Rafael Pereira', email: 'rafael.pereira@exemplo.test', phone: '11954321098', password: 'Rafael@2026' },
  { name: 'Felipe Costa', email: 'felipe.costa@exemplo.test', phone: '11943210987', password: 'Felipe@2026' },
  { name: 'Bruno Almeida', email: 'bruno.almeida@exemplo.test', phone: '11932109876', password: 'Bruno@2026' },
  { name: 'Thiago Rodrigues', email: 'thiago.rodrigues@exemplo.test', phone: '11921098765', password: 'Thiago@2026' },
  { name: 'Gustavo Ferreira', email: 'gustavo.ferreira@exemplo.test', phone: '11910987654', password: 'Gustavo@2026' },
  { name: 'Leonardo Lima', email: 'leonardo.lima@exemplo.test', phone: '11998761234', password: 'Leonardo@2026' },
  { name: 'Vinícius Carvalho', email: 'vinicius.carvalho@exemplo.test', phone: '11987612345', password: 'Vinicius@2026' },
  { name: 'Pedro Henrique Ribeiro', email: 'pedro.ribeiro@exemplo.test', phone: '11976123456', password: 'PedroH@2026' },
  { name: 'João Victor Martins', email: 'joao.martins@exemplo.test', phone: '11961234567', password: 'JoaoV@2026' },
  { name: 'Caio Barbosa', email: 'caio.barbosa@exemplo.test', phone: '11912345678', password: 'Caio@2026' },
  { name: 'Diego Araújo', email: 'diego.araujo@exemplo.test', phone: '11923456789', password: 'Diego@2026' },
  { name: 'Rodrigo Gomes', email: 'rodrigo.gomes@exemplo.test', phone: '11934567890', password: 'Rodrigo@2026' },
  { name: 'André Nascimento', email: 'andre.nascimento@exemplo.test', phone: '11945678901', password: 'Andre@2026' },
  { name: 'Marcelo Rocha', email: 'marcelo.rocha@exemplo.test', phone: '11956789012', password: 'Marcelo@2026' },
  { name: 'Eduardo Dias', email: 'eduardo.dias@exemplo.test', phone: '11967890123', password: 'Eduardo@2026' },
  { name: 'Ricardo Teixeira', email: 'ricardo.teixeira@exemplo.test', phone: '11978901234', password: 'Ricardo@2026' },
  { name: 'Fernando Moreira', email: 'fernando.moreira@exemplo.test', phone: '11989012345', password: 'Fernando@2026' },
];

/** First and last day (inclusive) covered by demo appointments. */
export const DEMO_PERIOD = { from: '2026-11-20', to: '2027-01-31' };

/** Appointments before this instant are history (completed/canceled); later ones are upcoming. */
export const DEMO_REFERENCE = new Date('2026-11-20T15:00:00.000-03:00');

/** National holidays inside the demo period: the shop is closed. */
export const DEMO_HOLIDAYS = new Set(['2026-12-25', '2027-01-01']);

const NOTES = [
  'Degradê baixo, por favor.',
  'Manter o comprimento em cima.',
  'Barba bem alinhada.',
  'Prefiro tesoura nas laterais.',
  'Primeira vez na barbearia.',
  'Chegarei 5 minutos antes.',
];

type Status = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';

export type DemoAppointment = {
  id: string;
  userId: string;
  barberId: string;
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  status: Status;
  notes: string | null;
};

export type DemoInput = {
  clientIds: string[];
  barberIds: string[];
  services: { id: string; durationMinutes: number }[];
  timeZone: ShopTimeZone;
  /** Deterministic random source in [0, 1). */
  random: () => number;
  workingWeekdays?: number[];
  opensAt?: string;
  closesAt?: string;
  slotMinutes?: number;
};

/** Small deterministic PRNG so every seed run produces the same appointments. */
export function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function* daysBetween(from: string, to: string) {
  const start = CalendarDate.parse(from);
  const end = CalendarDate.parse(to);
  const cursor = new Date(Date.UTC(start.year, start.month - 1, start.day));
  const last = Date.UTC(end.year, end.month - 1, end.day);
  while (cursor.getTime() <= last) {
    yield CalendarDate.of(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, cursor.getUTCDate());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

const pick = <T>(items: T[], random: () => number) => items[Math.floor(random() * items.length)];

function statusFor(startsAt: Date, random: () => number): Status {
  const roll = random();
  if (startsAt < DEMO_REFERENCE) return roll < 0.85 ? 'COMPLETED' : 'CANCELED';
  if (roll < 0.45) return 'CONFIRMED';
  if (roll < 0.9) return 'PENDING';
  return 'CANCELED';
}

const overlaps = (busy: { startsAt: Date; endsAt: Date }[], startsAt: Date, endsAt: Date) =>
  busy.some(other => other.startsAt < endsAt && other.endsAt > startsAt);

/**
 * Builds a realistic agenda: each barber gets 0–5 appointments per working day, inside working hours,
 * on the slot grid, never overlapping for the same barber or the same client.
 */
export function buildDemoAppointments(input: DemoInput): DemoAppointment[] {
  const {
    clientIds, barberIds, services, timeZone, random,
    workingWeekdays = [1, 2, 3, 4, 5], opensAt = '08:00', closesAt = '18:00', slotMinutes = 30,
  } = input;
  const open = LocalTime.parse(opensAt).minutesOfDay;
  const close = LocalTime.parse(closesAt).minutesOfDay;
  const appointments: DemoAppointment[] = [];
  const byClient = new Map<string, DemoAppointment[]>();

  for (const date of daysBetween(DEMO_PERIOD.from, DEMO_PERIOD.to)) {
    if (!workingWeekdays.includes(date.weekday) || DEMO_HOLIDAYS.has(date.toString())) continue;

    for (const barberId of barberIds) {
      const barberDay: DemoAppointment[] = [];
      const wanted = Math.floor(random() * 6);

      for (let attempt = 0; attempt < wanted * 4 && barberDay.length < wanted; attempt++) {
        const service = pick(services, random);
        const lastStart = close - service.durationMinutes;
        const slots = Math.floor((lastStart - open) / slotMinutes) + 1;
        const start = LocalTime.ofMinutes(open + Math.floor(random() * slots) * slotMinutes);
        const startsAt = timeZone.toInstant(date, start);
        const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
        const userId = pick(clientIds, random);

        if (overlaps(barberDay, startsAt, endsAt) || overlaps(byClient.get(userId) ?? [], startsAt, endsAt)) continue;

        const appointment: DemoAppointment = {
          id: `demo-${date.toString()}-${barberId}-${start.toString().replace(':', '')}`,
          userId,
          barberId,
          serviceId: service.id,
          startsAt,
          endsAt,
          status: statusFor(startsAt, random),
          notes: random() < 0.25 ? pick(NOTES, random) : null,
        };
        barberDay.push(appointment);
        byClient.set(userId, [...(byClient.get(userId) ?? []), appointment]);
        appointments.push(appointment);
      }
    }
  }

  return appointments.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}
