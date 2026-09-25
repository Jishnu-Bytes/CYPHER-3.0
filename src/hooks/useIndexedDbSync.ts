import { useState, useEffect } from 'react';
import { 
  indexedDbSyncManager, 
  SyncState, 
  OfflinePendingReport 
} from '../services/indexedDbService';

export function useIndexedDbSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncedAt: null,
    pendingReports: [],
  });

  useEffect(() => {
    // Subscribe to IndexedDB changes & network status
    const unsubscribe = indexedDbSyncManager.subscribe((state) => {
      setSyncState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const syncNow = async () => {
    return await indexedDbSyncManager.syncPendingReportsToServer();
  };

  const injectTestReport = async () => {
    return await indexedDbSyncManager.injectTestOfflineReport();
  };

  const removePendingReport = async (id: string) => {
    return await indexedDbSyncManager.removePendingReport(id);
  };

  const clearAllPending = async () => {
    return await indexedDbSyncManager.clearAllPendingReports();
  };

  return {
    ...syncState,
    syncNow,
    injectTestReport,
    removePendingReport,
    clearAllPending,
  };
}
