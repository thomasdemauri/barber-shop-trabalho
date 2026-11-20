import { vi } from 'vitest';

type Handler = (request: { body: unknown; query: URLSearchParams; path: string }) => unknown;
/** A JSON body to answer with, a handler computing it, or `undefined` for 204. */
type Route = Handler | object | undefined;
export type RecordedCall = { method: string; path: string; body: unknown; query: URLSearchParams; headers: Headers };

/** Throw from a route handler to answer with an error status. */
export class HttpResponseError {
  readonly status: number;
  readonly body: { error: string; message: string };

  constructor(status: number, body: { error: string; message: string }) {
    this.status = status;
    this.body = body;
  }
}

/** Public endpoints every provider hits on mount. */
const DEFAULT_ROUTES: Record<string, Route> = {
  'GET /shop/settings': { name: 'Navalha de Ouro' },
  'GET /catalog/services': [],
  'GET /catalog/barbers': [],
  'GET /schedules': [],
  'GET /appointments': [],
};

/**
 * Replaces `fetch` with a router keyed by "METHOD /path" (path without the /api prefix).
 * A route value is returned as JSON; a function receives the request; `undefined` means 204.
 */
export function mockApi(routes: Record<string, Route> = {}) {
  const table = { ...DEFAULT_ROUTES, ...routes };
  const calls: RecordedCall[] = [];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    const path = url.pathname.replace(/^\/api/, '');
    const method = init.method ?? 'GET';
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
    calls.push({ method, path, body, query: url.searchParams, headers: new Headers(init.headers) });

    const key = `${method} ${path}`;
    if (!(key in table)) return json(404, { error: 'NOT_MOCKED', message: `No mock for ${key}` });
    try {
      const route = table[key];
      const result = typeof route === 'function' ? await (route as Handler)({ body, query: url.searchParams, path }) : route;
      return result === undefined ? new Response(null, { status: 204 }) : json(200, result);
    } catch (error) {
      if (error instanceof HttpResponseError) return json(error.status, error.body);
      throw error;
    }
  });

  vi.stubGlobal('fetch', fetchMock);
  return {
    calls,
    callsTo: (method: string, path: string) => calls.filter(call => call.method === method && call.path === path),
  };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
