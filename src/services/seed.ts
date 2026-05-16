// Seed data for testing - initialize default users if none exist

const USERS_KEY = 'barbershop_users';

export function initializeTestData() {
  let users: any[] = [];
  try { users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { /* empty */ }

  if (users.length === 0) {
    const testUsers = [
      {
        id: 'u1',
        nome: 'JoÃ£o Silva',
        email: 'joao@test.com',
        telefone: '11999999999',
        tipo: 'cliente',
        senha: '123456',
        data_criacao: new Date().toISOString(),
      },
      {
        id: 'b1',
        nome: 'JoÃ£o Mestre',
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
    localStorage.setItem(USERS_KEY, JSON.stringify(testUsers));
  }
}

export const TEST_CREDENTIALS = {
  CLIENT: { email: 'joao@test.com', password: '123456', name: 'JoÃ£o Silva' },
  BARBER1: { email: 'joao.mestre@barbershop.com', password: '123456', name: 'JoÃ£o Mestre' },
  BARBER2: { email: 'carlos@barbershop.com', password: '123456', name: 'Carlos Neto' },
};
