import { DEFAULT_SERVICES } from '../src/domain/catalog.js';

describe('service catalog', () => {
  it('contains the six services used by the booking flow', () => {
    expect(DEFAULT_SERVICES.length).toBe(6);
    expect(DEFAULT_SERVICES.map(service => service.id)).toEqual([
      'corte-C', 'combo-CB', 'barba-B', 'trat-H', 'trat-D', 'trat-Co',
    ]);
  });

  it('has valid prices and positive durations for every service', () => {
    for (const service of DEFAULT_SERVICES) {
      expect(service.price).toBeGreaterThanOrEqual(0);
      expect(service.durationMinutes).toBeGreaterThan(0);
      expect(service.name.trim()).not.toBe('');
    }
  });
});
