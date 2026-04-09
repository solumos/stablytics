interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const pending = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 15_000; // 15 seconds

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl = DEFAULT_TTL
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key);
  if (existing && existing.expiresAt > now) {
    return existing.data as T;
  }

  // Coalesce concurrent requests for the same key
  const inflight = pending.get(key);
  if (inflight) return inflight as Promise<T>;

  const promise = fn()
    .then((data) => {
      store.set(key, { data, expiresAt: Date.now() + ttl });
      pending.delete(key);
      return data;
    })
    .catch((err) => {
      pending.delete(key);
      throw err;
    });

  pending.set(key, promise);
  return promise;
}
