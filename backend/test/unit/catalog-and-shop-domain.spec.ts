import { ServiceOffering } from '../../src/modules/catalog/domain/service-offering.js';
import { shopSettings } from '../../src/modules/shop/domain/shop-settings.js';
import { ValidationError } from '../../src/shared/domain/errors.js';

const input = { name: 'Corte', description: null, icon: 'C', category: 'corte', price: 40, durationMinutes: 40 };

describe('ServiceOffering', () => {
  it('is created active with an id and price rounded to cents', () => {
    const service = ServiceOffering.create({ ...input, price: 39.999 });
    expect(service.active).toBeTrue();
    expect(service.id).toBeTruthy();
    expect(service.price).toBe(40);
  });

  it('enforces invariants on create and update', () => {
    expect(() => ServiceOffering.create({ ...input, price: -1 })).toThrowError(ValidationError);
    expect(() => ServiceOffering.create({ ...input, durationMinutes: 12.5 })).toThrowError(ValidationError);
    expect(() => ServiceOffering.create({ ...input, name: ' ' })).toThrowError(ValidationError);
    const service = ServiceOffering.create(input);
    expect(() => service.update({ durationMinutes: 0 })).toThrowError(ValidationError);
    expect(service.durationMinutes).toBe(40);
  });

  it('can be deactivated and keeps its id', () => {
    const service = ServiceOffering.create({ ...input, id: 'corte' });
    service.update({ active: false, price: 45 });
    expect(service.toSnapshot()).toEqual(jasmine.objectContaining({ id: 'corte', active: false, price: 45 }));
  });
});

describe('shopSettings', () => {
  it('trims the name and enforces length', () => {
    expect(shopSettings({ name: '  Navalha  ' })).toEqual({ name: 'Navalha' });
    expect(() => shopSettings({ name: 'N' })).toThrowError(ValidationError);
  });
});
