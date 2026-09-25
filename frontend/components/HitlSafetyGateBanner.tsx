import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  CheckCircle, 
  Send, 
  FileCheck,
  UserCheck
} from 'lucide-react';
import { CivicIncident } from '../types';

interface HitlSafetyGateBannerProps {
  incident: CivicIncident;
  onAuthorizeToggle: (incidentId: string) => void;
  onDispatchCrew: (incidentId: string) => void;
}

export const HitlSafetyGateBanner: React.FC<HitlSafetyGateBannerProps> = ({
  incident,
  onAuthorizeToggle,
  onDispatchCrew
}) => {
  const isRequired = incident.hitl_required;
  const isAuthorized = incident.hitl_authorized;
  const isCritical = (incident.criticality_level || 1) >= 4;

  if (!isRequired) {
    return null;
  }

  return (
    <div id="hitl-safety-gate-container" className="w-full space-y-3">
      {/* Pulsing Amber/Red Alert Banner Across Top */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-xl border p-3 ${
          isAuthorized
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-gradient-to-r from-red-950/70 via-amber-950/60 to-red-950/70 border-red-500/60 text-red-200 shadow-lg shadow-red-950/50'
        }`}
      >
        {/* Animated Pulse Ping for Active Gate */}
        {!isAuthorized && (
          <div className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse" />
        )}

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              isAuthorized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400 animate-bounce'
            }`}>
              {isAuthorized ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                  <AlertTriangle className={`w-3.5 h-3.5 ${isAuthorized ? 'text-emerald-400' : 'text-amber-400'}`} />
                  {isAuthorized ? 'HUMAN-IN-THE-LOOP AUTHORIZATION VERIFIED' : '⚠️ HUMAN-IN-THE-LOOP SAFETY GATE ACTIVE'}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  isAuthorized ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' : 'bg-red-900/80 text-red-300 border border-red-500/40'
                }`}>
                  LEVEL {incident.criticality_level}/5 CRISIS
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 font-sans leading-snug">
                {isAuthorized
                  ? `Operator clearance verified by ${incident.hitl_authorized_by || 'Tactical Dispatcher #402'}. Automated interlocks disengaged.`
                  : incident.hitl_reason || "Level 5 Critical Life-Safety Risk detected. Mandatory human authorization required before crew dispatch."
                }
              </p>
            </div>
          </div>

          {/* Authorize & Validate Toggle Action */}
          <div className="flex items-center gap-2 flex-shrink-0 pt-1 sm:pt-0">
            <button
              id="btn-hitl-authorize"
              onClick={() => onAuthorizeToggle(incident.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                isAuthorized
                  ? 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950 hover:text-black border border-amber-400 font-extrabold animate-pulse'
              }`}
            >
              {isAuthorized ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Validated</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-950" />
                  <span>Authorize & Validate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dispatch Crew Button with Lock Interlock */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Target Crew:</span>
          <span className="font-semibold text-cyan-300">{incident.recommended_crew || "Municipal Emergency Unit"}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Dispatch Crew Button */}
          <button
            id="btn-dispatch-crew"
            disabled={!isAuthorized || incident.status === 'DISPATCHED'}
            onClick={() => onDispatchCrew(incident.id)}
            className={`relative px-4 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg ${
              incident.status === 'DISPATCHED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                : isAuthorized
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50 cursor-pointer active:scale-95'
                  : 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
            title={!isAuthorized ? "Automated dispatch locked: Requires Human-in-the-Loop authorization" : "Dispatch response team"}
          >
            {/* Lock Icon */}
            {!isAuthorized ? (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            ) : incident.status === 'DISPATCHED' ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-cyan-300" />
            )}

            <span>
              {incident.status === 'DISPATCHED'
                ? 'Crew Dispatched'
                : isAuthorized
                  ? 'Dispatch Crew Now'
                  : 'Dispatch Locked (Authorize Required)'}
            </span>

            {isAuthorized && incident.status !== 'DISPATCHED' && (
              <Send className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
