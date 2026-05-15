// Seed data for testing - initialize default users if none exist
import { lsGet, lsSet } from './storage';

export function initializeTestData() {
  const users = lsGet<any[]>('users', []);
  if (users.length === 0) {
    const testUsers = [
      {
        id: 'u1',
        nome: 'João Silva',
        email: 'joao@test.com',
        telefone: '11999999999',
        tipo: 'cliente',
        senha: '123456',
        data_criacao: new Date().toISOString(),
      },
      {
        id: 'b1',
        nome: 'João Mestre',
        email: 'joao.mestre@barbershop.com',
        telefone: '11988888888',
        tipo: 'barbeiro',
        senha: '123456',
        data_criacao: new Date().toISOString(),
      },
      {
        id: 'b2',
        nome: 'Carlos Neto',
        email: 'carlos@barbershop.com',
        telefone: '11987777777',
        tipo: 'barbeiro',
        senha: '123456',
        data_criacao: new Date().toISOString(),
      },
    ];
    lsSet('users', testUsers);
  }
}

export const TEST_CREDENTIALS = {
  CLIENT: { email: 'joao@test.com', password: '123456', name: 'João Silva' },
  BARBER1: { email: 'joao.mestre@barbershop.com', password: '123456', name: 'João Mestre' },
  BARBER2: { email: 'carlos@barbershop.com', password: '123456', name: 'Carlos Neto' },
};
