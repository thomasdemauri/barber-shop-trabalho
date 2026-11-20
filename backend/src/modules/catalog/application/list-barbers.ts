import type { BarberRepository } from '../domain/barber.js';

export class ListBarbers {
  constructor(private readonly barbers: BarberRepository) {}

  async execute() {
    return (await this.barbers.list()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }
}
