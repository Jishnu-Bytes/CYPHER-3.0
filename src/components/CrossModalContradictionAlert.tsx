import React from 'react';
import { motion } from 'motion/react';
import { Zap, Mic, Eye, AlertOctagon, HelpCircle, ArrowRightLeft } from 'lucide-react';
import { CivicIncident } from '../types';

interface CrossModalContradictionAlertProps {
  incident: CivicIncident;
}

export const CrossModalContradictionAlert: React.FC<CrossModalContradictionAlertProps> = ({ incident }) => {
  if (!incident.contradiction_detected) {
    return null;
  }

  const reason = incident.contradiction_reason || "Voice reported 'minor leak', photo indicates 'transformer flooding'.";

  return (
    <motion.div
      id="cross-modal-contradiction-alert"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-950/70 via-slate-950/80 to-amber-950/70 p-3.5 shadow-xl shadow-amber-950/40 text-xs font-sans text-slate-200"
    >
      {/* Top Banner Header */}
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0 animate-pulse">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-black tracking-wide text-amber-300 uppercase flex items-center gap-1.5">
              <span>⚡ Cross-Modal Contradiction Flagged</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold uppercase">
              REVISE CRITICALITY → LEVEL 5
            </span>
          </div>

          <p className="text-[12px] font-medium text-amber-200/90 leading-snug">
            {reason}
          </p>
        </div>
      </div>

      {/* Multimodal Conflict Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-amber-500/30 font-mono text-[11px]">
        {/* Modality 1: Acoustic Audio Input */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              Citizen Voice Audio
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Reported: Minor Leak
            </span>
          </div>
          <p className="text-slate-300 italic text-[11px] bg-slate-950/60 p-1.5 rounded border border-slate-800/50">
            "{incident.transcription || 'Chhota sa paani ka leak hai sadak ke kinare...'}"
          </p>
          <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
            <span>Acoustic Urgency: <strong className="text-emerald-400">Low (0.18)</strong></span>
            <span>Language: Telugu/Hindi</span>
          </div>
        </div>

        {/* Modality 2: Computer Vision Model */}
        <div className="bg-slate-900/90 border border-red-900/50 rounded-lg p-2.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-red-300">
              <Eye className="w-3.5 h-3.5 text-red-400" />
              Vision Tensor Analysis
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/30">
              Detected: Submerged Transformer
            </span>
          </div>
          <p className="text-slate-200 text-[11px] bg-slate-950/60 p-1.5 rounded border border-slate-800/50">
            High-voltage 11kV cooling fins submerged under 4.2ft water. High arcing danger.
          </p>
          <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
            <span>Vision Confidence: <strong className="text-red-400">98.2%</strong></span>
            <span>Hazard: Life-Safety</span>
          </div>
        </div>
      </div>

      {/* Reconciled Resolution Note */}
      <div className="mt-2 text-[10px] text-amber-300/80 bg-amber-950/30 px-2.5 py-1.5 rounded-lg border border-amber-500/20 flex items-center justify-between font-mono">
        <span>Automatic Action: Upgraded from Priority 2 to Priority 5 Crisis</span>
        <span className="text-white font-bold">Operator Verification Required</span>
      </div>
    </motion.div>
  );
};
