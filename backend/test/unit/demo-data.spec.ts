import { buildDemoAppointments, DEMO_CLIENTS, DEMO_HOLIDAYS, DEMO_PERIOD, DEMO_REFERENCE, mulberry32 } from '../../prisma/demo-data.js';
import { ShopTimeZone } from '../../src/modules/scheduling/domain/shop-time-zone.js';

const timeZone = new ShopTimeZone('America/Sao_Paulo');
const build = (seed = 1) => buildDemoAppointments({
  clientIds: ['c1', 'c2', 'c3', 'c4', 'c5'],
  barberIds: ['b1', 'b2', 'b3'],
  services: [{ id: 'corte', durationMinutes: 40 }, { id: 'combo', durationMinutes: 70 }, { id: 'coloracao', durationMinutes: 90 }],
  timeZone,
  random: mulberry32(seed),
});
const overlapping = (list: { startsAt: Date; endsAt: Date }[]) =>
  list.some((a, i) => list.some((b, j) => i !== j && a.startsAt < b.endsAt && a.endsAt > b.startsAt));

describe('demo clients', () => {
  it('have unique emails and phones on the reserved .test domain', () => {
    expect(new Set(DEMO_CLIENTS.map(c => c.email)).size).toBe(DEMO_CLIENTS.length);
    expect(new Set(DEMO_CLIENTS.map(c => c.phone)).size).toBe(DEMO_CLIENTS.length);
    expect(DEMO_CLIENTS.every(c => c.email.endsWith('@exemplo.test'))).toBeTrue();
    expect(DEMO_CLIENTS.every(c => /^11\d{9}$/.test(c.phone))).toBeTrue();
  });

  it('have passwords accepted by the password policy', () => {
    expect(DEMO_CLIENTS.every(c => c.password.length >= 6)).toBeTrue();
  });
});

describe('buildDemoAppointments', () => {
  const appointments = build();

  it('is deterministic for the same seed', () => {
    expect(build().map(a => a.id)).toEqual(appointments.map(a => a.id));
    expect(build(2).map(a => a.id)).not.toEqual(appointments.map(a => a.id));
  });

  it('covers the whole period on working days only, skipping holidays', () => {
    const days = appointments.map(a => timeZone.toLocal(a.startsAt).date);
    expect(appointments.length).toBeGreaterThan(200);
    expect(days[0].toString() >= DEMO_PERIOD.from).toBeTrue();
    expect(days.at(-1)!.toString() <= DEMO_PERIOD.to).toBeTrue();
    expect(days.some(d => d.toString().startsWith('2027-01'))).toBeTrue();
    expect(days.every(d => d.weekday >= 1 && d.weekday <= 5)).toBeTrue();
    expect(days.some(d => DEMO_HOLIDAYS.has(d.toString()))).toBeFalse();
  });

  it('keeps every appointment on the 30-minute grid inside working hours', () => {
    for (const appointment of appointments) {
      const start = timeZone.toLocal(appointment.startsAt).time.minutesOfDay;
      const end = timeZone.toLocal(appointment.endsAt).time.minutesOfDay;
      expect(start % 30).toBe(0);
      expect(start).toBeGreaterThanOrEqual(8 * 60);
      expect(end).toBeLessThanOrEqual(18 * 60);
    }
  });

  it('never double-books a barber or a client', () => {
    for (const key of ['barberId', 'userId'] as const) {
      const groups = new Map<string, typeof appointments>();
      for (const a of appointments) groups.set(a[key], [...(groups.get(a[key]) ?? []), a]);
      expect([...groups.values()].some(overlapping)).toBeFalse();
    }
  });

  it('uses history statuses before the reference date and open statuses after it', () => {
    const past = appointments.filter(a => a.startsAt < DEMO_REFERENCE);
    const future = appointments.filter(a => a.startsAt >= DEMO_REFERENCE);
    expect(past.every(a => a.status === 'COMPLETED' || a.status === 'CANCELED')).toBeTrue();
    expect(future.every(a => a.status !== 'COMPLETED')).toBeTrue();
    expect(new Set(future.map(a => a.status))).toEqual(new Set(['PENDING', 'CONFIRMED', 'CANCELED']));
  });

  it('gives each appointment a unique, stable id', () => {
    expect(new Set(appointments.map(a => a.id)).size).toBe(appointments.length);
    expect(appointments.every(a => a.id.startsWith('demo-'))).toBeTrue();
  });
});
