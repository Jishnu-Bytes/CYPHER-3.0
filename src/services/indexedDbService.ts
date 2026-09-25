// ============================================================================
// CYPHER INDEXEDDB OFFLINE STORAGE & REAL-TIME SYNC LISTENER
// ============================================================================

export interface OfflinePendingReport {
  id: string;
  ticketId: string;
  timestamp: string;
  createdAt: number;
  citizenName: string;
  verifiedPhone?: string;
  country: string;
  problemDomain: string;
  location: string;
  typedComplaint: string;
  lat?: number;
  lng?: number;
  photoDataUrl?: string;
  syncStatus: 'pending' | 'syncing' | 'failed';
  lastAttempt?: number;
  errorMessage?: string;
}

export interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  pendingReports: OfflinePendingReport[];
}

const DB_NAME = 'cypher_offline_storage';
const DB_VERSION = 1;
const STORE_NAME = 'pending_reports';

class IndexedDbSyncManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private listeners: Set<(state: SyncState) => void> = new Set();
  private currentState: SyncState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncedAt: null,
    pendingReports: [],
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.currentState.isOnline = true;
        this.notifyListeners();
        // Auto-sync when coming back online
        this.syncPendingReportsToServer().catch((err) => {
          console.warn('[IndexedDB] Auto-sync error on reconnect:', err);
        });
      });

      window.addEventListener('offline', () => {
        this.currentState.isOnline = false;
        this.notifyListeners();
      });

      // Initialize DB & load initial records
      this.initDb().then(() => {
        this.refreshState();
      }).catch((err) => {
        console.warn('[IndexedDB] DB initialization error:', err);
      });
    }
  }

  private initDb(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Failed to open database:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.initDb();
    const tx = db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
  }

  public subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    // Emit immediate current state
    listener({ ...this.currentState });

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const snapshot: SyncState = {
      ...this.currentState,
      pendingReports: [...this.currentState.pendingReports],
    };
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[IndexedDB] Listener callback error:', err);
      }
    }
  }

  public async refreshState(): Promise<SyncState> {
    try {
      const reports = await this.getAllPendingReports();
      this.currentState.pendingReports = reports;
      this.currentState.pendingCount = reports.filter(r => r.syncStatus !== 'syncing').length;
      if (typeof navigator !== 'undefined') {
        this.currentState.isOnline = navigator.onLine;
      }
      this.notifyListeners();
    } catch (err) {
      console.warn('[IndexedDB] Could not refresh state:', err);
    }
    return { ...this.currentState };
  }

  public async getAllPendingReports(): Promise<OfflinePendingReport[]> {
    try {
      const store = await this.getStore('readonly');
      return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const results = (req.result as OfflinePendingReport[]) || [];
          results.sort((a, b) => b.createdAt - a.createdAt);
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] getAllPendingReports error:', err);
      return [];
    }
  }

  public async saveOfflineReport(
    reportInput: Partial<OfflinePendingReport> & {
      location: string;
      typedComplaint: string;
    }
  ): Promise<OfflinePendingReport> {
    const store = await this.getStore('readwrite');
    const id = reportInput.id || `offline-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ticketId = reportInput.ticketId || `OFFLINE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const record: OfflinePendingReport = {
      id,
      ticketId,
      timestamp: new Date().toISOString(),
      createdAt: Date.now(),
      citizenName: reportInput.citizenName || 'Offline Citizen',
      verifiedPhone: reportInput.verifiedPhone || '+91 98765 00000',
      country: reportInput.country || 'India',
      problemDomain: reportInput.problemDomain || 'Roads',
      location: reportInput.location,
      typedComplaint: reportInput.typedComplaint,
      lat: reportInput.lat,
      lng: reportInput.lng,
      photoDataUrl: reportInput.photoDataUrl,
      syncStatus: 'pending',
    };

    return new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = async () => {
        await this.refreshState();
        resolve(record);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async removePendingReport(id: string): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = async () => {
        await this.refreshState();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async clearAllPendingReports(): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = async () => {
        await this.refreshState();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async syncPendingReportsToServer(): Promise<{ synced: number; failed: number }> {
    if (this.currentState.isSyncing) {
      return { synced: 0, failed: 0 };
    }

    const pending = await this.getAllPendingReports();
    if (pending.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.currentState.isSyncing = true;
    this.notifyListeners();

    let syncedCount = 0;
    let failedCount = 0;

    for (const report of pending) {
      try {
        // Mark as syncing in memory & db
        report.syncStatus = 'syncing';
        const store = await this.getStore('readwrite');
        store.put(report);

        // Upload to server
        const formData = new FormData();
        formData.append('citizenName', report.citizenName);
        formData.append('verifiedPhone', report.verifiedPhone || '');
        formData.append('country', report.country);
        formData.append('problemDomain', report.problemDomain);
        formData.append('location', report.location);
        formData.append('typedComplaint', report.typedComplaint);
        if (report.lat !== undefined) formData.append('lat', String(report.lat));
        if (report.lng !== undefined) formData.append('lng', String(report.lng));

        // If photo attached as data URL, convert to Blob
        if (report.photoDataUrl && report.photoDataUrl.startsWith('data:')) {
          try {
            const res = await fetch(report.photoDataUrl);
            const blob = await res.blob();
            formData.append('photo', blob, 'offline_evidence.jpg');
          } catch {
            // continue without photo
          }
        }

        const res = await fetch('/api/reports/submit', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success || data.duplicateMerged) {
            // Remove from IndexedDB on successful upload
            await this.removePendingReport(report.id);
            syncedCount++;
            continue;
          }
        }

        // Failed to upload
        report.syncStatus = 'failed';
        report.lastAttempt = Date.now();
        report.errorMessage = `HTTP error during upload`;
        const writeStore = await this.getStore('readwrite');
        writeStore.put(report);
        failedCount++;
      } catch (err: any) {
        console.error('[IndexedDB] Sync report error:', err);
        report.syncStatus = 'failed';
        report.lastAttempt = Date.now();
        report.errorMessage = err?.message || 'Network error';
        try {
          const writeStore = await this.getStore('readwrite');
          writeStore.put(report);
        } catch {
          // ignore
        }
        failedCount++;
      }
    }

    this.currentState.isSyncing = false;
    this.currentState.lastSyncedAt = Date.now();
    await this.refreshState();

    return { synced: syncedCount, failed: failedCount };
  }

  // Quick helper to inject a realistic offline pending report for immediate testing
  public async injectTestOfflineReport(): Promise<OfflinePendingReport> {
    const testSamples = [
      {
        problemDomain: 'Power',
        location: 'Kondapur Main Road near Junction, Hyderabad',
        typedComplaint: 'High-voltage spark detected in flooded transformer base during heavy rainfall. Immediate isolation required.',
        lat: 17.4622,
        lng: 78.3568,
      },
      {
        problemDomain: 'Water',
        location: 'Copacabana Posto 4, Rio de Janeiro',
        typedComplaint: 'Ruptura na tubulação principal de água potável vazando sob a calçada pública.',
        lat: -22.9711,
        lng: -43.1825,
      },
      {
        problemDomain: 'Roads',
        location: 'Outer Ring Road Exit 9, Gachibowli, Hyderabad',
        typedComplaint: 'Deep double pothole hazard across rapid transit lane causing vehicle tire ruptures.',
        lat: 17.4435,
        lng: 78.3772,
      },
    ];

    const pick = testSamples[Math.floor(Math.random() * testSamples.length)];
    return this.saveOfflineReport({
      citizenName: 'Field Inspection Unit (Offline)',
      verifiedPhone: '+91 98490 88219',
      country: 'India',
      problemDomain: pick.problemDomain,
      location: pick.location,
      typedComplaint: pick.typedComplaint,
      lat: pick.lat,
      lng: pick.lng,
    });
  }
}

export const indexedDbSyncManager = new IndexedDbSyncManager();
