// Simple tab-lock implementation using a lock key with expiration.
// This is not a perfect distributed lock but works for MVP browser simulation.

const LOCK_PREFIX = 'lock_';

export function acquireLock(slotKey: string, ownerId: string, ttl = 5000): boolean {
  const key = LOCK_PREFIX + slotKey;
  const now = Date.now();
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify({ owner: ownerId, ts: now, exp: now + ttl }));
    return true;
  }
  try {
    const obj = JSON.parse(raw as string);
    if (obj.exp && obj.exp < now) {
      // expired
      localStorage.setItem(key, JSON.stringify({ owner: ownerId, ts: now, exp: now + ttl }));
      return true;
    }
  } catch {
    localStorage.setItem(key, JSON.stringify({ owner: ownerId, ts: now, exp: now + ttl }));
    return true;
  }
  return false;
}

export function releaseLock(slotKey: string, ownerId: string) {
  const key = LOCK_PREFIX + slotKey;
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const obj = JSON.parse(raw as string);
    if (obj.owner === ownerId) localStorage.removeItem(key);
  } catch {
    localStorage.removeItem(key);
  }
}

