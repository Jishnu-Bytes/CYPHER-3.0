import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Map, 
  ListOrdered, 
  Activity, 
  Radio, 
  Flame, 
  AlertOctagon, 
  Cpu, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { CivicIncident } from './types';
import { TEST_PRESETS, INITIAL_INCIDENTS } from './data/presets';
import { DevToolbar } from './components/DevToolbar';
import { LiveTelemetryHUD } from './components/LiveTelemetryHUD';
import { GisMapCanvas } from './components/GisMapCanvas';
import { IncidentDetailCard } from './components/IncidentDetailCard';

export const App: React.FC = () => {
  const [incidents, setIncidents] = useState<CivicIncident[]>(INITIAL_INCIDENTS);
  // Default to Preset 2 (7 users merged problem)
  const [activePresetId, setActivePresetId] = useState<string>('preset-2');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('rep-preset-2');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Select Preset Trigger
  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const targetPreset = TEST_PRESETS.find(p => p.id === presetId);
    if (!targetPreset) return;

    // Ensure preset is in incidents list and selected
    const targetIncident = targetPreset.incident as CivicIncident;
    setIncidents(prev => {
      const exists = prev.some(i => i.id === targetIncident.id);
      if (exists) {
        return prev.map(i => i.id === targetIncident.id ? targetIncident : i);
      }
      return [targetIncident, ...prev];
    });

    setSelectedIncidentId(targetIncident.id);
    showToast(`Quick-loaded ${targetPreset.label}`);
  };

  // Reset Scenarios
  const handleReset = () => {
    setIncidents(INITIAL_INCIDENTS);
    setActivePresetId('preset-2');
    setSelectedIncidentId('rep-preset-2');
    showToast("Reset to default incident cluster");
  };

  // Toggle HITL Authorization
  const handleAuthorizeToggle = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const nextAuth = !inc.hitl_authorized;
        return {
          ...inc,
          hitl_authorized: nextAuth,
          hitl_authorized_by: nextAuth ? "Tactical Dispatcher #402" : undefined,
          hitl_authorized_at: nextAuth ? new Date().toISOString() : undefined
        };
      }
      return inc;
    }));

    showToast("Operator authorization verified. Interlock unlocked.");
  };

  // Dispatch Crew Action
  const handleDispatchCrew = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: "DISPATCHED"
        };
      }
      return inc;
    }));

    showToast("Tactical emergency crew dispatched to coordinate!");
  };

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Component 5: QUICK-LOAD TEST SCENARIOS (Dev Toolbar) */}
      <DevToolbar 
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
      />

      {/* Sovereign Command Center Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-mono font-black text-slate-950 text-xl shadow-lg shadow-cyan-950/50">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-black tracking-wider text-white">
                  CYPHER • GIS COMMAND CENTER
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                  REACT PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Principal Emergency Triage Engine & Sovereign Dispatch Matrix
              </p>
            </div>
          </div>

          {/* Quick Actions & Legacy Bridge */}
          <div className="flex items-center gap-2">
            <a
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1.5"
              title="Open Admin Portal"
            >
              <span>Classic Admin Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry: Green</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Command Center Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: GIS Map Canvas & Active Incidents List (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Interactive GIS Map Canvas - 100% Clean Surface, Zero Watermarks */}
          <GisMapCanvas 
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              // Match preset if exists
              if (id === 'rep-preset-1') setActivePresetId('preset-1');
              else if (id === 'rep-preset-2') setActivePresetId('preset-2');
              else if (id === 'rep-preset-3') setActivePresetId('preset-3');
            }}
          />

          {/* Incident Queue Table */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-cyan-400" />
                ACTIVE EMERGENCY QUEUE ({incidents.length})
              </span>
              <span className="text-slate-500 text-[11px]">Sorted by Criticality & Corroboration</span>
            </div>

            <div className="space-y-2">
              {incidents.map(inc => {
                const isSelected = inc.id === selectedIncidentId;
                const is7xMerged = (inc.duplicateCount || inc.corroboratedReports || 0) >= 7;

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      if (inc.id === 'rep-preset-1') setActivePresetId('preset-1');
                      else if (inc.id === 'rep-preset-2') setActivePresetId('preset-2');
                      else if (inc.id === 'rep-preset-3') setActivePresetId('preset-3');
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-500'
                        : 'bg-slate-900/50 hover:bg-slate-900/90 border-slate-800/80'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {inc.ticketId}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          (inc.criticality_level || 1) >= 4
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}>
                          PRIORITY {inc.criticality_level}/5
                        </span>

                        {/* Deduplication Marker in List */}
                        {is7xMerged && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                            <Flame className="w-3 h-3 text-amber-400" />
                            <span>🔥 7 Corroborated Signals</span>
                          </span>
                        )}

                        {inc.contradiction_detected && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1">
                            <span>⚡ Contradiction</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-1">
                        {inc.normalized_summary || inc.summary}
                      </p>

                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-3">
                        <span>{inc.location}</span>
                        <span>•</span>
                        <span>{inc.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                        inc.status === 'DISPATCHED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : inc.hitl_authorized
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {inc.status === 'DISPATCHED' ? '✓ DISPATCHED' : inc.hitl_authorized ? 'AUTHORIZED' : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Column: Comprehensive Incident Review & Safety Gate Dossier (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <IncidentDetailCard 
            incident={selectedIncident}
            onAuthorizeToggle={handleAuthorizeToggle}
            onDispatchCrew={handleDispatchCrew}
          />
        </section>
      </main>

      {/* Component 1: LIVE TELEMETRY HUD (Floating Widget in Bottom-Right Corner) */}
      <LiveTelemetryHUD />

      {/* Action Confirmation Toast */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-950/95 border border-cyan-500/60 text-cyan-300 font-mono text-xs shadow-2xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </motion.div>
      )}
    </div>
  );
};

export default App;
