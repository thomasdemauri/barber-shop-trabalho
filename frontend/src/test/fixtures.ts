import type { ApiAppointment, ApiUser, Barber, Service, Session } from '../api/types';

export const client: ApiUser = {
  id: 'u-client', name: 'Ana Cliente', email: 'ana@test.com', phone: '11999990000', role: 'CLIENT', createdAt: '2026-01-01T00:00:00.000Z',
};
export const admin: ApiUser = { ...client, id: 'u-admin', name: 'Admin Barbeiro', email: 'admin@test.com', role: 'ADMIN' };
export const barberUser: ApiUser = { ...client, id: 'u-joao', name: 'João Mestre', email: 'joao@shop.com', role: 'BARBER' };

export const session = (user: ApiUser): Session => ({ token: `token-${user.id}`, user });

export const corte: Service = {
  id: 'corte-C', name: 'Corte Clássico', description: 'Tesoura ou máquina', icon: 'C', category: 'corte', price: 40, durationMinutes: 40, active: true,
};
export const barba: Service = {
  id: 'barba-B', name: 'Barba Completa', description: 'Navalha', icon: 'B', category: 'barba', price: 35, durationMinutes: 30, active: true,
};

export const joao: Barber = { id: 'b-joao', name: 'João Mestre', experience: '12 anos', bio: 'Cortes clássicos', rating: 4.9, reviews: 380 };
export const pedro: Barber = { id: 'b-pedro', name: 'Pedro Silva', experience: '7 anos', bio: 'Barba', rating: 4.7, reviews: 210 };

export function apiAppointment(overrides: Partial<ApiAppointment> = {}): ApiAppointment {
  return {
    id: 'a-1',
    status: 'PENDING',
    startsAt: new Date(2030, 0, 15, 10, 0).toISOString(),
    endsAt: new Date(2030, 0, 15, 10, 40).toISOString(),
    notes: null,
    createdAt: '2029-12-01T12:00:00.000Z',
    client: { id: client.id, name: client.name, email: client.email, phone: client.phone },
    barber: { id: joao.id, name: joao.name },
    service: { id: corte.id, name: corte.name, price: corte.price, durationMinutes: corte.durationMinutes },
    ...overrides,
  };
}
