import { ShopTimeZone } from '../../src/modules/scheduling/domain/shop-time-zone.js';
import { CalendarDate, LocalTime } from '../../src/modules/scheduling/domain/time.js';
import { ValidationError } from '../../src/shared/domain/errors.js';

describe('ShopTimeZone', () => {
  it('converts shop wall-clock time to a UTC instant', () => {
    const saoPaulo = new ShopTimeZone('America/Sao_Paulo');
    const instant = saoPaulo.toInstant(CalendarDate.parse('2026-11-17'), LocalTime.parse('08:00'));
    expect(instant.toISOString()).toBe('2026-11-17T11:00:00.000Z');
  });

  it('converts an instant back to the shop date and time', () => {
    const saoPaulo = new ShopTimeZone('America/Sao_Paulo');
    const local = saoPaulo.toLocal(new Date('2026-11-18T01:30:00.000Z'));
    expect(local.date.toString()).toBe('2026-11-17');
    expect(local.time.toString()).toBe('22:30');
  });

  it('handles zones with daylight saving time', () => {
    const newYork = new ShopTimeZone('America/New_York');
    expect(newYork.toInstant(CalendarDate.parse('2026-07-01'), LocalTime.parse('09:00')).toISOString())
      .toBe('2026-07-01T13:00:00.000Z');
    expect(newYork.toInstant(CalendarDate.parse('2026-12-01'), LocalTime.parse('09:00')).toISOString())
      .toBe('2026-12-01T14:00:00.000Z');
  });

  it('treats 24:00 as the start of the next day', () => {
    const utc = new ShopTimeZone('UTC');
    expect(utc.toInstant(CalendarDate.parse('2026-11-17'), LocalTime.ofMinutes(1440)).toISOString())
      .toBe('2026-11-18T00:00:00.000Z');
  });

  it('rejects unknown zones', () => {
    expect(() => new ShopTimeZone('Mars/Olympus')).toThrowError(ValidationError);
  });
});
