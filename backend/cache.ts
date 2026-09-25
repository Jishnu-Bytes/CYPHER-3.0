export class UpstashRedisService {
  private url: string;
  private token: string;
  private memoryStore: Map<string, { value: string; expiresAt: number }>;
  private rateLimits: Map<string, { count: number; resetAt: number }>;
  public stats: { hits: number; misses: number; throttled: number; totalQueries: number };

  constructor() {
    this.url = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
    this.memoryStore = new Map();
    this.rateLimits = new Map();
    this.stats = { hits: 0, misses: 0, throttled: 0, totalQueries: 0 };

    if (this.url && this.token) {
      console.log("[CACHE] Upstash Redis REST credentials loaded.");
    } else {
      console.log("[CACHE] Running high-speed in-memory Redis-compatible cache & rate limiter.");
    }
  }

  public isUsingUpstash(): boolean {
    return Boolean(this.url && this.token);
  }

  async get(key: string): Promise<string | null> {
    this.stats.totalQueries++;
    if (this.url && this.token) {
      try {
        const res = await fetch(`${this.url}/get/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.result !== null && json.result !== undefined) {
            this.stats.hits++;
            return String(json.result);
          }
        }
      } catch (err) {
        console.warn("[UPSTASH] REST get error, falling back to memory:", err);
      }
    }

    const item = this.memoryStore.get(key);
    if (item) {
      if (Date.now() < item.expiresAt) {
        this.stats.hits++;
        return item.value;
      }
      this.memoryStore.delete(key);
    }
    this.stats.misses++;
    return null;
  }

  async set(key: string, value: string, ttlSeconds = 86400): Promise<void> {
    if (this.url && this.token) {
      try {
        await fetch(`${this.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?ex=${ttlSeconds}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
      } catch (err) {
        console.warn("[UPSTASH] REST set error:", err);
      }
    }
    this.memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  checkRateLimit(
    ip: string,
    maxPerMinute = 30
  ): { allowed: boolean; remaining: number; resetInSec: number } {
    const now = Date.now();
    const windowMs = 60000;
    let rec = this.rateLimits.get(ip);
    if (!rec || now > rec.resetAt) {
      rec = { count: 1, resetAt: now + windowMs };
      this.rateLimits.set(ip, rec);
      return { allowed: true, remaining: maxPerMinute - 1, resetInSec: Math.ceil(windowMs / 1000) };
    }
    rec.count++;
    const remaining = Math.max(0, maxPerMinute - rec.count);
    const resetInSec = Math.max(1, Math.ceil((rec.resetAt - now) / 1000));
    if (rec.count > maxPerMinute) {
      this.stats.throttled++;
      return { allowed: false, remaining: 0, resetInSec };
    }
    return { allowed: true, remaining, resetInSec };
  }
}

export const redisCache = new UpstashRedisService();
