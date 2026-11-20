import type { UserRepository } from '../domain/user-repository.js';

export class ListClients {
  constructor(private readonly users: UserRepository) {}

  async execute() {
    const clients = await this.users.listByRole('CLIENT');
    return clients.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }
}
