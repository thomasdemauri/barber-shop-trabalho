import { describe, expect, it } from 'vitest';
import { dateParts, fromDateKey, longDateLabel, monthGrid, monthLabel, toDateKey } from './dates';

describe('dates', () => {
  it('round-trips local calendar days through date keys', () => {
    const date = new Date(2026, 10, 7);
    expect(toDateKey(date)).toBe('2026-11-07');
    expect(fromDateKey('2026-11-07').getTime()).toBe(date.getTime());
  });

  it('builds a Sunday-first month grid flagging past days and today', () => {
    const grid = monthGrid(2026, 10, new Date(2026, 10, 17, 15, 0));
    const days = grid.filter(day => day !== null);

    expect(days).toHaveLength(30);
    expect(days[0]).toEqual({ day: 1, weekday: 0, dateKey: '2026-11-01', isPast: true, isToday: false });
    expect(days[16]).toEqual(expect.objectContaining({ dateKey: '2026-11-17', isPast: false, isToday: true }));
    expect(days[17].isPast).toBe(false);
  });

  it('pads the first week with empty cells', () => {
    // January 2030 starts on a Tuesday.
    expect(monthGrid(2030, 0, new Date(2030, 0, 1)).slice(0, 2)).toEqual([null, null]);
  });

  it('formats labels in Portuguese', () => {
    expect(monthLabel(2026, 10)).toBe('Novembro 2026');
    expect(longDateLabel('2026-11-17')).toBe('Ter, 17 de Novembro');
  });

  it('splits an ISO instant into local display parts', () => {
    const iso = new Date(2026, 10, 17, 9, 5).toISOString();
    expect(dateParts(iso)).toEqual({ day: 17, month: 'NOV', weekday: 'Ter', time: '09:05', dateKey: '2026-11-17' });
  });
});
