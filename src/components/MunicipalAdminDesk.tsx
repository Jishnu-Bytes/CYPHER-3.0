import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  Search, 
  Filter, 
  MapPin, 
  RefreshCw, 
  Eye, 
  Lock, 
  Unlock,
  ChevronRight
} from 'lucide-react';
import { CivicIncident, ThemeMode } from '../types';

interface MunicipalAdminDeskProps {
  themeMode: ThemeMode;
  onOpenGisConsole: (incidentId: string) => void;
}

export const MunicipalAdminDesk: React.FC<MunicipalAdminDeskProps> = ({
  themeMode,
  onOpenGisConsole,
}) => {
  const isDark = themeMode === 'dark';

  const [reports, setReports] = useState<CivicIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'hitl' | 'dispatched' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<CivicIncident | null>(null);

  // Operator Action Modal state
  const [actionModal, setActionModal] = useState<{
    type: 'hitl_override' | 'dispatch';
    incident: CivicIncident;
  } | null>(null);
  const [operatorId, setOperatorId] = useState('OPERATOR-402');
  const [overrideReason, setOverrideReason] = useState('Manual verification complete. Visual evidence and triage verified.');
  const [dispatchUnit, setDispatchUnit] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter logic
  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'hitl' && !r.hitl_required && r.status !== 'AWAITING_VALIDATION') {
      return false;
    }
    if (filterStatus === 'dispatched' && r.status !== 'DISPATCHED') {
      return false;
    }
    if (filterStatus === 'resolved' && r.status !== 'RESOLVED' && r.status !== 'Resolved') {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTicket = (r.ticketId || r.referenceId || '').toLowerCase().includes(q);
      const matchLoc = (r.location || '').toLowerCase().includes(q);
      const matchCitizen = (r.citizenName || '').toLowerCase().includes(q);
      const matchCategory = (r.hazard_category || (r as any).finalCategory || '').toLowerCase().includes(q);
      return matchTicket || matchLoc || matchCitizen || matchCategory;
    }

    return true;
  });

  const handleExecuteOverride = async () => {
    if (!actionModal) return;
    try {
      const res = await fetch(`/api/reports/${actionModal.incident.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: operatorId,
          override_reason: overrideReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Incident ${actionModal.incident.ticketId} HITL Override authorized.`);
        setActionModal(null);
        fetchReports();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to authorize override');
    }
  };

  const handleExecuteDispatch = async () => {
    if (!actionModal) return;
    try {
      const res = await fetch(`/api/reports/${actionModal.incident.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: operatorId,
          unit: dispatchUnit || actionModal.incident.recommended_crew || 'Municipal Tactical Squad',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Incident ${actionModal.incident.ticketId} crew dispatched.`);
        setActionModal(null);
        fetchReports();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to dispatch crew');
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight">
              Municipal Operations &amp; Dispatch Desk
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
              OPERATOR CONSOLE
            </span>
          </div>
          <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            High-contrast operational queue for manual triage verification, HITL safety gating, and tactical dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className={`p-4 rounded-xl border mb-6 flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Incidents', count: reports.length },
            { id: 'hitl', label: '⚠️ HITL Locked', count: reports.filter(r => r.hitl_required || r.status === 'AWAITING_VALIDATION').length },
            { id: 'dispatched', label: 'Dispatched', count: reports.filter(r => r.status === 'DISPATCHED').length },
            { id: 'resolved', label: 'Resolved', count: reports.filter(r => r.status === 'RESOLVED' || r.status === 'Resolved').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, location, citizen..."
            className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs font-mono transition outline-none ${
              isDark ? 'bg-slate-950 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300 focus:border-cyan-600'
            }`}
          />
        </div>
      </div>

      {/* Structured Operational Data Table */}
      <div className={`rounded-xl border overflow-hidden shadow-xl ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className={`border-b text-[11px] uppercase tracking-wider ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                <th className="p-3">Priority / Ticket</th>
                <th className="p-3">Category &amp; Summary</th>
                <th className="p-3">Location / Jurisdiction</th>
                <th className="p-3">Citizen Contact</th>
                <th className="p-3">Status / Gate</th>
                <th className="p-3 text-right">Operator Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.map((incident) => {
                const priority = Number(incident.criticality_level || incident.hazardPriorityScore || 3);
                const isHitlLocked = incident.hitl_required && !incident.hitl_authorized;

                return (
                  <tr
                    key={incident.id}
                    className={`transition hover:bg-slate-800/30 ${
                      isHitlLocked ? (isDark ? 'bg-red-950/10' : 'bg-red-50/50') : ''
                    }`}
                  >
                    {/* Priority & Ticket */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                          priority === 5
                            ? 'bg-red-600 text-white animate-pulse'
                            : priority === 4
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-cyan-700 text-white'
                        }`}>
                          L{priority}
                        </span>
                        <div>
                          <span className="font-bold text-white block">
                            {incident.ticketId || incident.referenceId}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {incident.timestamp?.slice(0, 16)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Summary */}
                    <td className="p-3 max-w-xs">
                      <span className="font-bold text-cyan-400 block mb-0.5">
                        {incident.hazard_category || (incident as any).finalCategory || 'Infrastructure'}
                      </span>
                      <p className="text-slate-300 text-[11px] truncate">
                        {incident.normalized_summary || incident.englishTranslation || incident.summary}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="p-3 max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate text-slate-300">
                          {incident.location}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 pl-4 block">
                        {incident.country}
                      </span>
                    </td>

                    {/* Citizen */}
                    <td className="p-3">
                      <span className="font-semibold text-slate-200 block">
                        {incident.citizenName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {incident.verifiedPhone}
                      </span>
                    </td>

                    {/* Status & HITL Safety Gate */}
                    <td className="p-3">
                      {isHitlLocked ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/80 border border-red-500/80 text-red-300">
                          <Lock className="w-3 h-3 text-red-400" />
                          <span>HITL LOCKED</span>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          incident.status === 'RESOLVED' || incident.status === 'Resolved'
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                            : incident.status === 'DISPATCHED'
                            ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}>
                          {incident.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {isHitlLocked ? (
                          <button
                            onClick={() => setActionModal({ type: 'hitl_override', incident })}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm cursor-pointer"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Release Lock</span>
                          </button>
                        ) : incident.status !== 'DISPATCHED' && incident.status !== 'RESOLVED' ? (
                          <button
                            onClick={() => {
                              setActionModal({ type: 'dispatch', incident });
                              setDispatchUnit(incident.recommended_crew || incident.recommendedDispatchUnit || 'Municipal Rapid Squad');
                            }}
                            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm cursor-pointer"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        ) : null}

                        <button
                          onClick={() => onOpenGisConsole(incident.id)}
                          className="px-2 py-1 rounded border border-slate-700 hover:border-slate-500 text-slate-300 text-[11px] transition cursor-pointer"
                          title="Center on GIS Canvas"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operator Modal (HITL Override or Crew Dispatch) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="font-bold text-base font-mono mb-2 flex items-center gap-2 text-cyan-400">
              {actionModal.type === 'hitl_override' ? (
                <>
                  <Unlock className="w-5 h-5 text-amber-400" />
                  <span>Authorize Human-in-the-Loop Override</span>
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5 text-cyan-400" />
                  <span>Dispatch Municipal Tactical Crew</span>
                </>
              )}
            </h3>

            <p className="text-xs font-mono text-slate-400 mb-4">
              Incident: <span className="font-bold text-white">{actionModal.incident.ticketId}</span> • Location: {actionModal.incident.location}
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Operator ID Credentials</label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              {actionModal.type === 'hitl_override' ? (
                <div>
                  <label className="block text-slate-400 mb-1">Reason for Safety Gate Override</label>
                  <textarea
                    rows={3}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className={`w-full p-3 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Tactical Unit</label>
                  <input
                    type="text"
                    value={dispatchUnit}
                    onChange={(e) => setDispatchUnit(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={actionModal.type === 'hitl_override' ? handleExecuteOverride : handleExecuteDispatch}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs cursor-pointer shadow-lg shadow-cyan-950/40"
              >
                {actionModal.type === 'hitl_override' ? 'Confirm Safety Override' : 'Release & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
