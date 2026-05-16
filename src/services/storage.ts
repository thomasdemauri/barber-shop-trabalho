const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

interface StoredItem<T> {
  data: T;
  expiry: number;
}

/**
 * Save data to localStorage with an 8-hour TTL.
 */
export function store<T>(key: string, data: T): void {
  const item: StoredItem<T> = {
    data,
    expiry: Date.now() + TTL_MS,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Read data from localStorage. Returns null if expired or missing.
 */
export function retrieve<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const item: StoredItem<T> = JSON.parse(raw);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Remove a key from localStorage.
 */
export function remove(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Purge all expired keys that follow our StoredItem format.
 */
export function purgeExpired(): void {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key) continue;
    try {
      const item = JSON.parse(localStorage.getItem(key) || '');
      if (item?.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
      }
    } catch {
      // Not our format, skip
    }
  }
}
