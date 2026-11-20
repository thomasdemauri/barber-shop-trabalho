import { NotFoundError, ValidationError } from '../../src/shared/domain/errors.js';
import { seedShop } from '../support/fixtures.js';

describe('catalog use cases', () => {
  it('lists active services by name and includes inactive ones only on request', async () => {
    const { useCases } = await seedShop();
    await useCases.catalog.updateServiceOffering.execute('combo', { active: false });

    expect((await useCases.catalog.listServiceOfferings.execute()).map(s => s.id)).toEqual(['corte']);
    expect((await useCases.catalog.listServiceOfferings.execute({ includeInactive: true })).map(s => s.id)).toEqual(['combo', 'corte']);
  });

  it('creates and updates services', async () => {
    const { useCases, infra } = await seedShop();
    const created = await useCases.catalog.createServiceOffering.execute({
      name: 'Pigmentação', description: 'Barba', icon: 'P', category: 'barba', price: 50, durationMinutes: 30,
    });
    await useCases.catalog.updateServiceOffering.execute(created.id, { price: 55 });
    expect((await infra.services.findById(created.id))?.price).toBe(55);
  });

  it('fails to update unknown services or with invalid values', async () => {
    const { useCases } = await seedShop();
    await expectAsync(useCases.catalog.updateServiceOffering.execute('missing', { price: 1 })).toBeRejectedWith(jasmine.any(NotFoundError));
    await expectAsync(useCases.catalog.updateServiceOffering.execute('corte', { price: -5 })).toBeRejectedWith(jasmine.any(ValidationError));
  });

  it('lists barbers by name', async () => {
    const { useCases } = await seedShop();
    expect((await useCases.catalog.listBarbers.execute()).map(b => b.name)).toEqual(['João Mestre', 'Pedro Silva']);
  });
});

describe('shop settings use cases', () => {
  it('falls back to the default name and persists updates', async () => {
    const { useCases } = await seedShop();
    expect(await useCases.shop.getShopSettings.execute()).toEqual({ name: 'Navalha de Ouro' });
    await useCases.shop.updateShopSettings.execute({ name: ' Barbearia Central ' });
    expect(await useCases.shop.getShopSettings.execute()).toEqual({ name: 'Barbearia Central' });
  });
});
