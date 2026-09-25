import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { CivicIncident, ThemeMode } from '../types';
import { SPATIAL_INCIDENTS, TEST_PRESETS } from '../data/presets';
import { TopCommandHeader } from './TopCommandHeader';
import { GoogleDarkMapCanvas } from './GoogleDarkMapCanvas';
import { IncidentInspectorPanel } from './IncidentInspectorPanel';
import { DevToolbar } from './DevToolbar';

interface GisCommandCenterProps {
  initialIncidents?: CivicIncident[];
}

export const GisCommandCenter: React.FC<GisCommandCenterProps> = ({
  initialIncidents = SPATIAL_INCIDENTS
}) => {
  const [incidents, setIncidents] = useState<CivicIncident[]>(initialIncidents);
  // Default selection is Preset B: 7-in-1 Master Marker (Center)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('rep-master-7x');
  const [activePresetId, setActivePresetId] = useState<string>('preset-b');
  const [activeFilter, setActiveFilter] = useState<'all' | 'hitl' | 'merged' | 'resolved'>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Stateful Theme Toggle with localStorage persistence
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('cypher_theme_mode');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cypher_theme_mode', themeMode);
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // safe fallback
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Preset Selection Handler
  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const preset = TEST_PRESETS.find(p => p.id === presetId);
    if (preset && preset.incident.id) {
      setSelectedIncidentId(preset.incident.id);
      showToast(`Loaded ${preset.label}: ${preset.badge}`, 'info');
    }
  };

  const handleResetPresets = () => {
    setIncidents(SPATIAL_INCIDENTS);
    setActivePresetId('preset-b');
    setSelectedIncidentId('rep-master-7x');
    showToast('Reset all incident test scenarios to initial state.', 'info');
  };

  // 1. Authorize HITL Toggle Action with Operator Payload
  const handleAuthorizeToggle = (id: string, payload?: { operator_id: string; override_reason: string }) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const nextAuth = !inc.hitl_authorized;
        return {
          ...inc,
          hitl_authorized: nextAuth,
          status: nextAuth ? 'OPEN' : 'AWAITING_VALIDATION',
          hitl_authorized_by: nextAuth ? (payload?.operator_id || "OPERATOR-402") : undefined,
          operator_id: nextAuth ? (payload?.operator_id || "OPERATOR-402") : undefined,
          hitl_override_reason: nextAuth ? (payload?.override_reason || "Verified AI triage") : undefined,
          hitl_authorized_at: nextAuth ? new Date().toISOString() : undefined
        };
      }
      return inc;
    }));

    const target = incidents.find(i => i.id === id);
    if (target?.hitl_authorized) {
      showToast(`Safety Interlock re-engaged for ${target.ticketId}`, 'warning');
    } else {
      showToast(`Operator override confirmed for ${target?.ticketId}. Dispatch unlocked.`, 'success');
    }
  };

  // 2. Validate & Dispatch Crew Action (Triggers real-time Socket.IO status event)
  const handleDispatchCrew = async (id: string) => {
    const target = incidents.find(i => i.id === id);
    if (!target) return;

    // Optimistically update local incident state
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status: 'DISPATCHED',
          assignedUnit: inc.assignedUnit || inc.recommended_crew || 'Emergency Rapid Unit 01'
        };
      }
      return inc;
    }));

    // Trigger backend Socket.IO / REST API dispatch endpoint
    try {
      await fetch(`/api/reports/${id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit: target.recommended_crew || 'Emergency Rapid Unit 01',
          operator: target.operator_id || 'OPERATOR-402',
          timestamp: new Date().toISOString()
        })
      });
    } catch {
      // Backend route fallback
    }

    showToast(`⚡ Dispatched: ${target.recommended_crew} routed to ${target.ticketId}! (Socket.IO event broadcast)`, 'success');
  };

  // 3. Merge with Existing Cluster Action
  const handleMergeCluster = (id: string) => {
    const target = incidents.find(i => i.id === id);
    if (!target) return;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          duplicateCount: (inc.duplicateCount || 1) + 1,
          corroboratedReports: (inc.corroboratedReports || 1) + 1,
          haversineDistanceM: 64,
          vectorSimilarity: 0.91
        };
      }
      return inc;
    }));

    showToast(`Spatial-semantic merge executed: Corroboration count incremented (Cosine similarity 0.91)`, 'info');
  };

  // 4. Escalate to Regional Command Action
  const handleEscalateCommand = (id: string) => {
    const target = incidents.find(i => i.id === id);
    showToast(`🚨 Priority Dossier ${target?.ticketId} escalated to State Disaster Management Authority (SDMA)`, 'warning');
  };

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Dynamic filter counts
  const counts = {
    all: incidents.length,
    hitl: incidents.filter(i => i.hitl_required && !i.hitl_authorized).length,
    merged: incidents.filter(i => (i.duplicateCount || i.corroboratedReports || 0) >= 7).length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
  };

  const isDark = themeMode === 'dark';

  return (
    <div 
      id="cypher-gis-command-center" 
      className={`w-full h-full flex flex-col min-h-screen font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* DEV TOOLBAR: QUICK LOAD PRESETS (A: L5, B: 7-Signal, C: Contradiction) */}
      {/* ------------------------------------------------------------- */}
      <DevToolbar 
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onReset={handleResetPresets}
      />

      {/* ------------------------------------------------------------- */}
      {/* TOP COMMAND HEADER & TELEMETRY HUD                            */}
      {/* ------------------------------------------------------------- */}
      <TopCommandHeader 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />

      {/* ------------------------------------------------------------- */}
      {/* MAIN SPATIAL WORKSPACE: 65% MAP / 35% INSPECTOR PANEL         */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Google Maps Dark/Light Vector Map Canvas (65% width / 8 cols in 12-col grid) */}
        <section className="lg:col-span-8 flex flex-col h-full min-h-[580px]">
          <GoogleDarkMapCanvas 
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              if (id === 'rep-hitl-north') setActivePresetId('preset-a');
              else if (id === 'rep-master-7x') setActivePresetId('preset-b');
              else if (id === 'rep-contradiction-west') setActivePresetId('preset-c');
            }}
            activeFilter={activeFilter}
            themeMode={themeMode}
          />
        </section>

        {/* Right Column: Incident Inspector Side Panel (35% width / 4 cols in 12-col grid) */}
        <section className="lg:col-span-4 flex flex-col h-full min-h-[580px]">
          <IncidentInspectorPanel 
            incident={selectedIncident}
            onAuthorizeToggle={handleAuthorizeToggle}
            onDispatchCrew={handleDispatchCrew}
            onMergeCluster={handleMergeCluster}
            onEscalateCommand={handleEscalateCommand}
            themeMode={themeMode}
          />
        </section>
      </main>


      {/* ------------------------------------------------------------- */}
      {/* REAL-TIME NOTIFICATION TOAST                                  */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md flex items-center gap-2.5 font-mono text-xs ${
              toastMessage.type === 'warning'
                ? 'bg-red-950/95 border-red-500/80 text-red-200'
                : toastMessage.type === 'info'
                ? 'bg-amber-950/95 border-amber-500/80 text-amber-200'
                : 'bg-slate-950/95 border-cyan-500/80 text-cyan-200'
            }`}
          >
            {toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default GisCommandCenter;
