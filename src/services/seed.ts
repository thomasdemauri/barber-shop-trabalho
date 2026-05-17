const USERS_KEY = 'barbershop_users';
const SEED_VERSION_KEY = 'barbershop_seed_v';
const SEED_VERSION = '3';

const DEFAULT_USERS = [
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
    id: 'admin',
    nome: 'Admin Barbeiro',
    email: 'admin@example.com',
    telefone: '11900000000',
    tipo: 'barbeiro',
    senha: '1234',
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
    nome: 'Pedro Silva',
    email: 'pedro@barbershop.com',
    telefone: '11977777777',
    tipo: 'barbeiro',
    senha: '123456',
    data_criacao: new Date().toISOString(),
  },
  {
    id: 'b3',
    nome: 'Carlos Barbosa',
    email: 'carlos@barbershop.com',
    telefone: '11966666666',
    tipo: 'barbeiro',
    senha: '123456',
    data_criacao: new Date().toISOString(),
  },
];

const SEED_EMAILS = new Set(DEFAULT_USERS.map(u => u.email));

export function initializeTestData() {
  const version = localStorage.getItem(SEED_VERSION_KEY);

  if (version !== SEED_VERSION) {
    // Seed changed: preserve user-registered accounts, replace seed data
    let existing: any[] = [];
    try { existing = JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { /* empty */ }

    const userCreated = existing.filter((u: any) => !SEED_EMAILS.has(u.email));
    localStorage.setItem(USERS_KEY, JSON.stringify([...DEFAULT_USERS, ...userCreated]));
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    return;
  }

  // Same version: ensure each seed user still has correct tipo (safety net)
  let users: any[] = [];
  try { users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return; }

  let changed = false;
  for (const seed of DEFAULT_USERS) {
    const idx = users.findIndex((u: any) => u.email === seed.email);
    if (idx === -1) {
      users.push(seed);
      changed = true;
    } else if (users[idx].tipo !== seed.tipo) {
      users[idx].tipo = seed.tipo;
      changed = true;
    }
  }
  if (changed) localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const TEST_CREDENTIALS = {
  CLIENT:  { email: 'joao@test.com',               password: '123456', name: 'João Silva' },
  ADMIN:   { email: 'admin@example.com',           password: '1234',   name: 'Admin Barbeiro' },
  BARBER1: { email: 'joao.mestre@barbershop.com', password: '123456', name: 'João Mestre' },
  BARBER2: { email: 'pedro@barbershop.com',        password: '123456', name: 'Pedro Silva' },
  BARBER3: { email: 'carlos@barbershop.com',       password: '123456', name: 'Carlos Barbosa' },
};
