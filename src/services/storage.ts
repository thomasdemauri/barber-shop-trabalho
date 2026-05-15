const PREFIX = 'barbershop_';

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet<T>(key: string, value: T) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function lsRemove(key: string) {
  localStorage.removeItem(PREFIX + key);
}

export default { lsGet, lsSet, lsRemove };
