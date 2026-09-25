import React, { useState } from 'react';
import { 
  CloudCheck, 
  CloudUpload, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  PlusCircle, 
  X,
  Database
} from 'lucide-react';
import { useIndexedDbSync } from '../hooks/useIndexedDbSync';
import { ThemeMode } from '../types';

interface SyncStatusIndicatorProps {
  themeMode?: ThemeMode;
  variant?: 'hud' | 'navbar';
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  themeMode = 'dark',
  variant = 'hud',
}) => {
  const isDark = themeMode === 'dark';
  const {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncedAt,
    pendingReports,
    syncNow,
    injectTestReport,
    removePendingReport,
    clearAllPending,
  } = useIndexedDbSync();

  const [isOpen, setIsOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleManualSync = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSyncFeedback('Syncing reports to server...');
    try {
      const res = await syncNow();
      if (res.synced > 0) {
        setSyncFeedback(`Successfully uploaded ${res.synced} report(s) to server.`);
      } else if (res.failed > 0) {
        setSyncFeedback(`Failed to upload ${res.failed} report(s).`);
      } else {
        setSyncFeedback('All local reports are up to date.');
      }
    } catch {
      setSyncFeedback('Sync error occurred.');
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleInjectTest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await injectTestReport();
    setSyncFeedback('Queued test offline report into IndexedDB.');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Badge Visual State
  const hasPending = pendingCount > 0;

  return (
    <div className="relative inline-block text-xs font-mono">
      {/* ------------------------------------------------------------- */}
      {/* HUD BADGE INDICATOR TRIGGER                                   */}
      {/* ------------------------------------------------------------- */}
      <button
        id="hud-sync-status-indicator"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer select-none ${
          !isOnline
            ? isDark
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900/80'
              : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
            : isSyncing
            ? isDark
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            : hasPending
            ? isDark
              ? 'bg-amber-950/90 border-amber-400 text-amber-300 hover:bg-amber-900 ring-1 ring-amber-400/40 animate-pulse'
              : 'bg-amber-100 border-amber-500 text-amber-900 hover:bg-amber-200'
            : isDark
            ? 'bg-slate-900/90 border-teal-500/40 text-teal-300 hover:bg-slate-800'
            : 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100'
        }`}
        title="Click to view IndexedDB offline sync queue"
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">Sync: Offline ({pendingCount} Queued)</span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="font-bold">Syncing {pendingCount} Report{pendingCount > 1 ? 's' : ''}...</span>
          </>
        ) : hasPending ? (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <CloudUpload className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">Sync: {pendingCount} Pending Upload</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <CloudCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-bold">Sync: All Synced (0 Pending)</span>
          </>
        )}
      </button>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE INDEXEDDB QUEUE DRAWER / MODAL POPOVER            */}
      {/* ------------------------------------------------------------- */}
      {isOpen && (
        <div
          id="hud-sync-queue-popover"
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl z-50 backdrop-blur-md transition-all ${
            isDark
              ? 'bg-[#090e1a]/95 border-slate-700 text-slate-100 shadow-black/80'
              : 'bg-white border-slate-300 text-slate-900 shadow-xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                  IndexedDB Sync Engine
                </h4>
                <p className="text-[10px] text-slate-400">
                  Client Offline Buffer • cypher_offline_storage
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Network & Queue Summary */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-slate-400 block text-[10px]">NETWORK STATUS</span>
              <span className={`font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                {isOnline ? 'Connected (Online)' : 'Disconnected (Offline)'}
              </span>
            </div>

            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-slate-400 block text-[10px]">PENDING UPLOAD</span>
              <span className={`font-bold ${hasPending ? 'text-amber-400' : 'text-teal-400'}`}>
                {pendingCount} Local Report{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {syncFeedback && (
            <div className="mb-3 p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-200 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{syncFeedback}</span>
            </div>
          )}

          {/* Pending Reports List */}
          <div className="max-h-48 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin">
            {pendingReports.length === 0 ? (
              <div className={`p-4 rounded-xl border text-center ${
                isDark ? 'bg-black/20 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-teal-400" />
                <p className="text-xs font-semibold text-slate-300">Local queue is clean</p>
                <p className="text-[10px]">All civic reports have been synced with the server.</p>
              </div>
            ) : (
              pendingReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-2.5 rounded-xl border text-[11px] flex items-start justify-between gap-2 transition ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-cyan-400 truncate">
                        {report.ticketId}
                      </span>
                      <span className="text-[9px] px-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 uppercase">
                        {report.syncStatus}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[10px] truncate">
                      {report.problemDomain} • {report.location}
                    </p>
                    <p className="text-slate-500 text-[9px] truncate">
                      "{report.typedComplaint}"
                    </p>
                  </div>

                  <button
                    onClick={() => removePendingReport(report.id)}
                    className="text-slate-400 hover:text-rose-400 p-1 rounded transition"
                    title="Remove from local queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
            <button
              onClick={handleInjectTest}
              className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 cursor-pointer"
              title="Add a test report into IndexedDB to verify pending state"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Queue Test Report</span>
            </button>

            <div className="flex items-center gap-1.5">
              {hasPending && (
                <button
                  onClick={() => clearAllPending()}
                  className="px-2 py-1.5 rounded-lg border text-[11px] transition text-rose-300 hover:bg-rose-950/50 border-rose-800/60 cursor-pointer"
                  title="Clear all local offline reports"
                >
                  Clear
                </button>
              )}

              <button
                onClick={handleManualSync}
                disabled={isSyncing || pendingCount === 0 || !isOnline}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-md shadow-cyan-950/50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
