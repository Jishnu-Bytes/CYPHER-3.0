import fs from 'fs';
import path from 'path';

/**
 * DB & External API Retry Queue with Exponential Backoff
 * Handles transient failures and rate limits
 */
export class DBRetryQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private maxRetries = 5;

  async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = async () => {
        let attempt = 0;
        let delay = 300;

        while (attempt < this.maxRetries) {
          try {
            const result = await operation();
            resolve(result);
            return;
          } catch (err: any) {
            attempt++;
            const isRateLimit = err?.status === 429 || String(err?.message || '').includes('429') || String(err?.message || '').includes('rate');
            console.warn(`[DBRetryQueue] Operation failed (Attempt ${attempt}/${this.maxRetries}): ${err?.message || err}. Retrying in ${delay}ms...`);
            
            if (attempt >= this.maxRetries) {
              reject(err);
              return;
            }

            await new Promise((res) => setTimeout(res, isRateLimit ? delay * 2 : delay));
            delay = Math.min(delay * 2, 8000);
          }
        }
      };

      this.queue.push(task);
      this.processNext();
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    const task = this.queue.shift();
    if (task) {
      try {
        await task();
      } catch (e) {
        console.error('[DBRetryQueue] Unhandled task error:', e);
      }
    }
    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.processNext();
    }
  }
}

export const dbRetryQueue = new DBRetryQueue();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'reports-store.json');

/**
 * Initializes persistent data directory
 */
export function initPersistenceDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn('[Persistence] Could not create data dir:', e);
    }
  }
}

/**
 * Loads reports from disk storage or returns null
 */
export function loadPersistedReports<T>(): T[] | null {
  initPersistenceDir();
  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('[Persistence] Error loading persisted reports:', err);
    }
  }
  return null;
}

/**
 * Saves reports to disk atomically via the retry queue
 */
export async function persistReports<T>(reports: T[]): Promise<void> {
  initPersistenceDir();
  return dbRetryQueue.enqueue(async () => {
    const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
    await fs.promises.writeFile(tempFile, JSON.stringify(reports, null, 2), 'utf-8');
    await fs.promises.rename(tempFile, STORE_FILE);
  });
}
