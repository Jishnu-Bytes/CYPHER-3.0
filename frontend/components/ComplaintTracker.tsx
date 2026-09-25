import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Clock, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  FileText,
  User,
  Zap
} from 'lucide-react';
import { ThemeMode, CivicIncident } from '../types';

interface ComplaintTrackerProps {
  themeMode: ThemeMode;
  initialTicketId?: string;
  onOpenGisConsole?: (incidentId: string) => void;
}

export const ComplaintTracker: React.FC<ComplaintTrackerProps> = ({
  themeMode,
  initialTicketId = '',
  onOpenGisConsole,
}) => {
  const isDark = themeMode === 'dark';

  const [searchQuery, setSearchQuery] = useState(initialTicketId);
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick search candidates
  const sampleTickets = [
    { label: '🔥 L5 Hazard (Flood & Power)', query: 'CYP-2026-7707' },
    { label: '⚠️ L4 Bridge Delamination', query: 'CYP-2026-9042' },
    { label: '✅ Resolved Pothole Repair', query: 'CYP-2026-1188' },
  ];

  const handleSearch = async (queryToSearch: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/reports/track/${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.success && data.reports && data.reports.length > 0) {
        setActiveReport(data.reports[0]);
      } else {
        setErrorMessage(`No active incident matching "${q}" was found.`);
        setActiveReport(null);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to fetch incident status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicketId) {
      setSearchQuery(initialTicketId);
      handleSearch(initialTicketId);
    } else {
      // Default to Preset B master ticket for immediate demonstration
      handleSearch('CYP-2026-7707');
    }
  }, [initialTicketId]);

  // Determine stage progression
  const getStageIndex = (status?: string, hitlAuthorized?: boolean) => {
    if (!status) return 1;
    const s = status.toUpperCase();
    if (s === 'RESOLVED') return 5;
    if (s === 'DISPATCHED' || s === 'IN_PROGRESS') return 4;
    if (hitlAuthorized || s === 'OPEN') return 3;
    if (s === 'AWAITING_VALIDATION') return 2;
    return 1;
  };

  const currentStage = getStageIndex(activeReport?.status, activeReport?.hitl_authorized);

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-8 font-sans ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold mb-3 border bg-cyan-950/80 border-cyan-500/40 text-cyan-300">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>CYPHER PUBLIC AUDIT TRAIL • SLA VERIFICATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
          Track Municipal Complaint &amp; SLA Status
        </h1>
        <p className={`text-sm mt-1 max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Real-time municipal dispatch timeline, operator audit logs, and photo verification proof.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className={`p-4 rounded-2xl border mb-6 shadow-xl backdrop-blur-md ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Ticket ID (e.g. CYP-2026-7707) or Mobile Phone..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm font-mono transition outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 focus:border-cyan-500 text-slate-100' : 'bg-slate-50 border-slate-300 focus:border-cyan-600 text-slate-900'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isLoading ? <span>Searching...</span> : <span>Track Ticket</span>}
          </button>
        </form>

        {/* Quick Sample Tickets */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs font-mono">
          <span className="text-slate-400 font-bold">Quick Samples:</span>
          {sampleTickets.map((st) => (
            <button
              key={st.query}
              type="button"
              onClick={() => {
                setSearchQuery(st.query);
                handleSearch(st.query);
              }}
              className="px-2.5 py-1 rounded-lg border text-[11px] font-mono transition bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 cursor-pointer"
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs font-mono flex items-center gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Incident Details Card */}
      {activeReport && (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className={`p-6 rounded-2xl border shadow-xl backdrop-blur-md ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-black text-lg text-white">
                    {activeReport.ticketId || activeReport.referenceId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                    activeReport.status === 'RESOLVED'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : activeReport.status === 'DISPATCHED'
                      ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                      : activeReport.status === 'AWAITING_VALIDATION'
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                  }`}>
                    {activeReport.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{activeReport.location}</span>
                </p>
              </div>

              {/* SLA Timer Badge */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono uppercase text-slate-400">Response SLA Window:</span>
                <span className="text-sm font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>2 hr Emergency SLA (Active)</span>
                </span>
              </div>
            </div>

            {/* 5-Step Pipeline Progression */}
            <div className="mt-6 mb-4">
              <span className="text-xs font-mono text-slate-400 block mb-3 font-bold">
                Operational Dispatch Pipeline:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
                {[
                  { step: 1, label: 'Reported', desc: 'Received & Logged' },
                  { step: 2, label: 'AI Triage', desc: 'Gemini 2.5 Flash' },
                  { step: 3, label: 'HITL Gate', desc: 'Operator Safety' },
                  { step: 4, label: 'Dispatched', desc: 'Tactical Unit' },
                  { step: 5, label: 'Resolved', desc: 'Proof Verified' },
                ].map((s) => {
                  const isDone = currentStage >= s.step;
                  const isCurrent = currentStage === s.step;
                  return (
                    <div
                      key={s.step}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                        isDone
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                          : isDark
                          ? 'bg-slate-950 border-slate-800/80 text-slate-500'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-2 ring-cyan-400 font-bold' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] opacity-75">STEP 0{s.step}</span>
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <span className="font-bold text-xs">{s.label}</span>
                      <span className="text-[10px] opacity-70 truncate">{s.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary & Translation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-bold">Original Vernacular Description:</span>
                <p className="text-slate-200 italic">
                  "{activeReport.transcription || activeReport.typedComplaint}"
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-bold">English Actionable Summary:</span>
                <p className="text-cyan-300">
                  {activeReport.englishTranslation || activeReport.summary || activeReport.actionableSummary}
                </p>
              </div>
            </div>

            {/* Assigned Dispatch Crew */}
            <div className="mt-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Assigned Response Crew:</span>
                <span className="font-bold text-indigo-200">
                  {activeReport.recommended_crew || activeReport.recommendedDispatchUnit || 'Municipal Rapid Response Squad'}
                </span>
              </div>

              {onOpenGisConsole && (
                <button
                  onClick={() => onOpenGisConsole(activeReport.id)}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                >
                  View on GIS Console →
                </button>
              )}
            </div>
          </div>

          {/* Audit Logs & Officer Notes */}
          <div className={`p-6 rounded-2xl border shadow-xl backdrop-blur-md ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" />
              <span>Official Municipal Audit Logs &amp; Operator Actions</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {activeReport.dispatchLogs && activeReport.dispatchLogs.length > 0 ? (
                activeReport.dispatchLogs.map((log: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/30 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-slate-200">{log.note}</p>
                      <span className="text-[10px] text-cyan-400">
                        Authorized by: {log.officer || 'Municipal Dispatcher'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs italic">No operator dispatch logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
