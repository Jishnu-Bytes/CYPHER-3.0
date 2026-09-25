import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Flame, 
  Lock, 
  Unlock, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Cpu, 
  Layers,
  Volume2,
  Camera,
  FileText,
  UserCheck,
  Building2,
  Gauge
} from 'lucide-react';
import { CivicIncident, ThemeMode } from '../types';
import { CrossModalContradictionAlert } from './CrossModalContradictionAlert';

interface IncidentInspectorPanelProps {
  incident: CivicIncident;
  onAuthorizeToggle: (id: string, payload?: { operator_id: string; override_reason: string }) => void;
  onDispatchCrew: (id: string) => void;
  onMergeCluster: (id: string) => void;
  onEscalateCommand: (id: string) => void;
  themeMode?: ThemeMode;
}

export const IncidentInspectorPanel: React.FC<IncidentInspectorPanelProps> = ({
  incident,
  onAuthorizeToggle,
  onDispatchCrew,
  onMergeCluster,
  onEscalateCommand,
  themeMode = 'dark'
}) => {
  const [signalsExpanded, setSignalsExpanded] = useState<boolean>(true);
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [operatorId, setOperatorId] = useState<string>("OPERATOR-TACTICAL-402");
  const [overrideReason, setOverrideReason] = useState<string>(
    "Field telemetry & visual arcing verified via high-voltage substation feeds."
  );

  // Dynamic SLA Countdown Timer
  const [timeLeftSec, setTimeLeftSec] = useState<number>(() => {
    const targetMin = incident.slaTargetMinutes || (incident.criticality_level === 5 ? 15 : 120);
    const elapsedSec = Math.floor((Date.now() - incident.createdAt) / 1000);
    return Math.max(0, targetMin * 60 - elapsedSec);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSec(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [incident.id]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const is7xMaster = (incident.duplicateCount || incident.corroboratedReports || 0) >= 7;
  const isHitlLocked = incident.hitl_required && !incident.hitl_authorized;
  const isDispatched = incident.status === 'DISPATCHED';
  const isResolved = incident.status === 'RESOLVED';
  const isDark = themeMode === 'dark';

  // Category Color Scheme
  let critBg = isDark ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-emerald-100 border-emerald-400 text-emerald-900';
  if (incident.criticality_level >= 4) {
    critBg = isDark ? 'bg-red-950/80 border-red-500/60 text-red-300' : 'bg-red-100 border-red-400 text-red-900';
  } else if (incident.criticality_level === 3) {
    critBg = isDark ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' : 'bg-amber-100 border-amber-400 text-amber-900';
  }

  const handleConfirmOverride = () => {
    onAuthorizeToggle(incident.id, {
      operator_id: operatorId.trim() || "OPERATOR-402",
      override_reason: overrideReason.trim() || "Standard manual operator authorization"
    });
    setShowOverrideModal(false);
  };

  return (
    <aside 
      id="incident-inspector-drawer"
      className={`w-full h-full rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl overflow-y-auto space-y-4 font-sans border transition-colors duration-200 ${
        isDark 
          ? 'bg-[#0d1527] border-slate-800/90 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200'
      }`}
    >
      <div className="space-y-4">
        {/* ----------------------------------------------------------- */}
        {/* HEADER: Incident ID, Hazard Category, Criticality Score     */}
        {/* ----------------------------------------------------------- */}
        <div className={`pb-3.5 border-b space-y-2 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-black tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {incident.ticketId}
              </span>
              <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {incident.referenceId}
              </span>
            </div>

            {/* Criticality Score Badge (Level 1 to 5) */}
            <div className={`px-3 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm ${critBg}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>CRITICALITY LEVEL {incident.criticality_level}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-slate-200' 
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}>
                {incident.id === 'rep-master-7x' ? 'Major Electrical / Transformer Explosion' : incident.hazard_category}
              </span>
              {incident.sector && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  isDark 
                    ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300' 
                    : 'bg-indigo-50 border-indigo-300 text-indigo-800'
                }`}>
                  {incident.sector} Sector
                </span>
              )}
            </div>

            {/* Status Pill */}
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
              isResolved
                ? isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-400'
                : isDispatched
                ? isDark ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-800 border-amber-400'
                : isDark ? 'bg-red-950 text-red-300 border-red-500/40' : 'bg-red-100 text-red-800 border-red-400'
            }`}>
              {incident.status === 'AWAITING_VALIDATION' ? '⚠️ AWAITING VALIDATION' : `Status: ${incident.status}`}
            </span>
          </div>

          {/* Location Pin & SLA Countdown Timer Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className={`flex items-center gap-1.5 text-xs font-sans ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{incident.location}</span>
            </div>

            {/* Visual SLA Countdown Timer */}
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
              timeLeftSec < 180 
                ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse' 
                : isDark ? 'bg-slate-900 border-slate-700 text-cyan-300' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <Clock className="w-3 h-3" />
              <span>SLA Target: {formatTimer(timeLeftSec)}</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* CROSS-MODAL CONTRADICTION ALERT (When Flagged)              */}
        {/* ----------------------------------------------------------- */}
        {incident.contradiction_detected && (
          <CrossModalContradictionAlert incident={incident} />
        )}

        {/* ----------------------------------------------------------- */}
        {/* HITL SAFETY GATE BANNER (When HITL Required)                */}
        {/* ----------------------------------------------------------- */}
        {incident.hitl_required && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-xl border transition-all ${
              isHitlLocked 
                ? 'bg-red-950/70 border-red-500/60 text-red-200 shadow-lg shadow-red-950/40' 
                : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {isHitlLocked ? (
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                ) : (
                  <Unlock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-mono text-xs font-black tracking-wide text-white">
                    ⚠️ HUMAN-IN-THE-LOOP AUTHORIZATION REQUIRED
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {isHitlLocked 
                      ? "Safety interlock active. Automated crew dispatch is blocked until an authorized dispatcher reviews multimodal evidence and overrides the lock."
                      : `Cleared by ${incident.operator_id || incident.hitl_authorized_by || 'Operator #402'}. Override reason: "${incident.hitl_override_reason || 'Verified telemetry'}". Dispatch unlocked.`
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                Safety Protocol: ISO-DISPATCH-901
              </span>
              <button
                onClick={() => {
                  if (isHitlLocked) {
                    setShowOverrideModal(true);
                  } else {
                    onAuthorizeToggle(incident.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isHitlLocked
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isHitlLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Verify AI Triage &amp; Override Lock</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Re-engage Safety Lock</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* A. FEATURED 7-IN-1 MASTER CLUSTER CORROBORATION SECTION     */}
        {/* ----------------------------------------------------------- */}
        {is7xMaster && (
          <div className="rounded-xl border border-amber-500/50 bg-gradient-to-b from-amber-950/40 to-slate-950/90 p-3.5 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span className="font-mono text-xs font-black text-amber-300">
                  MASTER INCIDENT DOSSIER
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/40">
                7-in-1 Collapsed
              </span>
            </div>

            {/* Corroboration Counter */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Corroboration Counter:</span>
                <span className="text-amber-400 font-bold">
                  7 Citizen Inputs Collapsed (3 Voice Notes, 4 Photos)
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Haversine Spatial Proximity: &lt; 100m</span>
                <span className="text-cyan-400">Vector Cosine: 0.88</span>
              </div>
            </div>

            {/* Collapsed Signal List (Expandable / Collapsible) */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => setSignalsExpanded(!signalsExpanded)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Collapsed Signal List (7 Raw Submissions)</span>
                </div>
                {signalsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              <AnimatePresence>
                {signalsExpanded && incident.corroborationDetails && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden pt-1"
                  >
                    {incident.corroborationDetails.map((detail, idx) => (
                      <div 
                        key={`sig-${idx}`}
                        className="p-2 rounded-lg bg-slate-950/90 border border-slate-800/80 flex items-start justify-between gap-2 text-[11px] font-mono"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            {detail.medium.includes('Voice') ? (
                              <Volume2 className="w-3 h-3 text-cyan-400 shrink-0" />
                            ) : detail.medium.includes('Photo') ? (
                              <Camera className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                            )}
                            <span>{detail.transcript}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Citizen: <strong className="text-slate-300">{detail.citizen}</strong> ({detail.phone}) • Δ{detail.distanceM}m
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                          {detail.time}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* AI TRIAGE SECTION WITH CONFIDENCE SCORES & TOOL ROUTING     */}
        {/* ----------------------------------------------------------- */}
        <div className={`border rounded-xl p-3.5 space-y-3 ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b font-mono text-xs ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              <Cpu className="w-3.5 h-3.5 text-cyan-500" />
              <span>GEMINI 2.5 FLASH AI TRIAGE</span>
            </span>
            <span className="text-emerald-500 text-[10px] font-bold">● SCHEMA VALIDATED</span>
          </div>

          {/* Normalised English Summary */}
          <div className="space-y-1">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Normalised English Operational Summary
            </span>
            <p className={`text-xs p-2.5 rounded-lg border leading-relaxed font-sans ${
              isDark ? 'bg-[#0a0f1d] border-slate-800/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {incident.normalized_summary || incident.englishTranslation}
            </p>
          </div>

          {/* Distress Score & Recommended Crew Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className={`p-2 rounded-lg border space-y-0.5 ${
              isDark ? 'bg-[#0a0f1d] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Distress Score</span>
                <span className="text-[10px] font-mono text-cyan-500 font-bold">
                  Conf: {(incident.confidence_score ? incident.confidence_score * 100 : 92).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-mono font-black text-amber-500">
                  {incident.distress_score.toFixed(2)}
                </span>
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${Math.min(incident.distress_score * 100, 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className={`p-2 rounded-lg border space-y-0.5 ${
              isDark ? 'bg-[#0a0f1d] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Recommended Crew</span>
              <div className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`} title={incident.recommended_crew}>
                {incident.recommended_crew || "Rapid Response Unit"}
              </div>
            </div>
          </div>

          {/* Municipal Department Tool Routing */}
          <div className={`p-2 rounded-lg border space-y-1 ${
            isDark ? 'bg-[#0a0f1d] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono uppercase flex items-center gap-1 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Building2 className="w-3 h-3 text-cyan-500" />
                <span>Department Routing (Tool: lookup_municipal_department)</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-500 font-bold">MATCHED</span>
            </div>
            <p className={`text-xs font-mono font-medium ${isDark ? 'text-cyan-300' : 'text-indigo-700'}`}>
              {incident.departmentRouted || "Municipal Public Safety & Disaster Management Board"}
            </p>
          </div>

          {/* Per-Field Confidence Breakdown */}
          {incident.field_confidences && (
            <div className="space-y-1 pt-1">
              <span className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Gauge className="w-3 h-3 text-indigo-400" />
                <span>Field-Level Extraction Confidence</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className={`p-1.5 rounded flex items-center justify-between ${
                  isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-800'
                }`}>
                  <span>Hazard Category:</span>
                  <span className="text-emerald-500 font-bold">{(incident.field_confidences.hazard_category * 100).toFixed(0)}%</span>
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${
                  isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-800'
                }`}>
                  <span>Criticality Index:</span>
                  <span className="text-emerald-500 font-bold">{(incident.field_confidences.criticality * 100).toFixed(0)}%</span>
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${
                  isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-800'
                }`}>
                  <span>Operational Summary:</span>
                  <span className="text-emerald-500 font-bold">{(incident.field_confidences.summary * 100).toFixed(0)}%</span>
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${
                  isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-800'
                }`}>
                  <span>Spatial Location:</span>
                  <span className="text-emerald-500 font-bold">{(incident.field_confidences.location * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Required Equipment List */}
          <div className="space-y-1.5 pt-1">
            <span className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Wrench className="w-3 h-3 text-cyan-500" />
              <span>Required Equipment Dispatch Manifest</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {incident.required_equipment.map((item, idx) => (
                <span
                  key={`eq-${idx}`}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-medium shadow-sm ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700/80 text-cyan-200' 
                      : 'bg-cyan-50 border-cyan-200 text-cyan-900'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* OPERATIONAL ACTION BUTTONS                                  */}
      {/* ----------------------------------------------------------- */}
      <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        {/* Button 1: [Validate & Dispatch Crew] */}
        <button
          onClick={() => {
            if (isHitlLocked) return;
            onDispatchCrew(incident.id);
          }}
          disabled={isHitlLocked || isDispatched || isResolved}
          className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            isHitlLocked
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : isDispatched
              ? 'bg-amber-950 text-amber-300 border border-amber-500/40 cursor-default'
              : isResolved
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950 active:scale-[0.99]'
          }`}
        >
          {isHitlLocked ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Dispatch Locked: Operator Authorization Required</span>
            </>
          ) : isDispatched ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Crew Dispatched &amp; En Route</span>
            </>
          ) : isResolved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Incident Cleared &amp; SLA Met</span>
            </>
          ) : (
            <>
              <Truck className="w-4 h-4" />
              <span>[Validate &amp; Dispatch Crew]</span>
            </>
          )}
        </button>

        {/* Action Row 2: Secondary Operational Options */}
        <div className="grid grid-cols-2 gap-2">
          {/* Button 2: [Merge with Existing Cluster] */}
          <button
            onClick={() => onMergeCluster(incident.id)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>[Merge Cluster]</span>
          </button>

          {/* Button 3: [Escalate to Regional Command] */}
          <button
            onClick={() => onEscalateCommand(incident.id)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-500" />
            <span>[Escalate Cmd]</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* OPERATOR HITL OVERRIDE MODAL                                */}
      {/* ----------------------------------------------------------- */}
      <AnimatePresence>
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-red-500/80 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 font-mono text-xs text-slate-200"
            >
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm pb-2 border-b border-slate-800">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <span>MANDATORY OPERATOR OVERRIDE AUTHORIZATION</span>
              </div>

              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                Criticality Level &gt;= 4 or Cross-Modal Contradiction detected. Under Safety Protocol ISO-DISPATCH-901, automated dispatch is interlocked. Releasing ticket <strong className="text-white">{incident.ticketId}</strong> requires dispatcher signature.
              </p>

              <div className="space-y-2">
                <label className="block text-slate-400 text-[11px]">
                  Dispatcher Identifier (Operator ID):
                </label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-red-400"
                  placeholder="e.g. OP-DISPATCH-402"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 text-[11px]">
                  Override Reason &amp; Telemetry Justification:
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-red-400"
                  placeholder="Explain why AI triage is verified or modified..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOverride}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-red-950 flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Authorize &amp; Release Dispatch Lock</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
};
export default IncidentInspectorPanel;
