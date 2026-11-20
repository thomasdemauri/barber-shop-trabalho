import { describe, expect, it } from 'vitest';
import { toAppointment } from '../api/endpoints';
import { apiAppointment } from '../test/fixtures';
import { historyFirst, isActive, newestFirst, onDay, revenue, upcomingFirst } from './appointments';

const now = new Date(2030, 0, 15, 12, 0);
const at = (day: number, hour: number) => new Date(2030, 0, day, hour, 0).toISOString();

const past = toAppointment(apiAppointment({ id: 'past', startsAt: at(14, 10), status: 'CONFIRMED' }));
const later = toAppointment(apiAppointment({ id: 'later', startsAt: at(20, 9) }));
const soon = toAppointment(apiAppointment({ id: 'soon', startsAt: at(16, 9), status: 'CONFIRMED' }));
const canceled = toAppointment(apiAppointment({ id: 'canceled', startsAt: at(18, 9), status: 'CANCELED' }));
const all = [past, later, soon, canceled];

describe('appointment helpers', () => {
  it('knows which statuses hold a slot', () => {
    expect([past, later, canceled].map(isActive)).toEqual([true, true, false]);
  });

  it('separates upcoming from history', () => {
    expect(upcomingFirst(all, now).map(a => a.id)).toEqual(['soon', 'later']);
    expect(historyFirst(all, now).map(a => a.id)).toEqual(['canceled', 'past']);
    expect(newestFirst(all).map(a => a.id)).toEqual(['later', 'canceled', 'soon', 'past']);
  });

  it('filters by local day', () => {
    expect(onDay(all, '2030-01-16').map(a => a.id)).toEqual(['soon']);
  });

  it('sums revenue ignoring canceled appointments', () => {
    expect(revenue(all)).toBe(120);
  });
});
