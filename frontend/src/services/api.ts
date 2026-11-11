const isProduction = import.meta.env.VITE_PROD === 'true';
const API_URL = isProduction ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

type ApiError = { message?: string; error?: string };

let token: string | null = localStorage.getItem('barbershop_token');

export function setApiToken(value: string | null) {
  token = value;
  if (value) localStorage.setItem('barbershop_token', value);
  else localStorage.removeItem('barbershop_token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiError;
    throw new Error(body.message || body.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CLIENT' | 'BARBER' | 'ADMIN';
  preferences?: Record<string, unknown> | null;
};

export type AuthResponse = { token: string; user: ApiUser };

export function toUiUser(user: ApiUser) {
  return {
    id: user.id,
    nome: user.name,
    email: user.email,
    telefone: user.phone || '',
    tipo: user.role === 'CLIENT' ? 'cliente' as const : 'barbeiro' as const,
  };
}

export function serviceApiId(id: string) {
  const ids: Record<string, string> = {
    '1': 'corte-C', '2': 'combo-CB', '3': 'barba-B',
    '4': 'trat-H', '5': 'trat-D', '6': 'trat-Co',
  };
  return ids[id] || id;
}

export function appointmentFromApi(item: any) {
  return {
    id: item.id,
    usuario_id: item.userId,
    cliente_email: item.user?.email,
    cliente_nome: item.user?.name,
    barbeiro_nome: item.barber?.user?.name,
    servico_id: ({ 'corte-C': '1', 'combo-CB': '2', 'barba-B': '3', 'trat-H': '4', 'trat-D': '5', 'trat-Co': '6' } as Record<string, string>)[item.serviceId] || item.serviceId,
    data_hora: item.startsAt,
    status: item.status.toLowerCase(),
    data_criacao: item.createdAt,
  };
}
