/** Always same-origin: Nginx (production) and the Vite dev server proxy `/api` to the backend. */
export const API_URL = '/api';

const TOKEN_KEY = 'barbershop_token';

type ErrorBody = { error?: string; message?: string };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string | null) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
};

type RequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; query?: Record<string, string | undefined> };

function urlFor(path: string, query: RequestOptions['query']) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) if (value !== undefined) params.set(key, value);
  const search = params.toString();
  return `${API_URL}${path}${search ? `?${search}` : ''}`;
}

export async function request<T>(path: string, { method = 'GET', body, query }: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  const token = tokenStore.get();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(urlFor(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as ErrorBody;
    throw new ApiError(response.status, error.error ?? 'REQUEST_FAILED', error.message ?? `Falha na requisição (${response.status})`);
  }
  if (response.status === 202 || response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const errorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
